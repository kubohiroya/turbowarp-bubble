import { describe, expect, it } from "vitest";
import {
  normalizeBubbleReveal,
  revealedBubbleText,
  splitBubbleText,
} from "../src/reveal.js";
import * as composition from "../src/composition.js";

describe("Bubble sequential reveal", () => {
  it("re-exports the same implementation from the composition entry", () => {
    expect(composition.normalizeBubbleReveal).toBe(normalizeBubbleReveal);
    expect(composition.splitBubbleText).toBe(splitBubbleText);
    expect(composition.revealedBubbleText).toBe(revealedBubbleText);
  });

  it("splits grapheme characters without breaking emoji", () => {
    const reveal = normalizeBubbleReveal({ unit: "CHARACTER" });
    const chunks = splitBubbleText("A👩‍🚀B", reveal);
    expect(chunks).toEqual(["A", "👩‍🚀", "B"]);
    expect(revealedBubbleText(chunks, 2)).toBe("A👩‍🚀");
  });

  it("supports custom invisible and visible WORD delimiters", () => {
    const hidden = normalizeBubbleReveal({
      unit: "WORD",
      delimiters: "/",
      showDelimiters: false,
    });
    expect(splitBubbleText("私の/名前は/中野/です", hidden)).toEqual([
      "私の",
      "名前は",
      "中野",
      "です",
    ]);
    const visible = normalizeBubbleReveal({
      unit: "WORD",
      delimiters: "/",
      showDelimiters: true,
    });
    expect(revealedBubbleText(splitBubbleText("私の/名前は", visible), 2)).toBe(
      "私の/名前は",
    );
  });

  it("uses space, tab, carriage return, and line feed as WORD defaults", () => {
    const reveal = normalizeBubbleReveal({ unit: "WORD" });
    expect(reveal.delimiters).toBe(" \t\r\n");
    expect(splitBubbleText("one two\tthree\rfour\nfive", reveal)).toEqual([
      "one",
      "two",
      "three",
      "four",
      "five",
    ]);
  });

  it("preserves line and paragraph boundaries", () => {
    expect(
      splitBubbleText(
        "one\ntwo\nthree",
        normalizeBubbleReveal({ unit: "LINE" }),
      ),
    ).toEqual(["one\n", "two\n", "three"]);
    expect(
      splitBubbleText(
        "one\ntwo\n\nthree",
        normalizeBubbleReveal({ unit: "BLOCK" }),
      ),
    ).toEqual(["one\ntwo\n\n", "three"]);
  });
});
