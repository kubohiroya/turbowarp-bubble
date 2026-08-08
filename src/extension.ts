import definitions from "./block-definitions.json";
import {
  normalizeBubbleDistance,
  normalizeBubbleOffset,
  normalizeBubblePlacement,
  normalizeBubbleTailLength,
  bubbleVisualStyles,
  type BubblePlacement,
  type BubbleVisualStyle,
} from "./composition.js";
import type {
  BubbleComposition,
  BubbleAnimationMode,
  BubbleFrameAnimationInput,
  BubbleHandle,
  BubbleScheduler,
  BubblePlacementInput,
  BubblePortraitInput,
  BubbleStyleInput,
} from "./composition.js";
import { extensionConfig } from "./config.js";
import {
  createTurboWarpBubbleComposition,
  type TurboWarpBubbleCompositionOptions,
  type TurboWarpBubbleRuntime,
  type TurboWarpBubbleTarget,
} from "./turbowarp-adapter.js";

type BlockTypeName = "COMMAND" | "REPORTER";
type ArgumentTypeName = "NUMBER" | "STRING";

interface DefinitionArgument {
  readonly type: ArgumentTypeName;
  readonly defaultValue: number | string;
  readonly menu?: string;
}

interface BlockDefinition {
  readonly opcode: string;
  readonly blockType: BlockTypeName;
  readonly text: string;
  readonly description: string;
  readonly arguments: Readonly<Record<string, DefinitionArgument>>;
}

interface DefinitionMenu {
  readonly acceptReporters: boolean;
  readonly items: readonly string[];
}

interface BlockUtility {
  readonly target: TurboWarpBubbleTarget;
}

interface BubbleExtensionRuntime extends TurboWarpBubbleRuntime {
  on?(event: string, listener: (...args: unknown[]) => void): void;
  off?(event: string, listener: (...args: unknown[]) => void): void;
  readonly ext_kubohiroyaasyncinput?: unknown;
  readonly ext_kubohiroyaruntimeexpression?: TurboWarpRuntimeExpressionExtension;
}

interface TurboWarpRuntimeExpressionExtension {
  runtimeCondition(args: Readonly<{ EXPRESSION: unknown }>): boolean;
}

interface PendingBubbleWait {
  cancel(error: Error): void;
}

type BubbleExtensionOptions = TurboWarpBubbleCompositionOptions;

type BlockArguments = Readonly<Record<string, unknown>>;
type AnimationField = "blink" | "talk";

const blockDefinitions = definitions.blocks as readonly BlockDefinition[];
const definitionMenus = definitions.menus as Record<string, DefinitionMenu>;
const validAnimationModes = new Set<BubbleAnimationMode>([
  "idle",
  "talking",
  "awaiting-advance",
]);
export const EXTENSION_DOCS_URI =
  "https://kubohiroya.github.io/turbowarp-bubble/";
export const EXTENSION_VERSION = "0.1.0";

function extensionError(message: string): Error {
  const error = new Error(`[Bubble] ${message}`);
  Object.defineProperty(error, "code", { value: "BUBBLE-EXTENSION-001" });
  return error;
}

export class BubbleExtension implements TurboWarpExtension {
  private readonly runtime: BubbleExtensionRuntime;
  private readonly options: BubbleExtensionOptions;
  private readonly styles = new Map<string, BubbleStyleInput>();
  private readonly handles = new Map<string, BubbleHandle>();
  private readonly waits = new Map<string, PendingBubbleWait>();
  private readonly waitScheduler: BubbleScheduler;
  private composition: BubbleComposition | null = null;
  private disposed = false;

