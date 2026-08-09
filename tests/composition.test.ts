import { describe, expect, it, vi } from "vitest";
import {
  BubbleCompositionError,
  createBubbleComposition,
  type BubbleImageCapability,
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
  const imageResolver: BubbleImageCapability = {
    isRegistered: vi.fn((name: unknown) => registered.has(String(name))),
    getMimeType: vi.fn((name: unknown) => registered.get(String(name)) ?? ""),
    applyToTarget: vi.fn(async (name: unknown, target) => {
      applied.push({ assetName: String(name), targetId: target.id });
    }),
  };
  const setText = vi.fn();
  const measureText = vi.fn(({ text }: { text: string }) => text.length * 10);
  const releaseTarget = vi.fn();
  const svgText: BubbleSvgText = { setText, measureText, releaseTarget };
  const visibility: Array<{ layer: BubbleLayer; visible: boolean }> = [];
  const surface: BubbleSurface = {
    targets: {
      text: { drawableID: 7 },
      portraitBase: { id: "portrait-base", isStage: false },
      portraitBlink: { id: "portrait-blink", isStage: false },
      portraitLipSync: { id: "portrait-lip-sync", isStage: false },
      continueIndicator: { id: "continue-indicator", isStage: false },
    },
    setLayerVisible: vi.fn(async (layer, visible) => {
      visibility.push({ layer, visible });
    }),
    updateStyle: vi.fn(async () => undefined),
    show: vi.fn(async () => undefined),
    hide: vi.fn(async () => undefined),
    dispose: vi.fn(async () => undefined),
  };
  const createSurface = vi.fn(async () => surface);
  const scheduler = new TestScheduler();
  const animationErrors: unknown[] = [];
  const composition = createBubbleComposition({
    imageResolver,
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
      lipSync: {
        frames: ["MouthClosed", "MouthOpen"],
        frameIntervalSeconds: 0.1,
      },
    },
    continueIndicator: {
      frames: ["Next1", "Next2"],
      frameIntervalSeconds: 0.2,
    },
  });
  return {
    animationErrors,
    applied,
    imageResolver,
    composition,
    createSurface,
    registered,
    releaseTarget,
    measureText,
    scheduler,
    setText,
    svgText,
    surface,
    visibility,
  };
}

