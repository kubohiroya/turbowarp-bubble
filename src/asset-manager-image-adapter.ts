import {
  type BubbleSvgOverlayImageCapability,
  type BubbleSvgOverlayImageResource,
} from "./svg-overlay-surface.js";

const supportedMimeTypes = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/webp",
]);

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeMimeType(value: string): string {
  const mimeType = value.split(";", 1)[0]?.trim().toLowerCase() ?? "";
  if (mimeType === "image/jpg" || mimeType === "image/pjpeg") {
    return "image/jpeg";
  }
  if (mimeType === "image/x-png") return "image/png";
  return mimeType;
}

function isSupportedMimeType(value: string): boolean {
  return supportedMimeTypes.has(normalizeMimeType(value));
}

function requireAssetManagerResource(
  value: AssetManagerDOMImageResource,
): AssetManagerDOMImageResource {
  if (
    !isRecord(value) ||
    typeof value.url !== "string" ||
    !value.url.startsWith("blob:") ||
    typeof value.mimeType !== "string" ||
    !isSupportedMimeType(value.mimeType) ||
    typeof value.width !== "number" ||
    !Number.isFinite(value.width) ||
    value.width <= 0 ||
    typeof value.height !== "number" ||
    !Number.isFinite(value.height) ||
    value.height <= 0 ||
    typeof value.release !== "function"
  ) {
    throw new TypeError(
      "Asset Manager DOM image resources must provide a supported MIME type, positive intrinsic dimensions, a blob URL, and release().",
    );
  }
  return value;
}

/**
 * Adapts Asset Manager's host-neutral DOM resource API to Bubble's SVG overlay contract.
 * Asset Manager owns byte validation and SVG sanitization; Bubble owns its capability shape.
 */
export function createAssetManagerSvgOverlayImageCapability(
  capabilityInput: AssetManagerDOMImageCapability,
): BubbleSvgOverlayImageCapability {
  if (
    !isRecord(capabilityInput) ||
    typeof capabilityInput.isRegistered !== "function" ||
    typeof capabilityInput.getMimeType !== "function" ||
    typeof capabilityInput.resolveDOMImageResource !== "function"
  ) {
    throw new TypeError("Asset Manager DOM image capability is invalid.");
  }
  const capability = capabilityInput;
  return Object.freeze({
    isRegistered(name: unknown): boolean {
      return (
        capability.isRegistered(name) &&
        isSupportedMimeType(capability.getMimeType(name))
      );
    },
    getMimeType(name: unknown): string {
      return normalizeMimeType(capability.getMimeType(name));
    },
    async resolveImage(name: unknown): Promise<BubbleSvgOverlayImageResource> {
      const declaredMimeType = normalizeMimeType(capability.getMimeType(name));
      if (
        !capability.isRegistered(name) ||
        !isSupportedMimeType(declaredMimeType)
      ) {
        throw new TypeError(
          "Asset Manager image is not registered with a Bubble-compatible MIME type.",
        );
      }
      const resource = await capability.resolveDOMImageResource(name);
      try {
        requireAssetManagerResource(resource);
        const mimeType = normalizeMimeType(resource.mimeType);
        if (mimeType !== declaredMimeType) {
          throw new TypeError(
            "Asset Manager DOM image resource MIME type changed during resolution.",
          );
        }
        return Object.freeze({
          height: resource.height,
          mimeType,
          src: resource.url,
          width: resource.width,
          release: () => resource.release(),
          ...(mimeType === "image/svg+xml"
            ? { svgSecurity: "sanitized" as const }
            : {}),
        });
      } catch (error) {
        resource?.release?.();
        throw error;
      }
    },
  });
}
