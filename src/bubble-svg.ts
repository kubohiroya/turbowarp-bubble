import jsclipper from "jsclipper";
import type { BubbleOffset, BubbleOffsetInput } from "./actor-transform.js";

const svgDefaultTailLength = 18;
const svgDefaultOffset: BubbleOffset = Object.freeze({
  x: 0,
  y: 0,
  scalePercent: 100,
});

function normalizeSvgTailLength(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new TypeError("Bubble tail length must be greater than zero.");
  }
  return value;
}

function normalizeSvgOffset(value: BubbleOffsetInput): BubbleOffset {
  if (value.length !== 2 && value.length !== 3) {
    throw new TypeError("Bubble offset must be [x, y] or [x, y, scale].");
  }
  const [x, y, scalePercent = 100] = value;
  if (![x, y, scalePercent].every(Number.isFinite) || scalePercent <= 0) {
    throw new TypeError(
      "Bubble offset values must be finite and scale positive.",
    );
  }
  return Object.freeze({ x, y, scalePercent });
}

export const bubbleVisualStyles = Object.freeze([
  "NORMAL",
  "THINKING",
  "DREAMING",
  "YELLING",
  "OFF_PANEL",
  "WAVY",
  "WHISPERING",
  "ANNOUNCEMENT",
  "NARRATION",
  "NO_BUBBLE",
] as const);

export type BubbleVisualStyle = (typeof bubbleVisualStyles)[number];

const cloudBodyMinimumSize = Object.freeze({ height: 96, width: 176 });
const emptyBodyMinimumSize = Object.freeze({ height: 0, width: 0 });

export function bubbleBodyMinimumSize(
  ...styles: readonly BubbleVisualStyle[]
): Readonly<{ height: number; width: number }> {
  return styles.some((style) => style === "THINKING" || style === "DREAMING")
    ? cloudBodyMinimumSize
    : emptyBodyMinimumSize;
}

/** Distance from the SVG edge to the body box; the margin hosts the tail. */
const bodyMargin = 24;
/** Gap kept between the content box and the inside of the outline stroke. */
export const bubbleContentClearance = 6;
const contentFitStep = 2;
const contentFitMaximumSteps = 400;
const contentFitCache = new Map<string, Readonly<SizeLike>>();
const contentFitCacheLimit = 128;

interface SizeLike {
  readonly height: number;
  readonly width: number;
}

/**
 * The region of a style's body that content may occupy without touching the
 * border. Undefined means the style draws no outline around the content.
 */
function contentRegion(
  style: BubbleVisualStyle,
  width: number,
  height: number,
): readonly Point[] | undefined {
  switch (style) {
    case "NO_BUBBLE":
      return undefined;
    case "THINKING":
    case "DREAMING":
      return cloudValleyPoints(width, height);
    case "YELLING":
      return burstBodyPoints(width, height);
    case "WAVY":
      return wavyBodyPoints(width, height);
    case "ANNOUNCEMENT":
      return roundedRectanglePoints(width, height, 13, 30);
    case "NORMAL":
    case "OFF_PANEL":
    case "WHISPERING":
    case "NARRATION":
      return roundedRectanglePoints(width, height);
  }
}

