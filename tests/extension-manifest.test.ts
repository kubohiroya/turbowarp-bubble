import { describe, expect, it } from "vitest";
import definitions from "../src/block-definitions.json";
import { extensionConfig } from "../src/config.js";
import {
  createExtensionManifest,
  serializeExtensionManifest,
} from "../src/extension-manifest.js";

describe("extension API manifest", () => {
  it("serializes the public block contract deterministically", () => {
    const manifest = createExtensionManifest(extensionConfig.id, definitions);
    expect(manifest.formatVersion).toBe(1);
    expect(manifest.id).toBe("kubohiroyabubble");
    expect(manifest.blocks.map(({ opcode }) => opcode)).toEqual(
      [...definitions.blocks].map(({ opcode }) => opcode).sort(),
    );
    expect(manifest.blocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ opcode: "finishBubbleReveal" }),
        expect.objectContaining({ opcode: "setBubbleReveal" }),
        expect.objectContaining({ opcode: "shakeBubble" }),
        expect.objectContaining({ opcode: "explodeBubble" }),
        expect.objectContaining({ opcode: "animateBubbleShape" }),
      ]),
    );
    expect(manifest.menus.map(({ id }) => id)).toEqual(
      [...Object.keys(definitions.menus)].sort(),
    );
    expect(serializeExtensionManifest(extensionConfig.id, definitions)).toBe(
      `${JSON.stringify(manifest, null, 2)}\n`,
    );
  });

  it("rejects duplicate opcodes", () => {
    expect(() =>
      createExtensionManifest("fixtureextension", {
        blocks: [
          { opcode: "same", blockType: "COMMAND" },
          { opcode: "same", blockType: "REPORTER" },
        ],
      }),
    ).toThrow("Duplicate block opcode: same");
  });
});