  public constructor(
    runtime = Scratch.vm?.runtime as BubbleExtensionRuntime | undefined,
    options: BubbleExtensionOptions = {},
  ) {
    if (!runtime) throw extensionError("TurboWarp runtime is unavailable.");
    this.runtime = runtime;
    this.options = options;
    this.waitScheduler =
      options.scheduler ??
      Object.freeze({
        setTimeout: (callback: () => void, milliseconds: number) =>
          globalThis.setTimeout(callback, milliseconds),
        clearTimeout: (handle: unknown) =>
          globalThis.clearTimeout(
            handle as ReturnType<typeof globalThis.setTimeout>,
          ),
      });
    const releaseAll = (): void => {
      void this.releaseAll().catch(() => undefined);
    };
    const releaseTarget = (target?: unknown): void => {
      if (this.isTarget(target)) {
        void this.releaseOwnedTarget(target.id).catch(() => undefined);
      }
    };
    runtime.on?.("PROJECT_START", releaseAll);
    runtime.on?.("PROJECT_STOP_ALL", releaseAll);
    runtime.on?.("STOP_FOR_TARGET", releaseTarget);
    runtime.on?.("RUNTIME_DISPOSED", () => {
      void this.dispose().catch(() => undefined);
    });
  }

  public getInfo(): Record<string, unknown> {
    return {
      id: extensionConfig.id,
      name: Scratch.translate(definitions.extensionName),
      docsURI: EXTENSION_DOCS_URI,
      color1: "#ff6680",
      blocks: blockDefinitions.map((block) => this.toScratchBlock(block)),
      menus: definitionMenus,
    };
  }

  public defineBubbleStyle(args: BlockArguments): void {
    const name = this.requireName(args.STYLE, "style");
    const style = Object.freeze({
      name,
      textStyle: this.requireName(args.TEXT_STYLE, "text style"),
    });
    this.installStyle(style);
  }

  public setPortraitBase(args: BlockArguments): void {
    const style = this.requireStyle(args.STYLE);
    const base = this.toString(args.ASSET).trim();
    const nextStyle: BubbleStyleInput = base
      ? Object.freeze({ ...style, portrait: { ...style.portrait, base } })
      : (() => {
          const { portrait, ...withoutPortrait } = style;
          void portrait;
          return Object.freeze(withoutPortrait);
        })();
    this.installStyle(nextStyle);
  }

  public setBubblePlacement(args: BlockArguments): void {
    const style = this.requireStyle(args.STYLE);
    let placement: BubblePlacement;
    try {
      placement = normalizeBubblePlacement(args.PLACEMENT);
    } catch (error) {
      throw extensionError(
        error instanceof Error ? error.message : "placement is invalid.",
      );
    }
    this.installStyle(
      Object.freeze({
        ...style,
        placement: this.placementInput(placement),
      }),
    );
  }

  public setBubbleDistance(args: BlockArguments): void {
    const style = this.requireStyle(args.STYLE);
    this.installStyle(
      Object.freeze({
        ...style,
        distance: this.normalizeTransformNumber(
          args.DISTANCE,
          normalizeBubbleDistance,
        ),
      }),
    );
  }

  public setBubbleVisualStyle(args: BlockArguments): void {
    const style = this.requireStyle(args.STYLE);
    const visualStyle = this.toString(args.VISUAL_STYLE)
      .trim()
      .toUpperCase() as BubbleVisualStyle;
    if (!bubbleVisualStyles.includes(visualStyle)) {
      throw extensionError(`unsupported Bubble visual style: ${visualStyle}`);
    }
    this.installStyle(Object.freeze({ ...style, visualStyle }));
  }

  public setBubbleTailLength(args: BlockArguments): void {
    const style = this.requireStyle(args.STYLE);
    this.installStyle(
      Object.freeze({
        ...style,
        tailLength: this.normalizeTransformNumber(
          args.LENGTH,
          normalizeBubbleTailLength,
        ),
      }),
    );
  }

