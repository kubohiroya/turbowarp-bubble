import { describe, expect, it } from "vitest";
import {
  normalizeBubbleReveal,
  revealedBubbleText,
  splitBubbleText,
} from "../src/reveal.js";

describe("Bubble sequential reveal", () => {
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
