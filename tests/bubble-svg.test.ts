import { describe, expect, it } from "vitest";
import { bubbleVisualStyles, renderBubbleSvg } from "../src/bubble-svg.js";

describe("renderBubbleSvg", () => {
  it.each(bubbleVisualStyles)("renders the canonical %s SVG", (style) => {
    const svg = renderBubbleSvg({
      style,
      lines: ["表示例"],
      tailDirection: 225,
    });

    expect(svg).toContain('data-bubble-renderer="canonical"');
    expect(svg).toContain(`data-bubble-style="${style}"`);
    expect(svg).toContain("表示例");
  });

  it("uses Scratch direction semantics for the tail", () => {
    const up = renderBubbleSvg({
      style: "NORMAL",
      lines: ["上"],
      tailDirection: 0,
    });
    const right = renderBubbleSvg({
      style: "NORMAL",
      lines: ["右"],
      tailDirection: 90,
    });

    expect(up).not.toEqual(right);
    expect(up).toMatch(/110\.00,7\.00/u);
    expect(right).toMatch(/213\.00,56\.00/u);
  });

  it("escapes text and rejects invalid dimensions", () => {
    expect(
      renderBubbleSvg({ style: "NO_BUBBLE", lines: ["<次へ>"] }),
    ).toContain("&lt;次へ&gt;");
    expect(() =>
      renderBubbleSvg({ style: "NORMAL", lines: [], width: 0 }),
    ).toThrow("dimensions must be positive");
  });
});
