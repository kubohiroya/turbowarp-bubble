import { Window } from "happy-dom";
import { describe, expect, it, vi } from "vitest";
import {
  createAssetManagerSvgOverlayImageCapability,
  createTurboWarpBubbleComposition,
  type BubbleRuntimeAdapterError,
  type BubbleSvgOverlayImageCapability,
  type BubbleSvgOverlayTextCapability,
  type TurboWarpBubbleRenderer,
  type TurboWarpBubbleRuntime,
} from "../src/turbowarp-adapter.js";

function createHarness(nativeSize: [number, number] = [480, 360]) {
  const window = new Window();
  const listeners = new Map<string, Set<(...args: unknown[]) => void>>();
  let currentNativeSize = nativeSize;
  let nextDrawable = 1;
  const renderer: TurboWarpBubbleRenderer & {
    createBitmapSkin: ReturnType<typeof vi.fn>;
  } = {
    createSVGSkin: vi.fn(() => 1),
    createBitmapSkin: vi.fn(() => 2),
    createDrawable: vi.fn(() => nextDrawable++),
    destroyDrawable: vi.fn(),
    destroySkin: vi.fn(),
    getCurrentSkinSize: vi.fn(() => [180, 48]),
    getNativeSize: vi.fn(() => currentNativeSize),
    updateDrawablePosition: vi.fn(),
    updateDrawableScale: vi.fn(),
    updateDrawableSkinId: vi.fn(),
    updateDrawableVisible: vi.fn(),
    addOverlay: vi.fn((element: Element) => {
      window.document.body.appendChild(
        element as unknown as Parameters<
          typeof window.document.body.appendChild
        >[0],
      );
    }),
    removeOverlay: vi.fn((element: Element) => {
      element.remove();
    }),
    on: vi.fn((event: string, listener: (...args: unknown[]) => void) => {
      const eventListeners = listeners.get(event) ?? new Set();
      eventListeners.add(listener);
      listeners.set(event, eventListeners);
    }),
    off: vi.fn((event: string, listener: (...args: unknown[]) => void) => {
      listeners.get(event)?.delete(listener);
    }),
  };
  const runtime: TurboWarpBubbleRuntime = {
    renderer,
    requestRedraw: vi.fn(),
  };
  const textCapability: BubbleSvgOverlayTextCapability = {
    layoutText({ text }) {
      const lines = text.split("\n");
      return {
        alignment: "left",
        fill: "#25283a",
        fontFamily: "Noto Sans JP, sans-serif",
        fontSize: 16,
        height: Math.max(24, lines.length * 22),
        lineHeight: 22,
        lines,
        width: Math.max(20, ...lines.map((line) => line.length * 10)),
      };
    },
    measureText({ text }) {
      return Math.max(1, text.length * 10);
    },
  };
  return {
    emit(event: string): void {
      for (const listener of listeners.get(event) ?? []) listener();
    },
    renderer,
    runtime,
    setNativeSize(size: [number, number]): void {
      currentNativeSize = size;
    },
    textCapability,
    window,
  };
}

function actor(id: string, x = 0, y = 0) {
  return {
    id,
    isStage: false,
    visible: true,
    x,
    y,
    getBoundsForBubble: () => ({
      bottom: y - 20,
      left: x - 20,
      right: x + 20,
      top: y + 20,
    }),
    onTargetVisualChange: null,
  };
}

