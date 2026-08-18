import { describe, expect, it, vi } from "vitest";

import {
  createAssetManagerSvgOverlayImageCapability,
  type AssetManagerDOMImageCapability,
} from "../src/asset-manager-image-adapter.js";

function capability(
  mimeType: string,
  overrides: Partial<AssetManagerDOMImageCapability> = {},
): AssetManagerDOMImageCapability {
  return {
    getMimeType: () => mimeType,
    isRegistered: () => true,
    async resolveDOMImageResource() {
      return {
        height: 80,
        mimeType,
        release: vi.fn(),
        url: "blob:https://example.test/portrait",
        width: 120,
      };
    },
    ...overrides,
  };
}

describe("Asset Manager SVG overlay image adapter", () => {
  it("maps a sanitized Asset Manager SVG resource to Bubble's capability contract", async () => {
    const release = vi.fn();
    const input = capability("image/svg+xml", {
      async resolveDOMImageResource() {
        return {
          height: 80,
          mimeType: "image/svg+xml",
          release,
          url: "blob:https://example.test/portrait",
          width: 120,
        };
      },
    });

    const adapter = createAssetManagerSvgOverlayImageCapability(input);
    const resource = await adapter.resolveImage("Portrait");

    expect(resource).toEqual({
      height: 80,
      mimeType: "image/svg+xml",
      release: expect.any(Function),
      src: "blob:https://example.test/portrait",
      svgSecurity: "sanitized",
      width: 120,
    });
    resource.release?.();
    expect(release).toHaveBeenCalledOnce();
  });

  it("accepts Bubble-compatible raster resources without SVG metadata", async () => {
    const adapter = createAssetManagerSvgOverlayImageCapability(
      capability("IMAGE/X-PNG; charset=binary"),
    );

    expect(adapter.isRegistered("Portrait")).toBe(true);
    const resource = await adapter.resolveImage("Portrait");
    expect(resource).toMatchObject({
      mimeType: "image/png",
      src: "blob:https://example.test/portrait",
    });
    expect(resource).not.toHaveProperty("svgSecurity");
    resource.release?.();
  });

  it("filters unsupported Asset Manager MIME types before resource resolution", async () => {
    const resolveDOMImageResource = vi.fn(async () => ({
      height: 80,
      mimeType: "image/bmp",
      release: vi.fn(),
      url: "blob:https://example.test/portrait",
      width: 120,
    }));
    const adapter = createAssetManagerSvgOverlayImageCapability(
      capability("image/bmp", {
        resolveDOMImageResource,
      }),
    );

    expect(adapter.isRegistered("Portrait")).toBe(false);
    await expect(adapter.resolveImage("Portrait")).rejects.toThrow(
      "Bubble-compatible MIME type",
    );
    expect(resolveDOMImageResource).not.toHaveBeenCalled();
  });

  it("releases a resource whose MIME type changed during resolution", async () => {
    const release = vi.fn();
    const adapter = createAssetManagerSvgOverlayImageCapability(
      capability("image/png", {
        async resolveDOMImageResource() {
          return {
            height: 80,
            mimeType: "image/webp",
            release,
            url: "blob:https://example.test/portrait",
            width: 120,
          };
        },
      }),
    );

    await expect(adapter.resolveImage("Portrait")).rejects.toThrow(
      "MIME type changed",
    );
    expect(release).toHaveBeenCalledOnce();
  });

  it("rejects capabilities without the public DOM resource method", () => {
    expect(() =>
      createAssetManagerSvgOverlayImageCapability({
        getMimeType: () => "image/png",
        isRegistered: () => true,
      } as unknown as AssetManagerDOMImageCapability),
    ).toThrow("capability is invalid");
  });
});