  public setBubbleOffset(args: BlockArguments): void {
    const style = this.requireStyle(args.STYLE);
    let offset;
    try {
      offset = normalizeBubbleOffset([
        Scratch.Cast.toNumber(args.X),
        Scratch.Cast.toNumber(args.Y),
        Scratch.Cast.toNumber(args.SCALE),
      ]);
    } catch (error) {
      throw extensionError(
        error instanceof Error ? error.message : "Bubble offset is invalid.",
      );
    }
    this.installStyle(
      Object.freeze({
        ...style,
        offset: Object.freeze([
          offset.x,
          offset.y,
          offset.scalePercent,
        ] as const),
      }),
    );
  }

  public setBlinkFrames(args: BlockArguments): void {
    this.setPortraitAnimation("blink", args);
  }

  public setTalkFrames(args: BlockArguments): void {
    this.setPortraitAnimation("talk", args);
  }

  public setAdvanceFrames(args: BlockArguments): void {
    const style = this.requireStyle(args.STYLE);
    const frames = this.parseFrames(args.ASSETS);
    if (frames.length === 1) {
      throw extensionError("advance frames must contain at least two assets.");
    }
    const advanceIndicator =
      frames.length === 0
        ? undefined
        : this.animationInput(frames, args.SECONDS, "advance");
    const { advanceIndicator: previousAdvance, ...withoutAdvance } = style;
    void previousAdvance;
    const nextStyle: BubbleStyleInput = Object.freeze({
      ...withoutAdvance,
      ...(advanceIndicator ? { advanceIndicator } : {}),
    });
    this.installStyle(nextStyle);
  }

  public sayWithBubbleStyle(
    args: BlockArguments,
    util: BlockUtility,
  ): Promise<void> {
    return this.show("say", args, util);
  }

  public thinkWithBubbleStyle(
    args: BlockArguments,
    util: BlockUtility,
  ): Promise<void> {
    return this.show("think", args, util);
  }

  public async setBubbleAnimationMode(
    args: BlockArguments,
    util: BlockUtility,
  ): Promise<void> {
    const target = this.requireTarget(util);
    const mode = this.toString(args.MODE)
      .trim()
      .toLowerCase() as BubbleAnimationMode;
    if (!validAnimationModes.has(mode)) {
      throw extensionError(
        "animation mode must be talking, awaiting-advance, or idle.",
      );
    }
    const handle = this.handles.get(target.id);
    if (!handle)
      throw extensionError("this target does not have an active bubble.");
    await handle.setAnimationMode(mode);
  }

  public async waitForBubbleAdvance(
    args: BlockArguments,
    util: BlockUtility,
  ): Promise<void> {
    const target = this.requireTarget(util);
    const handle = this.handles.get(target.id);
    if (!handle)
      throw extensionError("this target does not have an active bubble.");
    const condition = this.toString(args.CONDITION).trim();
    if (!condition) throw extensionError("wait condition is empty.");
    const timeoutSeconds = Scratch.Cast.toNumber(args.TIMEOUT);
    if (!Number.isFinite(timeoutSeconds) || timeoutSeconds < 0) {
      throw extensionError("wait timeout must be zero or greater.");
    }
    if (!this.isRecord(this.runtime.ext_kubohiroyaasyncinput)) {
      throw extensionError(
        "Bubble wait requires Async Input. Load @kubohiroya/turbowarp-async-input before using this block.",
      );
    }
    const runtimeExpression = this.runtime.ext_kubohiroyaruntimeexpression;
    if (
      !this.isRecord(runtimeExpression) ||
      typeof runtimeExpression.runtimeCondition !== "function"
    ) {
      throw extensionError(
        "Bubble wait requires Runtime Expression. Load @kubohiroya/turbowarp-runtime-expression before using this block.",
      );
    }
    if (
      typeof this.runtime.on !== "function" ||
      typeof this.runtime.off !== "function"
    ) {
      throw extensionError("TurboWarp runtime events are unavailable.");
    }

    this.cancelWait(target.id, "Bubble wait was replaced.");
    await handle.setAnimationMode("awaiting-advance");

    await new Promise<void>((resolve, reject) => {
      let settled = false;
      let timeoutHandle: unknown;
      const cleanup = (): void => {
        this.runtime.off?.("BEFORE_EXECUTE", checkCondition);
        if (timeoutHandle !== undefined)
          this.waitScheduler.clearTimeout(timeoutHandle);
        if (this.waits.get(target.id) === pending) this.waits.delete(target.id);
      };
      const finish = (error?: Error): void => {
        if (settled) return;
        settled = true;
        cleanup();
        if (error) {
          reject(error);
          return;
        }
        void handle.setAnimationMode("idle").then(resolve, reject);
      };
      const checkCondition = (): void => {
        try {
          if (runtimeExpression.runtimeCondition({ EXPRESSION: condition }))
            finish();
        } catch (error) {
          finish(
            error instanceof Error
              ? error
              : extensionError("wait condition evaluation failed."),
          );
        }
      };
      const pending: PendingBubbleWait = Object.freeze({ cancel: finish });
      this.waits.set(target.id, pending);
      this.runtime.on?.("BEFORE_EXECUTE", checkCondition);
      if (timeoutSeconds > 0) {
        timeoutHandle = this.waitScheduler.setTimeout(
          () => finish(),
          timeoutSeconds * 1000,
        );
      }
      checkCondition();
    });
  }

