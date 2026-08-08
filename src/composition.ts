import type {
  AssetManagerComposition,
  AssetManagerCompositionTarget,
} from "@kubohiroya/turbowarp-asset-manager/composition";
import type {
  SvgTextComposition,
  SvgTextTarget,
} from "@kubohiroya/turbowarp-svg-text/composition";
import {
  defaultBubblePlacementInput,
  normalizeBubblePlacement,
  type BubblePlacement,
  type BubblePlacementInput,
} from "./placement.js";
import {
  defaultBubbleDistance,
  defaultBubbleOffset,
  defaultBubbleTailLength,
  normalizeBubbleDistance,
  normalizeBubbleOffset,
  normalizeBubbleTailLength,
  type BubbleOffset,
  type BubbleOffsetInput,
} from "./actor-transform.js";
import { bubbleVisualStyles, type BubbleVisualStyle } from "./bubble-svg.js";

export {
  UnicodeLineBreakProvider,
  wrapText,
  type LineBreakOpportunity,
  type LineBreakProvider,
  type TextWidthMeasurer,
  type WrappedTextLayout,
  type WrappedTextLine,
  type WrapTextInput,
} from "./text-layout.js";
export {
  bubbleBackgroundRegions,
  bubbleDirectionAliases,
  bubbleDirectionNames,
  defaultBubblePlacementInput,
  normalizeBubblePlacement,
  type BubbleActorPlacement,
  type BubbleBackgroundPlacement,
  type BubbleBackgroundRegion,
  type BubbleDirectionAlias,
  type BubbleDirectionName,
  type BubblePlacement,
  type BubblePlacementInput,
} from "./placement.js";
export {
  actorRelativeBubbleCenter,
  defaultBubbleDistance,
  defaultBubbleOffset,
  defaultBubbleTailLength,
  normalizeBubbleDistance,
  normalizeBubbleOffset,
  normalizeBubbleTailLength,
  type ActorBounds,
  type ActorRelativeCenterInput,
  type BubbleOffset,
  type BubbleOffsetInput,
} from "./actor-transform.js";
export {
  bubbleBodyCenterOffset,
  bubbleVisualStyles,
  renderBubbleSvg,
  type BubbleBodyCenterOffsetInput,
  type BubbleVisualStyle,
  type RenderBubbleSvgInput,
} from "./bubble-svg.js";

export type BubbleKind = "say" | "think";
export type BubbleAnimationMode = "idle" | "talking" | "awaiting-advance";
export type BubbleLayer =
  "portraitBase" | "portraitBlink" | "portraitTalk" | "advanceIndicator";

export interface BubbleFrameAnimationInput {
  readonly frames: ReadonlyArray<string>;
  readonly frameIntervalSeconds: number;
}

export interface BubblePortraitInput {
  readonly base: string;
  readonly blink?: BubbleFrameAnimationInput;
  readonly talk?: BubbleFrameAnimationInput;
}

export interface BubbleStyleInput {
  readonly name: string;
  readonly textStyle: string;
  readonly placement?: BubblePlacementInput;
  readonly distance?: number;
  readonly tailLength?: number;
  readonly offset?: BubbleOffsetInput;
  readonly visualStyle?: BubbleVisualStyle;
  readonly portrait?: BubblePortraitInput;
  readonly advanceIndicator?: BubbleFrameAnimationInput;
}

export interface BubbleFrameAnimation {
  readonly frames: ReadonlyArray<string>;
  readonly frameIntervalSeconds: number;
}

export interface BubblePortrait {
  readonly base: string;
  readonly blink?: BubbleFrameAnimation;
  readonly talk?: BubbleFrameAnimation;
}

export interface BubbleStyle {
  readonly name: string;
  readonly textStyle: string;
  readonly placement: BubblePlacement;
  readonly distance: number;
  readonly tailLength: number;
  readonly offset: BubbleOffset;
  readonly visualStyle: BubbleVisualStyle;
  readonly portrait?: BubblePortrait;
  readonly advanceIndicator?: BubbleFrameAnimation;
}

export type BubbleAssetManager = Pick<
  AssetManagerComposition,
  "applyToTarget" | "getMimeType" | "isRegistered"
>;

