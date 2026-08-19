import { type BubbleImageCapability, type BubbleScheduler, type BubbleStyle, type BubbleSurface, type BubbleTextCapability } from "./composition.js";
export type BubbleRenderBackend = "scratch-render" | "svg-overlay";
export type BubbleOverlayUnsupportedBehavior = "error" | "fallback";
export declare const bubbleRenderBackends: readonly ["scratch-render", "svg-overlay"];
export declare const defaultBubbleRenderBackend: BubbleRenderBackend;
export declare const defaultBubbleOverlayUnsupportedBehavior: BubbleOverlayUnsupportedBehavior;
export interface BubbleSvgOverlayTextLine {
    /** Optional baseline relative to the center of the text layout. */
    readonly baseline?: number;
    readonly text: string;
    /** Optional x coordinate relative to the center of the text layout. */
    readonly x?: number;
}
export interface BubbleSvgOverlayTextLayout {
    readonly alignment: "center" | "left" | "right";
    readonly backgroundColor?: string;
    readonly backgroundCornerRadius?: number;
    readonly fill: string;
    readonly fontFamily: string;
    readonly fontSize: number;
    readonly fontStyle?: "normal" | "italic";
    readonly fontWeight?: "normal" | "bold" | number;
    readonly height: number;
    readonly lineHeight: number;
    readonly lines: readonly (string | BubbleSvgOverlayTextLine)[];
    readonly preserveWhitespace?: boolean;
    readonly width: number;
}
export interface BubbleSvgOverlayTextCapability {
    layoutText(input: Readonly<{
        nativeSize: Readonly<{
            height: number;
            width: number;
        }>;
        styleName: string;
        text: string;
    }>): BubbleSvgOverlayTextLayout;
    measureText?(input: Readonly<{
        nativeSize: Readonly<{
            height: number;
            width: number;
        }>;
        styleName: string;
        text: string;
    }>): number;
}
export interface BubbleSvgOverlayImageResource {
    readonly height: number;
    readonly mimeType: string;
    /** A capability-owned blob URL or an approved raster data URL. */
    readonly src: string;
    /** Required when mimeType is image/svg+xml; the provider owns sanitizing bytes. */
    readonly svgSecurity?: "sanitized";
    readonly width: number;
    /** Required for blob URLs and called on replacement and disposal. */
    readonly release?: () => void | Promise<void>;
}
export interface BubbleSvgOverlayImageCapability {
    getMimeType(name: unknown): string;
    isRegistered(name: unknown): boolean;
    resolveImage(name: unknown): BubbleSvgOverlayImageResource | Promise<BubbleSvgOverlayImageResource>;
}
export interface BubbleSvgOverlayRenderer {
    addOverlay(element: Element, mode?: string): unknown;
    getNativeSize(): unknown;
    removeOverlay(element: Element): void;
    on?(event: string, listener: (...args: unknown[]) => void): void;
    off?(event: string, listener: (...args: unknown[]) => void): void;
}
export interface BubbleSvgOverlayActor {
    readonly id: string;
    readonly isStage: boolean;
    readonly visible?: boolean;
    readonly x?: number;
    readonly y?: number;
    getBoundsForBubble?(): {
        readonly bottom: number;
        readonly left: number;
        readonly right: number;
        readonly top: number;
    };
    onTargetVisualChange?: ((target?: BubbleSvgOverlayActor) => void) | null;
}
export interface BubbleSvgOverlaySurfaceManager {
    readonly document: Document;
    readonly renderer: BubbleSvgOverlayRenderer;
    acquire(group: SVGGElement): void;
    release(group: SVGGElement): void;
    updateNativeSize(): Readonly<{
        height: number;
        width: number;
    }>;
}
export declare function createSvgOverlayTextAdapter(capabilityInput: BubbleSvgOverlayTextCapability, renderer: Pick<BubbleSvgOverlayRenderer, "getNativeSize">): BubbleTextCapability;
export declare function createSvgOverlayImageAdapter(capabilityInput: BubbleSvgOverlayImageCapability): BubbleImageCapability;
export declare function createSvgOverlaySurfaceManager(renderer: BubbleSvgOverlayRenderer, documentInput: Document): BubbleSvgOverlaySurfaceManager;
export declare function createSvgOverlaySurface(manager: BubbleSvgOverlaySurfaceManager, actor: BubbleSvgOverlayActor, actorKey: string, style: BubbleStyle, scheduler: BubbleScheduler): BubbleSurface;
