import { describe, expect, it } from "vitest";
import {
  UnicodeLineBreakProvider,
  wrapText,
  type LineBreakProvider,
} from "../src/text-layout.js";

const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });
const measureText = (text: string): number =>
  [...segmenter.segment(text)].length * 10;

describe("UnicodeLineBreakProvider", () => {
  it("keeps Japanese closing punctuation and small kana off line starts", () => {
    const provider = new UnicodeLineBreakProvider();
    const punctuation = provider.getBreakOpportunities("これは、本文です。");
    const smallKana = provider.getBreakOpportunities("新しいキャラクター");

    expect(punctuation.some(({ position }) => position === 3)).toBe(false);
    expect(punctuation.some(({ position }) => position === 4)).toBe(true);
    expect(smallKana.some(({ position }) => position === 4)).toBe(false);
    expect(smallKana.some(({ position }) => position === 5)).toBe(true);
  });

  it("reports explicit and final breaks as required", () => {
    const opportunities = new UnicodeLineBreakProvider().getBreakOpportunities(
      "A\nB",
    );

    expect(opportunities).toContainEqual({ position: 2, required: true });
    expect(opportunities.at(-1)).toEqual({ position: 3, required: true });
  });

  it("removes break positions inside an emoji grapheme cluster", () => {
    const opportunities = new UnicodeLineBreakProvider().getBreakOpportunities(
      "👨‍👩‍👧‍👦です",
    );

    expect(opportunities.map(({ position }) => position)).toEqual([11, 12, 13]);
  });
});

describe("wrapText", () => {
  it("uses measured width and legal Japanese break positions", () => {
    const layout = wrapText({
      text: "これは、とても長いセリフです。",
      maxWidth: 40,
      measureText,
    });

    expect(layout.lines.map(({ text }) => text)).toEqual([
      "これは、",
      "とても長",
      "いセリフ",
      "です。",
    ]);
    expect(layout.maxLineWidth).toBe(40);
    expect(
      layout.lines.every(({ text }) => !/^[、。ャュョッ]/u.test(text)),
    ).toBe(true);
  });

  it("preserves explicit and empty lines with original offsets", () => {
    const layout = wrapText({
      text: "A\r\n\nB",
      maxWidth: 100,
      measureText,
    });

    expect(layout.lines).toEqual([
      { text: "A", start: 0, end: 1, width: 10 },
      { text: "", start: 3, end: 3, width: 0 },
      { text: "B", start: 4, end: 5, width: 10 },
    ]);
  });

  it("falls back at grapheme boundaries for an unbreakable run", () => {
    const noBreaks: LineBreakProvider = {
      getBreakOpportunities: (text) => [
        { position: text.length, required: true },
      ],
    };
    const layout = wrapText({
      text: "👨‍👩‍👧‍👦ABC",
      maxWidth: 10,
      measureText,
      lineBreakProvider: noBreaks,
    });

    expect(layout.lines.map(({ text }) => text)).toEqual(["👨‍👩‍👧‍👦", "A", "B", "C"]);
  });

  it("allows one oversized grapheme without looping", () => {
    const layout = wrapText({
      text: "大",
      maxWidth: 5,
      measureText,
    });

    expect(layout.lines).toEqual([{ text: "大", start: 0, end: 1, width: 10 }]);
  });

  it("rejects invalid dimensions and measurements", () => {
    expect(() => wrapText({ text: "A", maxWidth: 0, measureText })).toThrow(
      "maxWidth must be a positive finite number",
    );
    expect(() =>
      wrapText({ text: "A", maxWidth: 10, measureText: () => Number.NaN }),
    ).toThrow("measureText must return a non-negative finite number");
  });
});