function pointInPolygon(point: Point, polygon: readonly Point[]): boolean {
  let inside = false;
  for (
    let index = 0, previousIndex = polygon.length - 1;
    index < polygon.length;
    previousIndex = index, index += 1
  ) {
    const current = polygon[index];
    const previous = polygon[previousIndex];
    if (!current || !previous) continue;
    if (
      current.y > point.y !== previous.y > point.y &&
      point.x <
        ((previous.x - current.x) * (point.y - current.y)) /
          (previous.y - current.y) +
          current.x
    ) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Counts the sample points where a centered content box, inflated by the
 * clearance, escapes the polygon, plus polygon vertices poking into the box.
 * Zero means the content fits inside the outline.
 */
function contentOverflow(
  polygon: readonly Point[],
  width: number,
  height: number,
  contentWidth: number,
  contentHeight: number,
): number {
  const halfWidth = contentWidth / 2 + bubbleContentClearance;
  const halfHeight = contentHeight / 2 + bubbleContentClearance;
  const left = width / 2 - halfWidth;
  const right = width / 2 + halfWidth;
  const top = height / 2 - halfHeight;
  const bottom = height / 2 + halfHeight;
  const outside = (x: number, y: number): number =>
    pointInPolygon({ x, y }, polygon) ? 0 : 1;
  let count = 0;
  const columns = Math.max(1, Math.ceil((right - left) / 4));
  const rows = Math.max(1, Math.ceil((bottom - top) / 4));
  for (let index = 0; index <= columns; index += 1) {
    const sampleX = left + ((right - left) * index) / columns;
    count += outside(sampleX, top) + outside(sampleX, bottom);
  }
  for (let index = 1; index < rows; index += 1) {
    const sampleY = top + ((bottom - top) * index) / rows;
    count += outside(left, sampleY) + outside(right, sampleY);
  }
  for (const vertex of polygon) {
    if (
      vertex.x > left &&
      vertex.x < right &&
      vertex.y > top &&
      vertex.y < bottom
    ) {
      count += 1;
    }
  }
  return count;
}

/**
 * Computes the Bubble SVG size whose visible outline encloses a content box of
 * the given size with {@link bubbleContentClearance} to spare, for every listed
 * style (all styles of a shape transition must fit the same content).
 */
export function bubbleBodySizeForContent(input: {
  readonly contentWidth: number;
  readonly contentHeight: number;
  readonly styles: readonly BubbleVisualStyle[];
}): Readonly<{ height: number; width: number }> {
  const contentWidth = Math.max(0, input.contentWidth);
  const contentHeight = Math.max(0, input.contentHeight);
  if (!Number.isFinite(contentWidth) || !Number.isFinite(contentHeight)) {
    throw new TypeError("Bubble content size must be finite.");
  }
  const styles = [...new Set(input.styles)];
  const key = `${styles.join(",")}:${contentWidth}:${contentHeight}`;
  const cached = contentFitCache.get(key);
  if (cached) return cached;
  const overflowAt = (width: number, height: number): number =>
    styles.reduce((sum, style) => {
      const region = contentRegion(style, width, height);
      return region
        ? sum +
            contentOverflow(region, width, height, contentWidth, contentHeight)
        : sum;
    }, 0);
  const minimum = bubbleBodyMinimumSize(...styles);
  let width = Math.max(contentWidth + bodyMargin * 2, minimum.width);
  let height = Math.max(contentHeight + bodyMargin * 2, minimum.height);
  // Greedy search: grow whichever axis removes more overflow, both on a tie.
  for (
    let step = 0;
    step < contentFitMaximumSteps && overflowAt(width, height) > 0;
    step += 1
  ) {
    const wider = overflowAt(width + contentFitStep, height);
    const taller = overflowAt(width, height + contentFitStep);
    if (wider <= taller) width += contentFitStep;
    if (taller <= wider) height += contentFitStep;
  }
  const result = Object.freeze({ height, width });
  if (contentFitCache.size >= contentFitCacheLimit) {
    const oldest = contentFitCache.keys().next().value;
    if (oldest !== undefined) contentFitCache.delete(oldest);
  }
  contentFitCache.set(key, result);
  return result;
}

export interface RenderBubbleSvgInput {
  readonly style: BubbleVisualStyle;
  readonly lines: readonly string[];
  readonly width?: number;
  readonly height?: number;
  /** Scratch direction: 0 is up, 90 is right. */
  readonly tailDirection?: number | null;
  readonly tailLength?: number;
  readonly offset?: BubbleOffsetInput;
  readonly fillColor?: string;
  readonly borderColor?: string;
  readonly textColor?: string;
  readonly fontFamily?: string;
  readonly fontSize?: number;
  readonly title?: string;
  /**
   * Cross-fades two Bubble body geometries while keeping the text layer
   * stable. This is used by the runtime adapter for animateBubbleShape.
   */
  readonly shapeTransition?: BubbleShapeTransition;
}

export interface BubbleShapeTransition {
  readonly from: BubbleVisualStyle;
  readonly to: BubbleVisualStyle;
  readonly progress: number;
}

export interface BubbleBodyCenterOffsetInput {
  readonly style: BubbleVisualStyle;
  readonly width: number;
  readonly height: number;
  readonly tailDirection: number;
  readonly tailLength?: number;
  readonly offset: BubbleOffsetInput;
}

interface Point {
  readonly x: number;
  readonly y: number;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function requireDimension(value: number | undefined, fallback: number): number {
  const normalized = value ?? fallback;
  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw new TypeError("Bubble SVG dimensions must be positive and finite.");
  }
  return normalized;
}

function normalizeDirection(value: number | null | undefined): number | null {
  if (value === null) return null;
  const direction = value ?? 180;
  if (!Number.isFinite(direction)) {
    throw new TypeError("tailDirection must be finite.");
  }
  return ((direction % 360) + 360) % 360;
}

function roundedRectanglePoints(
  width: number,
  height: number,
  radius = 18,
  inset = 24,
): Point[] {
  const left = inset;
  const top = inset;
  const right = width - inset;
  const bottom = height - inset;
  const segmentsPerCorner = 10;
  const corners = [
    { centerX: right - radius, centerY: top + radius, start: -90 },
    { centerX: right - radius, centerY: bottom - radius, start: 0 },
    { centerX: left + radius, centerY: bottom - radius, start: 90 },
    { centerX: left + radius, centerY: top + radius, start: 180 },
  ];
  return corners.flatMap(({ centerX, centerY, start }) =>
    Array.from({ length: segmentsPerCorner + 1 }, (_, index) => {
      const angle = start + (index * 90) / segmentsPerCorner;
      const radians = (angle * Math.PI) / 180;
      return {
        x: centerX + Math.cos(radians) * radius,
        y: centerY + Math.sin(radians) * radius,
      };
    }),
  );
}

function cross(left: Point, right: Point): number {
  return left.x * right.y - left.y * right.x;
}

function subtract(left: Point, right: Point): Point {
  return { x: left.x - right.x, y: left.y - right.y };
}

function distance(left: Point, right: Point): number {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

function walkPath(
  points: readonly Point[],
  startIndex: number,
  step: 1 | -1,
  requestedDistance: number,
): Point {
  let currentIndex = startIndex;
  let remaining = requestedDistance;
  while (remaining > 0) {
    const nextIndex = (currentIndex + step + points.length) % points.length;
    const current = points[currentIndex];
    const next = points[nextIndex];
    if (!current || !next) throw new Error("Bubble border path is invalid.");
    const segmentLength = distance(current, next);
    if (remaining <= segmentLength) {
      const ratio = remaining / segmentLength;
      return {
        x: current.x + (next.x - current.x) * ratio,
        y: current.y + (next.y - current.y) * ratio,
      };
    }
    remaining -= segmentLength;
    currentIndex = nextIndex;
  }
  const result = points[currentIndex];
  if (!result) throw new Error("Bubble border path is empty.");
  return result;
}

function tailGeometryForPolygon(
  body: readonly Point[],
  center: Point,
  ray: Point,
  tipDistance: number,
  fixedTip?: Point,
): {
  readonly base: readonly [Point, Point];
  readonly borderPoint: Point;
  readonly tip: Point;
} {
  let selected:
    | {
        readonly edgeIndex: number;
        readonly point: Point;
        readonly rayScale: number;
      }
    | undefined;

  for (let edgeIndex = 0; edgeIndex < body.length; edgeIndex += 1) {
    const edgeStart = body[edgeIndex];
    const edgeEnd = body[(edgeIndex + 1) % body.length];
    if (!edgeStart || !edgeEnd) continue;
    const segment = subtract(edgeEnd, edgeStart);
    const denominator = cross(ray, segment);
    if (Math.abs(denominator) < 1e-9) continue;
    const fromCenter = subtract(edgeStart, center);
    const rayScale = cross(fromCenter, segment) / denominator;
    const segmentScale = cross(fromCenter, ray) / denominator;
    if (
      rayScale < 0 ||
      segmentScale < -1e-9 ||
      segmentScale > 1 + 1e-9 ||
      (selected && rayScale >= selected.rayScale)
    ) {
      continue;
    }
    selected = {
      edgeIndex,
      point: {
        x: center.x + ray.x * rayScale,
        y: center.y + ray.y * rayScale,
      },
      rayScale,
    };
  }
  if (!selected) throw new Error("Tail ray does not intersect Bubble border.");

  const borderWithIntersection = [
    ...body.slice(0, selected.edgeIndex + 1),
    selected.point,
    ...body.slice(selected.edgeIndex + 1),
  ];
  const intersectionIndex = selected.edgeIndex + 1;
  return {
    borderPoint: selected.point,
    base: [
      walkPath(borderWithIntersection, intersectionIndex, -1, 9),
      walkPath(borderWithIntersection, intersectionIndex, 1, 9),
    ],
    tip: {
      x: fixedTip?.x ?? center.x + ray.x * (selected.rayScale + tipDistance),
      y: fixedTip?.y ?? center.y + ray.y * (selected.rayScale + tipDistance),
    },
  };
}

function directionRay(direction: number): Point {
  const radians = (direction * Math.PI) / 180;
  return { x: Math.sin(radians), y: -Math.cos(radians) };
}

function transformPoint(
  point: Point,
  center: Point,
  bodyCenter: Point,
  scale: number,
): Point {
  return {
    x: bodyCenter.x + (point.x - center.x) * scale,
    y: bodyCenter.y + (point.y - center.y) * scale,
  };
}

function transformedBodyGeometry(
  body: readonly Point[],
  width: number,
  height: number,
  direction: number,
  tailLength: number,
  offset: BubbleOffset,
): {
  readonly body: readonly Point[];
  readonly bodyCenter: Point;
  readonly tip: Point;
} {
  const center = { x: width / 2, y: height / 2 };
  const ray = directionRay(direction);
  const baseline = tailGeometryForPolygon(body, center, ray, tailLength);
  const borderRadius = distance(center, baseline.borderPoint);
  const scale = offset.scalePercent / 100;
  const bodyCenter = {
    x: center.x - ray.x * borderRadius * (scale - 1) + offset.x,
    // Bubble offset uses Stage coordinates, where positive y points upward.
    y: center.y - ray.y * borderRadius * (scale - 1) - offset.y,
  };
  return {
    body: body.map((point) => transformPoint(point, center, bodyCenter, scale)),
    bodyCenter,
    tip: baseline.tip,
  };
}

function polygonPath(points: readonly Point[]): string {
  const first = points[0];
  if (!first) throw new Error("Bubble polygon is empty.");
  return `M ${first.x.toFixed(4)} ${first.y.toFixed(4)} ${points
    .slice(1)
    .map(({ x, y }) => `L ${x.toFixed(4)} ${y.toFixed(4)}`)
    .join(" ")} Z`;
}

function polygonArea(points: readonly Point[]): number {
  return Math.abs(
    points.reduce((area, point, index) => {
      const next = points[(index + 1) % points.length];
      if (!next) return area;
      return area + point.x * next.y - next.x * point.y;
    }, 0) / 2,
  );
}

function bodyPath(
  points: readonly Point[],
  fill: string,
  border: string,
  extra = "",
): string {
  return `<path d="${polygonPath(points)}" fill="${fill}" stroke="${border}" stroke-width="3" stroke-linejoin="round" ${extra}/>`;
}

function unionBodyAndTail(
  body: readonly Point[],
  bodyCenter: Point,
  tip: Point,
  fill: string,
  border: string,
  extra = "",
): string {
  const tipVector = subtract(tip, bodyCenter);
  const tipDistance = Math.hypot(tipVector.x, tipVector.y);
  if (!(tipDistance > 0)) {
    throw new TypeError("Bubble body center and tail tip must differ.");
  }
  const geometry = tailGeometryForPolygon(
    body,
    bodyCenter,
    { x: tipVector.x / tipDistance, y: tipVector.y / tipDistance },
    0,
    tip,
  );
  const toClipperPath = (points: readonly Point[]): [number, number][] =>
    points.map(({ x, y }) => [x, y]);
  const solution = jsclipper.union(
    [toClipperPath(body)],
    [[toClipperPath([geometry.base[0], geometry.tip, geometry.base[1]])]],
  );
  if (!solution || solution.length === 0) {
    throw new Error("JSClipper failed to union Bubble body and tail.");
  }
  const outer = solution
    .map((path) => path.map(([x, y]) => ({ x, y })))
    .sort((left, right) => polygonArea(right) - polygonArea(left))[0];
  if (!outer) throw new Error("JSClipper returned an empty Bubble outline.");
  return `<path d="${polygonPath(outer)}" fill="${fill}" stroke="${border}" stroke-width="3" stroke-linejoin="round" data-boolean-operation="union" data-tail-base-on-border="true" ${extra}/>`;
}

/** Relative chord lengths that keep cloud puffs from looking machine-regular. */
const cloudPuffRhythm = Object.freeze([
  1, 0.78, 1.14, 0.88, 1.06, 0.8, 1.2, 0.92,
]);

/**
 * Returns the valleys between cloud puffs. Every puff bulges outward from the
 * polygon through these points, so the polygon is the cloud's inner envelope.
 */
function cloudValleyPoints(width: number, height: number): Point[] {
  const margin = 24;
  const boxWidth = width - margin * 2;
  const boxHeight = height - margin * 2;
  const centerX = width / 2;
  const centerY = height / 2;
  // Puffs are near-semicircular arcs; their height above the base curve is
  // about a third of the chord, so the base curve is inset by that amount.
  // Puff size grows slowly with the body so a larger body mostly adds room
  // for content instead of just making every puff bigger.
  const nominalChord = Math.min(
    40,
    Math.max(
      22,
      20 +
        Math.min(boxWidth, boxHeight) * 0.12 +
        Math.max(boxWidth, boxHeight) * 0.03,
    ),
  );
  const puffHeight = nominalChord * 0.34;
  const radiusX = Math.max(1, boxWidth / 2 - puffHeight);
  const radiusY = Math.max(1, boxHeight / 2 - puffHeight);
  // A squarish superellipse leaves more room for text than a plain ellipse.
  const exponent = 3;
  const base = (angle: number): Point => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: centerX + radiusX * Math.sign(cos) * Math.abs(cos) ** (2 / exponent),
      y: centerY + radiusY * Math.sign(sin) * Math.abs(sin) ** (2 / exponent),
    };
  };
  const samples = 720;
  const cumulative = [0];
  let previous = base(-Math.PI / 2);
  for (let index = 1; index <= samples; index += 1) {
    const current = base(-Math.PI / 2 + (index * Math.PI * 2) / samples);
    cumulative.push(
      (cumulative[index - 1] ?? 0) +
        Math.hypot(current.x - previous.x, current.y - previous.y),
    );
    previous = current;
  }
  const perimeter = cumulative[samples] ?? 0;
  const rhythmTotal = cloudPuffRhythm.reduce((sum, value) => sum + value, 0);
  const count = Math.max(
    8,
    Math.round(
      (perimeter / (nominalChord * rhythmTotal)) * cloudPuffRhythm.length,
    ),
  );
  const weights = Array.from(
    { length: count },
    (_, index) => cloudPuffRhythm[index % cloudPuffRhythm.length] ?? 1,
  );
  const weightTotal = weights.reduce((sum, value) => sum + value, 0);
  const pointAtLength = (length: number): Point => {
    let low = 0;
    let high = samples;
    while (high - low > 1) {
      const middle = (low + high) >> 1;
      if ((cumulative[middle] ?? 0) <= length) low = middle;
      else high = middle;
    }
    const from = cumulative[low] ?? 0;
    const to = cumulative[high] ?? from;
    const ratio = to > from ? (length - from) / (to - from) : 0;
    return base(-Math.PI / 2 + ((low + ratio) * Math.PI * 2) / samples);
  };
  let travelled = 0;
  return weights.map((weight) => {
    const point = pointAtLength((travelled / weightTotal) * perimeter);
    travelled += weight;
    return point;
  });
}

function cloudBody(
  width: number,
  height: number,
  fill: string,
  border: string,
): string {
  const format = (value: number): string => value.toFixed(4);
  const points = cloudValleyPoints(width, height);
  const first = points[0];
  if (!first) throw new Error("Cloud Bubble path is invalid.");
  const arcs = points.map((_, index) => {
    const from = points[index] ?? first;
    const to = points[(index + 1) % points.length] ?? first;
    const chord = Math.hypot(to.x - from.x, to.y - from.y);
    // Radius slightly above half the chord gives a round, puffy bump.
    const radius = chord * 0.56;
    return `A ${format(radius)} ${format(radius)} 0 0 1 ${format(to.x)} ${format(to.y)}`;
  });
  return `<path d="M ${format(first.x)} ${format(first.y)} ${arcs.join(" ")} Z" fill="${fill}" stroke="${border}" stroke-width="3" stroke-linejoin="round"/>`;
}

function thoughtTrail(
  body: readonly Point[],
  bodyCenter: Point,
  tip: Point,
  fill: string,
  border: string,
  dreaming: boolean,
): string {
  const tipVector = subtract(tip, bodyCenter);
  const tipDistance = Math.hypot(tipVector.x, tipVector.y);
  const geometry = tailGeometryForPolygon(
    body,
    bodyCenter,
    { x: tipVector.x / tipDistance, y: tipVector.y / tipDistance },
    0,
    tip,
  );
  const center = {
    x: (geometry.base[0].x + geometry.base[1].x) / 2,
    y: (geometry.base[0].y + geometry.base[1].y) / 2,
  };
  const circles = dreaming
    ? [
        { ratio: 0.45, radius: 7 },
        { ratio: 0.78, radius: 4.5 },
        { ratio: 1, radius: 3 },
      ]
    : [
        { ratio: 0.5, radius: 5 },
        { ratio: 0.82, radius: 3.5 },
      ];
  return circles
    .map(({ ratio, radius }) => {
      const x = center.x + (geometry.tip.x - center.x) * ratio;
      const y = center.y + (geometry.tip.y - center.y) * ratio;
      return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}" stroke="${border}" stroke-width="2"/>`;
    })
    .join("");
}

