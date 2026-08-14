import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BLOCK_ICON_URI, BubbleExtension } from "../src/extension.js";
import type {
  BubbleImageCapability,
  BubbleMotionInput,
  BubbleScheduler,
  BubbleTextCapability,
} from "../src/composition.js";
import type {
  TurboWarpBubbleRenderer,
  TurboWarpBubbleRuntime,
  TurboWarpBubbleTarget,
} from "../src/turbowarp-adapter.js";
import { createTurboWarpBubbleComposition } from "../src/turbowarp-adapter.js";

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

  public get size(): number {
    return this.callbacks.size;
  }

  public runNewest(): void {
    const id = Math.max(...this.callbacks.keys());
    const callback = this.callbacks.get(id);
    if (!callback) throw new Error("no scheduled callback");
    this.callbacks.delete(id);
    callback();
  }

  public async runAll(): Promise<void> {
    while (this.callbacks.size > 0) {
      this.runNewest();
      await Promise.resolve();
    }
  }
}

function scratch(): ScratchApi {
  return {
    ArgumentType: { NUMBER: "number", STRING: "string" },
    BlockType: { COMMAND: "command", REPORTER: "reporter" },
    Cast: {
      toNumber: (value: unknown) => Number(value),
      toString: (value: unknown) => String(value),
    },
    extensions: { register: () => undefined, unsandboxed: true },
    translate: (value) => (typeof value === "string" ? value : value.default),
  };
}

