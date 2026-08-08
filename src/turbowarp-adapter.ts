import {
  createBubbleComposition,
  type BubbleComposition,
  type BubbleCompositionOptions,
  type BubbleLayer,
  type BubbleScheduler,
  type BubbleStyle,
  type BubbleSurface,
  type BubbleSurfaceTargets,
} from "./composition.js";
import { bubbleDirectionVector } from "./placement.js";

const spriteLayer = "sprite";
const portraitBoxSize = 96;
const indicatorBoxSize = 18;
const contentGap = 8;
const actorGap = 12;
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
  createDrawable(layerGroup: string): number;
  destroyDrawable(drawableId: number, layerGroup: string): void;
  getCurrentSkinSize(drawableId: number): unknown;
  getNativeSize(): unknown;
  updateDrawablePosition(drawableId: number, position: [number, number]): void;
  updateDrawableScale(drawableId: number, scale: [number, number]): void;
  updateDrawableSkinId(drawableId: number, skinId: number): void;
  updateDrawableVisible(drawableId: number, visible: boolean): void;
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
  resolveSkin(
    value: unknown,
  ): Readonly<{ skinId: number }> | Promise<Readonly<{ skinId: number }>>;
}

export interface TurboWarpSvgTextExtension {
  setText(
    args: Readonly<{ STYLE: unknown; TEXT: unknown }>,
    util: Readonly<{ target: TurboWarpBubbleTarget }>,
  ): void;
  releaseTextActor(target: TurboWarpBubbleTarget): boolean;
}

export interface TurboWarpBubbleRuntime {
  readonly renderer: TurboWarpBubbleRenderer;
  readonly ext_kubohiroyaassetmanager?: TurboWarpAssetManagerExtension;
  readonly ext_kubohiroyasvgtext?: TurboWarpSvgTextExtension;
  requestRedraw?(): void;
}

export interface TurboWarpBubbleCompositionOptions {
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
    "createDrawable",
    "destroyDrawable",
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
      "Bubble requires Asset Manager. Load @kubohiroya/turbowarp-asset-manager before using Bubble blocks.",
    );
  }
  return value as unknown as TurboWarpAssetManagerExtension;
}