function burstBodyPoints(width: number, height: number): Point[] {
  const centerX = width / 2;
  const centerY = height / 2;
  return Array.from({ length: 28 }, (_, index) => {
    const radians = (index * Math.PI * 2) / 28 - Math.PI / 2;
    const outer = index % 2 === 0;
    const radiusX = outer ? width / 2 - 6 : width / 2 - 22;
    const radiusY = outer ? height / 2 - 6 : height / 2 - 22;
    return {
      x: centerX + Math.cos(radians) * radiusX,
      y: centerY + Math.sin(radians) * radiusY,
    };
  });
}

function wavyBodyPoints(width: number, height: number): Point[] {
  const left = 24;
  const top = 24;
  const right = width - 24;
  const bottom = height - 24;
  const steps = 20;
  const horizontal = Array.from({ length: steps + 1 }, (_, index) => {
    const ratio = index / steps;
    return {
      ratio,
      wave: Math.sin(ratio * Math.PI * 8) * 4,
    };
  });
  const vertical = Array.from({ length: 9 }, (_, index) => {
    const ratio = (index + 1) / 10;
    return {
      ratio,
      wave: Math.sin(ratio * Math.PI * 4) * 4,
    };
  });
  return [
    ...horizontal.map(({ ratio, wave }) => ({
      x: left + ratio * (right - left),
      y: top + wave,
    })),
    ...vertical.map(({ ratio, wave }) => ({
      x: right + wave,
      y: top + ratio * (bottom - top),
    })),
    ...[...horizontal].reverse().map(({ ratio, wave }) => ({
      x: left + ratio * (right - left),
      y: bottom + wave,
    })),
    ...[...vertical].reverse().map(({ ratio, wave }) => ({
      x: left + wave,
      y: top + ratio * (bottom - top),
    })),
  ];
}