function createRuntime(
  options: {
    assetManager?: boolean;
    asyncInput?: boolean;
    runtimeExpression?: boolean;
    svgTextExtension?: boolean;
  } = {},
) {
  let nextDrawable = 1;
  let nextSvgSkin = 200;
  const drawableSkins = new Map<number, number>();
  const skinSizes = new Map<number, [number, number]>([
    [11, [96, 96]],
    [12, [96, 96]],
    [13, [96, 96]],
    [14, [96, 96]],
    [15, [18, 18]],
    [16, [18, 18]],
    [100, [180, 48]],
  ]);
  const created: number[] = [];
  const destroyed: number[] = [];
  const destroyedSkins: number[] = [];
  const createdSvgSkins: string[] = [];
  const visibility = new Map<number, boolean>();
  const positions = new Map<number, [number, number]>();
  const positionHistory: Array<[number, [number, number]]> = [];
  const scales = new Map<number, [number, number]>();
  const scaleHistory: Array<[number, [number, number]]> = [];
  const ghostHistory: Array<[number, number]> = [];
  const renderer: TurboWarpBubbleRenderer = {
    createSVGSkin: vi.fn((svg) => {
      const skinId = nextSvgSkin;
      nextSvgSkin += 1;
      createdSvgSkins.push(svg);
      const width = Number(svg.match(/\bwidth="([0-9.]+)"/u)?.[1] ?? 1);
      const height = Number(svg.match(/\bheight="([0-9.]+)"/u)?.[1] ?? 1);
      skinSizes.set(skinId, [width, height]);
      return skinId;
    }),
    createDrawable: vi.fn(() => {
      const id = nextDrawable;
      nextDrawable += 1;
      created.push(id);
      return id;
    }),
    destroyDrawable: vi.fn((id) => {
      destroyed.push(id);
    }),
    destroySkin: vi.fn((skinId) => {
      destroyedSkins.push(skinId);
    }),
    getCurrentSkinSize: vi.fn((id) => {
      const skinId = drawableSkins.get(id);
      return skinId === undefined ? [1, 1] : (skinSizes.get(skinId) ?? [1, 1]);
    }),
    getNativeSize: vi.fn(() => [480, 360]),
    updateDrawablePosition: vi.fn((id, position) => {
      const nextPosition: [number, number] = [position[0], position[1]];
      positions.set(id, nextPosition);
      positionHistory.push([id, nextPosition]);
    }),
    updateDrawableScale: vi.fn((id, scale) => {
      const nextScale: [number, number] = [scale[0], scale[1]];
      scales.set(id, nextScale);
      scaleHistory.push([id, nextScale]);
    }),
    updateDrawableSkinId: vi.fn((id, skinId) => {
      drawableSkins.set(id, skinId);
    }),
    updateDrawableVisible: vi.fn((id, visible) => {
      visibility.set(id, visible);
    }),
    updateDrawableEffect: vi.fn((id, effectName, value) => {
      if (effectName === "ghost") ghostHistory.push([id, value]);
    }),
    setDrawableOrder: vi.fn(),
  };
  const assets = new Map<string, { mimeType: string; skinId: number }>([
    ["Face", { mimeType: "image/png", skinId: 11 }],
    ["EyesOpen", { mimeType: "image/png", skinId: 12 }],
    ["EyesClosed", { mimeType: "image/png", skinId: 13 }],
    ["MouthClosed", { mimeType: "image/png", skinId: 13 }],
    ["MouthOpen", { mimeType: "image/png", skinId: 14 }],
    ["Next1", { mimeType: "image/svg+xml", skinId: 15 }],
    ["Next2", { mimeType: "image/svg+xml", skinId: 16 }],
  ]);
  const setText = vi.fn(
    (_args: unknown, util: { target: TurboWarpBubbleTarget }) => {
      renderer.updateDrawableSkinId(Number(util.target.drawableID), 100);
    },
  );
  const releaseTextActor = vi.fn(() => true);
  const listeners = new Map<string, Array<(...args: unknown[]) => void>>();
  const conditionState = { value: false };
  const runtimeExpression = {
    runtimeCondition: vi.fn(() => conditionState.value),
  };
  const runtime: TurboWarpBubbleRuntime & {
    on(event: string, listener: (...args: unknown[]) => void): void;
    off(event: string, listener: (...args: unknown[]) => void): void;
    ext_kubohiroyaasyncinput?: Record<string, never>;
    ext_kubohiroyaruntimeexpression?: typeof runtimeExpression;
  } = {
    renderer,
    requestRedraw: vi.fn(),
    on(event, listener) {
      const existing = listeners.get(event) ?? [];
      existing.push(listener);
      listeners.set(event, existing);
    },
    off(event, listener) {
      listeners.set(
        event,
        (listeners.get(event) ?? []).filter((item) => item !== listener),
      );
    },
    ...((options.asyncInput ?? true) ? { ext_kubohiroyaasyncinput: {} } : {}),
    ...((options.runtimeExpression ?? true)
      ? { ext_kubohiroyaruntimeexpression: runtimeExpression }
      : {}),
    ...((options.assetManager ?? true)
      ? {
          ext_kubohiroyaassetmanager: {
            isLoaded: ({ NAME }: { NAME: unknown }) => assets.has(String(NAME)),
            getAssetMimeType: ({ NAME }: { NAME: unknown }) =>
              assets.get(String(NAME))?.mimeType ?? "",
            async resolveSkin(name: unknown) {
              const asset = assets.get(String(name));
              if (!asset) throw new Error(`missing ${String(name)}`);
              return { skinId: asset.skinId };
            },
          },
        }
      : {}),
    ...((options.svgTextExtension ?? true)
      ? { ext_kubohiroyasvgtext: { setText, releaseTextActor } }
      : {}),
  };
  const emit = (event: string, ...args: unknown[]): void => {
    for (const listener of listeners.get(event) ?? []) listener(...args);
  };
  return {
    assets,
    conditionState,
    created,
    createdSvgSkins,
    destroyed,
    destroyedSkins,
    drawableSkins,
    emit,
    positions,
    positionHistory,
    scales,
    scaleHistory,
    ghostHistory,
    releaseTextActor,
    renderer,
    runtime,
    runtimeExpression,
    setText,
    visibility,
  };
}

function actor(): TurboWarpBubbleTarget {
  return {
    id: "hero-id",
    isStage: false,
    visible: true,
    x: 20,
    y: -20,
    getBoundsForBubble: () => ({ bottom: -60, left: -10, right: 50, top: 20 }),
    onTargetVisualChange: null,
  };
}

