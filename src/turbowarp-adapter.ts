import {
  createBubbleComposition,
  defaultBubbleTailLength,
  type BubbleComposition,
  type BubbleCompositionOptions,
  type BubbleAudioCapability,
  type BubbleImageCapability,
  type BubbleLayer,
  type BubbleMotionInput,
  type BubbleScheduler,
  type BubbleTextCapability,
  type BubbleStyle,
  type BubbleSurface,
  type BubbleSurfaceTargets,
  type BubbleVisualStyle,
} from "./composition.js";
import {
  createTurboWarpSvgTextCapability,
  type TurboWarpSvgTextExtension,
} from "./turbowarp-svg-text-adapter.js";

export {
  createSvgTextCompositionCapability,
  createTurboWarpSvgTextCapability,
  type TurboWarpSvgTextExtension,
} from "./turbowarp-svg-text-adapter.js";
import { actorRelativeBubbleCenter } from "./actor-transform.js";
import { bubbleBodyCenterOffset, renderBubbleSvg } from "./bubble-svg.js";
import {
  bubbleDirectionVector,
  type BubbleDirectionName,
} from "./placement.js";

const spriteLayer = "sprite";
const portraitBoxSize = 96;
const indicatorBoxSize = 18;
const contentGap = 8;
const bubblePadding = 24;
const stageSafeMargin = 16;
let surfaceSequence = 0;

export interface TurboWarpBubbleTarget {
  readonly id: string;
  readonly isStage: boolean;
  readonly drawableID?: number | null;
  readonly visible?: boolean;
  readonly x?: number;
  readonly y?: number;
  getBoundsForBubble?(): {
    readonly bottom: number;
    readonly left: number;
    readonly right: number;
    readonly top: number;
  };
  onTargetVisualChange?: ((target?: TurboWarpBubbleTarget) => void) | null;
}

export interface TurboWarpBubbleRenderer {
  createSVGSkin(svg: string): number;
  createDrawable(layerGroup: string): number;
  destroyDrawable(drawableId: number, layerGroup: string): void;
  destroySkin(skinId: number): void;
  getCurrentSkinSize(drawableId: number): unknown;
  getNativeSize(): unknown;
  updateDrawablePosition(drawableId: number, position: [number, number]): void;
  updateDrawableScale(drawableId: number, scale: [number, number]): void;
  updateDrawableSkinId(drawableId: number, skinId: number): void;
  updateDrawableVisible(drawableId: number, visible: boolean): void;
  /** Scratch/TurboWarp's ghost effect is used to implement fade motions. */
  updateDrawableEffect?(
    drawableId: number,
    effectName: string,
    value: number,
  ): void;
  setDrawableOrder?(
    drawableId: number,
    order: number,
    layerGroup: string,
    relative?: boolean,
  ): void;
}

export interface TurboWarpAssetManagerExtension {
  isLoaded(args: Readonly<{ NAME: unknown }>): boolean;
  getAssetMimeType(args: Readonly<{ NAME: unknown }>): string;
  playSound?(args: Readonly<{ NAME: unknown }>): Promise<void>;
  playSoundUntilDone?(args: Readonly<{ NAME: unknown }>): Promise<void>;
  resolveSkin(
    value: unknown,
  ): Readonly<{ skinId: number }> | Promise<Readonly<{ skinId: number }>>;
}

export interface TurboWarpBubbleRuntime {
  readonly renderer: TurboWarpBubbleRenderer;
  readonly ext_kubohiroyaassetmanager?: TurboWarpAssetManagerExtension;
  readonly ext_kubohiroyasvgtext?: TurboWarpSvgTextExtension;
  requestRedraw?(): void;
}

export interface TurboWarpBubbleCompositionOptions {
  readonly imageResolver?: BubbleImageCapability;
  readonly audio?: BubbleAudioCapability;
  readonly textCapability?: BubbleTextCapability;
  readonly scheduler?: BubbleScheduler;
  readonly onAnimationError?: BubbleCompositionOptions["onAnimationError"];
}

export type BubbleRuntimeAdapterErrorCode =
  "BUBBLE-RUNTIME-001" | "BUBBLE-RUNTIME-002" | "BUBBLE-RUNTIME-003";

export class BubbleRuntimeAdapterError extends Error {
  public readonly code: BubbleRuntimeAdapterErrorCode;

  public constructor(code: BubbleRuntimeAdapterErrorCode, message: string) {
    super(message);
    this.name = "BubbleRuntimeAdapterError";
    this.code = code;
  }
}

interface DrawableTarget extends TurboWarpBubbleTarget {
  readonly drawableID: number;
}

