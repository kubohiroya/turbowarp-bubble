import type { BubbleTextCapability } from "./text-capability.js";
import type { BubbleSvgOverlayTextCapability } from "./svg-overlay-surface.js";
export interface TurboWarpSvgTextExtension {
    getLayoutCapability?(): SvgTextLayoutCompositionLike;
    setText(args: Readonly<{
        STYLE: unknown;
        TEXT: unknown;
    }>, util: Readonly<{
        target: unknown;
    }>): void;
    measureText?(styleName: unknown, text: unknown): number;
    releaseTextActor(target: unknown): boolean;
}
interface SvgTextLayoutLineLike {
    readonly baseline: number;
    readonly text: string;
    readonly width: number;
    readonly x: number;
}
interface SvgTextLayoutLike {
    readonly height: number;
    readonly lines: readonly SvgTextLayoutLineLike[];
    readonly preserveWhitespace: boolean;
    readonly style: Readonly<{
        alignment: "center" | "left" | "right";
        backgroundColor: string;
        cornerRadius: number;
        font: string;
        fontSize: number;
        lineHeight: number;
        textColor: string;
    }>;
    readonly width: number;
}
export interface SvgTextLayoutCompositionLike {
    layoutText(input: Readonly<{
        nativeSize: readonly [width: number, height: number];
        styleName: string;
        text: string;
    }>): SvgTextLayoutLike;
}
/**
 * Adapt the TurboWarp SVG Text extension to Bubble's host-neutral text
 * capability contract.
 */
export declare function createTurboWarpSvgTextCapability(extensionInput: unknown): BubbleTextCapability;
/**
 * Adapt the SVG Text package's composition API to Bubble's text capability.
 * This helper keeps the core package independent from SVG Text's target type.
 */
export declare function createSvgTextCompositionCapability(compositionInput: unknown): BubbleTextCapability;
/**
 * Adapt SVG Text's host-neutral layout composition to Bubble's SVG overlay.
 * The adapter preserves SVG Text's line coordinates without creating skins.
 */
export declare function createSvgTextOverlayTextCapability(compositionInput: SvgTextLayoutCompositionLike): BubbleSvgOverlayTextCapability;
/**
 * Adapts the stock SVG Text extension's shared named-style layout registry.
 */
export declare function createTurboWarpSvgTextOverlayTextCapability(extensionInput: unknown): BubbleSvgOverlayTextCapability;
export {};