export type BubbleSvgText = Pick<
  SvgTextComposition,
  "releaseTarget" | "setText"
>;

export interface BubbleSurfaceTargets {
  readonly text: SvgTextTarget;
  readonly portraitBase?: AssetManagerCompositionTarget;
  readonly portraitBlink?: AssetManagerCompositionTarget;
  readonly portraitTalk?: AssetManagerCompositionTarget;
  readonly advanceIndicator?: AssetManagerCompositionTarget;
}

export interface BubbleSurface {
  readonly targets: BubbleSurfaceTargets;
  setLayerVisible(layer: BubbleLayer, visible: boolean): void | Promise<void>;
  show(): void | Promise<void>;
  hide(): void | Promise<void>;
  dispose(): void | Promise<void>;
}

export interface BubbleSurfaceFactoryInput {
  readonly actor: unknown;
  readonly actorKey: string;
  readonly kind: BubbleKind;
  readonly style: BubbleStyle;
}

export type BubbleSurfaceFactory = (
  input: BubbleSurfaceFactoryInput,
) => BubbleSurface | Promise<BubbleSurface>;

export interface BubbleScheduler {
  setTimeout(callback: () => void, milliseconds: number): unknown;
  clearTimeout(handle: unknown): void;
}

export interface BubbleAnimationErrorContext {
  readonly actorKey: string;
  readonly layer: Exclude<BubbleLayer, "portraitBase">;
  readonly assetName: string;
}

export interface BubbleCompositionOptions {
  readonly assetManager: BubbleAssetManager;
  readonly svgText: BubbleSvgText;
  readonly createSurface: BubbleSurfaceFactory;
  readonly scheduler?: BubbleScheduler;
  readonly onAnimationError?: (
    error: unknown,
    context: BubbleAnimationErrorContext,
  ) => void;
}

export interface ShowBubbleInput {
  readonly actor: unknown;
  readonly actorKey: string;
  readonly kind: BubbleKind;
  readonly text: string;
  readonly styleName: string;
  readonly animationMode?: BubbleAnimationMode;
}

export interface BubbleHandle {
  readonly actorKey: string;
  readonly kind: BubbleKind;
  readonly animationMode: BubbleAnimationMode;
  setAnimationMode(mode: BubbleAnimationMode): Promise<void>;
  close(): Promise<void>;
}

export interface BubbleComposition {
  defineStyle(input: BubbleStyleInput): void;
  hasActiveBubble(actorKey: unknown): boolean;
  show(input: ShowBubbleInput): Promise<BubbleHandle>;
  releaseTarget(actorKey: unknown): Promise<void>;
  releaseAll(): Promise<void>;
  dispose(): Promise<void>;
}

export type BubbleCompositionErrorCode =
  | "BUBBLE-COMPOSITION-001"
  | "BUBBLE-COMPOSITION-002"
  | "BUBBLE-COMPOSITION-003"
  | "BUBBLE-COMPOSITION-004"
  | "BUBBLE-COMPOSITION-005";

export class BubbleCompositionError extends Error {
  public readonly code: BubbleCompositionErrorCode;

  public constructor(code: BubbleCompositionErrorCode, message: string) {
    super(message);
    this.name = "BubbleCompositionError";
    this.code = code;
  }
}

interface NormalizedFrameAnimation extends BubbleFrameAnimation {
  readonly frames: readonly string[];
}

interface NormalizedPortrait extends BubblePortrait {
  readonly blink?: NormalizedFrameAnimation;
  readonly talk?: NormalizedFrameAnimation;
}

interface NormalizedStyle extends BubbleStyle {
  readonly portrait?: NormalizedPortrait;
  readonly advanceIndicator?: NormalizedFrameAnimation;
}

interface FrameLoop {
  start(options?: Readonly<{ primed?: boolean }>): Promise<void>;
  stop(options?: Readonly<{ reset?: boolean }>): Promise<void>;
}

