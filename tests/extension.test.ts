import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BubbleExtension } from "../src/extension.js";
import type {
  BubbleAssetManager,
  BubbleScheduler,
  BubbleSvgText,
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
}

function scratch(): ScratchApi {
  return {
    ArgumentType: { COLOR: "color", NUMBER: "number", STRING: "string" },
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
    svgText?: boolean;
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
      positions.set(id, position);
    }),
    updateDrawableScale: vi.fn(),
    updateDrawableSkinId: vi.fn((id, skinId) => {
      drawableSkins.set(id, skinId);
    }),
    updateDrawableVisible: vi.fn((id, visible) => {
      visibility.set(id, visible);
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
    renderer,
    runtime,
    runtimeExpression,
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
  it("accepts host-owned Asset Manager and SVG Text compositions", async () => {
    const harness = createRuntime({ assetManager: false, svgText: false });
    const assetManager: BubbleAssetManager = {
      isRegistered: () => false,
      getMimeType: () => "",
      applyToTarget: vi.fn(),
    };
    const releaseTarget = vi.fn();
    const svgText: BubbleSvgText = {
      defineStyle: vi.fn(),
      setText: vi.fn(({ target }) => {
        harness.renderer.updateDrawableSkinId(Number(target.drawableID), 100);
      }),
      releaseTarget,
    };
    const composition = createTurboWarpBubbleComposition(harness.runtime, {
      assetManager,
      svgText,
    });
    composition.defineStyle({ name: "dialogue", textStyle: "dialogue" });

    const handle = await composition.show({
      actor: actor(),
      actorKey: "Hero",
      kind: "say",
      text: "Hello",
      styleName: "dialogue",
    });
    await handle.close();

    expect(svgText.setText).toHaveBeenCalledOnce();
    expect(releaseTarget).toHaveBeenCalledOnce();
    expect(harness.destroyed).toHaveLength(2);
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
      menus: Record<string, unknown>;
    };
    expect(info.id).toBe("kubohiroyabubble");
    expect(info.docsURI).toBe("https://kubohiroya.github.io/turbowarp-bubble/");
    expect(info.blocks.map((block) => block.opcode)).toEqual([
      "beginTextStyle",
      "setTextFont",
      "setTextSize",
      "setTextColor",
      "setTextBackgroundColor",
      "setTextAlign",
      "saveTextStyle",
      "defineBubbleStyle",
      "setBubblePresentationMode",
      "setBubblePlacement",
      "setPortraitBase",
      "setBubbleDistance",
      "setBubbleVisualStyle",
      "setBubbleTailLength",
      "setBubbleOffset",
      "setBlinkFrames",
      "setTalkFrames",
      "setAdvanceFrames",
      "sayWithBubbleStyle",
      "thinkWithBubbleStyle",
      "setTextActor",
      "clearTextActor",
      "setBubbleAnimationMode",
      "waitForBubbleAdvance",
      "closeBubble",
      "getVersion",
    ]);
    expect(info.menus.animationMode).toEqual({
      acceptReporters: true,
      items: ["talking", "awaiting-advance", "idle"],
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
    const firstPosition = harness.positions.get(drawableId!);
    expect(firstPosition?.[0]).toBeGreaterThan(bounds.right);
    expect(firstPosition?.[1]).toBe(-20);

    bounds = { bottom: -20, left: -50, right: 10, top: 60 };
    target.onTargetVisualChange?.(target);
    const movedPosition = harness.positions.get(drawableId!);
    expect(movedPosition?.[0]).toBeGreaterThan(bounds.right);
    expect(movedPosition?.[1]).toBe(20);
    expect(movedPosition).not.toEqual(firstPosition);

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
    expect(harness.positions.get(textDrawable)?.[0]).toBeGreaterThan(50);
    expect(harness.positions.get(textDrawable)?.[1]).toBe(-12);
  });

  it("builds text styles and renders TEXT_ACTOR on the actor drawable", async () => {
    const harness = createRuntime();
    const extension = new BubbleExtension(harness.runtime);
    const target = {
      ...actor(),
      drawableID: 99,
      updateAllDrawableProperties: vi.fn(),
    };

    expect(() => extension.setTextFont({ FONT: "Inter" })).toThrow(
      "begin a text style",
    );
    extension.beginTextStyle({ STYLE: "title-text" });
    extension.setTextFont({ FONT: "Noto Sans JP" });
    extension.setTextSize({ SIZE: 180 });
    extension.setTextColor({ COLOR: "#ffffff" });
    extension.setTextBackgroundColor({ COLOR: "#000000" });
    extension.setTextAlign({ ALIGN: "center" });
    extension.saveTextStyle();

    extension.defineBubbleStyle({
      STYLE: "title",
      TEXT_STYLE: "title-text",
    });
    extension.setBubblePresentationMode({
      MODE: "TEXT_ACTOR",
      STYLE: "title",
    });
    await extension.sayWithBubbleStyle(
      { MESSAGE: "Chapter 1", STYLE: "title" },
      { target },
    );

    expect(harness.createdSvgSkins.at(-1)).toContain(
      'data-bubble-presentation="TEXT_ACTOR"',
    );
    expect(harness.createdSvgSkins.at(-1)).toContain(
      'font-family="Noto Sans JP"',
    );
    expect(harness.createdSvgSkins.at(-1)).toContain('text-anchor="middle"');
    expect(harness.created).toHaveLength(0);

    await extension.closeBubble({}, { target });
    expect(target.updateAllDrawableProperties).toHaveBeenCalledOnce();
  });

  it("rejects popup-only decorators after selecting TEXT_ACTOR", () => {
    const harness = createRuntime();
    const extension = new BubbleExtension(harness.runtime);
    extension.defineBubbleStyle({ STYLE: "title", TEXT_STYLE: "default" });
    extension.setBubblePresentationMode({
      MODE: "TEXT_ACTOR",
      STYLE: "title",
    });
    expect(() =>
      extension.setBubblePlacement({ STYLE: "title", PLACEMENT: "up" }),
    ).toThrow("TEXT_ACTOR does not accept popup-only settings: placement");
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
    expect(harness.createdSvgSkins).toHaveLength(2);
    const bodySvg = harness.createdSvgSkins.find((svg) =>
      svg.includes('data-bubble-style="YELLING"'),
    );
    expect(bodySvg).toBeDefined();
    expect(bodySvg).toContain('data-boolean-operation="union"');
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
    expect(harness.destroyedSkins).toEqual([200, 201]);
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
    expect(harness.positions.get(drawableId)).toEqual([0, 144]);
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
    expect(harness.positions.get(harness.created.at(-1)!)).toEqual([0, -144]);
    await extension.setBubbleAnimationMode({ MODE: "idle" }, { target: stage });
    await extension.closeBubble({}, { target: stage });
  });

  it("renders layered speech and changes from talk to advance animation", async () => {
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
    extension.setTalkFrames({
      STYLE: "dialogue",
      ASSETS: "MouthClosed,MouthOpen",
      SECONDS: 0.1,
    });
    extension.setAdvanceFrames({
      STYLE: "dialogue",
      ASSETS: "Next1,Next2",
      SECONDS: 0.2,
    });

    await extension.sayWithBubbleStyle(
      { MESSAGE: "こんにちは", STYLE: "dialogue" },
      { target },
    );

    expect(harness.created).toHaveLength(6);
    expect(harness.createdSvgSkins).toEqual(
      expect.arrayContaining([
        expect.stringContaining('data-bubble-presentation="TEXT_ACTOR"'),
      ]),
    );
    expect(scheduler.size).toBe(2);
    expect([...harness.positions.values()]).not.toHaveLength(0);

    await extension.setBubbleAnimationMode(
      { MODE: "awaiting-advance" },
      { target },
    );
    expect(scheduler.size).toBe(2);

    await extension.closeBubble({}, { target });
    expect(scheduler.size).toBe(0);
    expect(harness.destroyed).toHaveLength(6);
    expect(harness.destroyedSkins).toHaveLength(2);
  });

  it("waits in awaiting-advance mode until the expression becomes true", async () => {
    const harness = createRuntime();
    const scheduler = new TestScheduler();
    const extension = new BubbleExtension(harness.runtime, { scheduler });
    const target = actor();
    extension.defineBubbleStyle({
      STYLE: "dialogue",
      TEXT_STYLE: "dialogue-text",
    });
    extension.setAdvanceFrames({
      STYLE: "dialogue",
      ASSETS: "Next1,Next2",
      SECONDS: 0.2,
    });
    await extension.sayWithBubbleStyle(
      { MESSAGE: "continue?", STYLE: "dialogue" },
      { target },
    );

    const waiting = extension.waitForBubbleAdvance(
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

    const waiting = extension.waitForBubbleAdvance(
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

    const waiting = extension.waitForBubbleAdvance(
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

      const waiting = extension.waitForBubbleAdvance(
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
      inputExtension.waitForBubbleAdvance(
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
      expressionExtension.waitForBubbleAdvance(
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

  it("requires Asset Manager but uses the built-in SVG Text engine", async () => {
    const noAssets = createRuntime({ assetManager: false });
    const first = new BubbleExtension(noAssets.runtime);
    first.defineBubbleStyle({ STYLE: "plain", TEXT_STYLE: "default" });
    first.setPortraitBase({ STYLE: "plain", ASSET: "Face" });
    await expect(
      first.sayWithBubbleStyle(
        { MESSAGE: "hello", STYLE: "plain" },
        { target: actor() },
      ),
    ).rejects.toThrow("Load @kubohiroya/turbowarp-asset-manager");

    const builtInText = createRuntime({ svgText: false });
    const second = new BubbleExtension(builtInText.runtime);
    second.defineBubbleStyle({ STYLE: "plain", TEXT_STYLE: "default" });
    await expect(
      second.sayWithBubbleStyle(
        { MESSAGE: "hello", STYLE: "plain" },
        { target: actor() },
      ),
    ).resolves.toBeUndefined();
    expect(builtInText.createdSvgSkins.length).toBeGreaterThanOrEqual(2);
  });
});
