import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import {
  createFixedInputEditor,
  EditorRegistry,
  sameFixedSnapshot,
  BlockEditorConflictError,
} from "@kubohiroya/turbowarp-extension-data-editor";
import type {
  BlockEditorHost,
  FixedBlockSnapshot,
  FixedInputEditorOptions,
  FixedHostCommitRequest,
  JsonObject,
  JsonValue,
} from "@kubohiroya/turbowarp-extension-data-editor";
import {
  fixedInputEditorOptions,
  fixedNumber,
  registerFixedInputEditors,
} from "../src/fixed-input-editors.js";
import { BubbleExtension } from "../src/extension.js";
import definitions from "../src/block-definitions.json";
import previousGetInfo from "./fixtures/fixed-getinfo-before.json";
import schemas from "../schemas/block-editor-fixed-inputs.schema.json";

const options = fixedInputEditorOptions();
function scratch(api?: unknown) {
  return {
    ArgumentType: {
      NUMBER: "number",
      STRING: "string",
      COLOR: "color",
      BOOLEAN: "Boolean",
    },
    BlockType: {
      COMMAND: "command",
      REPORTER: "reporter",
      BOOLEAN: "Boolean",
      HAT: "hat",
    },
    translate: (v: unknown) =>
      typeof v === "string" ? v : (v as { default: string }).default,
    Cast: { toNumber: Number, toString: String },
    extensions: { unsandboxed: true },
    ...(api ? { gui: { blockEditors: api } } : {}),
  };
}
const invalidTokens = [
  "",
  " ",
  "0x10",
  "+1",
  "001",
  "1.",
  ".5",
  "1e",
  "1e999",
  "NaN",
  "Infinity",
];
function fixture(
  option: FixedInputEditorOptions,
  seed: Record<
    string,
    { literal?: string; source?: "reporter" | "unsupported" | "missing" }
  >,
  failCommit = false,
) {
  const definition = createFixedInputEditor(option);
  const registry = new EditorRegistry();
  const remove = registry.registerFixed(definition);
  const live: FixedBlockSnapshot = {
    targetId: "sprite",
    blockId: "fixed",
    opcode: option.opcodes[0]!,
    revision: "1",
    arguments: {},
    fixedContext: {
      contractId: option.contractId,
      contractRevision: option.contractRevision,
      generation: "g1",
      readOnlyArguments: option.readOnlyArguments ?? [],
      dependencies: option.dependencies ?? [],
      inputs: {},
    },
  };
  const args = live.arguments as Record<string, unknown>;
  const inputs = live.fixedContext.inputs as Record<string, unknown>;
  for (const [name, spec] of Object.entries(seed)) {
    const source = spec.source ?? "shadow";
    const role = option.readOnlyArguments?.includes(name)
      ? "readonly"
      : "editable";
    if (source === "reporter") args[name] = { kind: "reporter" };
    else if (source !== "missing")
      args[name] = { kind: "literal", value: spec.literal ?? "unsupported" };
    if (
      !option.bindings.some((binding) => binding.argument === name) &&
      !option.readOnlyArguments?.includes(name)
    )
      continue;
    inputs[name] = {
      source,
      role,
      ...(source === "unsupported" || source === "missing"
        ? { reason: "Unavailable standard field." }
        : {}),
      identity: `${name}:1`,
      ...(source === "shadow"
        ? { field: { blockId: `${name}:shadow`, name: "TEXT", type: "text" } }
        : {}),
    };
  }
  const requests: FixedHostCommitRequest[] = [];
  const invalidation = new Set<(error: unknown) => void>();
  const commit = (request: FixedHostCommitRequest) => {
    if (!sameFixedSnapshot(request.expected, live))
      throw new BlockEditorConflictError("changed");
    if (
      request.changes.some(
        (change) =>
          !definition.editableArguments.includes(change.argument) ||
          definition.readOnlyArguments.includes(change.argument),
      )
    )
      throw new Error("readonly patch");
    if (failCommit) throw new Error("commit rejected");
    for (const change of request.changes)
      args[change.argument] = { kind: "literal", value: change.value };
    requests.push(request);
  };
  const host: BlockEditorHost = {
    readBlock: () => live,
    commit: () => {
      throw new Error("legacy path");
    },
    fixedInputs: {
      capability: "fixed-inputs-v1",
      readBlock: () => live,
      commit,
      subscribeInvalidation: (_r, _d, listener) => {
        invalidation.add(listener);
        return () => {
          invalidation.delete(listener);
        };
      },
    },
  };
  const open = () => registry.open(live, host)!;
  const session = open();
  const set = (name: string, value: JsonValue, buffer?: string) => {
    const draft = session.getDraft();
    const entries = draft.inputs as JsonObject;
    entries[name] = {
      value,
      changed: true,
      ...(buffer === undefined ? {} : { buffer }),
    };
    session.setDraft(draft);
  };
  return {
    definition,
    registry,
    remove,
    live,
    args,
    inputs,
    requests,
    commit,
    session,
    set,
    open,
    invalidate: () => {
      for (const listener of invalidation) listener(new Error("scope changed"));
    },
  };
}

