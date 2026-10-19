import type {
  FixedInputBinding,
  FixedInputEditorOptions,
  JsonValue,
  LiteralValue,
} from "@kubohiroya/turbowarp-extension-data-editor";
import type { SchemaBundle } from "@kubohiroya/turbowarp-extension-data-editor/schema";
import schemas from "../schemas/block-editor-fixed-inputs.schema.json";
import { extensionConfig } from "./config.js";

interface InputSchema {
  readonly type: string;
  readonly enum?: readonly string[];
  readonly pattern?: string;
  readonly minimum?: number;
  readonly maximum?: number;
  readonly exclusiveMinimum?: number;
}
const contracts = schemas.$defs as Readonly<
  Record<
    string,
    {
      readonly properties: Readonly<Record<string, InputSchema>>;
    }
  >
>;
const repository = "turbowarp-bubble";
const canonicalSource = {
  repository,
  path: "schemas/block-editor-fixed-inputs.schema.json",
};
const contractRevision = "fixed-inputs-v1";
const numberToken = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?$/u;

/** New input only: never run this strict lexical policy over unmodified raw fields. */
export function fixedNumber(value: JsonValue): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || !numberToken.test(value.trim()))
    throw new TypeError("Invalid fixed number.");
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError("Invalid fixed number.");
  return number;
}

function existingNumber(value: LiteralValue): number {
  if (typeof value !== "string" && typeof value !== "number")
    throw new TypeError("Invalid numeric projection.");
  if (typeof value === "string" && value.trim() === "")
    throw new TypeError("Unprojected existing numeric field.");
  const number = Number(value);
  if (!Number.isFinite(number))
    throw new TypeError("Invalid numeric projection.");
  return number;
}

function normalizeChoice(
  opcode: string,
  argument: string,
  value: string,
): string {
  const trimmed = value.trim();
  if (["VISUAL_STYLE", "UNIT", "LAYOUT"].includes(argument))
    return trimmed.toUpperCase();
  if (["TRIGGER", "SHOW", "MODE", "PLACEMENT"].includes(argument)) {
    const lowered = trimmed.toLowerCase();
    return opcode === "setPortraitLayout"
      ? lowered.replaceAll("_", "-")
      : lowered;
  }
  return trimmed;
}

function bundle(opcode: string, argument: string): SchemaBundle {
  // The root is the exact canonical property document, with its JSON pointer recorded as a symbol.
  const source = {
    ...canonicalSource,
    symbol: `/$defs/${opcode}/properties/${argument}`,
  };
  return {
    identity: {
      ownerId: repository,
      contractId: `${opcode}.${argument}`,
      revision: contractRevision,
      variantId: "fixed",
    },
    dialect: "draft-07",
    root: {
      retrievalUri: `${schemas.$id}?binding=${opcode}.${argument}`,
      document: contracts[opcode]!.properties[
        argument
      ] as unknown as SchemaBundle["root"]["document"],
      artifact: { role: "canonical-schema", source },
    },
    resources: [],
    provenance: {
      canonicalSources: [
        source,
        { repository, path: "src/block-definitions.json" },
        { repository, path: "src/extension.ts", symbol: opcode },
      ],
      generatedFiles: [],
      referenceSchemas: [],
      generationSources: [],
    },
  };
}

