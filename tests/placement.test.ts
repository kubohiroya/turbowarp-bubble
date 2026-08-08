import { describe, expect, it } from "vitest";
import {
  bubbleDirectionAliases,
  bubbleDirectionNames,
  bubbleDirectionVector,
  normalizeBubblePlacement,
} from "../src/placement.js";

describe("Bubble placement", () => {
  it("normalizes canonical names, aliases, and Scratch-style angles", () => {
    expect(normalizeBubblePlacement("up-up-right")).toEqual({
      basis: "actor",
      direction: "up-up-right",
    });
    expect(normalizeBubblePlacement(" NORTH-NORTHEAST ")).toEqual({
      basis: "actor",
      direction: "up-up-right",
    });
    expect(normalizeBubblePlacement(33.75)).toEqual({
      basis: "actor",
      direction: 33.75,
    });
    expect(normalizeBubblePlacement("360")).toEqual({
      basis: "actor",
      direction: 0,
    });
  });

  it("accepts all sixteen canonical names and their aliases", () => {
    expect(bubbleDirectionNames).toHaveLength(16);
    expect(bubbleDirectionAliases).toHaveLength(16);
    for (const [index, name] of bubbleDirectionNames.entries()) {
      expect(normalizeBubblePlacement(name)).toEqual({
        basis: "actor",
        direction: name,
      });
      expect(normalizeBubblePlacement(bubbleDirectionAliases[index])).toEqual({
        basis: "actor",
        direction: name,
      });
    }
  });

  it("normalizes the three background-relative regions", () => {
    for (const region of ["HEADER_LIKE", "CENTER", "FOOTER_LIKE"] as const) {
      expect(normalizeBubblePlacement(region.toLowerCase())).toEqual({
        basis: "background",
        region,
      });
    }
  });

  it("uses Scratch direction vectors without rounding numeric angles", () => {
    expect(bubbleDirectionVector(0)).toEqual({ x: 0, y: 1 });
    expect(bubbleDirectionVector(90)).toEqual({ x: 1, y: 0 });
    expect(bubbleDirectionVector(180)).toEqual({ x: 0, y: -1 });
    expect(bubbleDirectionVector(270)).toEqual({ x: -1, y: 0 });
    expect(bubbleDirectionVector(33.75).x).toBeCloseTo(
      Math.sin((33.75 * Math.PI) / 180),
    );
  });

  it("rejects unsupported names and out-of-range angles", () => {
    for (const value of [-1, 360.1, "auto", "", Number.NaN]) {
      expect(() => normalizeBubblePlacement(value)).toThrow();
    }
  });
});
