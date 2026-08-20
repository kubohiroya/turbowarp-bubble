import { describe, expect, it } from "vitest";
import {
  bubbleLayoutProfileForStyleInput,
  formatScratchBubbleArgument,
  layoutScratchBubbleText,
  positionScratchBubble,
  renderScratchBubbleSvg,
  scratchBubbleMetrics,
} from "../src/scratch-default.js";

describe("Scratch-compatible default Bubble profile", () => {
  it("selects the profile only for the unmodified default text style", () => {
    expect(
      bubbleLayoutProfileForStyleInput({
        name: "dialogue",
        textStyle: "default",
      }),
    ).toBe("scratch-default");
    expect(
      bubbleLayoutProfileForStyleInput({
        name: "dialogue",
        textStyle: "default",
        visualStyle: "NORMAL",
      }),
    ).toBe("custom");
    expect(
      bubbleLayoutProfileForStyleInput({
        name: "dialogue",
        textStyle: "cinematic",
      }),
    ).toBe("custom");
  });

  it("formats numeric block arguments and enforces the 330-character limit", () => {
    expect(formatScratchBubbleArgument(1.234)).toBe("1.23");
    expect(formatScratchBubbleArgument(0.001)).toBe("0.001");
    expect(formatScratchBubbleArgument("x".repeat(400))).toHaveLength(330);
  });

  it("uses Scratch dimensions for short and wrapped text", () => {
    const short = layoutScratchBubbleText("Hi", (text) => text.length * 7);
    expect(scratchBubbleMetrics(short)).toEqual({
      bodyHeight: 40,
      bodyWidth: 74,
      height: 52,
      paddedHeight: 36,
      paddedWidth: 70,
      width: 74,
    });

    const wrapped = layoutScratchBubbleText(
      "one two three",
      (text) => text.length * 20,
    );
    expect(wrapped.lines.length).toBeGreaterThan(1);
    expect(wrapped.maxLineWidth).toBeLessThanOrEqual(170);
    expect(scratchBubbleMetrics(wrapped).height).toBe(
      wrapped.lines.length * 16 + 36,
    );
  });

  it("starts on the right, flips only when the left fits, and fences the top", () => {
    const right = positionScratchBubble({
      bounds: { bottom: -20, left: -20, right: 20, top: 20 },
      height: 52,
      pointsLeft: false,
      stageHeight: 360,
      stageWidth: 480,
      width: 74,
    });
    expect(right).toEqual({
      centerX: 57,
      centerY: 6,
      left: 20,
      pointsLeft: false,
      top: 32,
    });

    const left = positionScratchBubble({
      bounds: { bottom: 170, left: 180, right: 220, top: 180 },
      height: 52,
      pointsLeft: false,
      stageHeight: 360,
      stageWidth: 480,
      width: 74,
    });
    expect(left.pointsLeft).toBe(true);
    expect(left.left).toBe(106);
    expect(left.top).toBe(180);
  });

  it("points say and think tails toward the actor while keeping text unmirrored", () => {
    const layout = layoutScratchBubbleText("Hello", (text) => text.length * 7);
    const say = renderScratchBubbleSvg({
      kind: "say",
      layout,
      pointsLeft: false,
    });
    const think = renderScratchBubbleSvg({
      kind: "think",
      layout,
      pointsLeft: true,
    });
    expect(say).toContain('data-bubble-kind="say"');
    expect(say).not.toContain("<circle");
    expect(say.match(/scale\(-1 1\)/gu)).toHaveLength(1);
    expect(say.match(/paint-order="stroke fill"/gu)).toHaveLength(1);
    expect(think).toContain('data-bubble-kind="think"');
    expect(think).toContain("<circle");
    expect(think).not.toContain("scale(-1 1)");
    expect(think.match(/paint-order="stroke fill"/gu)).toHaveLength(3);
    expect(think).toContain(">Hello</text>");
  });

  it("escapes basic-profile text before it enters the canonical SVG", () => {
    const layout = layoutScratchBubbleText("<script>alert(1)</script>");
    const svg = renderScratchBubbleSvg({
      kind: "say",
      layout,
      pointsLeft: false,
    });

    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&lt;script&gt;");
  });
});