function transformReferenceBody(
  style: BubbleVisualStyle,
  width: number,
  height: number,
): readonly Point[] {
  if (style === "YELLING") return burstBodyPoints(width, height);
  if (style === "WAVY") return wavyBodyPoints(width, height);
  return roundedRectanglePoints(width, height);
}

export function bubbleBodyCenterOffset(
  input: BubbleBodyCenterOffsetInput,
): Readonly<{ x: number; y: number }> {
  const minimumSize = bubbleBodyMinimumSize(input.style);
  const width = Math.max(requireDimension(input.width, 220), minimumSize.width);
  const height = Math.max(
    requireDimension(input.height, 112),
    minimumSize.height,
  );
  const direction = normalizeDirection(input.tailDirection);
  if (direction === null) {
    throw new TypeError("Bubble body center offset requires a tail direction.");
  }
  const tailLength = normalizeSvgTailLength(
    input.tailLength ?? svgDefaultTailLength,
  );
  const offset = normalizeSvgOffset(input.offset);
  const center = { x: width / 2, y: height / 2 };
  const transformed = transformedBodyGeometry(
    transformReferenceBody(input.style, width, height),
    width,
    height,
    direction,
    tailLength,
    offset,
  );
  return Object.freeze({
    x: transformed.bodyCenter.x - center.x,
    y: transformed.bodyCenter.y - center.y,
  });
}

