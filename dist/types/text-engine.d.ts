export type BubbleTextAlignment = "center" | "left" | "right";
export interface BubbleTextStyleInput {
    readonly name: string;
    readonly alignment?: BubbleTextAlignment;
    readonly backgroundColor?: string;
    readonly font?: string;
    readonly fontPercent?: number;
    readonly textColor?: string;
}
export interface BubbleTextTarget {
    readonly drawableID: number;
}
export interface BubbleTextActorInput {
    readonly scaleToStage?: boolean;
    readonly styleName: string;
    readonly target: BubbleTextTarget;
    readonly text: string;
}
export interface BubbleTextEngine {
    defineStyle(input: BubbleTextStyleInput): void;
    releaseAll(): void;
    releaseTarget(target: BubbleTextTarget): void;
    setText(input: BubbleTextActorInput): void;
}
export interface BubbleTextEngineRenderer {
    createSVGSkin(svg: string): number;
    destroySkin(skinId: number): void;
    getNativeSize?(): unknown;
    updateDrawableSkinId(drawableId: number, skinId: number): void;
}
export interface BubbleTextEngineRuntime {
    readonly renderer: BubbleTextEngineRenderer;
    on?(event: string, listener: () => void): void;
    off?(event: string, listener: () => void): void;
    requestRedraw?(): void;
}
export declare function renderTextActorSvg(text: string, style: BubbleTextStyleInput, scale?: number): string;
export declare function createBubbleTextEngine(runtimeInput: BubbleTextEngineRuntime): BubbleTextEngine;
