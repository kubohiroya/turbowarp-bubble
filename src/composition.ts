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
import { wrapText } from "./text-layout.js";

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
export type BubbleAnimationMode = "idle" | "talking" | "awaiting-continue";
export type BubbleLayer =
  "portraitBase" | "portraitBlink" | "portraitLipSync" | "continueIndicator";

export interface BubbleFrameAnimationInput {
  readonly frames: ReadonlyArray<string>;
  readonly frameIntervalSeconds: number;
}

export interface BubblePortraitInput {
  readonly base: string;
  readonly blink?: BubbleFrameAnimationInput;
  readonly lipSync?: BubbleFrameAnimationInput;
}

export interface BubbleStyleInput {
  readonly name: string;
  readonly textStyle: string;
  readonly maxWidth?: number;
  readonly textLocale?: string;
  readonly placement?: BubblePlacementInput;
  readonly distance?: number;
  readonly tailLength?: number;
  readonly offset?: BubbleOffsetInput;
  readonly visualStyle?: BubbleVisualStyle;
  readonly portrait?: BubblePortraitInput;
  readonly continueIndicator?: BubbleFrameAnimationInput;
}

export interface BubbleFrameAnimation {
  readonly frames: ReadonlyArray<string>;
  readonly frameIntervalSeconds: number;
}

export interface BubblePortrait {
  readonly base: string;
  readonly blink?: BubbleFrameAnimation;
  readonly lipSync?: BubbleFrameAnimation;
}

export interface BubbleStyle {
  readonly name: string;
  readonly textStyle: string;
  readonly maxWidth?: number;
  readonly textLocale?: string;
  readonly placement: BubblePlacement;
  readonly distance: number;
  readonly tailLength: number;
  readonly offset: BubbleOffset;
  readonly visualStyle: BubbleVisualStyle;
  readonly portrait?: BubblePortrait;
  readonly continueIndicator?: BubbleFrameAnimation;
}

export interface BubbleAssetTarget {
  readonly id: string;
  readonly isStage: boolean;
}

export interface BubbleImageCapability {
  readonly applyToTarget: (
    name: unknown,
    target: BubbleAssetTarget,
  ) => void | Promise<void>;
  readonly getMimeType: (name: unknown) => string;
  readonly isRegistered: (name: unknown) => boolean;
}

export interface BubbleAudioCapability {
  readonly playSound: (
    name: unknown,
    options?: Readonly<{ untilDone?: boolean }>,
  ) => Promise<void>;
}

export interface BubbleTextTarget {
  readonly drawableID: number;
}

export interface BubbleSvgText {
  readonly setText: (input: {
    readonly styleName: string;
    readonly target: BubbleTextTarget;
    readonly text: string;
  }) => void;
  readonly releaseTarget: (target: BubbleTextTarget) => void;
  readonly measureText?: (input: {
    readonly styleName: string;
    readonly text: string;
  }) => number;
}

export interface BubbleSurfaceTargets {
  readonly text: BubbleTextTarget;
  readonly portraitBase?: BubbleAssetTarget;
  readonly portraitBlink?: BubbleAssetTarget;
  readonly portraitLipSync?: BubbleAssetTarget;
  readonly continueIndicator?: BubbleAssetTarget;
}

export interface BubbleSurface {
  readonly targets: BubbleSurfaceTargets;
  setLayerVisible(layer: BubbleLayer, visible: boolean): void | Promise<void>;
  updateStyle(style: BubbleStyle): void | Promise<void>;
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
  readonly imageResolver?: BubbleImageCapability;
  readonly audio?: BubbleAudioCapability;
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
  setText(text: string): Promise<void>;
  updateStyle(style: BubbleStyleInput): Promise<void>;
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
  | "BUBBLE-COMPOSITION-005"
  | "BUBBLE-COMPOSITION-006"
  | "BUBBLE-COMPOSITION-007";

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
  readonly lipSync?: NormalizedFrameAnimation;
}

