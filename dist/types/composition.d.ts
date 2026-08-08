import type { AssetManagerComposition, AssetManagerCompositionTarget } from "@kubohiroya/turbowarp-asset-manager/composition";
import type { BubbleTextEngine, BubbleTextStyleInput, BubbleTextTarget } from "./text-engine.js";
import { type BubblePlacement, type BubblePlacementInput } from "./placement.js";
import { type BubbleOffset, type BubbleOffsetInput } from "./actor-transform.js";
import { type BubbleVisualStyle } from "./bubble-svg.js";
export { UnicodeLineBreakProvider, wrapText, type LineBreakOpportunity, type LineBreakProvider, type TextWidthMeasurer, type WrappedTextLayout, type WrappedTextLine, type WrapTextInput, } from "./text-layout.js";
export { bubbleBackgroundRegions, bubbleDirectionAliases, bubbleDirectionNames, defaultBubblePlacementInput, normalizeBubblePlacement, type BubbleActorPlacement, type BubbleBackgroundPlacement, type BubbleBackgroundRegion, type BubbleDirectionAlias, type BubbleDirectionName, type BubblePlacement, type BubblePlacementInput, } from "./placement.js";
export { actorRelativeBubbleCenter, defaultBubbleDistance, defaultBubbleOffset, defaultBubbleTailLength, normalizeBubbleDistance, normalizeBubbleOffset, normalizeBubbleTailLength, type ActorBounds, type ActorRelativeCenterInput, type BubbleOffset, type BubbleOffsetInput, } from "./actor-transform.js";
export { bubbleBodyCenterOffset, bubbleVisualStyles, renderBubbleSvg, type BubbleBodyCenterOffsetInput, type BubbleVisualStyle, type RenderBubbleSvgInput, } from "./bubble-svg.js";
export { createBubbleTextEngine, renderTextActorSvg, type BubbleTextActorInput, type BubbleTextAlignment, type BubbleTextEngine, type BubbleTextEngineRenderer, type BubbleTextEngineRuntime, type BubbleTextStyleInput, type BubbleTextTarget, } from "./text-engine.js";
export type BubbleKind = "say" | "think";
export type BubbleAnimationMode = "idle" | "talking" | "awaiting-advance";
export declare const bubblePresentationModes: readonly ["POP_OUT_BUBBLE", "TEXT_ACTOR"];
export type BubblePresentationMode = (typeof bubblePresentationModes)[number];
export type BubbleLayer = "portraitBase" | "portraitBlink" | "portraitTalk" | "advanceIndicator";
export interface BubbleFrameAnimationInput {
    readonly frames: ReadonlyArray<string>;
    readonly frameIntervalSeconds: number;
}
export interface BubblePortraitInput {
    readonly base: string;
    readonly blink?: BubbleFrameAnimationInput;
    readonly talk?: BubbleFrameAnimationInput;
}
export interface BubbleStyleInput {
    readonly name: string;
    readonly textStyle: string;
    readonly presentationMode?: BubblePresentationMode;
    readonly placement?: BubblePlacementInput;
    readonly distance?: number;
    readonly tailLength?: number;
    readonly offset?: BubbleOffsetInput;
    readonly visualStyle?: BubbleVisualStyle;
    readonly portrait?: BubblePortraitInput;
    readonly advanceIndicator?: BubbleFrameAnimationInput;
}
export interface BubbleFrameAnimation {
    readonly frames: ReadonlyArray<string>;
    readonly frameIntervalSeconds: number;
}
export interface BubblePortrait {
    readonly base: string;
    readonly blink?: BubbleFrameAnimation;
    readonly talk?: BubbleFrameAnimation;
}
export interface BubbleStyle {
    readonly name: string;
    readonly textStyle: string;
    readonly presentationMode: BubblePresentationMode;
    readonly placement: BubblePlacement;
    readonly distance: number;
    readonly tailLength: number;
    readonly offset: BubbleOffset;
    readonly visualStyle: BubbleVisualStyle;
    readonly portrait?: BubblePortrait;
    readonly advanceIndicator?: BubbleFrameAnimation;
}
export type BubbleAssetManager = Pick<AssetManagerComposition, "applyToTarget" | "getMimeType" | "isRegistered">;
export type BubbleSvgText = Pick<BubbleTextEngine, "defineStyle" | "releaseTarget" | "setText"> & {
    /** Internal adapter hook for popup text that is scaled by the Bubble surface. */
    readonly setPopupText?: (input: BubblePopupTextInput) => void;
};
export interface BubblePopupTextInput {
    readonly styleName: string;
    readonly target: BubbleTextTarget;
    readonly text: string;
}
export interface SetTextActorInput {
    readonly actor: BubbleTextTarget;
    readonly actorKey: string;
    readonly styleName: string;
    readonly text: string;
}
export interface BubbleSurfaceTargets {
    readonly text: BubbleTextTarget;
    readonly portraitBase?: AssetManagerCompositionTarget;
    readonly portraitBlink?: AssetManagerCompositionTarget;
    readonly portraitTalk?: AssetManagerCompositionTarget;
    readonly advanceIndicator?: AssetManagerCompositionTarget;
}
export interface BubbleSurface {
    readonly targets: BubbleSurfaceTargets;
    setLayerVisible(layer: BubbleLayer, visible: boolean): void | Promise<void>;
    show(): void | Promise<void>;
    hide(): void | Promise<void>;
    dispose(): void | Promise<void>;
}
export interface BubbleSurfaceFactoryInput {
    readonly actor: unknown;
    readonly actorKey: string;
    readonly kind: BubbleKind;
    readonly style: BubbleStyle;
}
export type BubbleSurfaceFactory = (input: BubbleSurfaceFactoryInput) => BubbleSurface | Promise<BubbleSurface>;
export interface BubbleScheduler {
    setTimeout(callback: () => void, milliseconds: number): unknown;
    clearTimeout(handle: unknown): void;
}
export interface BubbleAnimationErrorContext {
    readonly actorKey: string;
    readonly layer: Exclude<BubbleLayer, "portraitBase">;
    readonly assetName: string;
}
export interface BubbleCompositionOptions {
    readonly assetManager: BubbleAssetManager;
    readonly svgText: BubbleSvgText;
    readonly createSurface: BubbleSurfaceFactory;
    readonly scheduler?: BubbleScheduler;
    readonly onAnimationError?: (error: unknown, context: BubbleAnimationErrorContext) => void;
}
export interface ShowBubbleInput {
    readonly actor: unknown;
    readonly actorKey: string;
    readonly kind: BubbleKind;
    readonly text: string;
    readonly styleName: string;
    readonly animationMode?: BubbleAnimationMode;
}
export interface BubbleHandle {
    readonly actorKey: string;
    readonly kind: BubbleKind;
    readonly animationMode: BubbleAnimationMode;
    setText(text: string): Promise<void>;
    setAnimationMode(mode: BubbleAnimationMode): Promise<void>;
    close(): Promise<void>;
}
export interface BubbleComposition {
    defineTextStyle(input: BubbleTextStyleInput): void;
    defineStyle(input: BubbleStyleInput): void;
    hasActiveBubble(actorKey: unknown): boolean;
    setTextActor(input: SetTextActorInput): Promise<void>;
    show(input: ShowBubbleInput): Promise<BubbleHandle>;
    releaseTarget(actorKey: unknown): Promise<void>;
    releaseAll(): Promise<void>;
    dispose(): Promise<void>;
}
export type BubbleCompositionErrorCode = "BUBBLE-COMPOSITION-001" | "BUBBLE-COMPOSITION-002" | "BUBBLE-COMPOSITION-003" | "BUBBLE-COMPOSITION-004" | "BUBBLE-COMPOSITION-005";
export declare class BubbleCompositionError extends Error {
    readonly code: BubbleCompositionErrorCode;
    constructor(code: BubbleCompositionErrorCode, message: string);
}
export declare function createBubbleComposition(options: BubbleCompositionOptions): BubbleComposition;
