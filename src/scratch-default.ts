import { wrapText } from "./text-layout.js";

export const scratchBubbleTextLimit = 330;
export const scratchBubbleMaximumLineWidth = 170;
export const scratchBubbleMinimumTextWidth = 50;
export const scratchBubbleStrokeWidth = 4;
export const scratchBubblePadding = 10;
export const scratchBubbleCornerRadius = 16;
export const scratchBubbleTailHeight = 12;
export const scratchBubbleFontSize = 14;
export const scratchBubbleLineHeight = 16;

const scratchBubbleFontHeightRatio = 0.9;
const scratchDefaultOptionalStyleKeys = Object.freeze([
  "placement",
  "maxWidth",
  "textLocale",
  "distance",
  "tailLength",
  "offset",
  "visualStyle",
  "portrait",
  "continueIndicator",
  "reveal",
  "audio",
  "showAnimation",
  "hideAnimation",
] as const);

export type BubbleLayoutProfile = "scratch-default" | "custom";
export type ScratchBubbleKind = "say" | "think";

export interface ScratchBubbleTextLine {
  readonly text: string;
  readonly width: number;
}

export interface ScratchBubbleTextLayout {
  readonly lines: readonly ScratchBubbleTextLine[];
  readonly maxLineWidth: number;
  readonly text: string;
}

export interface ScratchBubbleMetrics {
  readonly bodyHeight: number;
  readonly bodyWidth: number;
  readonly height: number;
  readonly paddedHeight: number;
  readonly paddedWidth: number;
  readonly width: number;
}

export interface ScratchBubblePositionInput {
  readonly bounds: Readonly<{
    bottom: number;
    left: number;
    right: number;
    top: number;
  }>;
  readonly height: number;
  /** Whether the bubble body is positioned to the actor's left. */
  readonly pointsLeft: boolean;
  readonly stageHeight: number;
  readonly stageWidth: number;
  readonly width: number;
}

