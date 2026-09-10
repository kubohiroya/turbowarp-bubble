import { describe, expect, it } from "vitest";
import {
  bubbleContentPlainText,
  bubbleContentReadingText,
  isPlainBubbleContent,
  mergeBubbleContent,
  normalizeBubbleContent,
  type BubbleContentRun,
} from "../src/content-run.js";
import * as composition from "../src/composition.js";

const ruby = (base: string, reading: string): BubbleContentRun =>
  Object.freeze({ base, reading, type: "ruby" as const });
const text = (value: string): BubbleContentRun =>
  Object.freeze({ text: value, type: "text" as const });

describe("Bubble content runs", () => {
  it("re-exports the same implementation from the composition entry", () => {
    expect(composition.normalizeBubbleContent).toBe(normalizeBubbleContent);
    expect(composition.bubbleContentPlainText).toBe(bubbleContentPlainText);
    expect(composition.isPlainBubbleContent).toBe(isPlainBubbleContent);
  });

  it("wraps a plain string in a single text run", () => {
    expect(normalizeBubbleContent("hello")).toEqual([
      { text: "hello", type: "text" },
    ]);
    expect(isPlainBubbleContent(normalizeBubbleContent("hello"))).toBe(true);
  });

  it("keeps an empty string addressable as one empty text run", () => {
    expect(normalizeBubbleContent("")).toEqual([{ text: "", type: "text" }]);
    expect(normalizeBubbleContent([])).toEqual([{ text: "", type: "text" }]);
  });

  it("normalizes ruby runs and drops empty text runs", () => {
    const content = normalizeBubbleContent([
      { text: "", type: "text" },
      { base: "中野", reading: "なかの", type: "ruby" },
      { text: "です", type: "text" },
    ]);
    expect(content).toEqual([
      { base: "中野", reading: "なかの", type: "ruby" },
      { text: "です", type: "text" },
    ]);
    expect(isPlainBubbleContent(content)).toBe(false);
  });

  it("projects base text and reading text separately", () => {
    const content = normalizeBubbleContent([
      { text: "私は", type: "text" },
      { base: "中野", reading: "なかの", type: "ruby" },
      { text: "です", type: "text" },
    ]);
    expect(bubbleContentPlainText(content)).toBe("私は中野です");
    expect(bubbleContentReadingText(content)).toBe("なかの");
  });

  it("merges adjacent text runs without touching ruby runs", () => {
    expect(
      mergeBubbleContent([text("a"), text("b"), ruby("字", "じ"), text("c")]),
    ).toEqual([
      { text: "ab", type: "text" },
      { base: "字", reading: "じ", type: "ruby" },
      { text: "c", type: "text" },
    ]);
  });

  it("rejects malformed runs so authored ruby never degrades silently", () => {
    expect(() => normalizeBubbleContent(42)).toThrow(
      /string or content run array/u,
    );
    expect(() => normalizeBubbleContent([{ type: "bold" }])).toThrow(
      /type must be text or ruby/u,
    );
    expect(() =>
      normalizeBubbleContent([{ base: "字", reading: "", type: "ruby" }]),
    ).toThrow(/reading must not be empty/u);
    expect(() =>
      normalizeBubbleContent([{ base: "", reading: "じ", type: "ruby" }]),
    ).toThrow(/base must not be empty/u);
    expect(() =>
      normalizeBubbleContent([{ text: "a", type: "text", weight: 2 }]),
    ).toThrow(/unknown properties/u);
    expect(() =>
      normalizeBubbleContent([{ base: "字", type: "ruby" }]),
    ).toThrow(/reading must be a string/u);
  });
});