function requireSvgText(value: unknown): TurboWarpSvgTextExtension {
  if (
    !isRecord(value) ||
    typeof value.setText !== "function" ||
    typeof value.releaseTextActor !== "function"
  ) {
    throw new BubbleRuntimeAdapterError(
      "BUBBLE-RUNTIME-003",
      "Bubble requires SVG Text. Load @kubohiroya/turbowarp-svg-text before using Bubble blocks.",
    );
  }
  return value as unknown as TurboWarpSvgTextExtension;
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

function fitDrawable(
  renderer: TurboWarpBubbleRenderer,
  target: DrawableTarget,
  boxSize: number,
): DrawableSize {
  const native = readSize(renderer, target, {
    width: boxSize,
    height: boxSize,
  });
  const scale = Math.min(boxSize / native.width, boxSize / native.height);
  renderer.updateDrawableScale(target.drawableID, [scale * 100, scale * 100]);
  return { width: native.width * scale, height: native.height * scale };
}

function clamp(value: number, minimum: number, maximum: number): number {
  if (maximum < minimum) return (minimum + maximum) / 2;
  return Math.min(maximum, Math.max(minimum, value));
}

function createSurface(
  runtime: TurboWarpBubbleRuntime,
  actor: TurboWarpBubbleTarget,
  actorKey: string,
  style: BubbleStyle,
): BubbleSurface {
  const renderer = runtime.renderer;
  const sequence = surfaceSequence;
  surfaceSequence += 1;
  const drawables: DrawableTarget[] = [];

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
    const portraitBase = style.portrait
      ? createTarget("portrait-base")
      : undefined;
    const portraitBlink = style.portrait?.blink
      ? createTarget("portrait-blink")
      : undefined;
    const portraitTalk = style.portrait?.talk
      ? createTarget("portrait-talk")
      : undefined;
    const text = createTarget("text");
    const advanceIndicator = style.advanceIndicator
      ? createTarget("advance-indicator")
      : undefined;
    const targets: BubbleSurfaceTargets = Object.freeze({
      text,
      ...(portraitBase ? { portraitBase } : {}),
      ...(portraitBlink ? { portraitBlink } : {}),
      ...(portraitTalk ? { portraitTalk } : {}),
      ...(advanceIndicator ? { advanceIndicator } : {}),
    });
    const layerTargets = new Map<BubbleLayer, DrawableTarget>();
    if (portraitBase) layerTargets.set("portraitBase", portraitBase);
    if (portraitBlink) layerTargets.set("portraitBlink", portraitBlink);
    if (portraitTalk) layerTargets.set("portraitTalk", portraitTalk);
    if (advanceIndicator) {
      layerTargets.set("advanceIndicator", advanceIndicator);
    }
    const layerVisibility = new Map<BubbleLayer, boolean>();
    let surfaceVisible = false;
    let disposed = false;

    const updateVisibility = (): void => {
      const actorVisible =
        style.placement.basis === "background" || actor.visible !== false;
      renderer.updateDrawableVisible(
        text.drawableID,
        surfaceVisible && actorVisible,
      );
      for (const [layer, target] of layerTargets) {
        renderer.updateDrawableVisible(
          target.drawableID,
          surfaceVisible &&
            actorVisible &&
            (layerVisibility.get(layer) ?? false),
        );
      }
      runtime.requestRedraw?.();
    };

    const position = (): void => {
      if (disposed) return;
      const textSize = readSize(renderer, text, { width: 180, height: 48 });
      const portraitSize = portraitBase
        ? fitDrawable(renderer, portraitBase, portraitBoxSize)
        : { width: 0, height: 0 };
      for (const target of [portraitBlink, portraitTalk]) {
        if (target) fitDrawable(renderer, target, portraitBoxSize);
      }
      const indicatorSize = advanceIndicator
        ? fitDrawable(renderer, advanceIndicator, indicatorBoxSize)
        : { width: 0, height: 0 };
      const totalWidth =
        portraitSize.width + (portraitBase ? contentGap : 0) + textSize.width;
      const contentHeight = Math.max(portraitSize.height, textSize.height);
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
      const minimumCenterX = stageLeft + totalWidth / 2;
      const maximumCenterX = stageRight - totalWidth / 2;
      const minimumCenterY = stageBottom + contentHeight / 2;
      const maximumCenterY = stageTop - contentHeight / 2;
      let centerX: number;
      let centerY: number;

      if (style.placement.basis === "background") {
        centerX = 0;
        if (style.placement.region === "HEADER_LIKE") {
          centerY = stageTop - stageSafeMargin - contentHeight / 2;
        } else if (style.placement.region === "FOOTER_LIKE") {
          centerY = stageBottom + stageSafeMargin + contentHeight / 2;
        } else {
          centerY = 0;
        }
      } else {
        const bounds = targetBounds(actor);
        const actorCenterX = (bounds.left + bounds.right) / 2;
        const actorCenterY = (bounds.top + bounds.bottom) / 2;
        const vector = bubbleDirectionVector(style.placement.direction);
        const horizontalDistance =
          vector.x < 0
            ? actorCenterX - bounds.left + actorGap + totalWidth / 2
            : bounds.right - actorCenterX + actorGap + totalWidth / 2;
        const verticalDistance =
          vector.y < 0
            ? actorCenterY - bounds.bottom + actorGap + contentHeight / 2
            : bounds.top - actorCenterY + actorGap + contentHeight / 2;
        const placementScale = Math.min(
          vector.x === 0
            ? Number.POSITIVE_INFINITY
            : horizontalDistance / Math.abs(vector.x),
          vector.y === 0
            ? Number.POSITIVE_INFINITY
            : verticalDistance / Math.abs(vector.y),
        );
        centerX = actorCenterX + vector.x * placementScale;
        centerY = actorCenterY + vector.y * placementScale;
      }

      centerX = clamp(centerX, minimumCenterX, maximumCenterX);
      centerY = clamp(centerY, minimumCenterY, maximumCenterY);
      const left = centerX - totalWidth / 2;
      const portraitX = left + portraitSize.width / 2;
      const textX =
        left +
        portraitSize.width +
        (portraitBase ? contentGap : 0) +
        textSize.width / 2;
      for (const target of [portraitBase, portraitBlink, portraitTalk]) {
        if (target) {
          renderer.updateDrawablePosition(target.drawableID, [
            portraitX,
            centerY,
          ]);
        }
      }
      renderer.updateDrawablePosition(text.drawableID, [textX, centerY]);
      if (advanceIndicator) {
        renderer.updateDrawablePosition(advanceIndicator.drawableID, [
          textX + textSize.width / 2 - indicatorSize.width / 2 - contentGap,
          centerY - textSize.height / 2 + indicatorSize.height / 2 + contentGap,
        ]);
      }
      updateVisibility();
    };

    const originalVisualChange = actor.onTargetVisualChange;
    const visualChangeHook = (changedTarget?: TurboWarpBubbleTarget): void => {
      originalVisualChange?.(changedTarget);
      position();
    };
    if (style.placement.basis === "actor") {
      actor.onTargetVisualChange = visualChangeHook;
    }

    return Object.freeze({
      targets,
      setLayerVisible(layer: BubbleLayer, visible: boolean): void {
        if (disposed) return;
        layerVisibility.set(layer, visible);
        updateVisibility();
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
          style.placement.basis === "actor" &&
          actor.onTargetVisualChange === visualChangeHook
        ) {
          actor.onTargetVisualChange = originalVisualChange ?? null;
        }
        for (const target of [...drawables].reverse()) {
          renderer.destroyDrawable(target.drawableID, spriteLayer);
        }
        runtime.requestRedraw?.();
      },
    });
  } catch (error) {
    for (const target of [...drawables].reverse()) {
      renderer.destroyDrawable(target.drawableID, spriteLayer);
    }
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
  const assetExtension = requireAssetManager(
    runtime.ext_kubohiroyaassetmanager,
  );
  const svgTextExtension = requireSvgText(runtime.ext_kubohiroyasvgtext);

  return createBubbleComposition({
    assetManager: {
      isRegistered(name: unknown): boolean {
        return assetExtension.isLoaded({ NAME: name });
      },
      getMimeType(name: unknown): string {
        return assetExtension.getAssetMimeType({ NAME: name });
      },
      async applyToTarget(name, target): Promise<void> {
        const drawableID = (target as unknown as DrawableTarget).drawableID;
        if (!Number.isInteger(drawableID) || drawableID < 0) {
          throw new BubbleRuntimeAdapterError(
            "BUBBLE-RUNTIME-001",
            "Bubble image target drawable is invalid.",
          );
        }
        const skin = await assetExtension.resolveSkin(name);
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
    },
    svgText: {
      setText({ styleName, target, text }): void {
        svgTextExtension.setText(
          { STYLE: styleName, TEXT: text },
          { target: target as TurboWarpBubbleTarget },
        );
      },
      releaseTarget(target): void {
        svgTextExtension.releaseTextActor(target as TurboWarpBubbleTarget);
      },
    },
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