describe("fixed input owner contracts", () => {
  it("has exact planned bindings and canonical Schema provenance", () => {
    expect(options.flatMap((o) => o.bindings).length).toBe(38);
    for (const option of options) {
      const opcode = option.opcodes[0]!.slice(option.extensionId.length + 1);
      const block = definitions.blocks.find((b) => b.opcode === opcode)!;
      expect(block).toBeDefined();
      expect(option.bindings.map((b) => b.argument).sort()).toEqual(
        Object.keys(
          schemas.$defs[opcode as keyof typeof schemas.$defs].properties,
        ).sort(),
      );
      for (const binding of option.bindings) {
        expect(block.arguments).toHaveProperty(binding.argument);
        const factory = createFixedInputEditor(option);
        expect(factory.saveContract).toBe("prepared-fixed-v1");
        expect(binding.schemaBundle.root.artifact.role).toBe(
          "canonical-schema",
        );
        expect(binding.schemaBundle.root.artifact.source.symbol).toBe(
          `/$defs/${opcode}/properties/${binding.argument}`,
        );
      }
    }
  });
  it("registers only the optional capability at getInfo and leaves all metadata unchanged", () => {
    const calls: FixedInputEditorOptions[] = [];
    const removed = vi.fn();
    const events = new Map<string, () => void>();
    const runtime = {
      on: (name: string, fn: () => void) => events.set(name, fn),
      off: (name: string) => events.delete(name),
    };
    vi.stubGlobal(
      "Scratch",
      scratch({
        apiVersion: 1,
        registerFixedInputEditor: (o: FixedInputEditorOptions) => {
          calls.push(o);
          return removed;
        },
      }),
    );
    const extension = new BubbleExtension(runtime as never);
    expect(calls).toHaveLength(0);
    expect(extension.getInfo()).toEqual(previousGetInfo);
    extension.getInfo();
    expect(calls).toHaveLength(options.length);
    expect(calls.map((o) => o.opcodes)).toEqual(options.map((o) => o.opcodes));
    events.get("RUNTIME_DISPOSED")?.();
    events.get("RUNTIME_DISPOSED")?.();
    expect(removed).toHaveBeenCalledTimes(options.length);
    vi.unstubAllGlobals();
  });
  it("keeps old hosts inert and rolls back partial registration", () => {
    for (const api of [
      undefined,
      { apiVersion: 1 },
      {
        apiVersion: 2,
        registerFixedInputEditor: () => {
          throw new Error();
        },
      },
    ])
      expect(registerFixedInputEditors(scratch(api), {})).toBeUndefined();
    const remove = vi.fn();
    let calls = 0;
    const api = {
      apiVersion: 1,
      registerFixedInputEditor: () => {
        if (calls++ === 1) throw new Error("registration failure");
        return remove;
      },
    };
    if (options.length > 1) {
      expect(() => registerFixedInputEditors(scratch(api), {})).toThrow();
      expect(remove).toHaveBeenCalledOnce();
    } else {
      const dispose = registerFixedInputEditors(
        scratch({ apiVersion: 1, registerFixedInputEditor: () => remove }),
        {},
      );
      dispose?.();
      dispose?.();
      expect(remove).toHaveBeenCalledOnce();
    }
  });
  it("validates numeric lexical input without buffer and retains valid numeric tokens", () => {
    const numeric = options
      .flatMap((o) => o.bindings)
      .filter((b) => b.control?.kind === "number");
    for (const binding of numeric)
      for (const token of invalidTokens) {
        expect(
          () =>
            binding.encode(token, {
              consumerId: "test",
              nowMs: 0,
              settings: null,
            }),
          `${binding.argument}:${token}`,
        ).toThrow();
        // Owner semantic validation also accepts finite legacy aliases in unchanged dependencies.
        if (["", " ", "1e", "1e999", "NaN", "Infinity"].includes(token)) {
          expect(
            binding.validateCandidate(
              token,
              { consumerId: "test", nowMs: 0, settings: null },
              {} as never,
            ),
          ).not.toHaveLength(0);
        }
      }
    for (const token of ["-0", "1e2", "1.25"]) {
      expect(fixedNumber(token)).toBe(Number(token));
      for (const binding of numeric)
        expect(
          binding.encode(token, {
            consumerId: "test",
            nowMs: 0,
            settings: null,
          }),
        ).toBe(token);
    }
    for (const binding of numeric)
      for (const raw of ["", " ", "Infinity", "NaN"]) {
        expect(() => binding.read(raw)).toThrow();
      }
  });
  it("retains every unchanged raw and reporter without invoking encode or runtime functions", async () => {
    for (const option of options) {
      const seed = Object.fromEntries(
        option.bindings.map((b) => [
          b.argument,
          {
            literal:
              b.control?.kind === "number"
                ? " 0x10 "
                : ((b.control?.choices?.[0]?.value as string) ?? "#AbC"),
          },
        ]),
      );
      for (const arg of option.readOnlyArguments ?? [])
        seed[arg] = { literal: "ready" };
      const f = fixture(option, seed);
      const before = structuredClone(f.live.arguments);
      expect(await f.session.save()).toEqual({
        status: "saved",
        changed: false,
      });
      expect(f.live.arguments).toEqual(before);
      expect(f.requests).toHaveLength(0);
      f.session.dispose();
      f.remove();
    }
  });
  it("makes standard numeric boundary validation match the canonical fixed Schema", () => {
    const ctx = { consumerId: "test", nowMs: 0, settings: null };
    for (const option of options)
      for (const binding of option.bindings) {
        if (binding.control?.kind !== "number") continue;
        const opcode = option.opcodes[0]!.slice(option.extensionId.length + 1);
        const property = (
          schemas.$defs as unknown as Record<
            string,
            {
              properties: Record<
                string,
                { minimum?: number; exclusiveMinimum?: number; type: string }
              >;
            }
          >
        )[opcode]!.properties[binding.argument]!;
        if (property.exclusiveMinimum === 0)
          expect(
            binding.validateCandidate("0", ctx, {} as never),
          ).not.toHaveLength(0);
        if (property.minimum === 0)
          expect(
            binding.validateCandidate("-1", ctx, {} as never),
          ).not.toHaveLength(0);
        if (property.type === "integer")
          expect(
            binding.validateCandidate("1.5", ctx, {} as never),
          ).not.toHaveLength(0);
        expect(binding.validateCandidate("2", ctx, {} as never)).toHaveLength(
          0,
        );
      }
  });
  it("has local docsURI anchors and linked fixed editing rules for every target", () => {
    const html = readFileSync(
      new URL("../docs/index.html", import.meta.url),
      "utf8",
    );
    expect(html).toContain('id="fixed-input-editing"');
    for (const option of options) {
      const opcode = option.opcodes[0]!.slice(option.extensionId.length + 1);
      expect(html).toContain(`id="block-${opcode}"`);
      expect(html).toContain(`href="#block-${opcode}"`);
    }
    expect(html).toContain('href="#fixed-input-editing"');
  });
});

