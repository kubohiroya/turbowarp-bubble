import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BubbleExtension } from "../src/extension.js";
import type { BubbleScheduler } from "../src/composition.js";
import type {
  TurboWarpBubbleRenderer,
  TurboWarpBubbleRuntime,
  TurboWarpBubbleTarget,
} from "../src/turbowarp-adapter.js";

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
  options: { assetManager?: boolean; svgText?: boolean } = {},
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
  const setText = vi.fn(
    (_args: unknown, util: { target: TurboWarpBubbleTarget }) => {
      renderer.updateDrawableSkinId(Number(util.target.drawableID), 100);
    },
  );
  const releaseTextActor = vi.fn(() => true);
  const listeners = new Map<string, Array<(...args: unknown[]) => void>>();
  const runtime: TurboWarpBubbleRuntime & {
    on(event: string, listener: (...args: unknown[]) => void): void;
  } = {
    renderer,
    requestRedraw: vi.fn(),
    on(event, listener) {
      const existing = listeners.get(event) ?? [];
      existing.push(listener);
      listeners.set(event, existing);
    },
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
    ...((options.svgText ?? true)
      ? { ext_kubohiroyasvgtext: { setText, releaseTextActor } }
      : {}),
  };
  const emit = (event: string, ...args: unknown[]): void => {
    for (const listener of listeners.get(event) ?? []) listener(...args);
  };
  return {
    assets,
    created,
    createdSvgSkins,
    destroyed,
    destroyedSkins,
    drawableSkins,
    emit,
    positions,
    releaseTextActor,
    renderer,
    runtime,
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

describe("Bubble extension", () => {
  it("publishes the intended blocks and phase menu", () => {
    const harness = createRuntime();
    const extension = new BubbleExtension(harness.runtime);
    const info = extension.getInfo() as {
      blocks: Array<{ opcode: string }>;
      id: string;
      menus: Record<string, unknown>;
    };
    expect(info.id).toBe("kubohiroyabubble");
    expect(info.blocks.map((block) => block.opcode)).toEqual([
      "defineBubbleStyle",
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
      "setBubblePhase",
      "closeBubble",
      "getVersion",
    ]);
    expect(info.menus.phase).toEqual({
      acceptReporters: true,
      items: ["speaking", "waiting", "idle"],
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
    await extension.setBubblePhase({ PHASE: "idle" }, { target: stage });
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
    expect(harness.setText).toHaveBeenCalledWith(
      { STYLE: "dialogue-text", TEXT: "こんにちは" },
      { target: expect.objectContaining({ drawableID: expect.any(Number) }) },
    );
    expect(scheduler.size).toBe(2);
    expect([...harness.positions.values()]).not.toHaveLength(0);

    await extension.setBubblePhase({ PHASE: "waiting" }, { target });
    expect(scheduler.size).toBe(2);

    await extension.closeBubble({}, { target });
    expect(scheduler.size).toBe(0);
    expect(harness.destroyed).toHaveLength(6);
    expect(harness.destroyedSkins).toHaveLength(1);
    expect(harness.releaseTextActor).toHaveBeenCalledOnce();
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
    ).rejects.toThrow("Load @kubohiroya/turbowarp-asset-manager");

    const noText = createRuntime({ svgText: false });
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
