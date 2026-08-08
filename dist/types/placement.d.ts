export declare const bubbleDirectionNames: readonly ["up", "up-up-right", "up-right", "right-up-right", "right", "right-down-right", "down-right", "down-down-right", "down", "down-down-left", "down-left", "left-down-left", "left", "left-up-left", "up-left", "up-up-left"];
export type BubbleDirectionName = (typeof bubbleDirectionNames)[number];
export declare const bubbleDirectionAliases: readonly ["north", "north-northeast", "northeast", "east-northeast", "east", "east-southeast", "southeast", "south-southeast", "south", "south-southwest", "southwest", "west-southwest", "west", "west-northwest", "northwest", "north-northwest"];
export type BubbleDirectionAlias = (typeof bubbleDirectionAliases)[number];
export declare const bubbleBackgroundRegions: readonly ["HEADER_LIKE", "CENTER", "FOOTER_LIKE"];
export type BubbleBackgroundRegion = (typeof bubbleBackgroundRegions)[number];
export type BubblePlacementInput = BubbleDirectionName | BubbleDirectionAlias | BubbleBackgroundRegion | number;
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
export declare const defaultBubblePlacementInput: BubbleDirectionName;
/** Accepts API values and numeric strings supplied by Scratch block inputs. */
export declare function normalizeBubblePlacement(value: unknown): BubblePlacement;
export declare function bubbleDirectionVector(direction: BubbleDirectionName | number): BubbleDirectionVector;