const closeOptions = options.find((o) =>
  o.opcodes[0]!.endsWith("_defineBubbleClosePolicy"),
)!;
const closeSeed = {
  TRIGGER: { literal: "timeout" },
  TIMEOUT: { literal: "10" },
  CONDITION: { literal: "ready" },
};
describe("CP-bubble-close: all ten owner bindings", () => {
  it("accepts unchanged runtime numeric aliases across selector change while rejecting the same tokens as NEW edits", async () => {
    for (const raw of ["0x10", "+1", "001", "1."]) {
      const f = fixture(closeOptions, {
        ...closeSeed,
        TRIGGER: { literal: "condition" },
        TIMEOUT: { literal: raw },
      });
      f.set("TRIGGER", "timeout");
      expect((await f.session.save()).status).toBe("saved");
      expect(f.requests[0]!.changes).toEqual([
        { argument: "TRIGGER", value: "timeout" },
      ]);
      expect(f.args.TIMEOUT).toEqual({ kind: "literal", value: raw });
      f.session.dispose();
      f.remove();
      const changed = fixture(closeOptions, closeSeed);
      changed.set("TIMEOUT", raw);
      expect((await changed.session.save()).status).toBe("invalid");
      expect(changed.requests).toHaveLength(0);
      expect(changed.args.TIMEOUT).toEqual({ kind: "literal", value: "10" });
      changed.session.dispose();
      changed.remove();
    }
  });
  it("BC06 reporter selector keeps TIMEOUT readonly without evaluation", async () => {
    const f = fixture(closeOptions, {
      ...closeSeed,
      TRIGGER: { source: "reporter" },
    });
    expect(
      f.definition.describeFixed!(f.session.getDraft(), f.live).inputs.TIMEOUT!
        .state,
    ).toBe("readonly");
    expect(await f.session.save()).toEqual({ status: "saved", changed: false });
    expect(f.args.TRIGGER).toEqual({ kind: "reporter" });
  });
  for (const [id, condition] of [
    ["BC07", { literal: "  " }],
    ["BC08", { source: "reporter" }],
  ] as const)
    it(`${id} rejects selector change with unverifiable required condition`, async () => {
      const f = fixture(closeOptions, { ...closeSeed, CONDITION: condition });
      f.set("TRIGGER", "condition");
      expect((await f.session.save()).status).toBe("invalid");
      expect(f.requests).toHaveLength(0);
      expect(f.args.TRIGGER).toEqual({ kind: "literal", value: "timeout" });
    });
  it("BC09 edits positive TIMEOUT without evaluating unchanged readonly reporter", async () => {
    const f = fixture(closeOptions, {
      ...closeSeed,
      TRIGGER: { literal: "condition-or-timeout" },
      CONDITION: { source: "reporter" },
    });
    f.set("TIMEOUT", 20, "20");
    expect((await f.session.save()).status).toBe("saved");
    expect(f.requests[0]!.changes).toEqual([
      { argument: "TIMEOUT", value: "20" },
    ]);
    expect(f.args.CONDITION).toEqual({ kind: "reporter" });
  });
  it("BC10 detects readonly raw and connection changes atomically", async () => {
    for (const kind of ["raw", "connection"]) {
      const f = fixture(closeOptions, closeSeed);
      f.set("TIMEOUT", 20, "20");
      if (kind === "raw")
        f.args.CONDITION = { kind: "literal", value: "outside" };
      else
        f.inputs.CONDITION = {
          role: "readonly",
          source: "reporter",
          identity: "new-reporter",
        };
      expect((await f.session.save()).status).toBe("conflict");
      expect(f.requests).toHaveLength(0);
      expect(f.args.TIMEOUT).toEqual({ kind: "literal", value: "10" });
    }
  });
  it("BC12 rejects forged readonly patch in session and the atomic host contract", async () => {
    const f = fixture(closeOptions, closeSeed);
    const forged = [
      { argument: "CONDITION", value: "forged" },
      { argument: "TIMEOUT", value: "20" },
    ];
    const definition = {
      ...f.definition,
      prepareFixedSave: () => ({
        kind: "ready" as const,
        changes: forged,
        context: { consumerId: "test", nowMs: 0, settings: null },
      }),
    };
    f.session.dispose();
    f.remove();
    f.registry.registerFixed(definition);
    const session = f.open();
    expect((await session.save()).status).toBe("failed");
    expect(() =>
      f.commit({
        expected: f.live,
        changes: forged,
        context: { consumerId: "test", nowMs: 0, settings: null },
        signal: new AbortController().signal,
      }),
    ).toThrow();
    expect(f.requests).toHaveLength(0);
    expect(f.args.TIMEOUT).toEqual({ kind: "literal", value: "10" });
  });
  it("BC13 retains hidden/invalid draft, discards on end, and reopens from current raw", async () => {
    const f = fixture(closeOptions, closeSeed);
    f.set("TIMEOUT", 20, "20");
    f.set("TRIGGER", "condition");
    expect(
      f.definition.describeFixed!(f.session.getDraft(), f.live).inputs.TIMEOUT!
        .state,
    ).toBe("hidden");
    expect((f.session.getDraft().inputs as JsonObject).TIMEOUT).toMatchObject({
      buffer: "20",
    });
    f.set("TRIGGER", "timeout");
    expect((f.session.getDraft().inputs as JsonObject).TIMEOUT).toMatchObject({
      buffer: "20",
    });
    f.set("TIMEOUT", 20, "1e");
    f.set("TRIGGER", "condition");
    f.set("TRIGGER", "timeout");
    expect((await f.session.save()).status).toBe("invalid");
    expect((f.session.getDraft().inputs as JsonObject).TIMEOUT).toMatchObject({
      buffer: "1e",
    });
    for (const exit of ["save", "cancel", "dispose", "project", "target"]) {
      const ended = fixture(closeOptions, closeSeed);
      ended.set("TIMEOUT", 20, "20");
      ended.set("TRIGGER", "condition");
      if (exit === "save") {
        expect((await ended.session.save()).status).toBe("saved");
        ended.session.dispose();
      } else if (exit === "cancel") ended.session.cancel();
      else if (exit === "dispose") ended.session.dispose();
      else {
        if (exit === "project")
          (ended.live.fixedContext as unknown as JsonObject).generation =
            "other";
        else (ended.live as unknown as JsonObject).targetId = "other";
        ended.invalidate();
      }
      expect(() => ended.session.getDraft()).toThrow();
      expect(ended.args.TIMEOUT).toEqual({ kind: "literal", value: "10" });
      const reopened = fixture(closeOptions, closeSeed);
      expect(
        (reopened.session.getDraft().inputs as JsonObject).TIMEOUT,
      ).toMatchObject({ value: 10, changed: false });
      expect(
        (reopened.session.getDraft().inputs as JsonObject).TIMEOUT,
      ).not.toHaveProperty("buffer");
    }
    const failed = fixture(closeOptions, closeSeed, true);
    failed.set("TIMEOUT", 20, "20");
    failed.set("TRIGGER", "condition");
    expect((await failed.session.save()).status).toBe("failed");
    expect(
      (failed.session.getDraft().inputs as JsonObject).TIMEOUT,
    ).toMatchObject({ buffer: "20" });
  });
  it("BC14 unsupported/missing selector never chooses a default branch", async () => {
    for (const source of ["unsupported", "missing"] as const) {
      const f = fixture(closeOptions, { ...closeSeed, TRIGGER: { source } });
      expect(
        f.definition.describeFixed!(f.session.getDraft(), f.live).inputs
          .TIMEOUT!.state,
      ).toBe("readonly");
      expect(await f.session.save()).toEqual({
        status: "saved",
        changed: false,
      });
      expect(f.requests).toHaveLength(0);
    }
  });
  it("BC15 rejects selector change when active TIMEOUT remains a reporter", async () => {
    const f = fixture(closeOptions, {
      ...closeSeed,
      TRIGGER: { literal: "condition" },
      TIMEOUT: { source: "reporter" },
    });
    f.set("TRIGGER", "timeout");
    expect((await f.session.save()).status).toBe("invalid");
    expect(f.args.TIMEOUT).toEqual({ kind: "reporter" });
    expect(f.requests).toHaveLength(0);
  });
  it("BC16 repairs unknown selector to timeout without requiring unavailable CONDITION", async () => {
    const f = fixture(closeOptions, {
      ...closeSeed,
      TRIGGER: { literal: "unknown" },
      CONDITION: { source: "unsupported" },
    });
    f.set("TRIGGER", "timeout");
    expect((await f.session.save()).status).toBe("saved");
    expect(f.requests[0]!.changes).toEqual([
      { argument: "TRIGGER", value: "timeout" },
    ]);
    expect(f.inputs.CONDITION).toMatchObject({ source: "unsupported" });
  });
});
