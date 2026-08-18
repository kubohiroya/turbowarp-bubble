import { createSvgTextLayoutComposition } from "@kubohiroya/turbowarp-svg-text/composition";
import { Window } from "happy-dom";
import { describe, expect, it, vi } from "vitest";
import {
  createAssetManagerSvgOverlayImageCapability,
  createSvgTextOverlayTextCapability,
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
  it("defaults to SVG Text 0.8 layout without creating drawables or skins", async () => {
    const harness = createHarness();
    const textLayouts = createSvgTextLayoutComposition();
    textLayouts.defineStyle({ name: "body", backgroundColor: "transparent" });
    const composition = createTurboWarpBubbleComposition(harness.runtime, {
      document: harness.window.document as unknown as Document,
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
    const expected = textLayouts.layoutText({
      nativeSize: [480, 360],
      styleName: "body",
      text: "Updated",
    });
    expect(root?.getAttribute("viewBox")).toBe("0 0 480 360");
    expect(root?.getAttribute("aria-hidden")).toBe("true");
    expect(root?.querySelector("text")?.textContent).toBe("Updated");
    expect(root?.querySelector("text")?.getAttribute("font-size")).toBe(
      String(expected.style.fontSize),
    );
    expect(root?.querySelector("tspan")?.getAttribute("x")).toBe(
      String(expected.lines[0]!.x - expected.width / 2),
    );
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

  it("preserves SVG Text line coordinates and background geometry", async () => {
    const harness = createHarness();
    const textLayouts = createSvgTextLayoutComposition();
    textLayouts.defineStyle({
      name: "body",
      alignment: "right",
      backgroundColor: "#f0f0f0",
      font: "Helvetica",
      fontPercent: 100,
      textColor: "#25283a",
    });
    const expected = textLayouts.layoutText({
      nativeSize: [480, 360],
      styleName: "body",
      text: "Hello\nworld",
    });
    const composition = createTurboWarpBubbleComposition(harness.runtime, {
      bubbleRenderBackend: "svg-overlay",
      document: harness.window.document as unknown as Document,
      svgOverlayTextCapability: createSvgTextOverlayTextCapability(textLayouts),
    });
    composition.defineStyle({ name: "dialog", textStyle: "body" });

    const handle = await composition.show({
      actor: actor("sprite-1"),
      actorKey: "sprite-1",
      kind: "say",
      styleName: "dialog",
      text: "Hello\nworld",
    });

    const text = harness.window.document.querySelector("text");
    const tspans = text?.querySelectorAll("tspan");
    expect(tspans).toHaveLength(2);
    expected.lines.forEach((line, index) => {
      expect(tspans?.[index]?.getAttribute("x")).toBe(
        String(line.x - expected.width / 2),
      );
      expect(tspans?.[index]?.getAttribute("y")).toBe(
        String(line.baseline - expected.height / 2),
      );
    });
    const textBackground = text?.parentElement?.querySelector("rect");
    expect(textBackground?.getAttribute("rx")).toBe(
      String(expected.style.cornerRadius),
    );
    expect(textBackground?.getAttribute("fill")).toBe("#f0f0f0");
    expect(harness.renderer.createSVGSkin).not.toHaveBeenCalled();

    harness.setNativeSize([960, 720]);
    harness.emit("NativeSizeChanged");
    const resizedExpected = textLayouts.layoutText({
      nativeSize: [960, 720],
      styleName: "body",
      text: "Hello\nworld",
    });
    const resizedText = harness.window.document.querySelector("text");
    const resizedTspans = resizedText?.querySelectorAll("tspan");
    expect(resizedText?.getAttribute("font-size")).toBe(
      String(resizedExpected.style.fontSize),
    );
    resizedExpected.lines.forEach((line, index) => {
      expect(resizedTspans?.[index]?.getAttribute("x")).toBe(
        String(line.x - resizedExpected.width / 2),
      );
      expect(resizedTspans?.[index]?.getAttribute("y")).toBe(
        String(line.baseline - resizedExpected.height / 2),
      );
    });
    expect(
      resizedText?.parentElement?.querySelector("rect")?.getAttribute("width"),
    ).toBe(String(resizedExpected.width));

    await handle.close();
  });

  it("relayouts both reserved full text and currently revealed text", async () => {
    const harness = createHarness();
    const layoutText = vi.fn(
      ({
        nativeSize,
        text,
      }: Parameters<BubbleSvgOverlayTextCapability["layoutText"]>[0]) => {
        const scale = nativeSize.width / 480;
        return {
          alignment: "left" as const,
          backgroundColor: "#ffffff",
          fill: "#25283a",
          fontFamily: "Helvetica",
          fontSize: 14 * scale,
          height: 40 * scale,
          lineHeight: 16 * scale,
          lines: [text],
          width: Math.max(1, text.length * 10 * scale),
        };
      },
    );
    const composition = createTurboWarpBubbleComposition(harness.runtime, {
      bubbleRenderBackend: "svg-overlay",
      document: harness.window.document as unknown as Document,
      svgOverlayTextCapability: { layoutText },
    });
    composition.defineStyle({
      name: "reserved",
      textStyle: "body",
      reveal: {
        unit: "CHARACTER",
        layout: "RESERVED",
        intervalSeconds: 0,
      },
    });
    const handle = await composition.show({
      actor: actor("sprite-1"),
      actorKey: "sprite-1",
      kind: "say",
      styleName: "reserved",
      text: "ABC",
    });
    expect(harness.window.document.querySelector("text")?.textContent).toBe(
      "A",
    );

    layoutText.mockClear();
    harness.setNativeSize([960, 720]);
    harness.emit("NativeSizeChanged");

    expect(layoutText).toHaveBeenCalledWith(
      expect.objectContaining({
        nativeSize: { width: 960, height: 720 },
        text: "ABC",
      }),
    );
    expect(layoutText).toHaveBeenCalledWith(
      expect.objectContaining({
        nativeSize: { width: 960, height: 720 },
        text: "A",
      }),
    );
    expect(harness.window.document.querySelector("text")?.textContent).toBe(
      "A",
    );
    expect(
      harness.window.document
        .querySelector('[data-bubble-layer="text"] rect')
        ?.getAttribute("width"),
    ).toBe("20");

    await handle.close();
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

  it("updates the overlay transform only once per zero-duration motion frame", async () => {
    const harness = createHarness();
    const composition = createTurboWarpBubbleComposition(harness.runtime, {
      bubbleRenderBackend: "svg-overlay",
      document: harness.window.document as unknown as Document,
      svgOverlayTextCapability: harness.textCapability,
    });
    composition.defineStyle({ name: "dialog", textStyle: "body" });
    const handle = await composition.show({
      actor: actor("sprite"),
      actorKey: "sprite",
      kind: "say",
      styleName: "dialog",
      text: "Motion",
    });
    vi.mocked(harness.renderer.getNativeSize).mockClear();

    await handle.animate({ name: "fadeIn", durationSeconds: 0 });

    expect(harness.renderer.getNativeSize).toHaveBeenCalledTimes(3);
    await handle.close();
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

  it("releases image leases when renderer cleanup reports errors", async () => {
    const harness = createHarness();
    const release = vi.fn();
    const composition = createTurboWarpBubbleComposition(harness.runtime, {
      bubbleRenderBackend: "svg-overlay",
      document: harness.window.document as unknown as Document,
      svgOverlayImageCapability: {
        isRegistered: () => true,
        getMimeType: () => "image/png",
        resolveImage: () => ({
          height: 80,
          mimeType: "image/png",
          release,
          src: "blob:https://example.test/portrait",
          width: 60,
        }),
      },
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
      text: "Cleanup",
    });
    harness.renderer.off = vi.fn(() => {
      throw new Error("listener cleanup failed");
    });
    harness.renderer.removeOverlay = vi.fn(() => {
      throw new Error("overlay cleanup failed");
    });

    await expect(handle.close()).rejects.toThrow(
      "Failed to dispose SVG overlay Bubble surface",
    );
    expect(release).toHaveBeenCalledOnce();
    expect(
      harness.window.document.querySelector("[data-bubble-surface]"),
    ).toBeNull();
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

  it("uses the default text provider and only falls back when requested", () => {
    const harness = createHarness();
    expect(() =>
      createTurboWarpBubbleComposition(harness.runtime, {
        document: harness.window.document as unknown as Document,
      }),
    ).not.toThrow();

    const {
      addOverlay: unsupportedAddOverlay,
      removeOverlay: unsupportedRemoveOverlay,
      ...rendererWithoutOverlay
    } = harness.renderer;
    void unsupportedAddOverlay;
    void unsupportedRemoveOverlay;
    const unsupportedRuntime: TurboWarpBubbleRuntime = {
      ...harness.runtime,
      renderer: rendererWithoutOverlay,
    };
    expect(() =>
      createTurboWarpBubbleComposition(unsupportedRuntime, {
        document: harness.window.document as unknown as Document,
      }),
    ).toThrowError(
      expect.objectContaining<Partial<BubbleRuntimeAdapterError>>({
        code: "BUBBLE-RUNTIME-004",
      }),
    );

    expect(() =>
      createTurboWarpBubbleComposition(unsupportedRuntime, {
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
