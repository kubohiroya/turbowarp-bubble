export const bubbleDirectionNames = [
  "up",
  "up-up-right",
  "up-right",
  "right-up-right",
  "right",
  "right-down-right",
  "down-right",
  "down-down-right",
  "down",
  "down-down-left",
  "down-left",
  "left-down-left",
  "left",
  "left-up-left",
  "up-left",
  "up-up-left",
] as const;

export type BubbleDirectionName = (typeof bubbleDirectionNames)[number];

export const bubbleDirectionAliases = [
  "north",
  "north-northeast",
  "northeast",
  "east-northeast",
  "east",
  "east-southeast",
  "southeast",
  "south-southeast",
  "south",
  "south-southwest",
  "southwest",
  "west-southwest",
  "west",
  "west-northwest",
  "northwest",
  "north-northwest",
] as const;

export type BubbleDirectionAlias = (typeof bubbleDirectionAliases)[number];

export const bubbleBackgroundRegions = [
  "HEADER_LIKE",
  "CENTER",
  "FOOTER_LIKE",
] as const;

export type BubbleBackgroundRegion = (typeof bubbleBackgroundRegions)[number];

export type BubblePlacementInput =
  BubbleDirectionName | BubbleDirectionAlias | BubbleBackgroundRegion | number;

export interface BubbleActorPlacement {
  readonly basis: "actor";
  readonly direction: BubbleDirectionName | number;
}

export interface BubbleBackgroundPlacement {
  readonly basis: "background";
  readonly region: BubbleBackgroundRegion;
}

export type BubblePlacement = BubbleActorPlacement | BubbleBackgroundPlacement;

export interface BubbleDirectionVector {
  readonly x: number;
  readonly y: number;
}

export const defaultBubblePlacementInput: BubbleDirectionName = "up-right";

const aliasToDirection = new Map<BubbleDirectionAlias, BubbleDirectionName>([
  ["east", "right"],
  ["east-northeast", "right-up-right"],
  ["east-southeast", "right-down-right"],
  ["north", "up"],
  ["northeast", "up-right"],
  ["north-northeast", "up-up-right"],
  ["northwest", "up-left"],
  ["north-northwest", "up-up-left"],
  ["south", "down"],
  ["southeast", "down-right"],
  ["south-southeast", "down-down-right"],
  ["southwest", "down-left"],
  ["south-southwest", "down-down-left"],
  ["west", "left"],
  ["west-northwest", "left-up-left"],
  ["west-southwest", "left-down-left"],
]);

const directionSet = new Set<string>(bubbleDirectionNames);
const backgroundRegionSet = new Set<string>(bubbleBackgroundRegions);
const intermediateDirectionOffset = Math.SQRT2 - 1;
const directionVectors: Readonly<
  Record<BubbleDirectionName, BubbleDirectionVector>
> = Object.freeze({
  down: { x: 0, y: -1 },
  "down-down-left": { x: -intermediateDirectionOffset, y: -1 },
  "down-down-right": { x: intermediateDirectionOffset, y: -1 },
  "down-left": { x: -1, y: -1 },
  "down-right": { x: 1, y: -1 },
  left: { x: -1, y: 0 },
  "left-down-left": { x: -1, y: -intermediateDirectionOffset },
  "left-up-left": { x: -1, y: intermediateDirectionOffset },
  right: { x: 1, y: 0 },
  "right-down-right": { x: 1, y: -intermediateDirectionOffset },
  "right-up-right": { x: 1, y: intermediateDirectionOffset },
  up: { x: 0, y: 1 },
  "up-left": { x: -1, y: 1 },
  "up-right": { x: 1, y: 1 },
  "up-up-left": { x: -intermediateDirectionOffset, y: 1 },
  "up-up-right": { x: intermediateDirectionOffset, y: 1 },
});

function normalizedVectorComponent(value: number): number {
  if (Math.abs(value) < 1e-12) return 0;
  if (Math.abs(1 - Math.abs(value)) < 1e-12) return Math.sign(value);
  return value;
}

/** Accepts API values and numeric strings supplied by Scratch block inputs. */
export function normalizeBubblePlacement(value: unknown): BubblePlacement {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value < 0 || value > 360) {
      throw new TypeError("Bubble placement angle must be from 0 through 360.");
    }
    return Object.freeze({
      basis: "actor",
      direction: value === 360 ? 0 : value,
    });
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(
      "Bubble placement must be a direction, angle, or region.",
    );
  }

  const trimmed = value.trim();
  const region = trimmed.toUpperCase();
  if (backgroundRegionSet.has(region)) {
    return Object.freeze({
      basis: "background",
      region: region as BubbleBackgroundRegion,
    });
  }

  const direction = trimmed.toLowerCase();
  if (directionSet.has(direction)) {
    return Object.freeze({
      basis: "actor",
      direction: direction as BubbleDirectionName,
    });
  }
  const alias = aliasToDirection.get(direction as BubbleDirectionAlias);
  if (alias) {
    return Object.freeze({ basis: "actor", direction: alias });
  }

  const degrees = Number(trimmed);
  if (Number.isFinite(degrees) && degrees >= 0 && degrees <= 360) {
    return Object.freeze({
      basis: "actor",
      direction: degrees === 360 ? 0 : degrees,
    });
  }
  throw new TypeError("Bubble placement is invalid.");
}

export function bubbleDirectionVector(
  direction: BubbleDirectionName | number,
): BubbleDirectionVector {
  if (typeof direction === "string") return directionVectors[direction];
  const radians = (direction * Math.PI) / 180;
  return Object.freeze({
    x: normalizedVectorComponent(Math.sin(radians)),
    y: normalizedVectorComponent(Math.cos(radians)),
  });
}
