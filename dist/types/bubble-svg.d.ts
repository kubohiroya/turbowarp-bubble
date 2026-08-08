import type { BubbleOffsetInput } from "./actor-transform.js";
export declare const bubbleVisualStyles: readonly ["NORMAL", "THINKING", "DREAMING", "YELLING", "OFF_PANEL", "WAVY", "WHISPERING", "ANNOUNCEMENT", "NARRATION", "NO_BUBBLE"];
export type BubbleVisualStyle = (typeof bubbleVisualStyles)[number];
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
}
/**
 * Renders the canonical Bubble body preview as a standalone SVG document.
 * The function is pure so documentation and runtime adapters can share it.
 */
export declare function renderBubbleSvg(input: RenderBubbleSvgInput): string;
