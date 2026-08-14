import { describe, expect, it } from "vitest";
import {
  bubblePortraitPlacements,
  defaultBubblePortraitOffset,
  normalizeBubblePortraitCornerRadius,
  normalizeBubblePortraitOffset,
  normalizeBubblePortraitPlacement,
} from "../src/portrait-layout.js";

describe("Bubble portrait layout", () => {
  it("accepts all edge and corner placements", () => {
    for (const placement of bubblePortraitPlacements) {
      expect(normalizeBubblePortraitPlacement(placement)).toBe(placement);
      expect(normalizeBubblePortraitPlacement(placement.toUpperCase())).toBe(
        placement,
      );
    }
    expect(normalizeBubblePortraitPlacement("TOP_RIGHT")).toBe("top-right");
  });

  it("normalizes x, y, and optional zoom", () => {
    expect(normalizeBubblePortraitOffset([3, -4])).toEqual({
      x: 3,
      y: -4,
      zoomPercent: defaultBubblePortraitOffset.zoomPercent,
    });
    expect(normalizeBubblePortraitOffset([3, -4, 125])).toEqual({
      x: 3,
      y: -4,
      zoomPercent: 125,
    });
  });

  it("rejects invalid placements, offsets, zoom, and radius", () => {
    expect(() => normalizeBubblePortraitPlacement("center")).toThrow(
      "Unsupported",
    );
    expect(() => normalizeBubblePortraitOffset([0, 0, 0])).toThrow(
      "zoom positive",
    );
    expect(() => normalizeBubblePortraitOffset([0, Number.NaN])).toThrow(
      "finite",
    );
    expect(() => normalizeBubblePortraitCornerRadius(-1)).toThrow(
      "zero or greater",
    );
  });
});
