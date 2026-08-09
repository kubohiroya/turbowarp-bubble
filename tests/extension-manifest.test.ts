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
    expect(manifest).toEqual({
      formatVersion: 1,
      id: "kubohiroyabubble",
      blocks: [
        { opcode: "closeBubble", blockType: "COMMAND", arguments: [] },
        {
          opcode: "defineBubbleStyle",
          blockType: "COMMAND",
          arguments: [
            { id: "STYLE", type: "STRING" },
            { id: "TEXT_STYLE", type: "STRING" },
          ],
        },
        { opcode: "getVersion", blockType: "REPORTER", arguments: [] },
        {
          opcode: "sayWithBubbleStyle",
          blockType: "COMMAND",
          arguments: [
            { id: "MESSAGE", type: "STRING" },
            { id: "STYLE", type: "STRING" },
          ],
        },
        {
          opcode: "setBlinkFrames",
          blockType: "COMMAND",
          arguments: [
            { id: "ASSETS", type: "STRING" },
            { id: "SECONDS", type: "NUMBER" },
            { id: "STYLE", type: "STRING" },
          ],
        },
        {
          opcode: "setBubbleAnimationMode",
          blockType: "COMMAND",
          arguments: [{ id: "MODE", type: "STRING", menu: "animationMode" }],
        },
        {
          opcode: "setBubbleDistance",
          blockType: "COMMAND",
          arguments: [
            { id: "DISTANCE", type: "NUMBER" },
            { id: "STYLE", type: "STRING" },
          ],
        },
        {
          opcode: "setBubbleOffset",
          blockType: "COMMAND",
          arguments: [
            { id: "SCALE", type: "NUMBER" },
            { id: "STYLE", type: "STRING" },
            { id: "X", type: "NUMBER" },
            { id: "Y", type: "NUMBER" },
          ],
        },
        {
          opcode: "setBubblePlacement",
          blockType: "COMMAND",
          arguments: [
            { id: "PLACEMENT", type: "STRING", menu: "placement" },
            { id: "STYLE", type: "STRING" },
          ],
        },
        {
          opcode: "setBubbleTailLength",
          blockType: "COMMAND",
          arguments: [
            { id: "LENGTH", type: "NUMBER" },
            { id: "STYLE", type: "STRING" },
          ],
        },
        {
          opcode: "setBubbleVisualStyle",
          blockType: "COMMAND",
          arguments: [
            { id: "STYLE", type: "STRING" },
            {
              id: "VISUAL_STYLE",
              type: "STRING",
              menu: "visualStyle",
            },
          ],
        },
        {
          opcode: "setContinueFrames",
          blockType: "COMMAND",
          arguments: [
            { id: "ASSETS", type: "STRING" },
            { id: "SECONDS", type: "NUMBER" },
            { id: "STYLE", type: "STRING" },
          ],
        },
        {
          opcode: "setLipSyncFrames",
          blockType: "COMMAND",
          arguments: [
            { id: "ASSETS", type: "STRING" },
            { id: "SECONDS", type: "NUMBER" },
            { id: "STYLE", type: "STRING" },
          ],
        },
        {
          opcode: "setPortraitBase",
          blockType: "COMMAND",
          arguments: [
            { id: "ASSET", type: "STRING" },
            { id: "STYLE", type: "STRING" },
          ],
        },
        {
          opcode: "thinkWithBubbleStyle",
          blockType: "COMMAND",
          arguments: [
            { id: "MESSAGE", type: "STRING" },
            { id: "STYLE", type: "STRING" },
          ],
        },
        {
          opcode: "waitForBubbleContinue",
          blockType: "COMMAND",
          arguments: [
            { id: "CONDITION", type: "STRING" },
            { id: "TIMEOUT", type: "NUMBER" },
          ],
        },
      ],
      menus: [
        { id: "animationMode", acceptReporters: true },
        { id: "placement", acceptReporters: true },
        { id: "visualStyle", acceptReporters: true },
      ],
    });
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
