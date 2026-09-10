import { describe, expect, it } from "vitest";
import {
  normalizeBubbleReveal,
  revealedBubbleContent,
  revealedBubbleText,
  splitBubbleContent,
  splitBubbleText,
} from "../src/reveal.js";
import {
  bubbleContentPlainText,
  normalizeBubbleContent,
} from "../src/content-run.js";
import * as composition from "../src/composition.js";

const sentence = normalizeBubbleContent([
  { text: "私は ", type: "text" },
  { base: "中野", reading: "なかの", type: "ruby" },
  { text: " です", type: "text" },
]);

describe("Bubble content reveal", () => {
  it("re-exports the same implementation from the composition entry", () => {
    expect(composition.splitBubbleContent).toBe(splitBubbleContent);
    expect(composition.revealedBubbleContent).toBe(revealedBubbleContent);
  });

  it("matches the string path exactly for plain content", () => {
    const source = "one two\nthree\n\nfour";
    for (const unit of ["CHARACTER", "WORD", "LINE", "BLOCK"] as const) {
      const reveal = normalizeBubbleReveal({ unit });
      const content = normalizeBubbleContent(source);
      const chunks = splitBubbleContent(content, reveal);
      expect(chunks.map((chunk) => bubbleContentPlainText(chunk))).toEqual([
        ...splitBubbleText(source, reveal),
      ]);
      for (let count = 0; count <= chunks.length; count += 1) {
        expect(
          bubbleContentPlainText(revealedBubbleContent(chunks, count)),
        ).toBe(revealedBubbleText(splitBubbleText(source, reveal), count));
      }
    }
  });

  it.each(["CHARACTER", "WORD", "LINE", "BLOCK"] as const)(
    "keeps a ruby run whole for the %s reveal unit",
    (unit) => {
      const chunks = splitBubbleContent(
        sentence,
        normalizeBubbleReveal({ unit }),
      );
      const rubyChunks = chunks.filter((chunk) =>
        chunk.some((run) => run.type === "ruby"),
      );
      expect(rubyChunks.length).toBe(1);
      for (const chunk of rubyChunks) {
        expect(chunk.filter((run) => run.type === "ruby")).toEqual([
          { base: "中野", reading: "なかの", type: "ruby" },
        ]);
      }
      // Joining every chunk yields exactly what the string path yields, so
      // hidden WORD delimiters keep being dropped the way they always were.
      const plain = bubbleContentPlainText(sentence);
      expect(
        bubbleContentPlainText(revealedBubbleContent(chunks, chunks.length)),
      ).toBe(
        revealedBubbleText(
          splitBubbleText(plain, normalizeBubbleReveal({ unit })),
          Number.MAX_SAFE_INTEGER,
        ),
      );
    },
  );

  it("reveals a ruby run as one CHARACTER step", () => {
    const chunks = splitBubbleContent(
      sentence,
      normalizeBubbleReveal({ unit: "CHARACTER" }),
    );
    const plain = chunks.map((chunk) => bubbleContentPlainText(chunk));
    expect(plain).toEqual(["私", "は", " ", "中野", " ", "で", "す"]);
    expect(bubbleContentPlainText(revealedBubbleContent(chunks, 4))).toBe(
      "私は 中野",
    );
  });

  it("treats a ruby run as its own WORD unit", () => {
    const chunks = splitBubbleContent(
      sentence,
      normalizeBubbleReveal({ unit: "WORD" }),
    );
    expect(chunks.map((chunk) => bubbleContentPlainText(chunk))).toEqual([
      "私は",
      "中野",
      "です",
    ]);
  });

  it("splits LINE units across runs while ruby stays on its line", () => {
    const content = normalizeBubbleContent([
      { text: "一行目\n", type: "text" },
      { base: "二行", reading: "にぎょう", type: "ruby" },
      { text: "目\n三行目", type: "text" },
    ]);
    const chunks = splitBubbleContent(
      content,
      normalizeBubbleReveal({ unit: "LINE" }),
    );
    expect(chunks.map((chunk) => bubbleContentPlainText(chunk))).toEqual([
      "一行目\n",
      "二行目\n",
      "三行目",
    ]);
    expect(chunks[1]).toEqual([
      { base: "二行", reading: "にぎょう", type: "ruby" },
      { text: "目\n", type: "text" },
    ]);
  });

  it("splits BLOCK units on blank lines and keeps the separator", () => {
    const content = normalizeBubbleContent([
      { base: "前段", reading: "ぜんだん", type: "ruby" },
      { text: "です\n\n後段です", type: "text" },
    ]);
    const chunks = splitBubbleContent(
      content,
      normalizeBubbleReveal({ unit: "BLOCK" }),
    );
    expect(chunks.map((chunk) => bubbleContentPlainText(chunk))).toEqual([
      "前段です\n\n",
      "後段です",
    ]);
    expect(chunks[0]?.[0]).toEqual({
      base: "前段",
      reading: "ぜんだん",
      type: "ruby",
    });
  });

  it("merges adjacent text runs when joining revealed chunks", () => {
    const chunks = splitBubbleContent(
      sentence,
      normalizeBubbleReveal({ unit: "CHARACTER" }),
    );
    expect(revealedBubbleContent(chunks, 3)).toEqual([
      { text: "私は ", type: "text" },
    ]);
    expect(revealedBubbleContent(chunks, 5)).toEqual([
      { text: "私は ", type: "text" },
      { base: "中野", reading: "なかの", type: "ruby" },
      { text: " ", type: "text" },
    ]);
  });
});
