import { describe, expect, it } from "vitest";
import {
  bubbleBodyCenterOffset,
  bubbleBodyMinimumSize,
  bubbleBodySizeForContent,
  bubbleVisualStyles,
  renderBubbleSvg,
} from "../src/bubble-svg.js";

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

  it("keeps short cloud bodies above the non-intersecting minimum", () => {
    expect(bubbleBodyMinimumSize("NORMAL", "THINKING")).toEqual({
      height: 96,
      width: 176,
    });
    const svg = renderBubbleSvg({
      style: "THINKING",
      lines: ["Hi"],
      width: 125,
      height: 88,
      tailDirection: 225,
    });

    expect(svg).toContain('width="176" height="96"');
    expect(svg).toContain('data-bubble-body-width="176"');
    expect(svg).toContain('data-bubble-body-height="96"');
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

  it("renders a continuous body-shape transition without duplicating text", () => {
    const svg = renderBubbleSvg({
      style: "NORMAL",
      lines: ["shape"],
      tailDirection: 90,
      shapeTransition: {
        from: "NORMAL",
        to: "WAVY",
        progress: 0.5,
      },
    });

    expect(svg).toContain('data-bubble-shape-transition-from="NORMAL"');
    expect(svg).toContain('data-bubble-shape-transition-to="WAVY"');
    expect(svg).toContain('data-bubble-shape-transition-progress="0.5000"');
    expect(svg.match(/>shape</gu)).toHaveLength(1);
  });

  it("reports the body-center shift used to align runtime content", () => {
    const shift = bubbleBodyCenterOffset({
      style: "NORMAL",
      width: 220,
      height: 112,
      tailDirection: 270,
      tailLength: 18,
      offset: [10, -10, 120],
    });

    expect(shift.x).toBeCloseTo(27.2);
    expect(shift.y).toBeCloseTo(10);
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

interface Vertex {
  readonly x: number;
  readonly y: number;
}

/**
 * Reads the outline vertices of a tail-less body. For the cloud, the arc end
 * points are the valleys between outward-bulging puffs, so the polygon through
 * them is the cloud's inner envelope. ANNOUNCEMENT's inner frame is a rect.
 */
function outlinePolygons(svg: string): Vertex[][] {
  const polygons: Vertex[][] = [];
  for (const [, d] of svg.matchAll(/<path d="([^"]+)"/gu)) {
    const vertices: Vertex[] = [];
    for (const command of d!.matchAll(/([MLA])([^MLAZ]+)/gu)) {
      const numbers = command[2]!.trim().split(/\s+/u).map(Number);
      vertices.push({ x: numbers.at(-2)!, y: numbers.at(-1)! });
    }
    polygons.push(vertices);
  }
  for (const [, x, y, width, height, radius] of svg.matchAll(
    /<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" rx="([\d.]+)"/gu,
  )) {
    const left = Number(x);
    const top = Number(y);
    const right = left + Number(width);
    const bottom = top + Number(height);
    const r = Number(radius);
    const corners = [
      { cx: right - r, cy: top + r, start: -90 },
      { cx: right - r, cy: bottom - r, start: 0 },
      { cx: left + r, cy: bottom - r, start: 90 },
      { cx: left + r, cy: top + r, start: 180 },
    ];
    polygons.push(
      corners.flatMap(({ cx, cy, start }) =>
        Array.from({ length: 11 }, (_, index) => {
          const radians = ((start + index * 9) * Math.PI) / 180;
          return {
            x: cx + Math.cos(radians) * r,
            y: cy + Math.sin(radians) * r,
          };
        }),
      ),
    );
  }
  return polygons;
}

function inside(point: Vertex, polygon: readonly Vertex[]): boolean {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const a = polygon[i]!;
    const b = polygon[j]!;
    if (
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
    ) {
      result = !result;
    }
  }
  return result;
}

describe("bubbleBodySizeForContent", () => {
  const contentSizes = [
    [24, 20],
    [100, 20],
    [180, 48],
    [320, 61],
    [200, 120],
  ] as const;

  it.each(bubbleVisualStyles.filter((style) => style !== "NO_BUBBLE"))(
    "keeps content clear of the %s outline",
    (style) => {
      for (const [contentWidth, contentHeight] of contentSizes) {
        const { width, height } = bubbleBodySizeForContent({
          contentWidth,
          contentHeight,
          styles: [style],
        });
        const svg = renderBubbleSvg({
          style,
          lines: [],
          width,
          height,
          tailDirection: null,
        });
        // Half the 3px stroke must stay outside the content box.
        const halfWidth = contentWidth / 2 + 1.5;
        const halfHeight = contentHeight / 2 + 1.5;
        const box = {
          left: width / 2 - halfWidth,
          right: width / 2 + halfWidth,
          top: height / 2 - halfHeight,
          bottom: height / 2 + halfHeight,
        };
        const samples: Vertex[] = [];
        for (let t = 0; t <= 1; t += 1 / 32) {
          const x = box.left + (box.right - box.left) * t;
          const y = box.top + (box.bottom - box.top) * t;
          samples.push(
            { x, y: box.top },
            { x, y: box.bottom },
            { x: box.left, y },
            { x: box.right, y },
          );
        }
        const polygons = outlinePolygons(svg);
        expect(polygons.length).toBeGreaterThan(0);
        for (const polygon of polygons) {
          for (const sample of samples) {
            expect(
              inside(sample, polygon),
              `${style} ${contentWidth}x${contentHeight}`,
            ).toBe(true);
          }
          for (const vertex of polygon) {
            const intrudes =
              vertex.x > box.left &&
              vertex.x < box.right &&
              vertex.y > box.top &&
              vertex.y < box.bottom;
            expect(intrudes, `${style} ${contentWidth}x${contentHeight}`).toBe(
              false,
            );
          }
        }
      }
    },
  );

  it("fits every style of a shape transition", () => {
    const content = { contentWidth: 150, contentHeight: 20 };
    const normal = bubbleBodySizeForContent({ ...content, styles: ["NORMAL"] });
    const cloud = bubbleBodySizeForContent({
      ...content,
      styles: ["THINKING"],
    });
    const both = bubbleBodySizeForContent({
      ...content,
      styles: ["NORMAL", "THINKING"],
    });

    expect(both.width).toBeGreaterThanOrEqual(
      Math.max(normal.width, cloud.width) - 4,
    );
    expect(both.height).toBeGreaterThanOrEqual(
      Math.max(normal.height, cloud.height) - 4,
    );
  });

  it("keeps the cloud minimum for short thoughts", () => {
    expect(
      bubbleBodySizeForContent({
        contentWidth: 0,
        contentHeight: 0,
        styles: ["THINKING"],
      }),
    ).toEqual(bubbleBodyMinimumSize("THINKING"));
  });
});
