import { type BubblePlacement, type BubblePlacementInput } from "./placement.js";
import { type BubbleOffset, type BubbleOffsetInput } from "./actor-transform.js";
import { type BubbleVisualStyle } from "./bubble-svg.js";
export { UnicodeLineBreakProvider, wrapText, type LineBreakOpportunity, type LineBreakProvider, type TextWidthMeasurer, type WrappedTextLayout, type WrappedTextLine, type WrapTextInput, } from "./text-layout.js";
export { bubbleBackgroundRegions, bubbleDirectionAliases, bubbleDirectionNames, defaultBubblePlacementInput, normalizeBubblePlacement, type BubbleActorPlacement, type BubbleBackgroundPlacement, type BubbleBackgroundRegion, type BubbleDirectionAlias, type BubbleDirectionName, type BubblePlacement, type BubblePlacementInput, } from "./placement.js";
export { actorRelativeBubbleCenter, defaultBubbleDistance, defaultBubbleOffset, defaultBubbleTailLength, normalizeBubbleDistance, normalizeBubbleOffset, normalizeBubbleTailLength, type ActorBounds, type ActorRelativeCenterInput, type BubbleOffset, type BubbleOffsetInput, } from "./actor-transform.js";
export { bubbleBodyCenterOffset, bubbleVisualStyles, renderBubbleSvg, type BubbleBodyCenterOffsetInput, type BubbleVisualStyle, type RenderBubbleSvgInput, } from "./bubble-svg.js";
export type BubbleKind = "say" | "think";
export type BubbleAnimationMode = "idle" | "talking" | "awaiting-continue";
export type BubbleLayer = "portraitBase" | "portraitBlink" | "portraitLipSync" | "continueIndicator";
export interface BubbleFrameAnimationInput {
    readonly frames: ReadonlyArray<string>;
    readonly frameIntervalSeconds: number;
}
export interface BubblePortraitInput {
    readonly base: string;
    readonly blink?: BubbleFrameAnimationInput;
    readonly lipSync?: BubbleFrameAnimationInput;
}
export interface BubbleStyleInput {
    readonly name: string;
    readonly textStyle: string;
    readonly maxWidth?: number;
    readonly textLocale?: string;
    readonly placement?: BubblePlacementInput;
    readonly distance?: number;
    readonly tailLength?: number;
    readonly offset?: BubbleOffsetInput;
    readonly visualStyle?: BubbleVisualStyle;
    readonly portrait?: BubblePortraitInput;
    readonly continueIndicator?: BubbleFrameAnimationInput;
}
export interface BubbleFrameAnimation {
    readonly frames: ReadonlyArray<string>;
    readonly frameIntervalSeconds: number;
}
export interface BubblePortrait {
    readonly base: string;
    readonly blink?: BubbleFrameAnimation;
    readonly lipSync?: BubbleFrameAnimation;
}
export interface BubbleStyle {
    readonly name: string;
    readonly textStyle: string;
    readonly maxWidth?: number;
    readonly textLocale?: string;
    readonly placement: BubblePlacement;
    readonly distance: number;
    readonly tailLength: number;
    readonly offset: BubbleOffset;
    readonly visualStyle: BubbleVisualStyle;
    readonly portrait?: BubblePortrait;
    readonly continueIndicator?: BubbleFrameAnimation;
}
export interface BubbleAssetTarget {
    readonly id: string;
    readonly isStage: boolean;
}
export interface BubbleImageCapability {
    readonly applyToTarget: (name: unknown, target: BubbleAssetTarget) => void | Promise<void>;
    readonly getMimeType: (name: unknown) => string;
    readonly isRegistered: (name: unknown) => boolean;
}
export interface BubbleAudioCapability {
    readonly playSound: (name: unknown, options?: Readonly<{
        untilDone?: boolean;
    }>) => Promise<void>;
}
export interface BubbleTextTarget {
    readonly drawableID: number;
}
export interface BubbleSvgText {
    readonly setText: (input: {
        readonly styleName: string;
        readonly target: BubbleTextTarget;
        readonly text: string;
    }) => void;
    readonly releaseTarget: (target: BubbleTextTarget) => void;
    readonly measureText?: (input: {
        readonly styleName: string;
        readonly text: string;
    }) => number;
}
export interface BubbleSurfaceTargets {
    readonly text: BubbleTextTarget;
    readonly portraitBase?: BubbleAssetTarget;
    readonly portraitBlink?: BubbleAssetTarget;
    readonly portraitLipSync?: BubbleAssetTarget;
    readonly continueIndicator?: BubbleAssetTarget;
}
export interface BubbleSurface {
    readonly targets: BubbleSurfaceTargets;
    setLayerVisible(layer: BubbleLayer, visible: boolean): void | Promise<void>;
    updateStyle(style: BubbleStyle): void | Promise<void>;
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
    readonly imageResolver?: BubbleImageCapability;
    readonly audio?: BubbleAudioCapability;
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
    updateStyle(style: BubbleStyleInput): Promise<void>;
    setAnimationMode(mode: BubbleAnimationMode): Promise<void>;
    close(): Promise<void>;
}
export interface BubbleComposition {
    defineStyle(input: BubbleStyleInput): void;
    hasActiveBubble(actorKey: unknown): boolean;
    show(input: ShowBubbleInput): Promise<BubbleHandle>;
    releaseTarget(actorKey: unknown): Promise<void>;
    releaseAll(): Promise<void>;
    dispose(): Promise<void>;
}
export type BubbleCompositionErrorCode = "BUBBLE-COMPOSITION-001" | "BUBBLE-COMPOSITION-002" | "BUBBLE-COMPOSITION-003" | "BUBBLE-COMPOSITION-004" | "BUBBLE-COMPOSITION-005" | "BUBBLE-COMPOSITION-006" | "BUBBLE-COMPOSITION-007";
export declare class BubbleCompositionError extends Error {
    readonly code: BubbleCompositionErrorCode;
    constructor(code: BubbleCompositionErrorCode, message: string);
}
export declare function createBubbleComposition(options: BubbleCompositionOptions): BubbleComposition;
