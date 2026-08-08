import type { BubbleDirectionName } from "./placement.js";
export declare const defaultBubbleDistance = 12;
export declare const defaultBubbleTailLength = 18;
export declare const defaultBubbleOffset: Readonly<{
    x: 0;
    y: 0;
    scalePercent: 100;
}>;
export type BubbleOffsetInput = readonly [x: number, y: number] | readonly [x: number, y: number, scalePercent: number];
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
export declare function normalizeBubbleDistance(value: unknown): number;
export declare function normalizeBubbleTailLength(value: unknown): number;
export declare function normalizeBubbleOffset(value: unknown): BubbleOffset;
export declare function actorRelativeBubbleCenter(input: ActorRelativeCenterInput): Readonly<{
    x: number;
    y: number;
}>;
