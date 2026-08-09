import { type BubbleComposition, type BubbleCompositionOptions, type BubbleAudioCapability, type BubbleImageCapability, type BubbleScheduler, type BubbleSvgText } from "./composition.js";
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
    setDrawableOrder?(drawableId: number, order: number, layerGroup: string, relative?: boolean): void;
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
export interface TurboWarpSvgTextExtension {
    setText(args: Readonly<{
        STYLE: unknown;
        TEXT: unknown;
    }>, util: Readonly<{
        target: TurboWarpBubbleTarget;
    }>): void;
    measureText?(styleName: unknown, text: unknown): number;
    releaseTextActor(target: TurboWarpBubbleTarget): boolean;
}
export interface TurboWarpBubbleRuntime {
    readonly renderer: TurboWarpBubbleRenderer;
    readonly ext_kubohiroyaassetmanager?: TurboWarpAssetManagerExtension;
    readonly ext_kubohiroyasvgtext?: TurboWarpSvgTextExtension;
    requestRedraw?(): void;
}
export interface TurboWarpBubbleCompositionOptions {
    readonly imageResolver?: BubbleImageCapability;
    readonly audio?: BubbleAudioCapability;
    readonly svgText?: BubbleSvgText;
    readonly scheduler?: BubbleScheduler;
    readonly onAnimationError?: BubbleCompositionOptions["onAnimationError"];
}
export type BubbleRuntimeAdapterErrorCode = "BUBBLE-RUNTIME-001" | "BUBBLE-RUNTIME-002" | "BUBBLE-RUNTIME-003";
export declare class BubbleRuntimeAdapterError extends Error {
    readonly code: BubbleRuntimeAdapterErrorCode;
    constructor(code: BubbleRuntimeAdapterErrorCode, message: string);
}
export declare function createTurboWarpBubbleComposition(runtimeInput: TurboWarpBubbleRuntime, options?: TurboWarpBubbleCompositionOptions): BubbleComposition;