interface NormalizedStyle extends BubbleStyle {
  readonly portrait?: NormalizedPortrait;
  readonly continueIndicator?: NormalizedFrameAnimation;
}

interface FrameLoop {
  start(options?: Readonly<{ primed?: boolean }>): Promise<void>;
  stop(options?: Readonly<{ reset?: boolean }>): Promise<void>;
}

const validKinds = new Set<BubbleKind>(["say", "think"]);
const validAnimationModes = new Set<BubbleAnimationMode>([
  "idle",
  "talking",
  "awaiting-continue",
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
  requireExactKeys(value, ["base"], ["blink", "lipSync"], "Bubble portrait");
  const blink =
    value.blink === undefined
      ? undefined
      : normalizeAnimation(value.blink, "Bubble portrait blink", 1);
  const lipSync =
    value.lipSync === undefined
      ? undefined
      : normalizeAnimation(value.lipSync, "Bubble portrait lip-sync", 1);
  return Object.freeze({
    base: requireName(value.base, "Bubble portrait base"),
    ...(blink === undefined ? {} : { blink }),
    ...(lipSync === undefined ? {} : { lipSync }),
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
      "maxWidth",
      "textLocale",
      "distance",
      "tailLength",
      "offset",
      "visualStyle",
      "portrait",
      "continueIndicator",
    ],
    "Bubble style",
  );
  const portrait =
    value.portrait === undefined
      ? undefined
      : normalizePortrait(value.portrait);
  const continueIndicator =
    value.continueIndicator === undefined
      ? undefined
      : normalizeAnimation(
          value.continueIndicator,
          "Bubble continue indicator",
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
  let maxWidth: number | undefined;
  if (value.maxWidth !== undefined) {
    if (
      typeof value.maxWidth !== "number" ||
      !Number.isFinite(value.maxWidth) ||
      value.maxWidth <= 0
    ) {
      throw new BubbleCompositionError(
        "BUBBLE-COMPOSITION-001",
        "Bubble style maxWidth must be a positive finite number.",
      );
    }
    maxWidth = value.maxWidth;
  }
  const textLocale =
    value.textLocale === undefined
      ? undefined
      : requireName(value.textLocale, "Bubble style text locale");
  return Object.freeze({
    name: requireName(value.name, "Bubble style name"),
    textStyle: requireName(value.textStyle, "Bubble text style name"),
    ...(maxWidth === undefined ? {} : { maxWidth }),
    ...(textLocale === undefined ? {} : { textLocale }),
    placement,
    distance,
    tailLength,
    offset,
    visualStyle: visualStyle as BubbleVisualStyle,
    ...(portrait === undefined ? {} : { portrait }),
    ...(continueIndicator === undefined ? {} : { continueIndicator }),
  });
}

function validateImageResolver(
  value: unknown,
): BubbleImageCapability | undefined {
  if (value === undefined) return undefined;
  if (
    !isRecord(value) ||
    typeof value.applyToTarget !== "function" ||
    typeof value.getMimeType !== "function" ||
    typeof value.isRegistered !== "function"
  ) {
    throw new TypeError(
      "Bubble image capability must provide applyToTarget, getMimeType, and isRegistered.",
    );
  }
  return value as unknown as BubbleImageCapability;
}

function requireImageResolver(
  value: BubbleImageCapability | undefined,
): BubbleImageCapability {
  if (value === undefined) {
    throw new BubbleCompositionError(
      "BUBBLE-COMPOSITION-006",
      "Bubble image assets require an image capability. Provide options.imageResolver.",
    );
  }
  return value;
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

function validateAssetTarget(value: unknown, label: string): BubbleAssetTarget {
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
  return value as unknown as BubbleAssetTarget;
}

function validateTextTarget(value: unknown): BubbleTextTarget {
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
  return value as unknown as BubbleTextTarget;
}

function validateSurface(
  value: unknown,
  style: NormalizedStyle,
): BubbleSurface {
  if (
    !isRecord(value) ||
    !isRecord(value.targets) ||
    typeof value.setLayerVisible !== "function" ||
    typeof value.updateStyle !== "function" ||
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
  requireLayerTarget("portraitLipSync", style.portrait?.lipSync !== undefined);
  requireLayerTarget(
    "continueIndicator",
    style.continueIndicator !== undefined,
  );
  return value as unknown as BubbleSurface;
}

function requireImageAsset(
  imageResolver: BubbleImageCapability | undefined,
  name: string,
): void {
  if (imageResolver === undefined) {
    throw new BubbleCompositionError(
      "BUBBLE-COMPOSITION-006",
      `Bubble image capability is required for: ${name}. Provide options.imageResolver.`,
    );
  }
  if (!imageResolver.isRegistered(name)) {
    throw new BubbleCompositionError(
      "BUBBLE-COMPOSITION-003",
      `Bubble image asset is not registered: ${name}`,
    );
  }
  const mimeType = imageResolver.getMimeType(name);
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
          ...(style.portrait.lipSync?.frames ?? []),
        ]),
    ...(style.continueIndicator?.frames ?? []),
  ];
}

function formatBubbleText(
  text: string,
  style: BubbleStyle,
  textCapability: BubbleSvgText,
): string {
  if (style.maxWidth === undefined) return text;
  if (typeof textCapability.measureText !== "function") {
    throw new BubbleCompositionError(
      "BUBBLE-COMPOSITION-007",
      "Bubble style maxWidth requires the text capability measureText method.",
    );
  }
  const layout = wrapText({
    text,
    maxWidth: style.maxWidth,
    ...(style.textLocale === undefined ? {} : { locale: style.textLocale }),
    measureText: (candidate) =>
      textCapability.measureText?.({
        styleName: style.textStyle,
        text: candidate,
      }) ?? 0,
  });
  return layout.lines.map(({ text: line }) => line).join("\n");
}

function aggregateErrors(errors: unknown[], message: string): void {
  if (errors.length === 1) throw errors[0];
  if (errors.length > 1) throw new AggregateError(errors, message);
}

function createFrameLoop(options: {
  readonly actorKey: string;
  readonly layer: Exclude<BubbleLayer, "portraitBase">;
  readonly animation: NormalizedFrameAnimation;
  readonly target: BubbleAssetTarget;
  readonly imageResolver: BubbleImageCapability;
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
    await options.imageResolver.applyToTarget(assetName, options.target);
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
  const imageResolver = validateImageResolver(options.imageResolver);
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
    let activeStyle = style;
    let currentText = input.text;
    const resolveStyleImageCapability = (
      nextStyle: BubbleStyle,
    ): BubbleImageCapability | undefined => {
      const assetNames = new Set(styleAssetNames(nextStyle));
      const nextImageResolver =
        assetNames.size === 0 ? undefined : requireImageResolver(imageResolver);
      for (const assetName of assetNames) {
        requireImageAsset(nextImageResolver, assetName);
      }
      return nextImageResolver;
    };
    const styleImageResolver = resolveStyleImageCapability(activeStyle);

    const primeStyleImages = async (
      nextStyle: BubbleStyle,
      nextImageResolver: BubbleImageCapability | undefined,
      nextSurface: BubbleSurface,
    ): Promise<void> => {
      const imageCapability =
        styleAssetNames(nextStyle).length === 0
          ? undefined
          : requireImageResolver(nextImageResolver);
      const operations: Array<Promise<void>> = [];
      if (nextStyle.portrait) {
        const capability = requireImageResolver(imageCapability);
        operations.push(
          Promise.resolve(
            capability.applyToTarget(
              nextStyle.portrait.base,
              nextSurface.targets.portraitBase as BubbleAssetTarget,
            ),
          ),
        );
        const blinkFirst = nextStyle.portrait.blink?.frames[0];
        if (blinkFirst !== undefined) {
          operations.push(
            Promise.resolve(
              capability.applyToTarget(
                blinkFirst,
                nextSurface.targets.portraitBlink as BubbleAssetTarget,
              ),
            ),
          );
        }
        const lipSyncFirst = nextStyle.portrait.lipSync?.frames[0];
        if (lipSyncFirst !== undefined) {
          operations.push(
            Promise.resolve(
              capability.applyToTarget(
                lipSyncFirst,
                nextSurface.targets.portraitLipSync as BubbleAssetTarget,
              ),
            ),
          );
        }
      }
      const continueFirst = nextStyle.continueIndicator?.frames[0];
      if (continueFirst !== undefined) {
        const capability = requireImageResolver(imageCapability);
        operations.push(
          Promise.resolve(
            capability.applyToTarget(
              continueFirst,
              nextSurface.targets.continueIndicator as BubbleAssetTarget,
            ),
          ),
        );
      }
      await Promise.all(operations);
    };

    const createStyleLoops = (
      nextStyle: BubbleStyle,
      nextImageResolver: BubbleImageCapability | undefined,
      nextSurface: BubbleSurface,
    ): void => {
      blinkLoop =
        nextStyle.portrait?.blink === undefined
          ? undefined
          : createFrameLoop({
              actorKey: input.actorKey,
              layer: "portraitBlink",
              animation: nextStyle.portrait.blink,
              target: nextSurface.targets.portraitBlink as BubbleAssetTarget,
              imageResolver: requireImageResolver(nextImageResolver),
              scheduler,
              ...(options.onAnimationError === undefined
                ? {}
                : { onError: options.onAnimationError }),
            });
      lipSyncLoop =
        nextStyle.portrait?.lipSync === undefined
          ? undefined
          : createFrameLoop({
              actorKey: input.actorKey,
              layer: "portraitLipSync",
              animation: nextStyle.portrait.lipSync,
              target: nextSurface.targets.portraitLipSync as BubbleAssetTarget,
              imageResolver: requireImageResolver(nextImageResolver),
              scheduler,
              ...(options.onAnimationError === undefined
                ? {}
                : { onError: options.onAnimationError }),
            });
      indicatorLoop =
        nextStyle.continueIndicator === undefined
          ? undefined
          : createFrameLoop({
              actorKey: input.actorKey,
              layer: "continueIndicator",
              animation: nextStyle.continueIndicator,
              target: nextSurface.targets
                .continueIndicator as BubbleAssetTarget,
              imageResolver: requireImageResolver(nextImageResolver),
              scheduler,
              ...(options.onAnimationError === undefined
                ? {}
                : { onError: options.onAnimationError }),
            });
    };

    const previous = active.get(input.actorKey);
    if (previous) await previous.close();

    let surface: BubbleSurface | undefined;
    let textOwned = false;
    let surfaceVisible = false;
    let blinkLoop: FrameLoop | undefined;
    let lipSyncLoop: FrameLoop | undefined;
    let indicatorLoop: FrameLoop | undefined;
    try {
      surface = validateSurface(
        await options.createSurface(
          Object.freeze({
            actor: input.actor,
            actorKey: input.actorKey,
            kind: input.kind,
            style: activeStyle,
          }),
        ),
        activeStyle,
      );
      svgText.setText({
        styleName: activeStyle.textStyle,
        target: surface.targets.text,
        text: formatBubbleText(input.text, activeStyle, svgText),
      });
      textOwned = true;

      await primeStyleImages(activeStyle, styleImageResolver, surface);
      createStyleLoops(activeStyle, styleImageResolver, surface);

      let currentAnimationMode: BubbleAnimationMode = "idle";
      let closed = false;
      let transitionTail = Promise.resolve();

      const applyAnimationMode = async (
        mode: BubbleAnimationMode,
      ): Promise<void> => {
        if (mode === currentAnimationMode) return;
        if (mode === "talking") {
          await indicatorLoop?.stop();
          await surface?.setLayerVisible("continueIndicator", false);
          await surface?.setLayerVisible(
            "portraitLipSync",
            lipSyncLoop !== undefined,
          );
          await lipSyncLoop?.start({ primed: true });
        } else if (mode === "awaiting-continue") {
          await lipSyncLoop?.stop({ reset: true });
          await surface?.setLayerVisible("portraitLipSync", false);
          await surface?.setLayerVisible(
            "continueIndicator",
            indicatorLoop !== undefined,
          );
          await indicatorLoop?.start({ primed: true });
        } else {
          await Promise.all([
            lipSyncLoop?.stop({ reset: true }),
            indicatorLoop?.stop(),
          ]);
          await Promise.all([
            surface?.setLayerVisible("portraitLipSync", false),
            surface?.setLayerVisible("continueIndicator", false),
          ]);
        }
        currentAnimationMode = mode;
      };

      await Promise.all([
        surface.setLayerVisible(
          "portraitBase",
          activeStyle.portrait !== undefined,
        ),
        surface.setLayerVisible(
          "portraitBlink",
          activeStyle.portrait?.blink !== undefined,
        ),
        surface.setLayerVisible("portraitLipSync", false),
        surface.setLayerVisible("continueIndicator", false),
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
        setText(text: string): Promise<void> {
          if (closed) {
            return Promise.reject(
              new BubbleCompositionError(
                "BUBBLE-COMPOSITION-005",
                `Bubble is already closed: ${input.actorKey}`,
              ),
            );
          }
          if (typeof text !== "string") {
            return Promise.reject(
              new BubbleCompositionError(
                "BUBBLE-COMPOSITION-001",
                "Bubble text must be a string.",
              ),
            );
          }
          transitionTail = transitionTail.then(async () => {
            if (!surface) return;
            svgText.setText({
              styleName: activeStyle.textStyle,
              target: surface.targets.text,
              text: formatBubbleText(text, activeStyle, svgText),
            });
            currentText = text;
            await surface.show();
          });
          return transitionTail;
        },
        updateStyle(styleInput: BubbleStyleInput): Promise<void> {
          if (closed) {
            return Promise.reject(
              new BubbleCompositionError(
                "BUBBLE-COMPOSITION-005",
                `Bubble is already closed: ${input.actorKey}`,
              ),
            );
          }
          let nextStyle: NormalizedStyle;
          try {
            nextStyle = normalizeStyle(styleInput);
          } catch (error) {
            return Promise.reject(error);
          }
          transitionTail = transitionTail.then(async () => {
            if (!surface) return;
            validateSurface(surface, nextStyle);
            const nextImageResolver = resolveStyleImageCapability(nextStyle);
            await Promise.all([
              blinkLoop?.stop(),
              lipSyncLoop?.stop(),
              indicatorLoop?.stop(),
            ]);
            await primeStyleImages(nextStyle, nextImageResolver, surface);
            await surface.updateStyle(nextStyle);
            activeStyle = nextStyle;
            svgText.setText({
              styleName: nextStyle.textStyle,
              target: surface.targets.text,
              text: formatBubbleText(currentText, nextStyle, svgText),
            });
            createStyleLoops(nextStyle, nextImageResolver, surface);
            await Promise.all([
              surface.setLayerVisible(
                "portraitBase",
                nextStyle.portrait !== undefined,
              ),
              surface.setLayerVisible(
                "portraitBlink",
                nextStyle.portrait?.blink !== undefined,
              ),
              surface.setLayerVisible("portraitLipSync", false),
              surface.setLayerVisible("continueIndicator", false),
            ]);
            const previousMode = currentAnimationMode;
            currentAnimationMode = "idle";
            await blinkLoop?.start({ primed: true });
            await applyAnimationMode(previousMode);
            await surface.show();
          });
          return transitionTail;
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
            () => lipSyncLoop?.stop(),
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
        lipSyncLoop?.stop(),
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