const validKinds = new Set<BubbleKind>(["say", "think"]);
const validAnimationModes = new Set<BubbleAnimationMode>([
  "idle",
  "talking",
  "awaiting-advance",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireExactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[],
  label: string,
): void {
  const allowed = new Set([...required, ...optional]);
  const missing = required.filter(
    (key) => !Object.prototype.hasOwnProperty.call(value, key),
  );
  const unknown = Object.keys(value).filter((key) => !allowed.has(key));
  if (missing.length > 0 || unknown.length > 0) {
    throw new BubbleCompositionError(
      "BUBBLE-COMPOSITION-001",
      `${label} has missing or unknown properties.`,
    );
  }
}

function requireName(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new BubbleCompositionError(
      "BUBBLE-COMPOSITION-001",
      `${label} must be a non-empty string.`,
    );
  }
  return value.trim();
}

function normalizeAnimation(
  value: unknown,
  label: string,
  minimumFrames: number,
): NormalizedFrameAnimation {
  if (!isRecord(value)) {
    throw new BubbleCompositionError(
      "BUBBLE-COMPOSITION-001",
      `${label} must be an object.`,
    );
  }
  requireExactKeys(value, ["frames", "frameIntervalSeconds"], [], label);
  if (!Array.isArray(value.frames) || value.frames.length < minimumFrames) {
    throw new BubbleCompositionError(
      "BUBBLE-COMPOSITION-001",
      `${label}.frames must contain at least ${minimumFrames} image asset name${minimumFrames === 1 ? "" : "s"}.`,
    );
  }
  const frames = Object.freeze(
    value.frames.map((frame, index) =>
      requireName(frame, `${label}.frames[${index}]`),
    ),
  );
  const interval = value.frameIntervalSeconds;
  if (
    typeof interval !== "number" ||
    !Number.isFinite(interval) ||
    interval <= 0
  ) {
    throw new BubbleCompositionError(
      "BUBBLE-COMPOSITION-001",
      `${label}.frameIntervalSeconds must be a positive finite number.`,
    );
  }
  return Object.freeze({ frames, frameIntervalSeconds: interval });
}

function normalizePortrait(value: unknown): NormalizedPortrait {
  if (!isRecord(value)) {
    throw new BubbleCompositionError(
      "BUBBLE-COMPOSITION-001",
      "Bubble portrait must be an object.",
    );
  }
  requireExactKeys(value, ["base"], ["blink", "talk"], "Bubble portrait");
  const blink =
    value.blink === undefined
      ? undefined
      : normalizeAnimation(value.blink, "Bubble portrait blink", 1);
  const talk =
    value.talk === undefined
      ? undefined
      : normalizeAnimation(value.talk, "Bubble portrait talk", 1);
  return Object.freeze({
    base: requireName(value.base, "Bubble portrait base"),
    ...(blink === undefined ? {} : { blink }),
    ...(talk === undefined ? {} : { talk }),
  });
}

function normalizeStyle(value: unknown): NormalizedStyle {
  if (!isRecord(value)) {
    throw new BubbleCompositionError(
      "BUBBLE-COMPOSITION-001",
      "Bubble style must be an object.",
    );
  }
  requireExactKeys(
    value,
    ["name", "textStyle"],
    [
      "placement",
      "distance",
      "tailLength",
      "offset",
      "visualStyle",
      "portrait",
      "advanceIndicator",
    ],
    "Bubble style",
  );
  const portrait =
    value.portrait === undefined
      ? undefined
      : normalizePortrait(value.portrait);
  const advanceIndicator =
    value.advanceIndicator === undefined
      ? undefined
      : normalizeAnimation(
          value.advanceIndicator,
          "Bubble advance indicator",
          2,
        );
  let placement: BubblePlacement;
  try {
    placement = normalizeBubblePlacement(
      value.placement ?? defaultBubblePlacementInput,
    );
  } catch (error) {
    throw new BubbleCompositionError(
      "BUBBLE-COMPOSITION-001",
      error instanceof Error ? error.message : "Bubble placement is invalid.",
    );
  }
  let distance: number;
  let tailLength: number;
  let offset: BubbleOffset;
  try {
    distance = normalizeBubbleDistance(value.distance ?? defaultBubbleDistance);
    tailLength = normalizeBubbleTailLength(
      value.tailLength ?? defaultBubbleTailLength,
    );
    offset =
      value.offset === undefined
        ? defaultBubbleOffset
        : normalizeBubbleOffset(value.offset);
  } catch (error) {
    throw new BubbleCompositionError(
      "BUBBLE-COMPOSITION-001",
      error instanceof Error
        ? error.message
        : "Bubble actor-relative transform is invalid.",
    );
  }
  const visualStyle = value.visualStyle ?? "NORMAL";
  if (
    typeof visualStyle !== "string" ||
    !bubbleVisualStyles.includes(visualStyle as BubbleVisualStyle)
  ) {
    throw new BubbleCompositionError(
      "BUBBLE-COMPOSITION-001",
      `Unsupported Bubble visual style: ${String(visualStyle)}`,
    );
  }
  return Object.freeze({
    name: requireName(value.name, "Bubble style name"),
    textStyle: requireName(value.textStyle, "Bubble text style name"),
    placement,
    distance,
    tailLength,
    offset,
    visualStyle: visualStyle as BubbleVisualStyle,
    ...(portrait === undefined ? {} : { portrait }),
    ...(advanceIndicator === undefined ? {} : { advanceIndicator }),
  });
}