interface DrawableSize {
  readonly height: number;
  readonly width: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRenderer(value: unknown): TurboWarpBubbleRenderer {
  if (!isRecord(value)) {
    throw new BubbleRuntimeAdapterError(
      "BUBBLE-RUNTIME-001",
      "Bubble requires the TurboWarp renderer.",
    );
  }
  const methods = [
    "createSVGSkin",
    "createDrawable",
    "destroyDrawable",
    "destroySkin",
    "getCurrentSkinSize",
    "getNativeSize",
    "updateDrawablePosition",
    "updateDrawableScale",
    "updateDrawableSkinId",
    "updateDrawableVisible",
  ];
  if (methods.some((method) => typeof value[method] !== "function")) {
    throw new BubbleRuntimeAdapterError(
      "BUBBLE-RUNTIME-001",
      `Bubble renderer must provide ${methods.join(", ")}.`,
    );
  }
  return value as unknown as TurboWarpBubbleRenderer;
}

function requireAssetManager(value: unknown): TurboWarpAssetManagerExtension {
  if (
    !isRecord(value) ||
    typeof value.isLoaded !== "function" ||
    typeof value.getAssetMimeType !== "function" ||
    typeof value.resolveSkin !== "function"
  ) {
    throw new BubbleRuntimeAdapterError(
      "BUBBLE-RUNTIME-002",
      "Bubble image assets require an imageResolver capability. Load @kubohiroya/turbowarp-asset-manager or provide options.imageResolver before using image features.",
    );
  }
  return value as unknown as TurboWarpAssetManagerExtension;
}

function targetBounds(target: TurboWarpBubbleTarget) {
  try {
    const bounds = target.getBoundsForBubble?.();
    if (
      bounds &&
      [bounds.bottom, bounds.left, bounds.right, bounds.top].every((value) =>
        Number.isFinite(value),
      )
    ) {
      return bounds;
    }
  } catch {
    // Fall back to the target position when the VM cannot calculate bounds.
  }
  const x = Number.isFinite(target.x) ? Number(target.x) : 0;
  const y = Number.isFinite(target.y) ? Number(target.y) : 0;
  return { bottom: y, left: x, right: x, top: y };
}

function readSize(
  renderer: TurboWarpBubbleRenderer,
  target: DrawableTarget,
  fallback: DrawableSize,
): DrawableSize {
  const raw = renderer.getCurrentSkinSize(target.drawableID);
  if (!Array.isArray(raw) || raw.length < 2) return fallback;
  const width = Number(raw[0]);
  const height = Number(raw[1]);
  if (!(width > 0) || !(height > 0)) return fallback;
  return { width, height };
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function easeProgress(value: number, ease: BubbleMotionInput["ease"]): number {
  const progress = clamp01(value);
  switch (ease) {
    case "linear":
      return progress;
    case "easeIn":
      return progress * progress;
    case "easeOut":
      return 1 - (1 - progress) * (1 - progress);
    case "easeInOut": {
      return progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    }
    default:
      return progress;
  }
}

/**
 * Drives a motion with the same scheduler used by frame loops and reveal.
 * The adapter intentionally does not depend on requestAnimationFrame so a
 * host can provide deterministic time in tests and non-browser runtimes.
 */
function runMotionTimeline(
  scheduler: BubbleScheduler,
  durationSeconds: number,
  onFrame: (progress: number) => void,
): Promise<void> {
  const durationMilliseconds = Math.max(0, durationSeconds * 1000);
  if (durationMilliseconds === 0) {
    onFrame(1);
    return Promise.resolve();
  }
  return new Promise<void>((resolve, reject) => {
    let elapsed = 0;
    let timer: unknown;
    const tick = (): void => {
      const step = Math.min(16, durationMilliseconds - elapsed);
      elapsed += step;
      try {
        onFrame(clamp01(elapsed / durationMilliseconds));
      } catch (error) {
        if (timer !== undefined) scheduler.clearTimeout(timer);
        reject(error);
        return;
      }
      if (elapsed >= durationMilliseconds) {
        resolve();
        return;
      }
      timer = scheduler.setTimeout(
        tick,
        Math.min(16, durationMilliseconds - elapsed),
      );
    };
    timer = scheduler.setTimeout(tick, Math.min(16, durationMilliseconds));
  });
}

function fitDrawable(
  renderer: TurboWarpBubbleRenderer,
  target: DrawableTarget,
  boxSize: number,
  scaleMultiplier = 1,
): DrawableSize {
  const native = readSize(renderer, target, {
    width: boxSize,
    height: boxSize,
  });
  const scale = Math.min(boxSize / native.width, boxSize / native.height);
  const effectiveScale = scale * scaleMultiplier;
  renderer.updateDrawableScale(target.drawableID, [
    effectiveScale * 100,
    effectiveScale * 100,
  ]);
  return {
    width: native.width * effectiveScale,
    height: native.height * effectiveScale,
  };
}

function clamp(value: number, minimum: number, maximum: number): number {
  if (maximum < minimum) return (minimum + maximum) / 2;
  return Math.min(maximum, Math.max(minimum, value));
}

function expandSvgViewport(
  svg: string,
  width: number,
  height: number,
  extraX: number,
  extraY: number,
): string {
  const expandedWidth = width + extraX * 2;
  const expandedHeight = height + extraY * 2;
  return svg.replace(/<svg\b[^>]*>/u, (root) =>
    root
      .replace(/\bwidth="[^"]*"/u, `width="${expandedWidth}"`)
      .replace(/\bheight="[^"]*"/u, `height="${expandedHeight}"`)
      .replace(
        /\bviewBox="[^"]*"/u,
        `viewBox="${-extraX} ${-extraY} ${expandedWidth} ${expandedHeight}"`,
      ),
  );
}

function tailDirectionForPlacement(
  direction: BubbleDirectionName | number,
): number {
  const vector = bubbleDirectionVector(direction);
  const degrees = (Math.atan2(-vector.x, -vector.y) * 180) / Math.PI;
  return ((degrees % 360) + 360) % 360;
}

function createSurface(
  runtime: TurboWarpBubbleRuntime,
  actor: TurboWarpBubbleTarget,
  actorKey: string,
  style: BubbleStyle,
  scheduler: BubbleScheduler,
): BubbleSurface {
  const renderer = runtime.renderer;
  const sequence = surfaceSequence;
  surfaceSequence += 1;
  const drawables: DrawableTarget[] = [];
  let bodySkinId: number | undefined;

  const createTarget = (layer: string): DrawableTarget => {
    const drawableID = renderer.createDrawable(spriteLayer);
    if (!Number.isInteger(drawableID) || drawableID < 0) {
      throw new BubbleRuntimeAdapterError(
        "BUBBLE-RUNTIME-001",
        `TurboWarp did not create the Bubble ${layer} drawable.`,
      );
    }
    const target = Object.freeze({
      id: `bubble:${actorKey}:${sequence}:${layer}`,
      isStage: false,
      drawableID,
    });
    drawables.push(target);
    renderer.updateDrawableVisible(drawableID, false);
    renderer.setDrawableOrder?.(drawableID, Infinity, spriteLayer);
    return target;
  };

  try {
    const body = createTarget("body");
    const portraitBase = style.portrait
      ? createTarget("portrait-base")
      : undefined;
    const portraitBlink = style.portrait?.blink
      ? createTarget("portrait-blink")
      : undefined;
    const portraitLipSync = style.portrait?.lipSync
      ? createTarget("portrait-lip-sync")
      : undefined;
    const text = createTarget("text");
    const continueIndicator = style.continueIndicator
      ? createTarget("continue-indicator")
      : undefined;
    const targets: BubbleSurfaceTargets = Object.freeze({
      text,
      ...(portraitBase ? { portraitBase } : {}),
      ...(portraitBlink ? { portraitBlink } : {}),
      ...(portraitLipSync ? { portraitLipSync } : {}),
      ...(continueIndicator ? { continueIndicator } : {}),
    });
    const layerTargets = new Map<BubbleLayer, DrawableTarget>();
    if (portraitBase) layerTargets.set("portraitBase", portraitBase);
    if (portraitBlink) layerTargets.set("portraitBlink", portraitBlink);
    if (portraitLipSync) layerTargets.set("portraitLipSync", portraitLipSync);
    if (continueIndicator) {
      layerTargets.set("continueIndicator", continueIndicator);
    }
    const layerVisibility = new Map<BubbleLayer, boolean>();
    let surfaceVisible = false;
    let disposed = false;
    let cachedBodySkinSignature = "";
    let currentStyle = style;
    let reservedTextSize: DrawableSize | undefined;
    const layoutPositions = new Map<number, [number, number]>();
    const layoutScales = new Map<number, [number, number]>();
    let motionTranslation: [number, number] = [0, 0];
    let motionScaleMultiplier = 1;
    let motionOpacity = 1;
    let shapeTransition:
      | {
          readonly from: BubbleVisualStyle;
          readonly to: BubbleVisualStyle;
          readonly progress: number;
        }
      | undefined;

    const applyMotionTransforms = (): void => {
      for (const target of drawables) {
        const basePosition = layoutPositions.get(target.drawableID);
        if (basePosition) {
          renderer.updateDrawablePosition(target.drawableID, [
            basePosition[0] + motionTranslation[0],
            basePosition[1] + motionTranslation[1],
          ]);
        }
        const baseScale = layoutScales.get(target.drawableID);
        if (baseScale) {
          renderer.updateDrawableScale(target.drawableID, [
            baseScale[0] * motionScaleMultiplier,
            baseScale[1] * motionScaleMultiplier,
          ]);
        }
        renderer.updateDrawableEffect?.(
          target.drawableID,
          "ghost",
          (1 - motionOpacity) * 100,
        );
      }
    };

    const updateVisibility = (): void => {
      const actorVisible =
        currentStyle.placement.basis === "background" ||
        actor.visible !== false;
      renderer.updateDrawableVisible(
        body.drawableID,
        surfaceVisible &&
          actorVisible &&
          currentStyle.visualStyle !== "NO_BUBBLE" &&
          (renderer.updateDrawableEffect !== undefined || motionOpacity > 0),
      );
      renderer.updateDrawableVisible(
        text.drawableID,
        surfaceVisible &&
          actorVisible &&
          (renderer.updateDrawableEffect !== undefined || motionOpacity > 0),
      );
      for (const [layer, target] of layerTargets) {
        renderer.updateDrawableVisible(
          target.drawableID,
          surfaceVisible &&
            actorVisible &&
            (layerVisibility.get(layer) ?? false) &&
            (renderer.updateDrawableEffect !== undefined || motionOpacity > 0),
        );
      }
      applyMotionTransforms();
      runtime.requestRedraw?.();
    };

    const position = (): void => {
      if (disposed) return;
      const scaleMultiplier =
        currentStyle.placement.basis === "actor"
          ? currentStyle.offset.scalePercent / 100
          : 1;
      const nativeTextSize =
        reservedTextSize ??
        readSize(renderer, text, {
          width: 180,
          height: 48,
        });
      renderer.updateDrawableScale(text.drawableID, [
        scaleMultiplier * 100,
        scaleMultiplier * 100,
      ]);
      const textSize = {
        width: nativeTextSize.width * scaleMultiplier,
        height: nativeTextSize.height * scaleMultiplier,
      };
      const portraitSize = portraitBase
        ? fitDrawable(renderer, portraitBase, portraitBoxSize, scaleMultiplier)
        : { width: 0, height: 0 };
      for (const target of [portraitBlink, portraitLipSync]) {
        if (target)
          fitDrawable(renderer, target, portraitBoxSize, scaleMultiplier);
      }
      const indicatorSize = continueIndicator
        ? fitDrawable(
            renderer,
            continueIndicator,
            indicatorBoxSize,
            scaleMultiplier,
          )
        : { width: 0, height: 0 };
      const totalWidth =
        portraitSize.width +
        (portraitBase ? contentGap * scaleMultiplier : 0) +
        textSize.width;
      const contentHeight = Math.max(portraitSize.height, textSize.height);
      const baseBubbleWidth = totalWidth / scaleMultiplier + bubblePadding * 2;
      const baseBubbleHeight =
        contentHeight / scaleMultiplier + bubblePadding * 2;
      // The SVG viewport includes padding for the tail. Placement and clamping
      // use the visible body border, whose dimensions match the content box.
      const bubbleWidth = totalWidth;
      const bubbleHeight = contentHeight;
      const nativeSize = renderer.getNativeSize();
      const stageWidth =
        Array.isArray(nativeSize) && Number(nativeSize[0]) > 0
          ? Number(nativeSize[0])
          : 480;
      const stageHeight =
        Array.isArray(nativeSize) && Number(nativeSize[1]) > 0
          ? Number(nativeSize[1])
          : 360;
      const stageLeft = -stageWidth / 2;
      const stageRight = stageWidth / 2;
      const stageTop = stageHeight / 2;
      const stageBottom = -stageHeight / 2;
      const minimumCenterX = stageLeft + bubbleWidth / 2;
      const maximumCenterX = stageRight - bubbleWidth / 2;
      const minimumCenterY = stageBottom + bubbleHeight / 2;
      const maximumCenterY = stageTop - bubbleHeight / 2;
      let centerX: number;
      let centerY: number;

      if (currentStyle.placement.basis === "background") {
        centerX = 0;
        if (currentStyle.placement.region === "HEADER_LIKE") {
          centerY = stageTop - stageSafeMargin - bubbleHeight / 2;
        } else if (currentStyle.placement.region === "FOOTER_LIKE") {
          centerY = stageBottom + stageSafeMargin + bubbleHeight / 2;
        } else {
          centerY = 0;
        }
      } else {
        const bounds = targetBounds(actor);
        const center = actorRelativeBubbleCenter({
          bounds,
          bubbleWidth,
          bubbleHeight,
          direction: currentStyle.placement.direction,
          distance: currentStyle.distance,
          tailLength: currentStyle.tailLength,
          offset: currentStyle.offset,
        });
        centerX = center.x;
        centerY = center.y;
      }

      centerX = clamp(centerX, minimumCenterX, maximumCenterX);
      centerY = clamp(centerY, minimumCenterY, maximumCenterY);
      const tailDirection =
        currentStyle.placement.basis === "actor"
          ? tailDirectionForPlacement(currentStyle.placement.direction)
          : null;
      const bodyOffset =
        currentStyle.placement.basis === "actor"
          ? ([
              currentStyle.offset.x,
              currentStyle.offset.y,
              currentStyle.offset.scalePercent,
            ] as const)
          : ([0, 0, 100] as const);
      const bodyCenterOffset =
        tailDirection === null
          ? { x: 0, y: 0 }
          : bubbleBodyCenterOffset({
              style: currentStyle.visualStyle,
              width: baseBubbleWidth,
              height: baseBubbleHeight,
              tailDirection,
              tailLength: currentStyle.tailLength,
              offset: bodyOffset,
            });
      const viewportExtraX =
        Math.abs(bodyOffset[0]) +
        baseBubbleWidth * Math.abs(scaleMultiplier - 1) +
        Math.max(0, currentStyle.tailLength - defaultBubbleTailLength) +
        8;
      const viewportExtraY =
        Math.abs(bodyOffset[1]) +
        baseBubbleHeight * Math.abs(scaleMultiplier - 1) +
        Math.max(0, currentStyle.tailLength - defaultBubbleTailLength) +
        8;
      const nextBodySkinSignature = JSON.stringify({
        baseBubbleHeight,
        baseBubbleWidth,
        bodyOffset,
        tailDirection,
        tailLength: currentStyle.tailLength,
        viewportExtraX,
        viewportExtraY,
        visualStyle: currentStyle.visualStyle,
        shapeTransition,
      });
      if (nextBodySkinSignature !== cachedBodySkinSignature) {
        const rendered = renderBubbleSvg({
          style: currentStyle.visualStyle,
          lines: [],
          width: baseBubbleWidth,
          height: baseBubbleHeight,
          tailDirection,
          tailLength: currentStyle.tailLength,
          offset: bodyOffset,
          title: `${currentStyle.name} Bubble body`,
          ...(shapeTransition === undefined ? {} : { shapeTransition }),
        });
        const expanded = expandSvgViewport(
          rendered,
          baseBubbleWidth,
          baseBubbleHeight,
          viewportExtraX,
          viewportExtraY,
        );
        const nextSkinId = renderer.createSVGSkin(expanded);
        if (!Number.isInteger(nextSkinId) || nextSkinId < 0) {
          throw new BubbleRuntimeAdapterError(
            "BUBBLE-RUNTIME-001",
            "TurboWarp did not create the Bubble body SVG skin.",
          );
        }
        try {
          renderer.updateDrawableSkinId(body.drawableID, nextSkinId);
        } catch (error) {
          renderer.destroySkin(nextSkinId);
          throw error;
        }
        const previousBodySkinId = bodySkinId;
        bodySkinId = nextSkinId;
        cachedBodySkinSignature = nextBodySkinSignature;
        if (previousBodySkinId !== undefined) {
          renderer.destroySkin(previousBodySkinId);
        }
      }
      renderer.updateDrawableScale(body.drawableID, [100, 100]);
      renderer.updateDrawablePosition(body.drawableID, [
        centerX - bodyCenterOffset.x,
        centerY + bodyCenterOffset.y,
      ]);
      const left = centerX - totalWidth / 2;
      const portraitX = left + portraitSize.width / 2;
      const textX =
        left +
        portraitSize.width +
        (portraitBase ? contentGap * scaleMultiplier : 0) +
        textSize.width / 2;
      for (const target of [portraitBase, portraitBlink, portraitLipSync]) {
        if (target) {
          renderer.updateDrawablePosition(target.drawableID, [
            portraitX,
            centerY,
          ]);
        }
      }
      renderer.updateDrawablePosition(text.drawableID, [textX, centerY]);
      if (continueIndicator) {
        renderer.updateDrawablePosition(continueIndicator.drawableID, [
          textX +
            textSize.width / 2 -
            indicatorSize.width / 2 -
            contentGap * scaleMultiplier,
          centerY -
            textSize.height / 2 +
            indicatorSize.height / 2 +
            contentGap * scaleMultiplier,
        ]);
      }
      const remember = (
        target: DrawableTarget | undefined,
        positionValue: [number, number],
      ): void => {
        if (!target) return;
        layoutPositions.set(target.drawableID, positionValue);
      };
      remember(body, [
        centerX - bodyCenterOffset.x,
        centerY + bodyCenterOffset.y,
      ]);
      remember(text, [textX, centerY]);
      remember(portraitBase, [portraitX, centerY]);
      remember(portraitBlink, [portraitX, centerY]);
      remember(portraitLipSync, [portraitX, centerY]);
      layoutScales.set(body.drawableID, [100, 100]);
      layoutScales.set(text.drawableID, [
        scaleMultiplier * 100,
        scaleMultiplier * 100,
      ]);
      if (portraitBase)
        layoutScales.set(portraitBase.drawableID, [
          scaleMultiplier * 100,
          scaleMultiplier * 100,
        ]);
      if (portraitBlink)
        layoutScales.set(portraitBlink.drawableID, [
          scaleMultiplier * 100,
          scaleMultiplier * 100,
        ]);
      if (portraitLipSync)
        layoutScales.set(portraitLipSync.drawableID, [
          scaleMultiplier * 100,
          scaleMultiplier * 100,
        ]);
      if (continueIndicator)
        layoutScales.set(continueIndicator.drawableID, [
          scaleMultiplier * 100,
          scaleMultiplier * 100,
        ]);
      if (continueIndicator) {
        remember(continueIndicator, [
          textX +
            textSize.width / 2 -
            indicatorSize.width / 2 -
            contentGap * scaleMultiplier,
          centerY -
            textSize.height / 2 +
            indicatorSize.height / 2 +
            contentGap * scaleMultiplier,
        ]);
      }
      applyMotionTransforms();
      updateVisibility();
    };

    const originalVisualChange = actor.onTargetVisualChange;
    const visualChangeHook = (changedTarget?: TurboWarpBubbleTarget): void => {
      originalVisualChange?.(changedTarget);
      position();
    };
    if (currentStyle.placement.basis === "actor") {
      actor.onTargetVisualChange = visualChangeHook;
    }

    return Object.freeze({
      targets,
      setLayerVisible(layer: BubbleLayer, visible: boolean): void {
        if (disposed) return;
        layerVisibility.set(layer, visible);
        updateVisibility();
      },
      updateStyle(nextStyle: BubbleStyle): void {
        if (disposed) return;
        const wasActorRelative = currentStyle.placement.basis === "actor";
        currentStyle = nextStyle;
        motionTranslation = [0, 0];
        motionScaleMultiplier = 1;
        motionOpacity = 1;
        shapeTransition = undefined;
        if (nextStyle.reveal?.layout !== "RESERVED")
          reservedTextSize = undefined;
        const isActorRelative = currentStyle.placement.basis === "actor";
        if (wasActorRelative && !isActorRelative) {
          if (actor.onTargetVisualChange === visualChangeHook) {
            actor.onTargetVisualChange = originalVisualChange ?? null;
          }
        } else if (!wasActorRelative && isActorRelative) {
          actor.onTargetVisualChange = visualChangeHook;
        }
        position();
      },
      captureTextLayout(): void {
        if (disposed) return;
        reservedTextSize = readSize(renderer, text, {
          width: 180,
          height: 48,
        });
        position();
      },
      clearTextLayout(): void {
        reservedTextSize = undefined;
        position();
      },
      async animate(motion: BubbleMotionInput): Promise<void> {
        if (disposed) return;
        const durationSeconds = Math.max(0, motion.durationSeconds ?? 0);
        const setFrame = (): void => {
          if (disposed) return;
          applyMotionTransforms();
          updateVisibility();
        };
        const eased = (progress: number): number =>
          easeProgress(progress, motion.ease ?? "easeInOut");
        if (
          motion.name === "fadeIn" ||
          motion.name === "floatIn" ||
          motion.name === "zoomIn" ||
          motion.name === "riseUp"
        ) {
          surfaceVisible = true;
          const startingTranslation =
            motion.name === "floatIn" || motion.name === "riseUp"
              ? ([0, 16] as [number, number])
              : ([0, 0] as [number, number]);
          const startingScale = motion.name === "zoomIn" ? 0.01 : 1;
          motionTranslation = startingTranslation;
          motionScaleMultiplier = startingScale;
          motionOpacity = motion.name === "fadeIn" ? 0 : 1;
          setFrame();
          await runMotionTimeline(scheduler, durationSeconds, (progress) => {
            const easedProgress = eased(progress);
            motionTranslation = [
              startingTranslation[0] * (1 - easedProgress),
              startingTranslation[1] * (1 - easedProgress),
            ];
            motionScaleMultiplier =
              startingScale + (1 - startingScale) * easedProgress;
            motionOpacity = motion.name === "fadeIn" ? easedProgress : 1;
            setFrame();
          });
          motionTranslation = [0, 0];
          motionScaleMultiplier = 1;
          motionOpacity = 1;
          position();
          return;
        }
        if (
          motion.name === "fadeOut" ||
          motion.name === "floatOut" ||
          motion.name === "zoomOut" ||
          motion.name === "sink"
        ) {
          const endingTranslation =
            motion.name === "floatOut" || motion.name === "sink"
              ? ([0, -16] as [number, number])
              : ([0, 0] as [number, number]);
          const endingScale = motion.name === "zoomOut" ? 0.01 : 1;
          motionTranslation = [0, 0];
          motionScaleMultiplier = 1;
          motionOpacity = 1;
          setFrame();
          await runMotionTimeline(scheduler, durationSeconds, (progress) => {
            const easedProgress = eased(progress);
            motionTranslation = [
              endingTranslation[0] * easedProgress,
              endingTranslation[1] * easedProgress,
            ];
            motionScaleMultiplier = 1 + (endingScale - 1) * easedProgress;
            motionOpacity = motion.name === "fadeOut" ? 1 - easedProgress : 1;
            setFrame();
          });
          motionTranslation = endingTranslation;
          motionScaleMultiplier = endingScale;
          motionOpacity = motion.name === "fadeOut" ? 0 : 1;
          setFrame();
          surfaceVisible = false;
          updateVisibility();
          motionTranslation = [0, 0];
          motionScaleMultiplier = 1;
          motionOpacity = 1;
          return;
        }
        if (motion.name === "shake") {
          const count = Math.max(1, Math.floor(motion.count ?? 1));
          const animationDuration =
            durationSeconds > 0 ? durationSeconds : count * 0.08;
          const direction =
            typeof motion.direction === "number"
              ? motion.direction
              : ((motion.direction as BubbleDirectionName | undefined) ??
                "right");
          const vector =
            bubbleDirectionVector(direction) ?? bubbleDirectionVector("right");
          const amplitude = 5;
          motionTranslation = [0, 0];
          await runMotionTimeline(scheduler, animationDuration, (progress) => {
            const easedProgress = eased(progress);
            const phase = easedProgress * count * Math.PI * 2;
            const displacement = Math.sin(phase) * amplitude;
            motionTranslation = [
              vector.x * displacement,
              vector.y * displacement,
            ];
            setFrame();
          });
          motionTranslation = [0, 0];
          position();
          return;
        }
        if (motion.name === "explode") {
          const count = Math.max(1, Math.floor(motion.count ?? 1));
          const animationDuration =
            durationSeconds > 0 ? durationSeconds : count * 0.12;
          const factor = motion.relativeScale ?? 1.15;
          await runMotionTimeline(scheduler, animationDuration, (progress) => {
            const easedProgress = eased(progress);
            const wave = Math.abs(Math.sin(easedProgress * count * Math.PI));
            motionScaleMultiplier = 1 + (factor - 1) * wave;
            setFrame();
          });
          motionScaleMultiplier = 1;
          position();
          return;
        }
        if (motion.name === "animateBubbleShape") {
          const targetStyle = motion.visualStyle ?? currentStyle.visualStyle;
          const fromStyle = currentStyle.visualStyle;
          const speed =
            motion.speed === undefined ? 1 : Math.max(0, motion.speed);
          shapeTransition = {
            from: fromStyle,
            to: targetStyle,
            progress: 0,
          };
          position();
          await runMotionTimeline(scheduler, durationSeconds, (progress) => {
            const speedProgress =
              durationSeconds === 0
                ? 1
                : clamp01((progress * Math.max(speed, 1)) / 1);
            shapeTransition = {
              from: fromStyle,
              to: targetStyle,
              progress: easeProgress(speedProgress, motion.ease ?? "easeInOut"),
            };
            position();
          });
          shapeTransition = undefined;
          position();
          return;
        }
      },
      show(): void {
        if (disposed) return;
        surfaceVisible = true;
        position();
      },
      hide(): void {
        if (disposed) return;
        surfaceVisible = false;
        updateVisibility();
      },
      dispose(): void {
        if (disposed) return;
        disposed = true;
        if (
          currentStyle.placement.basis === "actor" &&
          actor.onTargetVisualChange === visualChangeHook
        ) {
          actor.onTargetVisualChange = originalVisualChange ?? null;
        }
        for (const target of [...drawables].reverse()) {
          renderer.destroyDrawable(target.drawableID, spriteLayer);
        }
        if (bodySkinId !== undefined) {
          renderer.destroySkin(bodySkinId);
          bodySkinId = undefined;
        }
        runtime.requestRedraw?.();
      },
    });
  } catch (error) {
    for (const target of [...drawables].reverse()) {
      renderer.destroyDrawable(target.drawableID, spriteLayer);
    }
    if (bodySkinId !== undefined) renderer.destroySkin(bodySkinId);
    throw error;
  }
}

export function createTurboWarpBubbleComposition(
  runtimeInput: TurboWarpBubbleRuntime,
  options: TurboWarpBubbleCompositionOptions = {},
): BubbleComposition {
  if (!isRecord(runtimeInput)) {
    throw new BubbleRuntimeAdapterError(
      "BUBBLE-RUNTIME-001",
      "Bubble requires the TurboWarp runtime.",
    );
  }
  const runtime = runtimeInput;
  const renderer = requireRenderer(runtime.renderer);
  const getAssetExtension = (): TurboWarpAssetManagerExtension =>
    requireAssetManager(runtime.ext_kubohiroyaassetmanager);
  let textCapability: BubbleTextCapability;
  if (options.textCapability !== undefined) {
    textCapability = options.textCapability;
  } else {
    try {
      textCapability = createTurboWarpSvgTextCapability(
        runtime.ext_kubohiroyasvgtext,
      );
    } catch {
      throw new BubbleRuntimeAdapterError(
        "BUBBLE-RUNTIME-003",
        "Bubble requires a text capability. Load @kubohiroya/turbowarp-svg-text or provide options.textCapability before using Bubble blocks.",
      );
    }
  }
  const imageResolver: BubbleImageCapability = options.imageResolver ?? {
    isRegistered(name: unknown): boolean {
      return getAssetExtension().isLoaded({ NAME: name });
    },
    getMimeType(name: unknown): string {
      return getAssetExtension().getAssetMimeType({ NAME: name });
    },
    async applyToTarget(name, target): Promise<void> {
      const drawableID = (target as unknown as DrawableTarget).drawableID;
      if (!Number.isInteger(drawableID) || drawableID < 0) {
        throw new BubbleRuntimeAdapterError(
          "BUBBLE-RUNTIME-001",
          "Bubble image target drawable is invalid.",
        );
      }
      const skin = await getAssetExtension().resolveSkin(name);
      if (
        !isRecord(skin) ||
        !Number.isInteger(skin.skinId) ||
        skin.skinId < 0
      ) {
        throw new BubbleRuntimeAdapterError(
          "BUBBLE-RUNTIME-002",
          `Asset Manager did not resolve an image skin: ${String(name)}`,
        );
      }
      renderer.updateDrawableSkinId(drawableID, skin.skinId);
      runtime.requestRedraw?.();
    },
  };
  const audio: BubbleAudioCapability | undefined = options.audio ?? {
    isRegistered(name: unknown): boolean {
      return getAssetExtension().isLoaded({ NAME: name });
    },
    getMimeType(name: unknown): string {
      return getAssetExtension().getAssetMimeType({ NAME: name });
    },
    async playSound(
      name: unknown,
      playOptions: Readonly<{ untilDone?: boolean }> = {},
    ): Promise<void> {
      const extension = getAssetExtension();
      const method = playOptions.untilDone
        ? extension?.playSoundUntilDone
        : extension?.playSound;
      if (typeof method !== "function") {
        throw new BubbleRuntimeAdapterError(
          "BUBBLE-RUNTIME-002",
          "TurboWarp Asset Manager does not provide audio playback.",
        );
      }
      await method.call(extension, { NAME: name });
    },
  };
  return createBubbleComposition({
    imageResolver,
    audio,
    textCapability,
    createSurface({ actor, actorKey, style }) {
      if (!isRecord(actor) || typeof actor.id !== "string") {
        throw new BubbleRuntimeAdapterError(
          "BUBBLE-RUNTIME-001",
          "Bubble actor target is invalid.",
        );
      }
      return createSurface(
        runtime,
        actor as unknown as TurboWarpBubbleTarget,
        actorKey,
        style,
        options.scheduler ?? {
          setTimeout: (callback: () => void, milliseconds: number) =>
            globalThis.setTimeout(callback, milliseconds),
          clearTimeout: (handle: unknown) =>
            globalThis.clearTimeout(handle as ReturnType<typeof setTimeout>),
        },
      );
    },
    ...(options.scheduler === undefined
      ? {}
      : { scheduler: options.scheduler }),
    ...(options.onAnimationError === undefined
      ? {}
      : { onAnimationError: options.onAnimationError }),
  });
}
