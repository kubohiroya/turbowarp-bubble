import type { BubbleDirectionName } from "./placement.js";
import { bubbleDirectionVector } from "./placement.js";

export const defaultBubbleDistance = 12;
export const defaultBubbleTailLength = 18;
export const defaultBubbleOffset = Object.freeze({
  x: 0,
  y: 0,
  scalePercent: 100,
});

export type BubbleOffsetInput =
  | readonly [x: number, y: number]
  | readonly [x: number, y: number, scalePercent: number];

export interface BubbleOffset {
  readonly x: number;
  readonly y: number;
  readonly scalePercent: number;
}

export interface ActorBounds {
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
}

export interface ActorRelativeCenterInput {
  readonly bounds: ActorBounds;
  readonly bubbleWidth: number;
  readonly bubbleHeight: number;
  readonly direction: BubbleDirectionName | number;
  readonly distance: number;
  readonly tailLength: number;
  readonly offset: BubbleOffset;
}

function requireFinite(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${label} must be a finite number.`);
  }
  return value;
}

export function normalizeBubbleDistance(value: unknown): number {
  const distance = requireFinite(value, "Bubble distance");
  if (distance < 0) {
    throw new TypeError("Bubble distance must be zero or greater.");
  }
  return distance;
}

export function normalizeBubbleTailLength(value: unknown): number {
  const length = requireFinite(value, "Bubble tail length");
  if (length <= 0) {
    throw new TypeError("Bubble tail length must be greater than zero.");
  }
  return length;
}

export function normalizeBubbleOffset(value: unknown): BubbleOffset {
  if (!Array.isArray(value) || (value.length !== 2 && value.length !== 3)) {
    throw new TypeError("Bubble offset must be [x, y] or [x, y, scale].");
  }
  const x = requireFinite(value[0], "Bubble offset x");
  const y = requireFinite(value[1], "Bubble offset y");
  const scalePercent = requireFinite(
    value.length === 3 ? value[2] : 100,
    "Bubble offset scale",
  );
  if (scalePercent <= 0) {
    throw new TypeError("Bubble offset scale must be greater than zero.");
  }
  return Object.freeze({ x, y, scalePercent });
}

export function actorRelativeBubbleCenter(
  input: ActorRelativeCenterInput,
): Readonly<{ x: number; y: number }> {
  const actorCenterX = (input.bounds.left + input.bounds.right) / 2;
  const actorCenterY = (input.bounds.top + input.bounds.bottom) / 2;
  const vector = bubbleDirectionVector(input.direction);
  const gap = input.distance + input.tailLength;
  const horizontalDistance =
    vector.x < 0
      ? actorCenterX - input.bounds.left + gap + input.bubbleWidth / 2
      : input.bounds.right - actorCenterX + gap + input.bubbleWidth / 2;
  const verticalDistance =
    vector.y < 0
      ? actorCenterY - input.bounds.bottom + gap + input.bubbleHeight / 2
      : input.bounds.top - actorCenterY + gap + input.bubbleHeight / 2;
  const placementScale = Math.min(
    vector.x === 0
      ? Number.POSITIVE_INFINITY
      : horizontalDistance / Math.abs(vector.x),
    vector.y === 0
      ? Number.POSITIVE_INFINITY
      : verticalDistance / Math.abs(vector.y),
  );
  return Object.freeze({
    x: actorCenterX + vector.x * placementScale + input.offset.x,
    y: actorCenterY + vector.y * placementScale + input.offset.y,
  });
}