function validateAssetManager(value: unknown): BubbleAssetManager {
  if (
    !isRecord(value) ||
    typeof value.applyToTarget !== "function" ||
    typeof value.getMimeType !== "function" ||
    typeof value.isRegistered !== "function"
  ) {
    throw new TypeError(
      "Bubble asset manager must provide applyToTarget, getMimeType, and isRegistered.",
    );
  }
  return value as unknown as BubbleAssetManager;
}

function validateSvgText(value: unknown): BubbleSvgText {
  if (
    !isRecord(value) ||
    typeof value.setText !== "function" ||
    typeof value.releaseTarget !== "function"
  ) {
    throw new TypeError(
      "Bubble SVG Text composition must provide setText and releaseTarget.",
    );
  }
  return value as unknown as BubbleSvgText;
}

function defaultScheduler(): BubbleScheduler {
  return Object.freeze({
    setTimeout: (callback: () => void, milliseconds: number) =>
      globalThis.setTimeout(callback, milliseconds),
    clearTimeout: (handle: unknown) =>
      globalThis.clearTimeout(handle as ReturnType<typeof setTimeout>),
  });
}

function validateScheduler(value: unknown): BubbleScheduler {
  if (
    !isRecord(value) ||
    typeof value.setTimeout !== "function" ||
    typeof value.clearTimeout !== "function"
  ) {
    throw new TypeError(
      "Bubble scheduler must provide setTimeout and clearTimeout.",
    );
  }
  return value as unknown as BubbleScheduler;
}

function validateAssetTarget(
  value: unknown,
  label: string,
): AssetManagerCompositionTarget {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    value.id.length === 0 ||
    typeof value.isStage !== "boolean"
  ) {
    throw new BubbleCompositionError(
      "BUBBLE-COMPOSITION-004",
      `${label} must provide id and isStage.`,
    );
  }
  return value as unknown as AssetManagerCompositionTarget;
}

function validateTextTarget(value: unknown): SvgTextTarget {
  if (
    !isRecord(value) ||
    typeof value.drawableID !== "number" ||
    !Number.isInteger(value.drawableID) ||
    value.drawableID < 0
  ) {
    throw new BubbleCompositionError(
      "BUBBLE-COMPOSITION-004",
      "Bubble text target must provide a non-negative integer drawableID.",
    );
  }
  return value as unknown as SvgTextTarget;
}

function validateSurface(
  value: unknown,
  style: NormalizedStyle,
): BubbleSurface {
  if (
    !isRecord(value) ||
    !isRecord(value.targets) ||
    typeof value.setLayerVisible !== "function" ||
    typeof value.show !== "function" ||
    typeof value.hide !== "function" ||
    typeof value.dispose !== "function"
  ) {
    throw new BubbleCompositionError(
      "BUBBLE-COMPOSITION-004",
      "Bubble surface is invalid.",
    );
  }
  const targets = value.targets;
  validateTextTarget(targets.text);
  const assetTargetIds = new Set<string>();
  const requireLayerTarget = (
    key: keyof Omit<BubbleSurfaceTargets, "text">,
    required: boolean,
  ): void => {
    const target = targets[key];
    if (!required && target === undefined) return;
    const validated = validateAssetTarget(target, `Bubble surface ${key}`);
    if (assetTargetIds.has(validated.id)) {
      throw new BubbleCompositionError(
        "BUBBLE-COMPOSITION-004",
        "Bubble image layers must use distinct target IDs.",
      );
    }
    assetTargetIds.add(validated.id);
  };
  requireLayerTarget("portraitBase", style.portrait !== undefined);
  requireLayerTarget("portraitBlink", style.portrait?.blink !== undefined);
  requireLayerTarget("portraitTalk", style.portrait?.talk !== undefined);
  requireLayerTarget("advanceIndicator", style.advanceIndicator !== undefined);
  return value as unknown as BubbleSurface;
}

