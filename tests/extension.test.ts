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
  const visibility = new Map<number, boolean>();
  const positions = new Map<number, [number, number]>();
  const renderer: TurboWarpBubbleRenderer = {
    createDrawable: vi.fn(() => {
      const id = nextDrawable;
      nextDrawable += 1;
      created.push(id);
      return id;
    }),
    destroyDrawable: vi.fn((id) => {
      destroyed.push(id);
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
    destroyed,
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
      "setPortraitBase",
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

    expect(harness.created).toHaveLength(5);
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
    expect(harness.destroyed).toHaveLength(5);
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
    await vi.waitFor(() => expect(harness.destroyed).toHaveLength(1));
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
