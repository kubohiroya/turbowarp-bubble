import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
});

function createScratch(
  unsandboxed: boolean,
): ScratchApi & { registered: TurboWarpExtension[] } {
  const registered: TurboWarpExtension[] = [];
  return {
    ArgumentType: { NUMBER: "number", STRING: "string" },
    BlockType: { COMMAND: "command", REPORTER: "reporter" },
    Cast: {
      toNumber: (value: unknown) => Number(value),
      toString: (value: unknown) => String(value),
    },
    extensions: {
      register: (extension) => registered.push(extension),
      unsandboxed,
    },
    registered,
    translate: (value) => (typeof value === "string" ? value : value.default),
    vm: { runtime: { on: () => undefined } },
  };
}

describe("extension entry point", () => {
  it("registers in an unsandboxed TurboWarp environment", async () => {
    const scratch = createScratch(true);
    vi.stubGlobal("Scratch", scratch);

    await import("../src/index.js");

    expect(scratch.registered).toHaveLength(1);
  });

  it("rejects sandboxed execution", async () => {
    vi.stubGlobal("Scratch", createScratch(false));

    await expect(import("../src/index.js")).rejects.toThrow(
      "Bubble must run unsandboxed.",
    );
  });
});