function requireImageAsset(
  assetManager: BubbleAssetManager,
  name: string,
): void {
  if (!assetManager.isRegistered(name)) {
    throw new BubbleCompositionError(
      "BUBBLE-COMPOSITION-003",
      `Bubble image asset is not registered: ${name}`,
    );
  }
  const mimeType = assetManager.getMimeType(name);
  if (!mimeType.startsWith("image/")) {
    throw new BubbleCompositionError(
      "BUBBLE-COMPOSITION-003",
      `Bubble asset is not an image: ${name}`,
    );
  }
}

function styleAssetNames(style: NormalizedStyle): readonly string[] {
  return [
    ...(style.portrait === undefined
      ? []
      : [
          style.portrait.base,
          ...(style.portrait.blink?.frames ?? []),
          ...(style.portrait.talk?.frames ?? []),
        ]),
    ...(style.advanceIndicator?.frames ?? []),
  ];
}

function aggregateErrors(errors: unknown[], message: string): void {
  if (errors.length === 1) throw errors[0];
  if (errors.length > 1) throw new AggregateError(errors, message);
}

function createFrameLoop(options: {
  readonly actorKey: string;
  readonly layer: Exclude<BubbleLayer, "portraitBase">;
  readonly animation: NormalizedFrameAnimation;
  readonly target: AssetManagerCompositionTarget;
  readonly assetManager: BubbleAssetManager;
  readonly scheduler: BubbleScheduler;
  readonly onError?: BubbleCompositionOptions["onAnimationError"];
}): FrameLoop {
  let running = false;
  let generation = 0;
  let frameIndex = 0;
  let timer: unknown;
  let pending = Promise.resolve();

  const applyFrame = async (index: number): Promise<void> => {
    const assetName = options.animation.frames[index];
    if (assetName === undefined) return;
    await options.assetManager.applyToTarget(assetName, options.target);
  };

  const reportError = (error: unknown, assetName: string): void => {
    options.onError?.(
      error,
      Object.freeze({
        actorKey: options.actorKey,
        layer: options.layer,
        assetName,
      }),
    );
  };

  const schedule = (expectedGeneration: number): void => {
    timer = options.scheduler.setTimeout(() => {
      timer = undefined;
      if (!running || generation !== expectedGeneration) return;
      frameIndex = (frameIndex + 1) % options.animation.frames.length;
      const assetName = options.animation.frames[frameIndex];
      pending = pending
        .then(() => applyFrame(frameIndex))
        .catch((error: unknown) => {
          running = false;
          generation += 1;
          reportError(error, assetName ?? "");
        })
        .then(() => {
          if (running && generation === expectedGeneration) {
            schedule(expectedGeneration);
          }
        });
    }, options.animation.frameIntervalSeconds * 1000);
  };

  return Object.freeze({
    async start(
      startOptions: Readonly<{ primed?: boolean }> = {},
    ): Promise<void> {
      if (running) return;
      running = true;
      generation += 1;
      const expectedGeneration = generation;
      frameIndex = 0;
      if (!(startOptions.primed ?? false)) await applyFrame(frameIndex);
      if (!running || generation !== expectedGeneration) return;
      schedule(expectedGeneration);
    },
    async stop(stopOptions: Readonly<{ reset?: boolean }> = {}): Promise<void> {
      const wasRunning = running;
      running = false;
      generation += 1;
      if (timer !== undefined) options.scheduler.clearTimeout(timer);
      timer = undefined;
      await pending;
      if ((stopOptions.reset ?? false) && (wasRunning || frameIndex !== 0)) {
        frameIndex = 0;
        await applyFrame(frameIndex);
      }
    },
  });
}

