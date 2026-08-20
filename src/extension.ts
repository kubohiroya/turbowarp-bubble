import definitions from "./block-definitions.json";
import {
  normalizeBubbleDistance,
  normalizeBubbleOffset,
  normalizeBubblePlacement,
  normalizeBubblePortraitCornerRadius,
  normalizeBubblePortraitOffset,
  normalizeBubblePortraitPlacement,
  normalizeBubbleTailLength,
  bubbleVisualStyles,
  formatScratchBubbleArgument,
  isScratchDefaultBubbleStyleInput,
  type BubblePlacement,
  type BubbleVisualStyle,
} from "./composition.js";
import type {
  BubbleComposition,
  BubbleAnimationMode,
  BubbleFrameAnimationInput,
  BubbleHandle,
  BubbleMotionInput,
  BubbleRevealInput,
  BubbleScheduler,
  BubblePlacementInput,
  BubblePortraitInput,
  BubblePortraitPlacement,
  BubbleStyleInput,
  BubbleRevealUnit,
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
type AnimationField = "blink" | "lipSync";

const blockDefinitions = definitions.blocks as readonly BlockDefinition[];
const definitionMenus = definitions.menus as Record<string, DefinitionMenu>;
const validAnimationModes = new Set<BubbleAnimationMode>([
  "idle",
  "talking",
  "awaiting-continue",
]);
const validRevealUnits = new Set<BubbleRevealUnit>([
  "CHARACTER",
  "WORD",
  "LINE",
  "BLOCK",
]);
const showMotionNames = new Set(["fadeIn", "floatIn", "zoomIn", "riseUp"]);
const hideMotionNames = new Set(["fadeOut", "floatOut", "zoomOut", "sink"]);
const motionNames = new Set([
  ...showMotionNames,
  ...hideMotionNames,
  "shake",
  "explode",
  "animateBubbleShape",
]);
const easeNames = new Set(["linear", "easeIn", "easeOut", "easeInOut"]);
export const EXTENSION_DOCS_URI =
  "https://kubohiroya.github.io/turbowarp-bubble/";
export const EXTENSION_VERSION = "0.8.0";
export const BLOCK_ICON_URI = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" d="M12 13h40a5 5 0 0 1 5 5v23a5 5 0 0 1-5 5H30L17 55v-9h-5a5 5 0 0 1-5-5V18a5 5 0 0 1 5-5Z"/><g fill="#fff"><circle cx="23" cy="30" r="3"/><circle cx="32" cy="30" r="3"/><circle cx="41" cy="30" r="3"/></g></svg>',
)}`;

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
      blockIconURI: BLOCK_ICON_URI,
      color1: "#ff6680",
      color2: "#e64d6a",
      color3: "#b83255",
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

  public setPortraitLayout(args: BlockArguments): void {
    const style = this.requireStyle(args.STYLE);
    const placementValue = this.toString(args.PLACEMENT).trim().toLowerCase();
    if (placementValue === "none") {
      const { portrait, ...withoutPortrait } = style;
      void portrait;
      this.installStyle(Object.freeze(withoutPortrait));
      return;
    }
    if (!style.portrait?.base) {
      throw extensionError("set the portrait base before portrait layout.");
    }
    let placement: BubblePortraitPlacement;
    let offset;
    let cornerRadius: number;
    try {
      placement = normalizeBubblePortraitPlacement(args.PLACEMENT);
      offset = normalizeBubblePortraitOffset([
        Scratch.Cast.toNumber(args.X),
        Scratch.Cast.toNumber(args.Y),
        Scratch.Cast.toNumber(args.ZOOM),
      ]);
      cornerRadius = normalizeBubblePortraitCornerRadius(
        Scratch.Cast.toNumber(args.RADIUS),
      );
    } catch (error) {
      throw extensionError(
        error instanceof Error
          ? error.message
          : "Bubble portrait layout is invalid.",
      );
    }
    this.installStyle(
      Object.freeze({
        ...style,
        portrait: Object.freeze({
          ...style.portrait,
          placement,
          offset: Object.freeze([
            offset.x,
            offset.y,
            offset.zoomPercent,
          ] as const),
          cornerRadius,
        }),
      }),
    );
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

  public setLipSyncFrames(args: BlockArguments): void {
    this.setPortraitAnimation("lipSync", args);
  }

  public setContinueFrames(args: BlockArguments): void {
    const style = this.requireStyle(args.STYLE);
    const frames = this.parseFrames(args.ASSETS);
    if (frames.length === 1) {
      throw extensionError("continue frames must contain at least two assets.");
    }
    const continueIndicator =
      frames.length === 0
        ? undefined
        : this.animationInput(frames, args.SECONDS, "continue");
    const { continueIndicator: previousContinue, ...withoutContinue } = style;
    void previousContinue;
    const nextStyle: BubbleStyleInput = Object.freeze({
      ...withoutContinue,
      ...(continueIndicator ? { continueIndicator } : {}),
    });
    this.installStyle(nextStyle);
  }

  public setBubbleReveal(args: BlockArguments): void {
    const style = this.requireStyle(args.STYLE);
    const unit = this.toString(args.UNIT)
      .trim()
      .toUpperCase() as BubbleRevealUnit;
    if (!validRevealUnits.has(unit))
      throw extensionError(
        "reveal unit must be CHARACTER, WORD, LINE, or BLOCK.",
      );
    const seconds = Scratch.Cast.toNumber(args.SECONDS);
    if (!Number.isFinite(seconds) || seconds < 0)
      throw extensionError("reveal interval must be zero or greater.");
    const layout = this.toString(args.LAYOUT).trim().toUpperCase();
    if (layout !== "DYNAMIC" && layout !== "RESERVED")
      throw extensionError("reveal layout must be DYNAMIC or RESERVED.");
    const previous = style.reveal;
    const reveal: BubbleRevealInput = Object.freeze({
      unit,
      ...(previous?.delimiters === undefined
        ? {}
        : { delimiters: previous.delimiters }),
      ...(previous?.showDelimiters === undefined
        ? {}
        : { showDelimiters: previous.showDelimiters }),
      layout,
      intervalSeconds: seconds,
      ...(previous?.sound === undefined ? {} : { sound: previous.sound }),
    });
    this.installStyle(Object.freeze({ ...style, reveal }));
  }

  public setBubbleWordDelimiters(args: BlockArguments): void {
    const style = this.requireStyle(args.STYLE);
    const delimiters = this.toString(args.DELIMITERS);
    if (!delimiters) throw extensionError("word delimiters are empty.");
    const show = this.toString(args.SHOW).trim().toLowerCase();
    if (show !== "true" && show !== "false")
      throw extensionError("show delimiters must be true or false.");
    const previous = style.reveal;
    const reveal: BubbleRevealInput = Object.freeze({
      unit: previous?.unit ?? "WORD",
      delimiters,
      showDelimiters: show === "true",
      ...(previous?.layout === undefined ? {} : { layout: previous.layout }),
      ...(previous?.intervalSeconds === undefined
        ? {}
        : { intervalSeconds: previous.intervalSeconds }),
      ...(previous?.sound === undefined ? {} : { sound: previous.sound }),
    });
    this.installStyle(Object.freeze({ ...style, reveal }));
  }

  public setBubbleRevealSound(args: BlockArguments): void {
    const style = this.requireStyle(args.STYLE);
    const asset = this.toString(args.ASSET).trim();
    const audio = style.audio;
    const nextAudio = asset
      ? Object.freeze({ ...(audio ?? {}), reveal: asset })
      : (() => {
          if (!audio) return undefined;
          const { reveal, ...withoutReveal } = audio;
          void reveal;
          return Object.freeze(withoutReveal);
        })();
    this.installStyle(
      Object.freeze({
        ...style,
        ...(nextAudio === undefined ? {} : { audio: nextAudio }),
      }),
    );
  }

  public setBubbleVoice(args: BlockArguments): void {
    const style = this.requireStyle(args.STYLE);
    const asset = this.toString(args.ASSET).trim();
    const audio = style.audio;
    const nextAudio = asset
      ? Object.freeze({ ...(audio ?? {}), voice: asset })
      : (() => {
          if (!audio) return undefined;
          const { voice, ...withoutVoice } = audio;
          void voice;
          return Object.freeze(withoutVoice);
        })();
    this.installStyle(
      Object.freeze({
        ...style,
        ...(nextAudio === undefined ? {} : { audio: nextAudio }),
      }),
    );
  }

  public setBubbleShowAnimation(args: BlockArguments): void {
    const style = this.requireStyle(args.STYLE);
    const motion = this.motionInput(
      args.MOTION,
      args.SECONDS,
      "show",
      showMotionNames,
    );
    this.installStyle(Object.freeze({ ...style, showAnimation: motion }));
  }

  public setBubbleHideAnimation(args: BlockArguments): void {
    const style = this.requireStyle(args.STYLE);
    const motion = this.motionInput(
      args.MOTION,
      args.SECONDS,
      "hide",
      hideMotionNames,
    );
    this.installStyle(Object.freeze({ ...style, hideAnimation: motion }));
  }

  public async animateBubble(
    args: BlockArguments,
    util: BlockUtility,
  ): Promise<void> {
    const handle = this.requireHandle(util);
    const name = this.toString(args.MOTION).trim();
    if (!motionNames.has(name))
      throw extensionError("unsupported Bubble motion.");
    await handle.animate({ name: name as BubbleMotionInput["name"] });
  }

  public async shakeBubble(
    args: BlockArguments,
    util: BlockUtility,
  ): Promise<void> {
    const handle = this.requireHandle(util);
    const count = Scratch.Cast.toNumber(args.COUNT);
    if (!Number.isInteger(count) || count < 1)
      throw extensionError("shake count must be a positive integer.");
    const ease = this.toString(args.EASE).trim();
    if (!easeNames.has(ease)) throw extensionError("unsupported easing.");
    await handle.animate({
      name: "shake",
      direction: Scratch.Cast.toNumber(args.DIRECTION),
      count,
      ease: ease as NonNullable<BubbleMotionInput["ease"]>,
    });
  }

  public async explodeBubble(
    args: BlockArguments,
    util: BlockUtility,
  ): Promise<void> {
    const handle = this.requireHandle(util);
    const scale = Scratch.Cast.toNumber(args.SCALE);
    const count = Scratch.Cast.toNumber(args.COUNT);
    if (!Number.isFinite(scale) || scale <= 0)
      throw extensionError("explode scale must be positive.");
    if (!Number.isInteger(count) || count < 1)
      throw extensionError("explode count must be a positive integer.");
    const ease = this.toString(args.EASE).trim();
    if (!easeNames.has(ease)) throw extensionError("unsupported easing.");
    await handle.animate({
      name: "explode",
      relativeScale: scale,
      count,
      ease: ease as NonNullable<BubbleMotionInput["ease"]>,
    });
  }

  public async animateBubbleShape(
    args: BlockArguments,
    util: BlockUtility,
  ): Promise<void> {
    const handle = this.requireHandle(util);
    const visualStyle = this.toString(args.VISUAL_STYLE)
      .trim()
      .toUpperCase() as NonNullable<BubbleStyleInput["visualStyle"]>;
    if (
      !bubbleVisualStyles.includes(
        visualStyle as (typeof bubbleVisualStyles)[number],
      )
    )
      throw extensionError("unsupported Bubble visual style.");
    const speed = Scratch.Cast.toNumber(args.SPEED);
    const seconds = Scratch.Cast.toNumber(args.SECONDS);
    if (
      !Number.isFinite(speed) ||
      speed < 0 ||
      !Number.isFinite(seconds) ||
      seconds < 0
    )
      throw extensionError(
        "shape animation speed and duration must be zero or greater.",
      );
    await handle.animate({
      name: "animateBubbleShape",
      visualStyle,
      speed,
      durationSeconds: seconds,
    });
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
        "animation mode must be talking, awaiting-continue, or idle.",
      );
    }
    const handle = this.handles.get(target.id);
    if (!handle)
      throw extensionError("this target does not have an active bubble.");
    await handle.setAnimationMode(mode);
  }

  public async waitForBubbleContinue(
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
    await handle.setAnimationMode("awaiting-continue");

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

  public async finishBubbleReveal(
    args: BlockArguments,
    util: BlockUtility,
  ): Promise<void> {
    const handle = this.requireHandle(util);
    const unit = this.toString(args.UNIT)
      .trim()
      .toUpperCase() as BubbleRevealUnit;
    if (!validRevealUnits.has(unit))
      throw extensionError("reveal unit is invalid.");
    const conditionText = this.toString(args.CONDITION).trim();
    const timeoutSeconds = Scratch.Cast.toNumber(args.TIMEOUT);
    if (!conditionText) throw extensionError("finish condition is empty.");
    if (!Number.isFinite(timeoutSeconds) || timeoutSeconds < 0)
      throw extensionError("finish timeout must be zero or greater.");
    const expression = this.runtime.ext_kubohiroyaruntimeexpression;
    if (
      !this.isRecord(expression) ||
      typeof expression.runtimeCondition !== "function"
    ) {
      throw extensionError(
        "Bubble finish requires Runtime Expression. Load @kubohiroya/turbowarp-runtime-expression before using this block.",
      );
    }
    await handle.finish({
      unit,
      timeoutSeconds,
      condition: () =>
        expression.runtimeCondition({ EXPRESSION: conditionText }),
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

  private motionInput(
    value: unknown,
    secondsValue: unknown,
    label: string,
    valid: Set<string>,
  ): BubbleMotionInput {
    const name = this.toString(value).trim();
    if (!valid.has(name))
      throw extensionError(`${label} animation is invalid.`);
    const seconds = Scratch.Cast.toNumber(secondsValue);
    if (!Number.isFinite(seconds) || seconds < 0)
      throw extensionError(
        `${label} animation duration must be zero or greater.`,
      );
    return Object.freeze({
      name: name as BubbleMotionInput["name"],
      durationSeconds: seconds,
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
    const { blink, lipSync, ...portraitLayout } = portrait;
    const nextPortrait: BubblePortraitInput = Object.freeze({
      ...portraitLayout,
      ...(field === "blink"
        ? {
            ...(animation ? { blink: animation } : {}),
            ...(lipSync ? { lipSync } : {}),
          }
        : {
            ...(blink ? { blink } : {}),
            ...(animation ? { lipSync: animation } : {}),
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

  private requireHandle(util: BlockUtility): BubbleHandle {
    const target = this.requireTarget(util);
    const handle = this.handles.get(target.id);
    if (!handle)
      throw extensionError("this target does not have an active bubble.");
    return handle;
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
    const scratchDefault = isScratchDefaultBubbleStyleInput(style);
    const message = scratchDefault
      ? formatScratchBubbleArgument(args.MESSAGE)
      : this.toString(args.MESSAGE);
    if (scratchDefault && message === "") {
      await this.releaseOwnedTarget(target.id);
      return;
    }
    const composition = this.getComposition();
    let handle: BubbleHandle;
    try {
      handle = await composition.show({
        actor: target,
        actorKey: target.id,
        kind,
        text: message,
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