  public async closeBubble(
    _args: BlockArguments,
    util: BlockUtility,
  ): Promise<void> {
    const target = this.requireTarget(util);
    await this.releaseOwnedTarget(target.id);
  }

  public getVersion(): string {
    return EXTENSION_VERSION;
  }

  public async releaseAll(): Promise<void> {
    this.cancelAllWaits("Bubble waits were released.");
    if (!this.composition) return;
    await this.composition.releaseAll();
    this.handles.clear();
  }

  public async dispose(): Promise<void> {
    if (this.disposed) return;
    this.disposed = true;
    this.cancelAllWaits("Bubble extension was disposed.");
    if (this.composition) await this.composition.dispose();
    this.handles.clear();
    this.styles.clear();
  }

  private toScratchBlock(block: BlockDefinition): Record<string, unknown> {
    return {
      opcode: block.opcode,
      blockType: Scratch.BlockType[block.blockType],
      text: Scratch.translate(block.text),
      arguments: Object.fromEntries(
        Object.entries(block.arguments).map(([name, argument]) => [
          name,
          {
            type: Scratch.ArgumentType[argument.type],
            defaultValue: argument.defaultValue,
            ...(argument.menu === undefined ? {} : { menu: argument.menu }),
          },
        ]),
      ),
    };
  }

