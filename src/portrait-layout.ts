export const bubblePortraitPlacements = Object.freeze([
  "left",
  "right",
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
] as const);

export type BubblePortraitPlacement = (typeof bubblePortraitPlacements)[number];

export type BubblePortraitOffsetInput =
  | readonly [x: number, y: number]
  | readonly [x: number, y: number, zoomPercent: number];

export interface BubblePortraitOffset {
  readonly x: number;
  readonly y: number;
  readonly zoomPercent: number;
}

export const defaultBubblePortraitPlacement: BubblePortraitPlacement = "left";
export const defaultBubblePortraitOffset: BubblePortraitOffset = Object.freeze({
  x: 0,
  y: 0,
  zoomPercent: 100,
});
export const defaultBubblePortraitCornerRadius = 0;

export function normalizeBubblePortraitPlacement(
  value: unknown,
): BubblePortraitPlacement {
  if (typeof value !== "string") {
    throw new TypeError("Bubble portrait placement must be a string.");
  }
  const normalized = value.trim().toLowerCase().replaceAll("_", "-");
  if (
    !bubblePortraitPlacements.includes(normalized as BubblePortraitPlacement)
  ) {
    throw new TypeError(`Unsupported Bubble portrait placement: ${value}`);
  }
  return normalized as BubblePortraitPlacement;
}

export function normalizeBubblePortraitOffset(
  value: BubblePortraitOffsetInput,
): BubblePortraitOffset {
  if (!Array.isArray(value) || (value.length !== 2 && value.length !== 3)) {
    throw new TypeError(
      "Bubble portrait offset must be [x, y] or [x, y, zoom].",
    );
  }
  const [x, y, zoomPercent = 100] = value;
  if (![x, y, zoomPercent].every(Number.isFinite) || zoomPercent <= 0) {
    throw new TypeError(
      "Bubble portrait offset values must be finite and zoom positive.",
    );
  }
  return Object.freeze({ x, y, zoomPercent });
}

export function normalizeBubblePortraitCornerRadius(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new TypeError(
      "Bubble portrait corner radius must be zero or greater.",
    );
  }
  return value;
}
