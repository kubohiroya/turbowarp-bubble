import { describe, expect, it } from "vitest";
import {
  actorRelativeBubbleCenter,
  normalizeBubbleDistance,
  normalizeBubbleOffset,
  normalizeBubbleTailLength,
} from "../src/actor-transform.js";

const bounds = { bottom: -20, left: -20, right: 20, top: 20 };

describe("actor-relative Bubble transform", () => {
  it("normalizes distance, tail length, and tuple offsets", () => {
    expect(normalizeBubbleDistance(0)).toBe(0);
    expect(normalizeBubbleTailLength(18)).toBe(18);
    expect(normalizeBubbleOffset([10, -10])).toEqual({
      x: 10,
      y: -10,
      scalePercent: 100,
    });
    expect(normalizeBubbleOffset([10, -10, 120])).toEqual({
      x: 10,
      y: -10,
      scalePercent: 120,
    });
    expect(() => normalizeBubbleDistance(-1)).toThrow("zero or greater");
    expect(() => normalizeBubbleTailLength(0)).toThrow("greater than zero");
    expect(() => normalizeBubbleOffset([0, 0, 0])).toThrow("greater than zero");
  });

  it("keeps the actor-side body edge fixed when scaling without x/y offset", () => {
    const normal = actorRelativeBubbleCenter({
      bounds,
      bubbleWidth: 100,
      bubbleHeight: 60,
      direction: "right",
      distance: 12,
      tailLength: 18,
      offset: normalizeBubbleOffset([0, 0]),
    });
    const enlarged = actorRelativeBubbleCenter({
      bounds,
      bubbleWidth: 120,
      bubbleHeight: 72,
      direction: "right",
      distance: 12,
      tailLength: 18,
      offset: normalizeBubbleOffset([0, 0, 120]),
    });

    expect(normal).toEqual({ x: 100, y: 0 });
    expect(enlarged).toEqual({ x: 110, y: 0 });
    expect(normal.x - 100 / 2).toBe(enlarged.x - 120 / 2);
  });

  it("adds x/y offsets after directional placement", () => {
    expect(
      actorRelativeBubbleCenter({
        bounds,
        bubbleWidth: 100,
        bubbleHeight: 60,
        direction: "up",
        distance: 12,
        tailLength: 18,
        offset: normalizeBubbleOffset([10, -10]),
      }),
    ).toEqual({ x: 10, y: 70 });
  });
});
