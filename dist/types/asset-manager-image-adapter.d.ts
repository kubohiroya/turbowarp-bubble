import { type BubbleSvgOverlayImageCapability } from "./svg-overlay-surface.js";
export interface AssetManagerDOMImageResource {
    readonly height: number;
    readonly mimeType: string;
    readonly url: string;
    readonly width: number;
    release(): void;
}
export interface AssetManagerDOMImageCapability {
    getMimeType(name: unknown): string;
    isRegistered(name: unknown): boolean;
    resolveDOMImageResource(name: unknown): Promise<AssetManagerDOMImageResource>;
}
/**
 * Adapts Asset Manager's host-neutral DOM resource API to Bubble's SVG overlay contract.
 * Asset Manager owns byte validation and SVG sanitization; Bubble owns its capability shape.
 */
export declare function createAssetManagerSvgOverlayImageCapability(capabilityInput: AssetManagerDOMImageCapability): BubbleSvgOverlayImageCapability;
