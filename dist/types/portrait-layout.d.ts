export declare const bubblePortraitPlacements: readonly ["left", "right", "top-left", "top-right", "bottom-left", "bottom-right"];
export type BubblePortraitPlacement = (typeof bubblePortraitPlacements)[number];
export type BubblePortraitOffsetInput = readonly [x: number, y: number] | readonly [x: number, y: number, zoomPercent: number];
export interface BubblePortraitOffset {
    readonly x: number;
    readonly y: number;
    readonly zoomPercent: number;
}
export declare const defaultBubblePortraitPlacement: BubblePortraitPlacement;
export declare const defaultBubblePortraitOffset: BubblePortraitOffset;
export declare const defaultBubblePortraitCornerRadius = 0;
export declare function normalizeBubblePortraitPlacement(value: unknown): BubblePortraitPlacement;
export declare function normalizeBubblePortraitOffset(value: BubblePortraitOffsetInput): BubblePortraitOffset;
export declare function normalizeBubblePortraitCornerRadius(value: unknown): number;