export interface ScratchBubblePosition {
  readonly centerX: number;
  readonly centerY: number;
  readonly left: number;
  /** Whether the bubble body is positioned to the actor's left. */
  readonly pointsLeft: boolean;
  readonly top: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * The block-level basic style is intentionally narrow. Any explicit layout,
 * body, media, reveal, or motion option selects the existing custom renderer.
 */
export function bubbleLayoutProfileForStyleInput(
  value: unknown,
): BubbleLayoutProfile {
  if (!isRecord(value)) return "custom";
  if (
    typeof value.textStyle !== "string" ||
    value.textStyle.trim() !== "default"
  )
    return "custom";
  return scratchDefaultOptionalStyleKeys.every(
    (key) => value[key] === undefined,
  )
    ? "scratch-default"
    : "custom";
}

export function isScratchDefaultBubbleStyleInput(value: unknown): boolean {
  return bubbleLayoutProfileForStyleInput(value) === "scratch-default";
}

/** Matches the numeric presentation and length limit used by say/think. */
export function formatScratchBubbleArgument(value: unknown): string {
  let formatted = value;
  if (typeof value === "number" && Math.abs(value) >= 0.01 && value % 1 !== 0) {
    formatted = value.toFixed(2);
  }
  return String(formatted).slice(0, scratchBubbleTextLimit);
}

function estimatedHelveticaWidth(text: string): number {
  let units = 0;
  for (const character of text) {
    if (/\p{Mark}/u.test(character)) continue;
    if (/\s/u.test(character)) {
      units += 0.35;
      continue;
    }
    units += (character.codePointAt(0) ?? 0) <= 127 ? 0.62 : 1;
  }
  return units * scratchBubbleFontSize;
}

export function layoutScratchBubbleText(
  value: string,
  measureText: (text: string) => number = estimatedHelveticaWidth,
): ScratchBubbleTextLayout {
  const text = value.slice(0, scratchBubbleTextLimit);
  const measured = (candidate: string): number => {
    let width: number;
    try {
      width = measureText(candidate);
    } catch {
      return estimatedHelveticaWidth(candidate);
    }
    return Number.isFinite(width) && width >= 0
      ? width
      : estimatedHelveticaWidth(candidate);
  };
  const wrapped = wrapText({
    text,
    maxWidth: scratchBubbleMaximumLineWidth,
    measureText: measured,
  });
  const lines = Object.freeze(
    wrapped.lines.map((line) =>
      Object.freeze({ text: line.text, width: line.width }),
    ),
  );
  return Object.freeze({
    lines,
    maxLineWidth: Math.max(0, ...lines.map((line) => line.width)),
    text: lines.map((line) => line.text).join("\n"),
  });
}

export function scratchBubbleMetrics(
  layout: ScratchBubbleTextLayout,
): ScratchBubbleMetrics {
  const lineCount = Math.max(1, layout.lines.length);
  const paddedWidth =
    Math.max(layout.maxLineWidth, scratchBubbleMinimumTextWidth) +
    scratchBubblePadding * 2;
  const paddedHeight =
    scratchBubbleLineHeight * lineCount + scratchBubblePadding * 2;
  return Object.freeze({
    bodyHeight: paddedHeight + scratchBubbleStrokeWidth,
    bodyWidth: paddedWidth + scratchBubbleStrokeWidth,
    height: paddedHeight + scratchBubbleStrokeWidth + scratchBubbleTailHeight,
    paddedHeight,
    paddedWidth,
    width: paddedWidth + scratchBubbleStrokeWidth,
  });
}

export function positionScratchBubble(
  input: ScratchBubblePositionInput,
): ScratchBubblePosition {
  const stageLeft = -input.stageWidth / 2;
  const stageRight = input.stageWidth / 2;
  const stageTop = input.stageHeight / 2;
  let pointsLeft = input.pointsLeft;
  if (
    !pointsLeft &&
    input.width + input.bounds.right > stageRight &&
    input.bounds.left - input.width > stageLeft
  ) {
    pointsLeft = true;
  } else if (
    pointsLeft &&
    input.bounds.left - input.width < stageLeft &&
    input.width + input.bounds.right < stageRight
  ) {
    pointsLeft = false;
  }
  const left = pointsLeft
    ? Math.min(
        stageRight - input.width,
        Math.max(stageLeft, input.bounds.left - input.width),
      )
    : Math.max(
        stageLeft,
        Math.min(stageRight - input.width, input.bounds.right),
      );
  const top = Math.min(stageTop, input.bounds.bottom + input.height);
  return Object.freeze({
    centerX: left + input.width / 2,
    centerY: top - input.height / 2,
    left,
    pointsLeft,
    top,
  });
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function scratchBodyPath(metrics: ScratchBubbleMetrics): string {
  const { paddedHeight: height, paddedWidth: width } = metrics;
  const radius = Math.min(scratchBubbleCornerRadius, width / 2, height / 2);
  return [
    `M ${radius} ${height}`,
    `Q 0 ${height} 0 ${height - radius}`,
    `L 0 ${radius}`,
    `Q 0 0 ${radius} 0`,
    `L ${width - radius} 0`,
    `Q ${width} 0 ${width} ${radius}`,
    `L ${width} ${height - radius}`,
    `Q ${width} ${height} ${width - radius} ${height}`,
  ].join(" ");
}

function scratchSayBody(metrics: ScratchBubbleMetrics): string {
  const { paddedHeight: height, paddedWidth: width } = metrics;
  const path = `${scratchBodyPath(metrics)} C ${width - 16} ${height + 4} ${width - 12} ${height + 8} ${width - 12} ${height + 10} Q ${width - 12} ${height + 12} ${width - 14} ${height + 12} C ${width - 17} ${height + 12} ${width - 27} ${height + 8} ${width - 32} ${height} Z`;
  return `<path d="${path}" fill="white" stroke="rgba(0, 0, 0, 0.15)" stroke-width="${scratchBubbleStrokeWidth}" stroke-linejoin="round"/>`;
}

function scratchThinkBody(metrics: ScratchBubbleMetrics): string {
  const { paddedHeight: height, paddedWidth: width } = metrics;
  const body = `${scratchBodyPath(metrics)} L ${width - 28} ${height} A 4 4 0 0 1 ${width - 36} ${height} Z`;
  return `<path d="${body}" fill="white" stroke="rgba(0, 0, 0, 0.15)" stroke-width="${scratchBubbleStrokeWidth}" stroke-linejoin="round"/><circle cx="${width - 25.25}" cy="${height + 7.25}" r="2.25" fill="white" stroke="rgba(0, 0, 0, 0.15)" stroke-width="${scratchBubbleStrokeWidth}"/><circle cx="${width - 17.5}" cy="${height + 9.5}" r="1.5" fill="white" stroke="rgba(0, 0, 0, 0.15)" stroke-width="${scratchBubbleStrokeWidth}"/>`;
}

export function renderScratchBubbleSvg(
  input: Readonly<{
    kind: ScratchBubbleKind;
    layout: ScratchBubbleTextLayout;
    pointsLeft: boolean;
    title?: string;
  }>,
): string {
  const metrics = scratchBubbleMetrics(input.layout);
  const body =
    input.kind === "say" ? scratchSayBody(metrics) : scratchThinkBody(metrics);
  const bodyTransform = input.pointsLeft
    ? `translate(${scratchBubbleStrokeWidth / 2} ${scratchBubbleStrokeWidth / 2})`
    : `translate(${metrics.width} 0) scale(-1 1) translate(${scratchBubbleStrokeWidth / 2} ${scratchBubbleStrokeWidth / 2})`;
  const firstBaseline =
    scratchBubbleStrokeWidth / 2 +
    scratchBubblePadding +
    scratchBubbleFontHeightRatio * scratchBubbleFontSize;
  const text = input.layout.lines
    .map(
      (line, index) =>
        `<text x="${scratchBubbleStrokeWidth / 2 + scratchBubblePadding}" y="${firstBaseline + scratchBubbleLineHeight * index}" fill="#575E75" font-family="Helvetica, sans-serif" font-size="${scratchBubbleFontSize}" xml:space="preserve">${escapeXml(line.text)}</text>`,
    )
    .join("");
  const title = escapeXml(input.title ?? `${input.kind} bubble`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${metrics.width}" height="${metrics.height}" viewBox="0 0 ${metrics.width} ${metrics.height}" role="img" data-bubble-profile="scratch-default" data-bubble-kind="${input.kind}"><title>${title}</title><g transform="${bodyTransform}">${body}</g>${text}</svg>`;
}