function renderBody(
  style: BubbleVisualStyle,
  width: number,
  height: number,
  direction: number | null,
  fill: string,
  border: string,
  tailLength: number,
  offset: BubbleOffset,
): string {
  const rounded = roundedRectanglePoints(width, height);
  const transformWithoutTail = (body: readonly Point[]): readonly Point[] => {
    if (direction === null) return body;
    return transformedBodyGeometry(
      body,
      width,
      height,
      direction,
      tailLength,
      offset,
    ).body;
  };
  const withTail = (body: readonly Point[], extra = ""): string => {
    if (direction === null) return bodyPath(body, fill, border, extra);
    const transformed = transformedBodyGeometry(
      body,
      width,
      height,
      direction,
      tailLength,
      offset,
    );
    return unionBodyAndTail(
      transformed.body,
      transformed.bodyCenter,
      transformed.tip,
      fill,
      border,
      extra,
    );
  };
  switch (style) {
    case "NO_BUBBLE":
      return "";
    case "THINKING":
    case "DREAMING": {
      if (direction === null) return cloudBody(width, height, fill, border);
      const transformed = transformedBodyGeometry(
        rounded,
        width,
        height,
        direction,
        tailLength,
        offset,
      );
      const scale = offset.scalePercent / 100;
      const center = { x: width / 2, y: height / 2 };
      const translateX = transformed.bodyCenter.x - center.x * scale;
      const translateY = transformed.bodyCenter.y - center.y * scale;
      return `${thoughtTrail(transformed.body, transformed.bodyCenter, transformed.tip, fill, border, style === "DREAMING")}<g transform="translate(${translateX} ${translateY}) scale(${scale})">${cloudBody(width, height, fill, border)}</g>`;
    }
    case "YELLING":
      return withTail(burstBodyPoints(width, height));
    case "WAVY":
      return withTail(wavyBodyPoints(width, height));
    case "WHISPERING":
      return withTail(rounded, 'stroke-dasharray="5 5"');
    case "ANNOUNCEMENT": {
      // The inner frame reuses the outer body's offset and scale (derived from
      // the outer outline) so both outlines stay concentric.
      const frame = roundedRectanglePoints(width, height, 13, 30);
      const placedFrame =
        direction === null
          ? frame
          : (() => {
              const { bodyCenter } = transformedBodyGeometry(
                rounded,
                width,
                height,
                direction,
                tailLength,
                offset,
              );
              const center = { x: width / 2, y: height / 2 };
              const scale = offset.scalePercent / 100;
              return frame.map((point) =>
                transformPoint(point, center, bodyCenter, scale),
              );
            })();
      return `${withTail(rounded)}<path d="${polygonPath(placedFrame)}" fill="none" stroke="${border}" stroke-width="1.5" stroke-linejoin="round" data-bubble-inner-frame="true"/>`;
    }
    case "NARRATION":
      return bodyPath(transformWithoutTail(rounded), fill, border);
    case "OFF_PANEL":
      return withTail(rounded);
    case "NORMAL":
      return withTail(rounded);
  }
}