describe("Bubble composition", () => {
  it("allows text-only bubbles without an Asset Manager", async () => {
    const surface: BubbleSurface = {
      targets: { text: { drawableID: 7 } },
      setLayerVisible: vi.fn(),
      updateStyle: vi.fn(),
      show: vi.fn(),
      hide: vi.fn(),
      dispose: vi.fn(),
    };
    const composition = createBubbleComposition({
      svgText: { setText: vi.fn(), releaseTarget: vi.fn() },
      createSurface: vi.fn(() => surface),
    });
    composition.defineStyle({ name: "plain", textStyle: "default" });

    const handle = await composition.show({
      actor: {},
      actorKey: "plain-actor",
      kind: "say",
      text: "hello",
      styleName: "plain",
    });

    expect(handle.animationMode).toBe("talking");
    await handle.close();
  });

  it("requires an image capability only when an image style is shown", async () => {
    const surface: BubbleSurface = {
      targets: {
        text: { drawableID: 7 },
        portraitBase: { id: "portrait-base", isStage: false },
      },
      setLayerVisible: vi.fn(),
      updateStyle: vi.fn(),
      show: vi.fn(),
      hide: vi.fn(),
      dispose: vi.fn(),
    };
    const composition = createBubbleComposition({
      svgText: { setText: vi.fn(), releaseTarget: vi.fn() },
      createSurface: vi.fn(() => surface),
    });
    composition.defineStyle({
      name: "portrait",
      textStyle: "default",
      portrait: { base: "Face" },
    });

    await expect(
      composition.show({
        actor: {},
        actorKey: "portrait-actor",
        kind: "say",
        text: "hello",
        styleName: "portrait",
      }),
    ).rejects.toMatchObject({
      code: "BUBBLE-COMPOSITION-006",
      message: expect.stringContaining("image capability"),
    });
  });

  it("requires an audio capability only when a voice or reveal sound is shown", async () => {
    const harness = createHarness();
    harness.composition.defineStyle({
      name: "voice",
      textStyle: "default",
      audio: { voice: "Voice" },
    });
    await expect(
      harness.composition.show({
        actor: {},
        actorKey: "voice-actor",
        kind: "say",
        text: "hello",
        styleName: "voice",
      }),
    ).rejects.toMatchObject({
      code: "BUBBLE-COMPOSITION-006",
      message: expect.stringContaining("audio capability"),
    });
  });

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
        { assetName: "MouthClosed", targetId: "portrait-lip-sync" },
        { assetName: "Next1", targetId: "continue-indicator" },
      ]),
    );
    expect(harness.visibility).toContainEqual({
      layer: "portraitLipSync",
      visible: true,
    });
    expect(harness.visibility).toContainEqual({
      layer: "continueIndicator",
      visible: false,
    });
    expect(handle.animationMode).toBe("talking");
    expect(harness.composition.hasActiveBubble("Hero")).toBe(true);
    expect(harness.scheduler.size).toBe(2);

    await handle.setText("こんにちは、浦島太郎です");
    expect(harness.setText).toHaveBeenLastCalledWith({
      styleName: "dialogue-text",
      target: harness.surface.targets.text,
      text: "こんにちは、浦島太郎です",
    });
    expect(harness.surface.show).toHaveBeenCalledTimes(2);
  });

  it("updates the active style through the bubble handle", async () => {
    const harness = createHarness();
    const handle = await harness.composition.show({
      actor: {},
      actorKey: "StyleUpdate",
      kind: "say",
      text: "style",
      styleName: "dialogue",
    });

    await handle.updateStyle({
      name: "dialogue",
      textStyle: "updated-text",
      visualStyle: "WAVY",
      portrait: {
        base: "Face",
        blink: {
          frames: ["EyesOpen", "EyesClosed"],
          frameIntervalSeconds: 0.4,
        },
        lipSync: {
          frames: ["MouthClosed", "MouthOpen"],
          frameIntervalSeconds: 0.1,
        },
      },
      continueIndicator: {
        frames: ["Next1", "Next2"],
        frameIntervalSeconds: 0.2,
      },
    });

    expect(harness.surface.updateStyle).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "dialogue",
        textStyle: "updated-text",
        visualStyle: "WAVY",
      }),
    );
    expect(harness.setText).toHaveBeenLastCalledWith({
      styleName: "updated-text",
      target: harness.surface.targets.text,
      text: "style",
    });
    await handle.close();
    await harness.composition.show({
      actor: {},
      actorKey: "StyleUpdateNext",
      kind: "say",
      text: "next",
      styleName: "dialogue",
    });
    expect(harness.createSurface).toHaveBeenLastCalledWith(
      expect.objectContaining({
        style: expect.objectContaining({ textStyle: "dialogue-text" }),
      }),
    );
  });

  it("uses wrapText and the text capability when maxWidth is configured", async () => {
    const harness = createHarness();
    harness.composition.defineStyle({
      name: "wrapped",
      textStyle: "dialogue-text",
      maxWidth: 20,
    });

    const handle = await harness.composition.show({
      actor: {},
      actorKey: "Wrapped",
      kind: "say",
      text: "abcd",
      styleName: "wrapped",
    });

    expect(harness.setText).toHaveBeenLastCalledWith({
      styleName: "dialogue-text",
      target: harness.surface.targets.text,
      text: "ab\ncd",
    });
    expect(harness.measureText).toHaveBeenCalled();
    await handle.close();
  });

  it("reveals CHARACTER units, plays unit sounds, and reserves final layout", async () => {
    const harness = createHarness();
    const played: string[] = [];
    const audio = {
      playSound: vi.fn(async (name: unknown) => {
        played.push(String(name));
      }),
    };
    const composition = createBubbleComposition({
      imageResolver: harness.imageResolver,
      audio,
      svgText: {
        ...harness.svgText,
      },
      createSurface: harness.createSurface,
      scheduler: harness.scheduler,
    });
    composition.defineStyle({
      name: "reveal",
      textStyle: "dialogue-text",
      reveal: {
        unit: "CHARACTER",
        layout: "RESERVED",
        intervalSeconds: 0,
        sound: "Voice",
      },
    });
    const handle = await composition.show({
      actor: {},
      actorKey: "Reveal",
      kind: "say",
      text: "ABC",
      styleName: "reveal",
    });
    expect(harness.setText).toHaveBeenLastCalledWith(
      expect.objectContaining({ text: "A" }),
    );
    expect(played).toEqual(["Voice"]);
    expect(await handle.revealNext()).toBe(true);
    expect(harness.setText).toHaveBeenLastCalledWith(
      expect.objectContaining({ text: "AB" }),
    );
    await handle.revealAll();
    expect(harness.setText).toHaveBeenLastCalledWith(
      expect.objectContaining({ text: "ABC" }),
    );
    await handle.close();
  });

  it("supports finish conditions and surface motion", async () => {
    const harness = createHarness();
    const animate = vi.fn();
    harness.surface.animate = animate;
    const handle = await harness.composition.show({
      actor: {},
      actorKey: "Motion",
      kind: "say",
      text: "motion",
      styleName: "dialogue",
    });
    await handle.animate({
      name: "shake",
      direction: 90,
      count: 2,
      ease: "easeOut",
    });
    expect(animate).toHaveBeenCalledWith(
      expect.objectContaining({ name: "shake", ease: "easeOut" }),
    );
    await handle.finish({ condition: async () => true });
    await handle.close();
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

  it("stops mouth animation and loops the indicator while awaiting continue", async () => {
    const harness = createHarness();
    const handle = await harness.composition.show({
      actor: { id: "Hero" },
      actorKey: "Hero",
      kind: "think",
      text: "どうしよう",
      styleName: "dialogue",
    });

    await handle.setAnimationMode("awaiting-continue");
    expect(handle.animationMode).toBe("awaiting-continue");
    expect(harness.visibility.slice(-2)).toEqual([
      { layer: "portraitLipSync", visible: false },
      { layer: "continueIndicator", visible: true },
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
      targetId: "continue-indicator",
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
      firstHandle.setAnimationMode("awaiting-continue"),
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

  it("validates style shape and requires two continue frames", () => {
    const harness = createHarness();
    expect(() =>
      harness.composition.defineStyle({
        name: "bad",
        textStyle: "default",
        continueIndicator: {
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

  it("preserves literal image and audio asset names", async () => {
    const harness = createHarness();
    const imageNames = [
      " leading-space",
      "trailing-space ",
      "./portrait/frame",
      "control\u0001frame",
      "e\u0301-frame",
      " ",
    ] as const;
    const soundNames = [
      " voice ",
      "reveal/sound",
      "finish\u0002sound",
    ] as const;
    for (const name of imageNames) harness.registered.set(name, "image/png");
    for (const name of soundNames) harness.registered.set(name, "audio/mpeg");
    const played: string[] = [];
    const composition = createBubbleComposition({
      imageResolver: harness.imageResolver,
      audio: {
        isRegistered: (name) => harness.registered.has(String(name)),
        getMimeType: (name) => harness.registered.get(String(name)) ?? "",
        async playSound(name) {
          played.push(String(name));
        },
      },
      svgText: harness.svgText,
      createSurface: harness.createSurface,
      scheduler: harness.scheduler,
    });
    composition.defineStyle({
      name: "literal-assets",
      textStyle: "default",
      portrait: {
        base: imageNames[0],
        blink: {
          frames: [imageNames[1], imageNames[5]],
          frameIntervalSeconds: 0.4,
        },
        lipSync: { frames: [imageNames[2]], frameIntervalSeconds: 0.1 },
      },
      continueIndicator: {
        frames: [imageNames[3], imageNames[4]],
        frameIntervalSeconds: 0.2,
      },
      reveal: { unit: "CHARACTER", intervalSeconds: 0, sound: soundNames[1] },
      audio: { voice: soundNames[0], finish: soundNames[2] },
    });

    const handle = await composition.show({
      actor: {},
      actorKey: "Hero",
      kind: "say",
      text: "literal",
      styleName: "literal-assets",
    });
    await handle.finish();

    expect(harness.applied.map(({ assetName }) => assetName)).toEqual(
      expect.arrayContaining(imageNames.slice(0, 4)),
    );
    expect(played).toEqual(expect.arrayContaining([...soundNames]));
    expect(harness.createSurface).toHaveBeenCalledWith(
      expect.objectContaining({
        style: expect.objectContaining({
          portrait: expect.objectContaining({
            base: imageNames[0],
            lipSync: { frames: [imageNames[2]], frameIntervalSeconds: 0.1 },
          }),
          continueIndicator: {
            frames: [imageNames[3], imageNames[4]],
            frameIntervalSeconds: 0.2,
          },
          reveal: expect.objectContaining({ sound: soundNames[1] }),
          audio: { voice: soundNames[0], finish: soundNames[2] },
        }),
      }),
    );
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
