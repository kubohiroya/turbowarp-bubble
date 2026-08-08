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
    expect(up).toContain("L 101.0000 24.0000 L 110.0000 6.0000 Z");
    expect(right).toContain("L 214.0000 56.0000");
  });

  it("unions the body and border-anchored tail at all 16 directions", () => {
    for (let direction = 0; direction < 360; direction += 22.5) {
      const svg = renderBubbleSvg({
        style: "NORMAL",
        lines: ["連続した輪郭"],
        tailDirection: direction,
      });

      expect(svg).toContain('data-boolean-operation="union"');
      expect(svg).toContain('data-tail-base-on-border="true"');
      expect(svg).not.toContain("<polygon");
      expect(svg.match(/<path\b/gu)).toHaveLength(1);
    }
  });

  it("keeps thought trails separate from polygon union", () => {
    for (const style of ["THINKING", "DREAMING"] as const) {
      const svg = renderBubbleSvg({
        style,
        lines: ["思考"],
        tailDirection: 225,
      });

      expect(svg).not.toContain('data-boolean-operation="union"');
      expect(svg).toContain("<circle");
    }
  });

  it("applies tail length, body offset, scale, and scaled text", () => {
    const baseline = renderBubbleSvg({
      style: "NORMAL",
      lines: ["拡大"],
      tailDirection: 90,
    });
    const transformed = renderBubbleSvg({
      style: "NORMAL",
      lines: ["拡大"],
      tailDirection: 90,
      tailLength: 30,
      offset: [10, -10, 120],
      fontSize: 15,
    });

    expect(transformed).not.toEqual(baseline);
    expect(transformed).toContain('font-size="18"');
    expect(transformed).toContain('data-boolean-operation="union"');
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
