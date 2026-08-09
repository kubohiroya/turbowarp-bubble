import type { BubbleTextCapability } from "./text-capability.js";
export interface TurboWarpSvgTextExtension {
    setText(args: Readonly<{
        STYLE: unknown;
        TEXT: unknown;
    }>, util: Readonly<{
        target: unknown;
    }>): void;
    measureText?(styleName: unknown, text: unknown): number;
    releaseTextActor(target: unknown): boolean;
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
