import type { AssetManagerComposition, AssetManagerCompositionTarget } from "@kubohiroya/turbowarp-asset-manager/composition";
import type { SvgTextComposition, SvgTextTarget } from "@kubohiroya/turbowarp-svg-text/composition";
export type BubbleKind = "say" | "think";
export type BubblePhase = "idle" | "speaking" | "waiting";
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
    readonly portrait?: BubblePortrait;
    readonly advanceIndicator?: BubbleFrameAnimation;
}
export type BubbleAssetManager = Pick<AssetManagerComposition, "applyToTarget" | "getMimeType" | "isRegistered">;
export type BubbleSvgText = Pick<SvgTextComposition, "releaseTarget" | "setText">;
export interface BubbleSurfaceTargets {
    readonly text: SvgTextTarget;
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
    readonly phase?: BubblePhase;
}
export interface BubbleHandle {
    readonly actorKey: string;
    readonly kind: BubbleKind;
    readonly phase: BubblePhase;
    setPhase(phase: BubblePhase): Promise<void>;
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
export type BubbleCompositionErrorCode = "BUBBLE-COMPOSITION-001" | "BUBBLE-COMPOSITION-002" | "BUBBLE-COMPOSITION-003" | "BUBBLE-COMPOSITION-004" | "BUBBLE-COMPOSITION-005";
export declare class BubbleCompositionError extends Error {
    readonly code: BubbleCompositionErrorCode;
    constructor(code: BubbleCompositionErrorCode, message: string);
}
export declare function createBubbleComposition(options: BubbleCompositionOptions): BubbleComposition;