describe("SVG overlay backend", () => {
  it("renders and animates without creating Bubble drawables or skins", async () => {
    const harness = createHarness();
    const composition = createTurboWarpBubbleComposition(harness.runtime, {
      bubbleRenderBackend: "svg-overlay",
      document: harness.window.document as unknown as Document,
      svgOverlayTextCapability: harness.textCapability,
    });
    composition.defineStyle({ name: "dialog", textStyle: "body" });

    const handle = await composition.show({
      actor: actor("sprite-1", 40, -10),
      actorKey: "sprite-1",
      kind: "say",
      styleName: "dialog",
      text: "Hello\nworld",
    });
    await handle.setText("Updated");
    await handle.animate({ name: "shake", durationSeconds: 0 });
    await handle.animate({
      name: "animateBubbleShape",
      durationSeconds: 0,
      visualStyle: "THINKING",
    });

    expect(harness.renderer.addOverlay).toHaveBeenCalledOnce();
    expect(harness.renderer.addOverlay).toHaveBeenCalledWith(
      expect.anything(),
      "scale",
    );
    expect(harness.renderer.createDrawable).not.toHaveBeenCalled();
    expect(harness.renderer.createSVGSkin).not.toHaveBeenCalled();
    expect(harness.renderer.createBitmapSkin).not.toHaveBeenCalled();
    const root = harness.window.document.querySelector(
      '[data-bubble-render-backend="svg-overlay"]',
    );
    expect(root?.getAttribute("viewBox")).toBe("0 0 480 360");
    expect(root?.getAttribute("aria-hidden")).toBe("true");
    expect(root?.querySelector("text")?.textContent).toBe("Updated");
    expect(root?.querySelector("path, circle, rect")).not.toBeNull();
    expect(root?.querySelector("script, foreignObject")).toBeNull();
    expect(root?.querySelector("[onclick], [onload]")).toBeNull();

    harness.setNativeSize([640, 480]);
    harness.emit("NativeSizeChanged");
    expect(root?.getAttribute("viewBox")).toBe("0 0 640 480");

    await handle.close();
    expect(harness.renderer.removeOverlay).toHaveBeenCalledOnce();
    expect(harness.renderer.off).toHaveBeenCalledWith(
      "NativeSizeChanged",
      expect.any(Function),
    );
    expect(root?.isConnected).toBe(false);
  });

  it("shares one root and removes it after the last Bubble closes", async () => {
    const harness = createHarness();
    const composition = createTurboWarpBubbleComposition(harness.runtime, {
      bubbleRenderBackend: "svg-overlay",
      document: harness.window.document as unknown as Document,
      svgOverlayTextCapability: harness.textCapability,
    });
    composition.defineStyle({ name: "dialog", textStyle: "body" });
    const first = await composition.show({
      actor: actor("first", -50, 0),
      actorKey: "first",
      kind: "say",
      styleName: "dialog",
      text: "First",
    });
    const second = await composition.show({
      actor: actor("second", 50, 0),
      actorKey: "second",
      kind: "think",
      styleName: "dialog",
      text: "Second",
    });

    expect(harness.renderer.addOverlay).toHaveBeenCalledOnce();
    expect(
      harness.window.document.querySelectorAll("[data-bubble-surface]"),
    ).toHaveLength(2);
    await first.close();
    expect(harness.renderer.removeOverlay).not.toHaveBeenCalled();
    await second.close();
    expect(harness.renderer.removeOverlay).toHaveBeenCalledOnce();
  });

  it("releases every capability-owned blob URL on close", async () => {
    const harness = createHarness();
    const releases = new Map<string, Array<ReturnType<typeof vi.fn>>>();
    const imageCapability: BubbleSvgOverlayImageCapability = {
      isRegistered: () => true,
      getMimeType: () => "image/png",
      resolveImage(name) {
        const key = String(name);
        const release = vi.fn();
        const resourceReleases = releases.get(key) ?? [];
        resourceReleases.push(release);
        releases.set(key, resourceReleases);
        return {
          height: key === "portrait" ? 80 : 16,
          mimeType: "image/png",
          release,
          src: `blob:https://example.test/${key}`,
          width: key === "portrait" ? 60 : 16,
        };
      },
    };
    const composition = createTurboWarpBubbleComposition(harness.runtime, {
      bubbleRenderBackend: "svg-overlay",
      document: harness.window.document as unknown as Document,
      svgOverlayImageCapability: imageCapability,
      svgOverlayTextCapability: harness.textCapability,
    });
    composition.defineStyle({
      name: "dialog",
      textStyle: "body",
      portrait: { base: "portrait", cornerRadius: 12 },
      continueIndicator: {
        frameIntervalSeconds: 1,
        frames: ["continue", "continue-2"],
      },
    });
    const handle = await composition.show({
      actor: actor("sprite"),
      actorKey: "sprite",
      kind: "say",
      styleName: "dialog",
      text: "With images",
    });

    const images = harness.window.document.querySelectorAll("image[href]");
    expect(images).toHaveLength(2);
    expect(
      harness.window.document.querySelector('[clip-path^="url(#bubble-"]'),
    ).not.toBeNull();
    await handle.updateStyle({
      name: "dialog",
      textStyle: "body",
      portrait: { base: "portrait-2", cornerRadius: 12 },
      continueIndicator: {
        frameIntervalSeconds: 1,
        frames: ["continue", "continue-2"],
      },
    });
    expect(releases.get("portrait")?.[0]).toHaveBeenCalledOnce();
    expect(releases.get("continue")?.[0]).toHaveBeenCalledOnce();
    await handle.close();
    expect(releases.get("portrait-2")?.[0]).toHaveBeenCalledOnce();
    expect(releases.get("continue")?.[1]).toHaveBeenCalledOnce();
  });

  it("renders an Asset Manager SVG resource through the Bubble-owned adapter", async () => {
    const harness = createHarness();
    const release = vi.fn();
    const imageCapability = createAssetManagerSvgOverlayImageCapability({
      getMimeType: () => "image/svg+xml",
      isRegistered: () => true,
      async resolveDOMImageResource() {
        return {
          height: 80,
          mimeType: "image/svg+xml",
          release,
          url: "blob:https://example.test/sanitized-portrait",
          width: 60,
        };
      },
    });
    const composition = createTurboWarpBubbleComposition(harness.runtime, {
      bubbleRenderBackend: "svg-overlay",
      document: harness.window.document as unknown as Document,
      svgOverlayImageCapability: imageCapability,
      svgOverlayTextCapability: harness.textCapability,
    });
    composition.defineStyle({
      name: "dialog",
      textStyle: "body",
      portrait: { base: "portrait" },
    });

    const handle = await composition.show({
      actor: actor("sprite"),
      actorKey: "sprite",
      kind: "say",
      styleName: "dialog",
      text: "Asset Manager portrait",
    });

    expect(
      harness.window.document.querySelector("image")?.getAttribute("href"),
    ).toBe("blob:https://example.test/sanitized-portrait");
    await handle.close();
    expect(release).toHaveBeenCalledOnce();
  });

  it("rejects unsafe image URLs and cleans up the root", async () => {
    const harness = createHarness();
    const release = vi.fn();
    const composition = createTurboWarpBubbleComposition(harness.runtime, {
      bubbleRenderBackend: "svg-overlay",
      document: harness.window.document as unknown as Document,
      svgOverlayTextCapability: harness.textCapability,
      svgOverlayImageCapability: {
        isRegistered: () => true,
        getMimeType: () => "image/svg+xml",
        resolveImage: () => ({
          height: 10,
          mimeType: "image/svg+xml",
          release,
          src: 'data:image/svg+xml,<svg onload="alert(1)"/>',
          width: 10,
        }),
      },
    });
    composition.defineStyle({
      name: "unsafe",
      textStyle: "body",
      portrait: { base: "unsafe" },
    });

    await expect(
      composition.show({
        actor: actor("sprite"),
        actorKey: "sprite",
        kind: "say",
        styleName: "unsafe",
        text: "Unsafe",
      }),
    ).rejects.toThrow(/sanitized SVG metadata/u);
    expect(release).toHaveBeenCalledOnce();
    expect(harness.renderer.removeOverlay).toHaveBeenCalledOnce();
    expect(harness.window.document.querySelector("svg")).toBeNull();
  });

  it("errors explicitly or follows the documented scratch fallback", () => {
    const harness = createHarness();
    expect(() =>
      createTurboWarpBubbleComposition(harness.runtime, {
        bubbleRenderBackend: "svg-overlay",
        document: harness.window.document as unknown as Document,
      }),
    ).toThrowError(
      expect.objectContaining<Partial<BubbleRuntimeAdapterError>>({
        code: "BUBBLE-RUNTIME-004",
      }),
    );

    expect(() =>
      createTurboWarpBubbleComposition(harness.runtime, {
        bubbleRenderBackend: "svg-overlay",
        document: harness.window.document as unknown as Document,
        svgOverlayUnsupportedBehavior: "fallback",
        textCapability: {
          setText: vi.fn(),
          releaseTarget: vi.fn(),
          measureText: ({ text }) => text.length * 10,
        },
      }),
    ).not.toThrow();

    expect(() =>
      createTurboWarpBubbleComposition(harness.runtime, {
        bubbleRenderBackend: "canvas" as never,
      }),
    ).toThrow(/bubbleRenderBackend must be scratch-render or svg-overlay/u);
  });
});