function normalizeShowInput(value: unknown): Required<ShowBubbleInput> {
  if (!isRecord(value)) {
    throw new BubbleCompositionError(
      "BUBBLE-COMPOSITION-001",
      "Show bubble input must be an object.",
    );
  }
  requireExactKeys(
    value,
    ["actor", "actorKey", "kind", "text", "styleName"],
    ["animationMode"],
    "Show bubble input",
  );
  if (!validKinds.has(value.kind as BubbleKind)) {
    throw new BubbleCompositionError(
      "BUBBLE-COMPOSITION-001",
      "Bubble kind must be say or think.",
    );
  }
  if (typeof value.text !== "string") {
    throw new BubbleCompositionError(
      "BUBBLE-COMPOSITION-001",
      "Bubble text must be a string.",
    );
  }
  const animationMode = value.animationMode ?? "talking";
  if (!validAnimationModes.has(animationMode as BubbleAnimationMode)) {
    throw new BubbleCompositionError(
      "BUBBLE-COMPOSITION-001",
      "Bubble animation mode is invalid.",
    );
  }
  return {
    actor: value.actor,
    actorKey: requireName(value.actorKey, "Bubble actor key"),
    kind: value.kind as BubbleKind,
    text: value.text,
    styleName: requireName(value.styleName, "Bubble style name"),
    animationMode: animationMode as BubbleAnimationMode,
  };
}

