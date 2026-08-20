export declare const scratchBubbleTextLimit = 330;
export declare const scratchBubbleMaximumLineWidth = 170;
export declare const scratchBubbleMinimumTextWidth = 50;
export declare const scratchBubbleStrokeWidth = 4;
export declare const scratchBubblePadding = 10;
export declare const scratchBubbleCornerRadius = 16;
export declare const scratchBubbleTailHeight = 12;
export declare const scratchBubbleFontSize = 14;
export declare const scratchBubbleLineHeight = 16;
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
    readonly pointsLeft: boolean;
    readonly stageHeight: number;
    readonly stageWidth: number;
    readonly width: number;
}
export interface ScratchBubblePosition {
    readonly centerX: number;
    readonly centerY: number;
    readonly left: number;
    readonly pointsLeft: boolean;
    readonly top: number;
}
/**
 * The block-level basic style is intentionally narrow. Any explicit layout,
 * body, media, reveal, or motion option selects the existing custom renderer.
 */
export declare function bubbleLayoutProfileForStyleInput(value: unknown): BubbleLayoutProfile;
export declare function isScratchDefaultBubbleStyleInput(value: unknown): boolean;
/** Matches the numeric presentation and length limit used by say/think. */
export declare function formatScratchBubbleArgument(value: unknown): string;
export declare function layoutScratchBubbleText(value: string, measureText?: (text: string) => number): ScratchBubbleTextLayout;
export declare function scratchBubbleMetrics(layout: ScratchBubbleTextLayout): ScratchBubbleMetrics;
export declare function positionScratchBubble(input: ScratchBubblePositionInput): ScratchBubblePosition;
export declare function renderScratchBubbleSvg(input: Readonly<{
    kind: ScratchBubbleKind;
    layout: ScratchBubbleTextLayout;
    pointsLeft: boolean;
    title?: string;
}>): string;
