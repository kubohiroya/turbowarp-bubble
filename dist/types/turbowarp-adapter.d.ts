import { type BubbleComposition, type BubbleCompositionOptions, type BubbleAudioCapability, type BubbleImageCapability, type BubbleScheduler, type BubbleTextCapability } from "./composition.js";
import { type TurboWarpSvgTextExtension } from "./turbowarp-svg-text-adapter.js";
export { createSvgTextCompositionCapability, createTurboWarpSvgTextCapability, type TurboWarpSvgTextExtension, } from "./turbowarp-svg-text-adapter.js";
import { type BubbleOverlayUnsupportedBehavior, type BubbleRenderBackend, type BubbleSvgOverlayImageCapability, type BubbleSvgOverlayTextCapability } from "./svg-overlay-surface.js";
export { createSvgOverlayImageAdapter, createSvgOverlaySurface, createSvgOverlaySurfaceManager, createSvgOverlayTextAdapter, bubbleRenderBackends, defaultBubbleOverlayUnsupportedBehavior, defaultBubbleRenderBackend, type BubbleOverlayUnsupportedBehavior, type BubbleRenderBackend, type BubbleSvgOverlayActor, type BubbleSvgOverlayImageCapability, type BubbleSvgOverlayImageResource, type BubbleSvgOverlayRenderer, type BubbleSvgOverlaySurfaceManager, type BubbleSvgOverlayTextCapability, type BubbleSvgOverlayTextLayout, } from "./svg-overlay-surface.js";
export interface TurboWarpBubbleTarget {
    readonly id: string;
    readonly isStage: boolean;
    readonly drawableID?: number | null;
    readonly visible?: boolean;
    readonly x?: number;
    readonly y?: number;
    getBoundsForBubble?(): {
        readonly bottom: number;
        readonly left: number;
        readonly right: number;
        readonly top: number;
    };
    onTargetVisualChange?: ((target?: TurboWarpBubbleTarget) => void) | null;
}
export interface TurboWarpBubbleRenderer {
    createSVGSkin(svg: string): number;
    createDrawable(layerGroup: string): number;
    destroyDrawable(drawableId: number, layerGroup: string): void;
    destroySkin(skinId: number): void;
    getCurrentSkinSize(drawableId: number): unknown;
    getNativeSize(): unknown;
    updateDrawablePosition(drawableId: number, position: [number, number]): void;
    updateDrawableScale(drawableId: number, scale: [number, number]): void;
    updateDrawableSkinId(drawableId: number, skinId: number): void;
    updateDrawableVisible(drawableId: number, visible: boolean): void;
    /** Scratch/TurboWarp's ghost effect is used to implement fade motions. */
    updateDrawableEffect?(drawableId: number, effectName: string, value: number): void;
    setDrawableOrder?(drawableId: number, order: number, layerGroup: string, relative?: boolean): void;
    addOverlay?(element: Element, mode?: string): unknown;
    removeOverlay?(element: Element): void;
    on?(event: string, listener: (...args: unknown[]) => void): void;
    off?(event: string, listener: (...args: unknown[]) => void): void;
}
export interface TurboWarpAssetManagerExtension {
    isLoaded(args: Readonly<{
        NAME: unknown;
    }>): boolean;
    getAssetMimeType(args: Readonly<{
        NAME: unknown;
    }>): string;
    playSound?(args: Readonly<{
        NAME: unknown;
    }>): Promise<void>;
    playSoundUntilDone?(args: Readonly<{
        NAME: unknown;
    }>): Promise<void>;
    resolveSkin(value: unknown): Readonly<{
        skinId: number;
    }> | Promise<Readonly<{
        skinId: number;
    }>>;
}
export interface TurboWarpBubbleRuntime {
    readonly renderer: TurboWarpBubbleRenderer;
    readonly ext_kubohiroyaassetmanager?: TurboWarpAssetManagerExtension;
    readonly ext_kubohiroyasvgtext?: TurboWarpSvgTextExtension;
    requestRedraw?(): void;
}
export interface TurboWarpBubbleCompositionOptions {
    /** Defaults to scratch-render; svg-overlay is explicitly opt-in. */
    readonly bubbleRenderBackend?: BubbleRenderBackend;
    /** Defaults to error so an opt-in request never silently changes semantics. */
    readonly svgOverlayUnsupportedBehavior?: BubbleOverlayUnsupportedBehavior;
    /** Host-neutral text layout supplied by turbowarp-svg-text or another host. */
    readonly svgOverlayTextCapability?: BubbleSvgOverlayTextCapability;
    /** Releasable DOM image resources supplied by Asset Manager or another host. */
    readonly svgOverlayImageCapability?: BubbleSvgOverlayImageCapability;
    /** Browser document override for packaged players and deterministic tests. */
    readonly document?: Document;
    readonly imageResolver?: BubbleImageCapability;
    readonly audio?: BubbleAudioCapability;
    readonly textCapability?: BubbleTextCapability;
    readonly scheduler?: BubbleScheduler;
    readonly onAnimationError?: BubbleCompositionOptions["onAnimationError"];
}
export type BubbleRuntimeAdapterErrorCode = "BUBBLE-RUNTIME-001" | "BUBBLE-RUNTIME-002" | "BUBBLE-RUNTIME-003" | "BUBBLE-RUNTIME-004";
export declare class BubbleRuntimeAdapterError extends Error {
    readonly code: BubbleRuntimeAdapterErrorCode;
    constructor(code: BubbleRuntimeAdapterErrorCode, message: string);
}
export declare function createTurboWarpBubbleComposition(runtimeInput: TurboWarpBubbleRuntime, options?: TurboWarpBubbleCompositionOptions): BubbleComposition;