export function createBubbleComposition(
  options: BubbleCompositionOptions,
): BubbleComposition {
  if (!isRecord(options)) {
    throw new TypeError("Bubble composition options must be an object.");
  }
  const assetManager = validateAssetManager(options.assetManager);
  const svgText = validateSvgText(options.svgText);
  if (typeof options.createSurface !== "function") {
    throw new TypeError("Bubble composition createSurface must be a function.");
  }
  if (
    options.onAnimationError !== undefined &&
    typeof options.onAnimationError !== "function"
  ) {
    throw new TypeError(
      "Bubble composition onAnimationError must be a function.",
    );
  }
  const scheduler = validateScheduler(options.scheduler ?? defaultScheduler());
  const styles = new Map<string, NormalizedStyle>();
  const active = new Map<string, BubbleHandle>();
  const actorQueues = new Map<string, Promise<unknown>>();
  let disposed = false;

  const ensureActive = (): void => {
    if (disposed) {
      throw new BubbleCompositionError(
        "BUBBLE-COMPOSITION-005",
        "Bubble composition has been disposed.",
      );
    }
  };

  const enqueueActor = async <T>(
    actorKey: string,
    operation: () => Promise<T>,
  ): Promise<T> => {
    const previous = actorQueues.get(actorKey) ?? Promise.resolve();
    const current = previous.catch(() => undefined).then(operation);
    actorQueues.set(actorKey, current);
    try {
      return await current;
    } finally {
      if (actorQueues.get(actorKey) === current) actorQueues.delete(actorKey);
    }
  };

  const showNow = async (
    input: Required<ShowBubbleInput>,
  ): Promise<BubbleHandle> => {
    ensureActive();
    const style = styles.get(input.styleName);
    if (!style) {
      throw new BubbleCompositionError(
        "BUBBLE-COMPOSITION-002",
        `Bubble style is not defined: ${input.styleName}`,
      );
    }
    for (const assetName of new Set(styleAssetNames(style))) {
      requireImageAsset(assetManager, assetName);
    }

    const previous = active.get(input.actorKey);
    if (previous) await previous.close();

    let surface: BubbleSurface | undefined;
    let textOwned = false;
    let surfaceVisible = false;
    let blinkLoop: FrameLoop | undefined;
    let talkLoop: FrameLoop | undefined;
    let indicatorLoop: FrameLoop | undefined;
    try {
      surface = validateSurface(
        await options.createSurface(
          Object.freeze({
            actor: input.actor,
            actorKey: input.actorKey,
            kind: input.kind,
            style,
          }),
        ),
        style,
      );
      svgText.setText({
        styleName: style.textStyle,
        target: surface.targets.text,
        text: input.text,
      });
      textOwned = true;

      const primeOperations: Array<Promise<void>> = [];
      if (style.portrait) {
        primeOperations.push(
          assetManager.applyToTarget(
            style.portrait.base,
            surface.targets.portraitBase as AssetManagerCompositionTarget,
          ),
        );
        const blinkFirst = style.portrait.blink?.frames[0];
        if (blinkFirst !== undefined) {
          primeOperations.push(
            assetManager.applyToTarget(
              blinkFirst,
              surface.targets.portraitBlink as AssetManagerCompositionTarget,
            ),
          );
        }
        const talkFirst = style.portrait.talk?.frames[0];
        if (talkFirst !== undefined) {
          primeOperations.push(
            assetManager.applyToTarget(
              talkFirst,
              surface.targets.portraitTalk as AssetManagerCompositionTarget,
            ),
          );
        }
      }
      const indicatorFirst = style.advanceIndicator?.frames[0];
      if (indicatorFirst !== undefined) {
        primeOperations.push(
          assetManager.applyToTarget(
            indicatorFirst,
            surface.targets.advanceIndicator as AssetManagerCompositionTarget,
          ),
        );
      }
      await Promise.all(primeOperations);

      blinkLoop =
        style.portrait?.blink === undefined
          ? undefined
          : createFrameLoop({
              actorKey: input.actorKey,
              layer: "portraitBlink",
              animation: style.portrait.blink,
              target: surface.targets
                .portraitBlink as AssetManagerCompositionTarget,
              assetManager,
              scheduler,
              ...(options.onAnimationError === undefined
                ? {}
                : { onError: options.onAnimationError }),
            });
      talkLoop =
        style.portrait?.talk === undefined
          ? undefined
          : createFrameLoop({
              actorKey: input.actorKey,
              layer: "portraitTalk",
              animation: style.portrait.talk,
              target: surface.targets
                .portraitTalk as AssetManagerCompositionTarget,
              assetManager,
              scheduler,
              ...(options.onAnimationError === undefined
                ? {}
                : { onError: options.onAnimationError }),
            });
      indicatorLoop =
        style.advanceIndicator === undefined
          ? undefined
          : createFrameLoop({
              actorKey: input.actorKey,
              layer: "advanceIndicator",
              animation: style.advanceIndicator,
              target: surface.targets
                .advanceIndicator as AssetManagerCompositionTarget,
              assetManager,
              scheduler,
              ...(options.onAnimationError === undefined
                ? {}
                : { onError: options.onAnimationError }),
            });

      let currentAnimationMode: BubbleAnimationMode = "idle";
      let closed = false;
      let transitionTail = Promise.resolve();

      const applyAnimationMode = async (
        mode: BubbleAnimationMode,
      ): Promise<void> => {
        if (mode === currentAnimationMode) return;
        if (mode === "talking") {
          await indicatorLoop?.stop();
          await surface?.setLayerVisible("advanceIndicator", false);
          await surface?.setLayerVisible(
            "portraitTalk",
            talkLoop !== undefined,
          );
          await talkLoop?.start({ primed: true });
        } else if (mode === "awaiting-advance") {
          await talkLoop?.stop({ reset: true });
          await surface?.setLayerVisible("portraitTalk", false);
          await surface?.setLayerVisible(
            "advanceIndicator",
            indicatorLoop !== undefined,
          );
          await indicatorLoop?.start({ primed: true });
        } else {
          await Promise.all([
            talkLoop?.stop({ reset: true }),
            indicatorLoop?.stop(),
          ]);
          await Promise.all([
            surface?.setLayerVisible("portraitTalk", false),
            surface?.setLayerVisible("advanceIndicator", false),
          ]);
        }
        currentAnimationMode = mode;
      };

      await Promise.all([
        surface.setLayerVisible("portraitBase", style.portrait !== undefined),
        surface.setLayerVisible(
          "portraitBlink",
          style.portrait?.blink !== undefined,
        ),
        surface.setLayerVisible("portraitTalk", false),
        surface.setLayerVisible("advanceIndicator", false),
      ]);
      await surface.show();
      surfaceVisible = true;
      await blinkLoop?.start({ primed: true });
      await applyAnimationMode(input.animationMode);

      const handle: BubbleHandle = Object.freeze({
        actorKey: input.actorKey,
        kind: input.kind,
        get animationMode(): BubbleAnimationMode {
          return currentAnimationMode;
        },
        setAnimationMode(mode: BubbleAnimationMode): Promise<void> {
          if (closed) {
            return Promise.reject(
              new BubbleCompositionError(
                "BUBBLE-COMPOSITION-005",
                `Bubble is already closed: ${input.actorKey}`,
              ),
            );
          }
          if (!validAnimationModes.has(mode)) {
            return Promise.reject(
              new BubbleCompositionError(
                "BUBBLE-COMPOSITION-001",
                "Bubble animation mode is invalid.",
              ),
            );
          }
          transitionTail = transitionTail.then(() => applyAnimationMode(mode));
          return transitionTail;
        },
        async close(): Promise<void> {
          if (closed) return;
          closed = true;
          const errors: unknown[] = [];
          try {
            await transitionTail;
          } catch (error) {
            errors.push(error);
          }
          for (const operation of [
            () => blinkLoop?.stop(),
            () => talkLoop?.stop(),
            () => indicatorLoop?.stop(),
            async () => {
              if (surfaceVisible) await surface?.hide();
            },
            async () => {
              if (textOwned && surface)
                svgText.releaseTarget(surface.targets.text);
            },
            async () => surface?.dispose(),
          ]) {
            try {
              await operation();
            } catch (error) {
              errors.push(error);
            }
          }
          if (active.get(input.actorKey) === handle) {
            active.delete(input.actorKey);
          }
          aggregateErrors(errors, `Failed to close bubble: ${input.actorKey}`);
        },
      });
      active.set(input.actorKey, handle);
      return handle;
    } catch (error) {
      const cleanupErrors: unknown[] = [];
      const loopResults = await Promise.allSettled([
        blinkLoop?.stop(),
        talkLoop?.stop(),
        indicatorLoop?.stop(),
      ]);
      cleanupErrors.push(
        ...loopResults.flatMap((result) =>
          result.status === "rejected" ? [result.reason] : [],
        ),
      );
      if (surfaceVisible && surface) {
        try {
          await surface.hide();
        } catch (cleanupError) {
          cleanupErrors.push(cleanupError);
        }
      }
      if (textOwned && surface) {
        try {
          svgText.releaseTarget(surface.targets.text);
        } catch (cleanupError) {
          cleanupErrors.push(cleanupError);
        }
      }
      if (surface) {
        try {
          await surface.dispose();
        } catch (cleanupError) {
          cleanupErrors.push(cleanupError);
        }
      }
      if (cleanupErrors.length > 0) {
        throw new AggregateError(
          [error, ...cleanupErrors],
          `Failed to show and clean up bubble: ${input.actorKey}`,
          { cause: error },
        );
      }
      throw error;
    }
  };

  return Object.freeze({
    defineStyle(input: BubbleStyleInput): void {
      ensureActive();
      const style = normalizeStyle(input);
      styles.set(style.name, style);
    },
    hasActiveBubble(actorKey: unknown): boolean {
      return active.has(requireName(actorKey, "Bubble actor key"));
    },
    async show(input: ShowBubbleInput): Promise<BubbleHandle> {
      ensureActive();
      const normalized = normalizeShowInput(input);
      return enqueueActor(normalized.actorKey, () => showNow(normalized));
    },
    releaseTarget(actorKey: unknown): Promise<void> {
      ensureActive();
      const normalized = requireName(actorKey, "Bubble actor key");
      return enqueueActor(normalized, async () => {
        await active.get(normalized)?.close();
      });
    },
    async releaseAll(): Promise<void> {
      ensureActive();
      await Promise.allSettled([...actorQueues.values()]);
      const results = await Promise.allSettled(
        [...active.values()].map((handle) => handle.close()),
      );
      aggregateErrors(
        results.flatMap((result) =>
          result.status === "rejected" ? [result.reason] : [],
        ),
        "Failed to release all bubbles",
      );
    },
    async dispose(): Promise<void> {
      if (disposed) return;
      disposed = true;
      await Promise.allSettled([...actorQueues.values()]);
      const results = await Promise.allSettled(
        [...active.values()].map((handle) => handle.close()),
      );
      styles.clear();
      aggregateErrors(
        results.flatMap((result) =>
          result.status === "rejected" ? [result.reason] : [],
        ),
        "Failed to dispose bubble composition",
      );
    },
  });
}