/**
 * Renders the canonical Bubble body preview as a standalone SVG document.
 * The function is pure so documentation and runtime adapters can share it.
 */
export function renderBubbleSvg(input: RenderBubbleSvgInput): string {
  if (!bubbleVisualStyles.includes(input.style)) {
    throw new TypeError(
      `Unsupported Bubble visual style: ${String(input.style)}`,
    );
  }
  if (
    !Array.isArray(input.lines) ||
    input.lines.some((line) => typeof line !== "string")
  ) {
    throw new TypeError("lines must be an array of strings.");
  }
  const requestedWidth = requireDimension(input.width, 220);
  const requestedHeight = requireDimension(input.height, 112);
  const fontSize = requireDimension(input.fontSize, 15);
  const direction = normalizeDirection(input.tailDirection);
  const tailLength = normalizeSvgTailLength(
    input.tailLength ?? svgDefaultTailLength,
  );
  const offset =
    input.offset === undefined
      ? svgDefaultOffset
      : normalizeSvgOffset(input.offset);
  const shapeTransition = input.shapeTransition;
  if (shapeTransition !== undefined) {
    if (
      !bubbleVisualStyles.includes(shapeTransition.from) ||
      !bubbleVisualStyles.includes(shapeTransition.to) ||
      !Number.isFinite(shapeTransition.progress) ||
      shapeTransition.progress < 0 ||
      shapeTransition.progress > 1
    ) {
      throw new TypeError("Bubble shape transition is invalid.");
    }
  }
  const minimumSize = bubbleBodyMinimumSize(
    input.style,
    ...(shapeTransition === undefined
      ? []
      : [shapeTransition.from, shapeTransition.to]),
  );
  const width = Math.max(requestedWidth, minimumSize.width);
  const height = Math.max(requestedHeight, minimumSize.height);
  const fill = input.fillColor ?? "#fff4cc";
  const border = input.borderColor ?? "#6f5b45";
  const textColor = input.textColor ?? "#25283a";
  const fontFamily = input.fontFamily ?? "Noto Sans JP, sans-serif";
  const lineHeight = fontSize * 1.35;
  const firstBaseline =
    height / 2 - ((input.lines.length - 1) * lineHeight) / 2 + fontSize * 0.35;
  const textScale = direction === null ? 1 : offset.scalePercent / 100;
  const textCenter =
    direction === null
      ? { x: width / 2, y: height / 2 }
      : transformedBodyGeometry(
          roundedRectanglePoints(width, height),
          width,
          height,
          direction,
          tailLength,
          offset,
        ).bodyCenter;
  const text = input.lines
    .map(
      (line, index) =>
        `<text x="${textCenter.x}" y="${textCenter.y + (firstBaseline + index * lineHeight - height / 2) * textScale}" text-anchor="middle" fill="${escapeXml(textColor)}" font-family="${escapeXml(fontFamily)}" font-size="${fontSize * textScale}">${escapeXml(line)}</text>`,
    )
    .join("");
  const body =
    shapeTransition === undefined
      ? renderBody(
          input.style,
          width,
          height,
          direction,
          fill,
          border,
          tailLength,
          offset,
        )
      : `<g opacity="${(1 - shapeTransition.progress).toFixed(4)}">${renderBody(
          shapeTransition.from,
          width,
          height,
          direction,
          fill,
          border,
          tailLength,
          offset,
        )}</g><g opacity="${shapeTransition.progress.toFixed(4)}">${renderBody(
          shapeTransition.to,
          width,
          height,
          direction,
          fill,
          border,
          tailLength,
          offset,
        )}</g>`;
  const title = escapeXml(input.title ?? `${input.style} bubble`);
  const transitionAttributes =
    shapeTransition === undefined
      ? ""
      : ` data-bubble-shape-transition-from="${shapeTransition.from}" data-bubble-shape-transition-to="${shapeTransition.to}" data-bubble-shape-transition-progress="${shapeTransition.progress.toFixed(4)}"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" data-bubble-renderer="canonical" data-bubble-style="${input.style}" data-bubble-body-width="${width}" data-bubble-body-height="${height}"${transitionAttributes}><title>${title}</title>${body}${text}</svg>`;
}