export function fixedInputEditorOptions(): readonly FixedInputEditorOptions[] {
  return Object.entries(contracts).map(([opcode, contract]) => {
    const bindings: FixedInputBinding[] = Object.entries(
      contract.properties,
    ).map(([argument, schema]) => ({
      argument,
      schemaBundle: bundle(opcode, argument),
      control: schema.enum
        ? {
            kind: "enum",
            choices: schema.enum.map((value) => ({ value, label: value })),
          }
        : {
            kind:
              schema.type === "number" || schema.type === "integer"
                ? "number"
                : "color",
          },
      read(value) {
        if (schema.type === "number" || schema.type === "integer")
          return existingNumber(value);
        if (typeof value !== "string")
          throw new TypeError("Invalid string projection.");
        return schema.enum ? normalizeChoice(opcode, argument, value) : value;
      },
      encode(value) {
        if (schema.type === "number" || schema.type === "integer") {
          fixedNumber(value);
          return typeof value === "number"
            ? Object.is(value, -0)
              ? "-0"
              : String(value)
            : (value as string).trim();
        }
        if (typeof value !== "string")
          throw new TypeError("Invalid fixed string.");
        return value;
      },
      validateCandidate(candidate) {
        let valid: boolean;
        try {
          if (schema.type === "number" || schema.type === "integer") {
            const number = existingNumber(candidate);
            valid =
              (schema.type !== "integer" || Number.isInteger(number)) &&
              (schema.minimum === undefined || number >= schema.minimum) &&
              (schema.maximum === undefined || number <= schema.maximum) &&
              (schema.exclusiveMinimum === undefined ||
                number > schema.exclusiveMinimum);
          } else
            valid =
              typeof candidate === "string" &&
              (schema.enum
                ? schema.enum.includes(candidate)
                : new RegExp(schema.pattern!, "u").test(candidate));
        } catch {
          valid = false;
        }
        return valid
          ? []
          : [{ path: argument, message: "Check this value before saving." }];
      },
    }));
    return {
      apiVersion: 1,
      extensionId: extensionConfig.id,
      editorId: `${extensionConfig.id}.fixed.${opcode}`,
      opcodes: [`${extensionConfig.id}_${opcode}`],
      contractId: `${repository}.${opcode}.fixed`,
      contractRevision,
      bindings,
      validationContext: () => ({
        consumerId: repository,
        nowMs: 0,
        settings: null,
      }),
      ...(opcode === "defineBubbleClosePolicy"
        ? {
            readOnlyArguments: ["CONDITION"],
            dependencies: [{ selector: "TRIGGER", dependents: ["TIMEOUT"] }],
            branchPolicies: [
              {
                selector: "TRIGGER",
                normalize: { trim: true, lowercase: true },
                cases: [
                  {
                    values: ["condition"],
                    activeDependents: [],
                    requireOnSelectorChange: [
                      {
                        argument: "CONDITION",
                        rule: "nonempty-string" as const,
                      },
                    ],
                  },
                  { values: ["timeout"], activeDependents: ["TIMEOUT"] },
                  {
                    values: ["condition-or-timeout"],
                    activeDependents: ["TIMEOUT"],
                    requireOnSelectorChange: [
                      {
                        argument: "CONDITION",
                        rule: "nonempty-string" as const,
                      },
                    ],
                  },
                ],
              },
            ],
          }
        : {}),
    };
  });
}

interface RegistrationRuntime {
  on?(event: string, listener: () => void): void;
  off?(event: string, listener: () => void): void;
}

/** Optional GUI capability; ordinary runtime/composition consumers do not load the editor. */
export function registerFixedInputEditors(
  scratch: unknown,
  runtime: unknown,
): (() => void) | undefined {
  const api = (
    scratch as {
      gui?: {
        blockEditors?: {
          apiVersion?: number;
          registerFixedInputEditor?: (
            options: FixedInputEditorOptions,
          ) => () => void;
        };
      };
    }
  ).gui?.blockEditors;
  if (
    api?.apiVersion !== 1 ||
    typeof api.registerFixedInputEditor !== "function"
  )
    return undefined;
  const events = runtime as RegistrationRuntime;
  const removers: (() => void)[] = [];
  let active = true;
  const dispose = () => {
    if (!active) return;
    active = false;
    events.off?.("RUNTIME_DISPOSED", dispose);
    for (const remove of removers.splice(0).reverse()) remove();
  };
  try {
    for (const options of fixedInputEditorOptions())
      removers.push(api.registerFixedInputEditor.call(api, options));
    events.on?.("RUNTIME_DISPOSED", dispose);
  } catch (error) {
    dispose();
    throw error;
  }
  return dispose;
}