beforeEach(() => {
  vi.stubGlobal("Scratch", scratch());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("TurboWarp composition adapter", () => {
  it("defers Asset Manager lookup until a media style is shown", () => {
    const harness = createRuntime({ assetManager: false });

    expect(() =>
      createTurboWarpBubbleComposition(harness.runtime),
    ).not.toThrow();
  });

  it("accepts host-owned Asset Manager and SVG Text compositions", async () => {
    const harness = createRuntime({
      assetManager: false,
      svgTextExtension: false,
    });
    const imageResolver: BubbleImageCapability = {
      isRegistered: () => true,
      getMimeType: () => "image/png",
      applyToTarget: vi.fn(),
    };
    const releaseTarget = vi.fn();
    const textCapability: BubbleTextCapability = {
      setText: vi.fn(({ target }) => {
        harness.renderer.updateDrawableSkinId(Number(target.drawableID), 100);
      }),
      releaseTarget,
    };
    const composition = createTurboWarpBubbleComposition(harness.runtime, {
      imageResolver,
      textCapability,
    });
    composition.defineStyle({
      name: "dialogue",
      textStyle: "dialogue",
      portrait: { base: "Face" },
    });

    const handle = await composition.show({
      actor: actor(),
      actorKey: "Hero",
      kind: "say",
      text: "Hello",
      styleName: "dialogue",
    });
    await handle.close();

    expect(textCapability.setText).toHaveBeenCalledOnce();
    expect(imageResolver.applyToTarget).toHaveBeenCalledWith(
      "Face",
      expect.objectContaining({ id: expect.any(String) }),
    );
    expect(releaseTarget).toHaveBeenCalledOnce();
    expect(harness.destroyed).toHaveLength(4);
  });

  it("renders time-based motion frames with easing and shape transitions", async () => {
    const harness = createRuntime();
    const scheduler = new TestScheduler();
    const composition = createTurboWarpBubbleComposition(harness.runtime, {
      scheduler,
    });
    composition.defineStyle({
      name: "motion",
      textStyle: "default",
      visualStyle: "NORMAL",
    });
    const handle = await composition.show({
      actor: actor(),
      actorKey: "motion",
      kind: "say",
      text: "motion",
      styleName: "motion",
    });
    const bodyId = harness.created[0]!;
    const initialPosition = harness.positions.get(bodyId);
    expect(initialPosition).toBeDefined();
    const runMotion = async (motion: BubbleMotionInput): Promise<void> => {
      const promise = handle.animate(motion);
      await Promise.resolve();
      await Promise.resolve();
      await scheduler.runAll();
      await promise;
    };

    await runMotion({
      name: "shake",
      direction: 90,
      count: 2,
      durationSeconds: 0.048,
      ease: "linear",
    });
    expect(
      harness.positionHistory.some(
        ([id, position]) =>
          id === bodyId &&
          (position[0] !== initialPosition?.[0] ||
            position[1] !== initialPosition?.[1]),
      ),
    ).toBe(true);
    expect(harness.positions.get(bodyId)).toEqual(initialPosition);

    await runMotion({
      name: "explode",
      relativeScale: 1.2,
      count: 2,
      ease: "easeInOut",
    });
    expect(
      harness.scaleHistory.some(
        ([id, scale]) => id === bodyId && scale[0] > 100,
      ),
    ).toBe(true);
    expect(harness.scales.get(bodyId)).toEqual([100, 100]);

    await runMotion({
      name: "fadeIn",
      durationSeconds: 0.032,
      ease: "easeOut",
    });
    const ghostValues = harness.ghostHistory
      .filter(([id]) => id === bodyId)
      .map(([, value]) => value);
    expect(ghostValues.some((value) => value > 0 && value < 100)).toBe(true);
    expect(ghostValues.at(-1)).toBe(0);

    const positionHistoryBeforeEntry = harness.positionHistory.length;
    await runMotion({
      name: "floatIn",
      durationSeconds: 0.032,
      ease: "easeIn",
    });
    expect(
      harness.positionHistory
        .slice(positionHistoryBeforeEntry)
        .some(
          ([id, position]) =>
            id === bodyId && position[1] !== initialPosition?.[1],
        ),
    ).toBe(true);

    const scaleHistoryBeforeEntry = harness.scaleHistory.length;
    await runMotion({
      name: "zoomIn",
      durationSeconds: 0.032,
      ease: "easeOut",
    });
    expect(
      harness.scaleHistory
        .slice(scaleHistoryBeforeEntry)
        .some(([id, scale]) => id === bodyId && scale[0] < 100),
    ).toBe(true);

    await runMotion({
      name: "riseUp",
      durationSeconds: 0.032,
      ease: "linear",
    });

    await runMotion({
      name: "fadeOut",
      durationSeconds: 0.032,
      ease: "easeIn",
    });
    expect(harness.visibility.get(bodyId)).toBe(false);

    await runMotion({
      name: "floatOut",
      durationSeconds: 0.032,
      ease: "linear",
    });
    await runMotion({
      name: "zoomOut",
      durationSeconds: 0.032,
      ease: "linear",
    });
    await runMotion({
      name: "sink",
      durationSeconds: 0.032,
      ease: "linear",
    });

    await runMotion({
      name: "animateBubbleShape",
      visualStyle: "WAVY",
      speed: 1,
      durationSeconds: 0.032,
      ease: "linear",
    });
    expect(
      harness.createdSvgSkins.some((svg) =>
        svg.includes('data-bubble-shape-transition-to="WAVY"'),
      ),
    ).toBe(true);
    expect(harness.createdSvgSkins.at(-1)).toContain(
      'data-bubble-style="WAVY"',
    );
    await handle.close();
  });
});

describe("Bubble extension", () => {
  it("publishes the intended blocks and animation mode menu", () => {
    const harness = createRuntime();
    const extension = new BubbleExtension(harness.runtime);
    const info = extension.getInfo() as {
      blocks: Array<{ opcode: string }>;
      docsURI: string;
      id: string;
      blockIconURI: string;
      menus: Record<string, unknown>;
    };
    expect(info.id).toBe("kubohiroyabubble");
    expect(info.docsURI).toBe("https://kubohiroya.github.io/turbowarp-bubble/");
    expect(info.blockIconURI).toBe(BLOCK_ICON_URI);
    const iconSvg = decodeURIComponent(
      BLOCK_ICON_URI.slice("data:image/svg+xml,".length),
    );
    expect(iconSvg).toContain('viewBox="0 0 64 64"');
    expect(iconSvg).toContain('<circle cx="32" cy="30" r="3"/>');
    expect(iconSvg).not.toContain("<rect");
    expect(info.blocks.map((block) => block.opcode)).toEqual([
      "defineBubbleStyle",
      "setBubblePlacement",
      "setPortraitBase",
      "setPortraitLayout",
      "setBubbleDistance",
      "setBubbleVisualStyle",
      "setBubbleTailLength",
      "setBubbleOffset",
      "setBlinkFrames",
      "setLipSyncFrames",
      "setContinueFrames",
      "setBubbleReveal",
      "setBubbleWordDelimiters",
      "setBubbleRevealSound",
      "setBubbleVoice",
      "finishBubbleReveal",
      "setBubbleShowAnimation",
      "setBubbleHideAnimation",
      "animateBubble",
      "shakeBubble",
      "explodeBubble",
      "animateBubbleShape",
      "sayWithBubbleStyle",
      "thinkWithBubbleStyle",
      "setBubbleAnimationMode",
      "waitForBubbleContinue",
      "closeBubble",
      "getVersion",
    ]);
    expect(info.menus.animationMode).toEqual({
      acceptReporters: true,
      items: ["talking", "awaiting-continue", "idle"],
    });
    expect(info.menus.portraitPlacement).toEqual({
      acceptReporters: true,
      items: [
        "none",
        "left",
        "right",
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
      ],
    });
    expect(info.menus.placement).toEqual({
      acceptReporters: true,
      items: [
        "up",
        "up-up-right",
        "up-right",
        "right-up-right",
        "right",
        "right-down-right",
        "down-right",
        "down-down-right",
        "down",
        "down-down-left",
        "down-left",
        "left-down-left",
        "left",
        "left-up-left",
        "up-left",
        "up-up-left",
        "HEADER_LIKE",
        "CENTER",
        "FOOTER_LIKE",
      ],
    });
    expect(info.menus.visualStyle).toEqual({
      acceptReporters: true,
      items: [
        "NORMAL",
        "THINKING",
        "DREAMING",
        "YELLING",
        "OFF_PANEL",
        "WAVY",
        "WHISPERING",
        "ANNOUNCEMENT",
        "NARRATION",
        "NO_BUBBLE",
      ],
    });
  });

  it("places actor-relative bubbles by aliases and continuous angles", async () => {
    const harness = createRuntime();
    const extension = new BubbleExtension(harness.runtime);
    const target = actor();
    let bounds = { bottom: -60, left: -10, right: 50, top: 20 };
    target.getBoundsForBubble = () => bounds;
    extension.defineBubbleStyle({ STYLE: "placed", TEXT_STYLE: "default" });
    extension.setBubblePlacement({
      STYLE: "placed",
      PLACEMENT: "east",
    });

    await extension.sayWithBubbleStyle(
      { MESSAGE: "right", STYLE: "placed" },
      { target },
    );
    const drawableId = harness.created.at(-1);
    expect(drawableId).toBeDefined();
    expect(harness.positions.get(drawableId!)).toEqual([150, -20]);

    bounds = { bottom: -20, left: -50, right: 10, top: 60 };
    target.onTargetVisualChange?.(target);
    expect(harness.positions.get(drawableId!)).toEqual([130, 20]);

    extension.setBubblePlacement({ STYLE: "placed", PLACEMENT: "33.75" });
    await extension.sayWithBubbleStyle(
      { MESSAGE: "angle", STYLE: "placed" },
      { target },
    );
    expect(harness.positions.get(harness.created.at(-1)!)).not.toEqual([
      130, 20,
    ]);
  });

  it("scales text and applies actor distance, tail length, and offset", async () => {
    const harness = createRuntime();
    const extension = new BubbleExtension(harness.runtime);
    const target = actor();
    extension.defineBubbleStyle({ STYLE: "transform", TEXT_STYLE: "default" });
    extension.setBubblePlacement({ STYLE: "transform", PLACEMENT: "right" });
    extension.setBubbleDistance({ STYLE: "transform", DISTANCE: 5 });
    extension.setBubbleTailLength({ STYLE: "transform", LENGTH: 15 });
    extension.setBubbleOffset({
      STYLE: "transform",
      X: -10,
      Y: 8,
      SCALE: 120,
    });

    await extension.sayWithBubbleStyle(
      { MESSAGE: "scaled", STYLE: "transform" },
      { target },
    );

    const textDrawable = harness.created.at(-1)!;
    expect(harness.renderer.updateDrawableScale).toHaveBeenCalledWith(
      textDrawable,
      [120, 120],
    );
    // The requested x position is 168; stage-edge clamping keeps it visible.
    expect(harness.positions.get(textDrawable)).toEqual([132, -12]);
  });

  it("places, offsets, zooms, and rounds the portrait inside the bubble", async () => {
    const harness = createRuntime();
    const extension = new BubbleExtension(harness.runtime);
    const target = actor();
    extension.defineBubbleStyle({ STYLE: "portrait", TEXT_STYLE: "default" });
    extension.setPortraitBase({ STYLE: "portrait", ASSET: "Face" });
    extension.setPortraitLayout({
      STYLE: "portrait",
      PLACEMENT: "top-right",
      X: 10,
      Y: 5,
      ZOOM: 25,
      RADIUS: 12,
    });

    await extension.sayWithBubbleStyle(
      { MESSAGE: "portrait", STYLE: "portrait" },
      { target },
    );

    const portraitPosition = harness.positions.get(2);
    const maskPosition = harness.positions.get(3);
    const textPosition = harness.positions.get(4);
    expect(portraitPosition).toBeDefined();
    expect(textPosition).toBeDefined();
    expect(portraitPosition![0] - textPosition![0]).toBe(120);
    expect(portraitPosition![1] - textPosition![1]).toBe(17);
    expect(maskPosition).toEqual(portraitPosition);
    expect(harness.scales.get(2)).toEqual([25, 25]);
    expect(harness.visibility.get(3)).toBe(true);
    expect(
      harness.createdSvgSkins.some((svg) =>
        svg.includes('data-bubble-portrait-corner-radius="12"'),
      ),
    ).toBe(true);

    await extension.closeBubble({}, { target });
    expect(harness.destroyedSkins).toHaveLength(2);
  });

  it("removes the complete portrait through the none layout", async () => {
    const harness = createRuntime();
    const extension = new BubbleExtension(harness.runtime);
    const target = actor();
    extension.defineBubbleStyle({ STYLE: "plain", TEXT_STYLE: "default" });
    extension.setPortraitBase({ STYLE: "plain", ASSET: "Face" });
    extension.setPortraitLayout({
      STYLE: "plain",
      PLACEMENT: "none",
      X: 0,
      Y: 0,
      ZOOM: 100,
      RADIUS: 0,
    });

    await extension.sayWithBubbleStyle(
      { MESSAGE: "text only", STYLE: "plain" },
      { target },
    );

    expect(harness.created).toHaveLength(2);
    expect(harness.drawableSkins.has(2)).toBe(true);
    await extension.closeBubble({}, { target });
  });

  it("renders the selected SVG body behind actor-relative content", async () => {
    const harness = createRuntime();
    const extension = new BubbleExtension(harness.runtime);
    const target = actor();
    extension.defineBubbleStyle({ STYLE: "body", TEXT_STYLE: "default" });
    extension.setBubbleVisualStyle({
      STYLE: "body",
      VISUAL_STYLE: "YELLING",
    });
    extension.setBubbleTailLength({ STYLE: "body", LENGTH: 28 });

    await extension.sayWithBubbleStyle(
      { MESSAGE: "Editor body", STYLE: "body" },
      { target },
    );

    expect(harness.created).toHaveLength(2);
    const [bodyDrawable, textDrawable] = harness.created;
    expect(bodyDrawable).toBeDefined();
    expect(textDrawable).toBeDefined();
    expect(harness.createdSvgSkins).toHaveLength(1);
    expect(harness.createdSvgSkins[0]).toContain('data-bubble-style="YELLING"');
    expect(harness.createdSvgSkins[0]).toContain(
      'data-boolean-operation="union"',
    );
    expect(harness.visibility.get(bodyDrawable!)).toBe(true);
    expect(harness.renderer.setDrawableOrder).toHaveBeenNthCalledWith(
      1,
      bodyDrawable,
      Infinity,
      "sprite",
    );
    expect(harness.renderer.setDrawableOrder).toHaveBeenNthCalledWith(
      2,
      textDrawable,
      Infinity,
      "sprite",
    );

    await extension.closeBubble({}, { target });
    expect(harness.destroyedSkins).toEqual([200]);
  });

  it("places background-relative bubbles independently of actor visibility", async () => {
    const harness = createRuntime();
    const extension = new BubbleExtension(harness.runtime);
    const hiddenActor = { ...actor(), visible: false };
    extension.defineBubbleStyle({
      STYLE: "header",
      TEXT_STYLE: "default",
    });
    extension.setBubblePlacement({
      STYLE: "header",
      PLACEMENT: "HEADER_LIKE",
    });

    await extension.sayWithBubbleStyle(
      { MESSAGE: "header", STYLE: "header" },
      { target: hiddenActor },
    );
    const drawableId = harness.created.at(-1)!;
    expect(harness.positions.get(drawableId)).toEqual([0, 140]);
    expect(harness.visibility.get(drawableId)).toBe(true);
    expect(hiddenActor.onTargetVisualChange).toBeNull();
    expect(harness.createdSvgSkins.at(-1)).not.toContain(
      'data-boolean-operation="union"',
    );
  });

  it("keeps text visible without creating a visible body for NO_BUBBLE", async () => {
    const harness = createRuntime();
    const extension = new BubbleExtension(harness.runtime);
    const target = actor();
    extension.defineBubbleStyle({ STYLE: "plain", TEXT_STYLE: "default" });
    extension.setBubbleVisualStyle({
      STYLE: "plain",
      VISUAL_STYLE: "NO_BUBBLE",
    });

    await extension.sayWithBubbleStyle(
      { MESSAGE: "文字だけ", STYLE: "plain" },
      { target },
    );

    const [bodyDrawable, textDrawable] = harness.created;
    expect(harness.visibility.get(bodyDrawable!)).toBe(false);
    expect(harness.visibility.get(textDrawable!)).toBe(true);
  });

  it("allows background placement from Stage and rejects actor placement there", async () => {
    const harness = createRuntime();
    const extension = new BubbleExtension(harness.runtime);
    const stage: TurboWarpBubbleTarget = {
      id: "stage-id",
      isStage: true,
      visible: true,
    };
    extension.defineBubbleStyle({ STYLE: "stage", TEXT_STYLE: "default" });

    await expect(
      extension.sayWithBubbleStyle(
        { MESSAGE: "bad", STYLE: "stage" },
        { target: stage },
      ),
    ).rejects.toThrow(
      "actor-relative bubble placement requires a sprite or clone",
    );

    extension.setBubblePlacement({
      STYLE: "stage",
      PLACEMENT: "FOOTER_LIKE",
    });
    await extension.sayWithBubbleStyle(
      { MESSAGE: "footer", STYLE: "stage" },
      { target: stage },
    );
    expect(harness.positions.get(harness.created.at(-1)!)).toEqual([0, -140]);
    await extension.setBubbleAnimationMode({ MODE: "idle" }, { target: stage });
    await extension.closeBubble({}, { target: stage });
  });

  it("renders layered speech and changes from talk to continue animation", async () => {
    const harness = createRuntime();
    const scheduler = new TestScheduler();
    const extension = new BubbleExtension(harness.runtime, { scheduler });
    const target = actor();
    extension.defineBubbleStyle({
      STYLE: "dialogue",
      TEXT_STYLE: "dialogue-text",
    });
    extension.setPortraitBase({ STYLE: "dialogue", ASSET: "Face" });
    extension.setBlinkFrames({
      STYLE: "dialogue",
      ASSETS: "EyesOpen,EyesClosed",
      SECONDS: 0.4,
    });
    extension.setLipSyncFrames({
      STYLE: "dialogue",
      ASSETS: "MouthClosed,MouthOpen",
      SECONDS: 0.1,
    });
    extension.setContinueFrames({
      STYLE: "dialogue",
      ASSETS: "Next1,Next2",
      SECONDS: 0.2,
    });

    await extension.sayWithBubbleStyle(
      { MESSAGE: "こんにちは", STYLE: "dialogue" },
      { target },
    );

    expect(harness.created).toHaveLength(7);
    expect(harness.setText).toHaveBeenCalledWith(
      { STYLE: "dialogue-text", TEXT: "こんにちは" },
      { target: expect.objectContaining({ drawableID: expect.any(Number) }) },
    );
    expect(scheduler.size).toBe(2);
    expect([...harness.positions.values()]).not.toHaveLength(0);

    await extension.setBubbleAnimationMode(
      { MODE: "awaiting-continue" },
      { target },
    );
    expect(scheduler.size).toBe(2);

    await extension.closeBubble({}, { target });
    expect(scheduler.size).toBe(0);
    expect(harness.destroyed).toHaveLength(7);
    expect(harness.destroyedSkins).toHaveLength(1);
    expect(harness.releaseTextActor).toHaveBeenCalledOnce();
  });

  it("waits in awaiting-continue mode until the expression becomes true", async () => {
    const harness = createRuntime();
    const scheduler = new TestScheduler();
    const extension = new BubbleExtension(harness.runtime, { scheduler });
    const target = actor();
    extension.defineBubbleStyle({
      STYLE: "dialogue",
      TEXT_STYLE: "dialogue-text",
    });
    extension.setContinueFrames({
      STYLE: "dialogue",
      ASSETS: "Next1,Next2",
      SECONDS: 0.2,
    });
    await extension.sayWithBubbleStyle(
      { MESSAGE: "continue?", STYLE: "dialogue" },
      { target },
    );

    const waiting = extension.waitForBubbleContinue(
      { CONDITION: 'input == "pressed"', TIMEOUT: 0 },
      { target },
    );
    await vi.waitFor(() =>
      expect(harness.runtimeExpression.runtimeCondition).toHaveBeenCalled(),
    );
    harness.emit("BEFORE_EXECUTE");
    expect(harness.runtimeExpression.runtimeCondition).toHaveBeenCalledWith({
      EXPRESSION: 'input == "pressed"',
    });

    harness.conditionState.value = true;
    harness.emit("BEFORE_EXECUTE");
    await waiting;
    await extension.closeBubble({}, { target });
    expect(scheduler.size).toBe(0);
  });

  it("reveals units and exposes display animations through extension blocks", async () => {
    const harness = createRuntime();
    const extension = new BubbleExtension(harness.runtime);
    const target = actor();
    extension.defineBubbleStyle({ STYLE: "reveal", TEXT_STYLE: "default" });
    extension.setBubbleReveal({
      STYLE: "reveal",
      UNIT: "CHARACTER",
      SECONDS: 0,
      LAYOUT: "RESERVED",
    });
    extension.setBubbleWordDelimiters({
      STYLE: "reveal",
      DELIMITERS: "/",
      SHOW: "false",
    });
    await extension.sayWithBubbleStyle(
      { MESSAGE: "私の/名前", STYLE: "reveal" },
      { target },
    );
    expect(harness.setText).toHaveBeenLastCalledWith(
      { STYLE: "default", TEXT: "私" },
      { target: expect.objectContaining({ drawableID: expect.any(Number) }) },
    );
    harness.conditionState.value = true;
    await extension.finishBubbleReveal(
      { UNIT: "CHARACTER", CONDITION: "true", TIMEOUT: 0 },
      { target },
    );
    await extension.closeBubble({}, { target });
  });

  it("continues after the Bubble wait timeout", async () => {
    const harness = createRuntime();
    const scheduler = new TestScheduler();
    const extension = new BubbleExtension(harness.runtime, { scheduler });
    const target = actor();
    extension.defineBubbleStyle({
      STYLE: "dialogue",
      TEXT_STYLE: "dialogue-text",
    });
    await extension.sayWithBubbleStyle(
      { MESSAGE: "continue?", STYLE: "dialogue" },
      { target },
    );

    const waiting = extension.waitForBubbleContinue(
      { CONDITION: "false", TIMEOUT: 2 },
      { target },
    );
    await vi.waitFor(() => expect(scheduler.size).toBeGreaterThan(0));
    scheduler.runNewest();
    await waiting;
    await extension.closeBubble({}, { target });
    expect(scheduler.size).toBe(0);
  });

  it("cancels a pending Bubble wait when the Bubble closes", async () => {
    const harness = createRuntime();
    const scheduler = new TestScheduler();
    const extension = new BubbleExtension(harness.runtime, { scheduler });
    const target = actor();
    extension.defineBubbleStyle({
      STYLE: "dialogue",
      TEXT_STYLE: "dialogue-text",
    });
    await extension.sayWithBubbleStyle(
      { MESSAGE: "continue?", STYLE: "dialogue" },
      { target },
    );

    const waiting = extension.waitForBubbleContinue(
      { CONDITION: "false", TIMEOUT: 10 },
      { target },
    );
    await vi.waitFor(() => expect(scheduler.size).toBeGreaterThan(0));
    const rejection = expect(waiting).rejects.toMatchObject({
      name: "AbortError",
    });
    await extension.closeBubble({}, { target });

    await rejection;
    expect(scheduler.size).toBe(0);
  });

  it.each([
    ["STOP_FOR_TARGET", true],
    ["PROJECT_STOP_ALL", false],
    ["RUNTIME_DISPOSED", false],
  ] as const)(
    "cancels a pending Bubble wait on %s",
    async (event, passesTarget) => {
      const harness = createRuntime();
      const scheduler = new TestScheduler();
      const extension = new BubbleExtension(harness.runtime, { scheduler });
      const target = actor();
      extension.defineBubbleStyle({
        STYLE: "dialogue",
        TEXT_STYLE: "dialogue-text",
      });
      await extension.sayWithBubbleStyle(
        { MESSAGE: "continue?", STYLE: "dialogue" },
        { target },
      );

      const waiting = extension.waitForBubbleContinue(
        { CONDITION: "false", TIMEOUT: 10 },
        { target },
      );
      await vi.waitFor(() => expect(scheduler.size).toBeGreaterThan(0));
      const rejection = expect(waiting).rejects.toMatchObject({
        name: "AbortError",
      });
      harness.emit(event, ...(passesTarget ? [target] : []));

      await rejection;
      await vi.waitFor(() => expect(scheduler.size).toBe(0));
    },
  );

  it("requires Async Input and Runtime Expression for Bubble waits", async () => {
    const target = actor();
    const noInput = createRuntime({ asyncInput: false });
    const inputExtension = new BubbleExtension(noInput.runtime);
    inputExtension.defineBubbleStyle({
      STYLE: "dialogue",
      TEXT_STYLE: "dialogue-text",
    });
    await inputExtension.sayWithBubbleStyle(
      { MESSAGE: "continue?", STYLE: "dialogue" },
      { target },
    );
    await expect(
      inputExtension.waitForBubbleContinue(
        { CONDITION: "true", TIMEOUT: 0 },
        { target },
      ),
    ).rejects.toThrow("requires Async Input");

    const noExpression = createRuntime({ runtimeExpression: false });
    const expressionExtension = new BubbleExtension(noExpression.runtime);
    expressionExtension.defineBubbleStyle({
      STYLE: "dialogue",
      TEXT_STYLE: "dialogue-text",
    });
    await expressionExtension.sayWithBubbleStyle(
      { MESSAGE: "continue?", STYLE: "dialogue" },
      { target },
    );
    await expect(
      expressionExtension.waitForBubbleContinue(
        { CONDITION: "true", TIMEOUT: 0 },
        { target },
      ),
    ).rejects.toThrow("requires Runtime Expression");
  });

  it("releases a target-owned bubble when TurboWarp stops the target", async () => {
    const harness = createRuntime();
    const extension = new BubbleExtension(harness.runtime, {
      scheduler: new TestScheduler(),
    });
    const target = actor();
    extension.defineBubbleStyle({ STYLE: "plain", TEXT_STYLE: "default" });
    await extension.thinkWithBubbleStyle(
      { MESSAGE: "hmm", STYLE: "plain" },
      { target },
    );

    harness.emit("STOP_FOR_TARGET", target);
    await vi.waitFor(() => expect(harness.destroyed).toHaveLength(2));
  });

  it("reports missing dependent extensions with corrective messages", async () => {
    const noAssets = createRuntime({ assetManager: false });
    const first = new BubbleExtension(noAssets.runtime);
    first.defineBubbleStyle({ STYLE: "plain", TEXT_STYLE: "default" });
    await expect(
      first.sayWithBubbleStyle(
        { MESSAGE: "hello", STYLE: "plain" },
        { target: actor() },
      ),
    ).resolves.toBeUndefined();
    first.setPortraitBase({ STYLE: "plain", ASSET: "Face" });
    await expect(
      first.sayWithBubbleStyle(
        { MESSAGE: "hello", STYLE: "plain" },
        { target: actor() },
      ),
    ).rejects.toThrow("imageResolver capability");

    const noText = createRuntime({ svgTextExtension: false });
    const second = new BubbleExtension(noText.runtime);
    second.defineBubbleStyle({ STYLE: "plain", TEXT_STYLE: "default" });
    await expect(
      second.sayWithBubbleStyle(
        { MESSAGE: "hello", STYLE: "plain" },
        { target: actor() },
      ),
    ).rejects.toThrow("Load @kubohiroya/turbowarp-svg-text");
  });
});
