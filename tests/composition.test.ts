import { describe, expect, it, vi } from "vitest";
import {
  BubbleCompositionError,
  createBubbleComposition,
  type BubbleAssetManager,
  type BubbleLayer,
  type BubbleScheduler,
  type BubbleSurface,
  type BubbleSvgText,
} from "../src/composition.js";

class TestScheduler implements BubbleScheduler {
  private nextId = 1;
  private readonly callbacks = new Map<number, () => void>();

  public setTimeout(callback: () => void): unknown {
    const id = this.nextId;
    this.nextId += 1;
    this.callbacks.set(id, callback);
    return id;
  }

  public clearTimeout(handle: unknown): void {
    this.callbacks.delete(Number(handle));
  }

  public runPending(): void {
    const pending = [...this.callbacks.values()];
    this.callbacks.clear();
    for (const callback of pending) callback();
  }

  public get size(): number {
    return this.callbacks.size;
  }
}

async function flushAnimations(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

function createHarness() {
  const registered = new Map<string, string>([
    ["Face", "image/png"],
    ["EyesOpen", "image/png"],
    ["EyesClosed", "image/png"],
    ["MouthClosed", "image/png"],
    ["MouthOpen", "image/png"],
    ["Next1", "image/svg+xml"],
    ["Next2", "image/svg+xml"],
    ["Voice", "audio/mpeg"],
  ]);
  const applied: Array<{ assetName: string; targetId: string }> = [];
  const assetManager: BubbleAssetManager = {
    isRegistered: vi.fn((name: unknown) => registered.has(String(name))),
    getMimeType: vi.fn((name: unknown) => registered.get(String(name)) ?? ""),
    applyToTarget: vi.fn(async (name: unknown, target) => {
      applied.push({ assetName: String(name), targetId: target.id });
    }),
  };
  const setText = vi.fn();
  const releaseTarget = vi.fn();
  const svgText: BubbleSvgText = { setText, releaseTarget };
  const visibility: Array<{ layer: BubbleLayer; visible: boolean }> = [];
  const surface: BubbleSurface = {
    targets: {
      text: { drawableID: 7 },
      portraitBase: { id: "portrait-base", isStage: false },
      portraitBlink: { id: "portrait-blink", isStage: false },
      portraitTalk: { id: "portrait-talk", isStage: false },
      advanceIndicator: { id: "advance-indicator", isStage: false },
    },
    setLayerVisible: vi.fn(async (layer, visible) => {
      visibility.push({ layer, visible });
    }),
    show: vi.fn(async () => undefined),
    hide: vi.fn(async () => undefined),
    dispose: vi.fn(async () => undefined),
  };
  const createSurface = vi.fn(async () => surface);
  const scheduler = new TestScheduler();
  const animationErrors: unknown[] = [];
  const composition = createBubbleComposition({
    assetManager,
    svgText,
    createSurface,
    scheduler,
    onAnimationError(error, context) {
      animationErrors.push({ error, context });
    },
  });
  composition.defineStyle({
    name: "dialogue",
    textStyle: "dialogue-text",
    portrait: {
      base: "Face",
      blink: {
        frames: ["EyesOpen", "EyesClosed"],
        frameIntervalSeconds: 0.4,
      },
      talk: {
        frames: ["MouthClosed", "MouthOpen"],
        frameIntervalSeconds: 0.1,
      },
    },
    advanceIndicator: {
      frames: ["Next1", "Next2"],
      frameIntervalSeconds: 0.2,
    },
  });
  return {
    animationErrors,
    applied,
    assetManager,
    composition,
    createSurface,
    registered,
    releaseTarget,
    scheduler,
    setText,
    surface,
    visibility,
  };
}

describe("Bubble composition", () => {
  it("coordinates SVG text and independent portrait layers for say bubbles", async () => {
    const harness = createHarness();
    const actor = { id: "Hero" };

    const handle = await harness.composition.show({
      actor,
      actorKey: "Hero",
      kind: "say",
      text: "こんにちは",
      styleName: "dialogue",
    });

    expect(harness.createSurface).toHaveBeenCalledWith(
      expect.objectContaining({
        actor,
        actorKey: "Hero",
        kind: "say",
        style: expect.objectContaining({
          placement: { basis: "actor", direction: "up-right" },
          distance: 12,
          tailLength: 18,
          offset: { x: 0, y: 0, scalePercent: 100 },
          visualStyle: "NORMAL",
        }),
      }),
    );
    expect(harness.setText).toHaveBeenCalledWith({
      styleName: "dialogue-text",
      target: harness.surface.targets.text,
      text: "こんにちは",
    });
    expect(harness.applied).toEqual(
      expect.arrayContaining([
        { assetName: "Face", targetId: "portrait-base" },
        { assetName: "EyesOpen", targetId: "portrait-blink" },
        { assetName: "MouthClosed", targetId: "portrait-talk" },
        { assetName: "Next1", targetId: "advance-indicator" },
      ]),
    );
    expect(harness.visibility).toContainEqual({
      layer: "portraitTalk",
      visible: true,
    });
    expect(harness.visibility).toContainEqual({
      layer: "advanceIndicator",
      visible: false,
    });
    expect(handle.animationMode).toBe("talking");
    expect(harness.composition.hasActiveBubble("Hero")).toBe(true);
    expect(harness.scheduler.size).toBe(2);
  });

  it("normalizes direction aliases and background regions in styles", async () => {
    const harness = createHarness();
    harness.composition.defineStyle({
      name: "alias",
      textStyle: "default",
      placement: "west-northwest",
    });
    await harness.composition.show({
      actor: {},
      actorKey: "Alias",
      kind: "say",
      text: "alias",
      styleName: "alias",
    });
    expect(harness.createSurface).toHaveBeenLastCalledWith(
      expect.objectContaining({
        style: expect.objectContaining({
          placement: { basis: "actor", direction: "left-up-left" },
        }),
      }),
    );

    harness.composition.defineStyle({
      name: "footer",
      textStyle: "default",
      placement: "FOOTER_LIKE",
    });
    await harness.composition.show({
      actor: {},
      actorKey: "Stage",
      kind: "say",
      text: "footer",
      styleName: "footer",
    });
    expect(harness.createSurface).toHaveBeenLastCalledWith(
      expect.objectContaining({
        style: expect.objectContaining({
          placement: { basis: "background", region: "FOOTER_LIKE" },
        }),
      }),
    );
  });

  it("normalizes actor-relative transform settings", async () => {
    const harness = createHarness();
    harness.composition.defineStyle({
      name: "transform",
      textStyle: "default",
      distance: 6,
      tailLength: 24,
      offset: [10, -10, 120],
      visualStyle: "WAVY",
    });
    await harness.composition.show({
      actor: {},
      actorKey: "Transform",
      kind: "say",
      text: "transform",
      styleName: "transform",
    });
    expect(harness.createSurface).toHaveBeenLastCalledWith(
      expect.objectContaining({
        style: expect.objectContaining({
          distance: 6,
          tailLength: 24,
          offset: { x: 10, y: -10, scalePercent: 120 },
          visualStyle: "WAVY",
        }),
      }),
    );
  });

  it("stops mouth animation and loops the indicator while awaiting advance", async () => {
    const harness = createHarness();
    const handle = await harness.composition.show({
      actor: { id: "Hero" },
      actorKey: "Hero",
      kind: "think",
      text: "どうしよう",
      styleName: "dialogue",
    });

    await handle.setAnimationMode("awaiting-advance");
    expect(handle.animationMode).toBe("awaiting-advance");
    expect(harness.visibility.slice(-2)).toEqual([
      { layer: "portraitTalk", visible: false },
      { layer: "advanceIndicator", visible: true },
    ]);
    expect(harness.scheduler.size).toBe(2);

    harness.scheduler.runPending();
    await flushAnimations();
    expect(harness.applied).toContainEqual({
      assetName: "EyesClosed",
      targetId: "portrait-blink",
    });
    expect(harness.applied).toContainEqual({
      assetName: "Next2",
      targetId: "advance-indicator",
    });

    await handle.close();
    expect(harness.scheduler.size).toBe(0);
    expect(harness.releaseTarget).toHaveBeenCalledWith(
      harness.surface.targets.text,
    );
    expect(harness.surface.hide).toHaveBeenCalledOnce();
    expect(harness.surface.dispose).toHaveBeenCalledOnce();
    expect(harness.composition.hasActiveBubble("Hero")).toBe(false);
  });

  it("replaces an existing bubble for the same actor without sharing state", async () => {
    const first = createHarness();
    const second = createHarness();

    const firstHandle = await first.composition.show({
      actor: {},
      actorKey: "Hero",
      kind: "say",
      text: "first",
      styleName: "dialogue",
    });
    const replacement = await first.composition.show({
      actor: {},
      actorKey: "Hero",
      kind: "say",
      text: "second",
      styleName: "dialogue",
    });
    const independent = await second.composition.show({
      actor: {},
      actorKey: "Hero",
      kind: "say",
      text: "other runtime",
      styleName: "dialogue",
    });

    await expect(
      firstHandle.setAnimationMode("awaiting-advance"),
    ).rejects.toMatchObject({
      code: "BUBBLE-COMPOSITION-005",
    });
    expect(first.releaseTarget).toHaveBeenCalledTimes(1);
    expect(first.composition.hasActiveBubble("Hero")).toBe(true);
    expect(second.composition.hasActiveBubble("Hero")).toBe(true);

    await replacement.close();
    expect(second.composition.hasActiveBubble("Hero")).toBe(true);
    await independent.close();
  });

  it("rejects missing and non-image assets before creating a surface", async () => {
    const missing = createHarness();
    missing.registered.delete("Next2");
    await expect(
      missing.composition.show({
        actor: {},
        actorKey: "Hero",
        kind: "say",
        text: "missing",
        styleName: "dialogue",
      }),
    ).rejects.toMatchObject({ code: "BUBBLE-COMPOSITION-003" });
    expect(missing.createSurface).not.toHaveBeenCalled();

    const wrongKind = createHarness();
    wrongKind.composition.defineStyle({
      name: "audio",
      textStyle: "default",
      portrait: { base: "Voice" },
    });
    await expect(
      wrongKind.composition.show({
        actor: {},
        actorKey: "Hero",
        kind: "say",
        text: "audio",
        styleName: "audio",
      }),
    ).rejects.toMatchObject({ code: "BUBBLE-COMPOSITION-003" });
  });

  it("validates style shape and requires two advance frames", () => {
    const harness = createHarness();
    expect(() =>
      harness.composition.defineStyle({
        name: "bad",
        textStyle: "default",
        advanceIndicator: {
          frames: ["Next1"],
          frameIntervalSeconds: 0.2,
        },
      }),
    ).toThrowError(BubbleCompositionError);
    expect(() =>
      harness.composition.defineStyle({
        name: "bad-visual-style",
        textStyle: "default",
        visualStyle: "ROUND" as "NORMAL",
      }),
    ).toThrowError(BubbleCompositionError);
    expect(() =>
      harness.composition.defineStyle({
        name: "bad-transform",
        textStyle: "default",
        distance: -1,
      }),
    ).toThrowError(BubbleCompositionError);
    expect(() =>
      harness.composition.defineStyle({
        name: "bad-offset",
        textStyle: "default",
        offset: [0, 0, 0],
      }),
    ).toThrowError(BubbleCompositionError);
    expect(() =>
      harness.composition.defineStyle({
        name: "bad-placement",
        textStyle: "default",
        placement: 361,
      }),
    ).toThrowError(BubbleCompositionError);
  });

  it("cleans up a partially shown bubble when animation scheduling fails", async () => {
    const harness = createHarness();
    vi.spyOn(harness.scheduler, "setTimeout").mockImplementationOnce(() => {
      throw new Error("scheduler failed");
    });

    await expect(
      harness.composition.show({
        actor: {},
        actorKey: "Hero",
        kind: "say",
        text: "cleanup",
        styleName: "dialogue",
      }),
    ).rejects.toThrow("scheduler failed");

    expect(harness.scheduler.size).toBe(0);
    expect(harness.releaseTarget).toHaveBeenCalledWith(
      harness.surface.targets.text,
    );
    expect(harness.surface.hide).toHaveBeenCalledOnce();
    expect(harness.surface.dispose).toHaveBeenCalledOnce();
    expect(harness.composition.hasActiveBubble("Hero")).toBe(false);
  });

  it("releases all bubbles and rejects new work after disposal", async () => {
    const harness = createHarness();
    await harness.composition.show({
      actor: {},
      actorKey: "Hero",
      kind: "say",
      text: "bye",
      styleName: "dialogue",
    });

    await harness.composition.dispose();
    expect(harness.composition.hasActiveBubble("Hero")).toBe(false);
    expect(() =>
      harness.composition.defineStyle({ name: "x", textStyle: "x" }),
    ).toThrowError(/disposed/u);
    await expect(
      harness.composition.show({
        actor: {},
        actorKey: "Hero",
        kind: "say",
        text: "again",
        styleName: "dialogue",
      }),
    ).rejects.toMatchObject({ code: "BUBBLE-COMPOSITION-005" });
  });
});