  private toString(value: unknown): string {
    return Scratch.Cast.toString(value);
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private abortError(message: string): Error {
    const error = extensionError(message);
    error.name = "AbortError";
    return error;
  }

  private cancelWait(targetId: string, message: string): void {
    this.waits.get(targetId)?.cancel(this.abortError(message));
  }

  private cancelAllWaits(message: string): void {
    for (const targetId of [...this.waits.keys()])
      this.cancelWait(targetId, message);
  }

  private requireName(value: unknown, label: string): string {
    const name = this.toString(value).trim();
    if (!name) throw extensionError(`${label} name is empty.`);
    return name;
  }

  private requireStyle(value: unknown): BubbleStyleInput {
    const name = this.requireName(value, "style");
    const style = this.styles.get(name);
    if (!style) throw extensionError(`bubble style is not defined: ${name}`);
    return style;
  }

  private normalizeTransformNumber(
    value: unknown,
    normalize: (value: unknown) => number,
  ): number {
    try {
      return normalize(Scratch.Cast.toNumber(value));
    } catch (error) {
      throw extensionError(
        error instanceof Error
          ? error.message
          : "Bubble transform value is invalid.",
      );
    }
  }

  private installStyle(style: BubbleStyleInput): void {
    this.styles.set(style.name, style);
    this.composition?.defineStyle(style);
  }

  private parseFrames(value: unknown): string[] {
    const text = this.toString(value).trim();
    if (!text) return [];
    const frames = text
      .split(",")
      .map((frame) => frame.trim())
      .filter(Boolean);
    if (frames.length === 0) throw extensionError("frame asset list is empty.");
    return frames;
  }

  private animationInput(
    frames: string[],
    secondsValue: unknown,
    label: string,
  ): BubbleFrameAnimationInput {
    const seconds = Scratch.Cast.toNumber(secondsValue);
    if (!Number.isFinite(seconds) || seconds <= 0) {
      throw extensionError(
        `${label} frame interval must be greater than zero.`,
      );
    }
    return Object.freeze({
      frames: Object.freeze(frames),
      frameIntervalSeconds: seconds,
    });
  }

  private setPortraitAnimation(
    field: AnimationField,
    args: BlockArguments,
  ): void {
    const style = this.requireStyle(args.STYLE);
    const portrait = style.portrait;
    if (!portrait?.base) {
      throw extensionError(
        "set the portrait base before portrait animation frames.",
      );
    }
    const frames = this.parseFrames(args.ASSETS);
    const animation =
      frames.length === 0
        ? undefined
        : this.animationInput(frames, args.SECONDS, field);
    const nextPortrait: BubblePortraitInput = Object.freeze({
      base: portrait.base,
      ...(field === "blink"
        ? {
            ...(animation ? { blink: animation } : {}),
            ...(portrait.talk ? { talk: portrait.talk } : {}),
          }
        : {
            ...(portrait.blink ? { blink: portrait.blink } : {}),
            ...(animation ? { talk: animation } : {}),
          }),
    });
    this.installStyle(Object.freeze({ ...style, portrait: nextPortrait }));
  }

  private isTarget(value: unknown): value is TurboWarpBubbleTarget {
    return (
      typeof value === "object" &&
      value !== null &&
      typeof (value as { id?: unknown }).id === "string" &&
      typeof (value as { isStage?: unknown }).isStage === "boolean"
    );
  }

  private requireTarget(util: BlockUtility): TurboWarpBubbleTarget {
    const target = util?.target;
    if (!this.isTarget(target)) throw extensionError("target is unavailable.");
    return target;
  }

  private placementInput(placement: BubblePlacement): BubblePlacementInput {
    return placement.basis === "actor" ? placement.direction : placement.region;
  }

  private getComposition(): BubbleComposition {
    if (this.disposed) throw extensionError("extension is disposed.");
    if (!this.composition) {
      this.composition = createTurboWarpBubbleComposition(
        this.runtime,
        this.options,
      );
      for (const style of this.styles.values())
        this.composition.defineStyle(style);
    }
    return this.composition;
  }

  private async show(
    kind: "say" | "think",
    args: BlockArguments,
    util: BlockUtility,
  ): Promise<void> {
    const style = this.requireStyle(args.STYLE);
    const target = this.requireTarget(util);
    const placement = normalizeBubblePlacement(style.placement ?? "up-right");
    if (target.isStage && placement.basis === "actor") {
      throw extensionError(
        "actor-relative bubble placement requires a sprite or clone.",
      );
    }
    this.cancelWait(target.id, "Bubble wait was replaced.");
    const composition = this.getComposition();
    let handle: BubbleHandle;
    try {
      handle = await composition.show({
        actor: target,
        actorKey: target.id,
        kind,
        text: this.toString(args.MESSAGE),
        styleName: style.name,
      });
    } catch (error) {
      if (!composition.hasActiveBubble(target.id))
        this.handles.delete(target.id);
      throw error;
    }
    if (composition.hasActiveBubble(target.id))
      this.handles.set(target.id, handle);
  }

  private async releaseOwnedTarget(targetId: string): Promise<void> {
    this.cancelWait(targetId, "Bubble wait was released.");
    this.handles.delete(targetId);
    if (this.composition) await this.composition.releaseTarget(targetId);
  }
}
