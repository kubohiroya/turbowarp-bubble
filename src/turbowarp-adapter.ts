import {
  createBubbleComposition,
  defaultBubbleTailLength,
  type BubbleComposition,
  type BubbleCompositionOptions,
  type BubbleLayer,
  type BubbleScheduler,
  type BubbleStyle,
  type BubbleSurface,
  type BubbleSurfaceTargets,
} from "./composition.js";
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
    let cachedBodySkinSignature = "";

    const updateVisibility = (): void => {
      const actorVisible =
        style.placement.basis === "background" || actor.visible !== false;
      renderer.updateDrawableVisible(
        body.drawableID,
        surfaceVisible && actorVisible && style.visualStyle !== "NO_BUBBLE",
      );
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
      const scaleMultiplier =
        style.placement.basis === "actor" ? style.offset.scalePercent / 100 : 1;
      const nativeTextSize = readSize(renderer, text, {
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
      for (const target of [portraitBlink, portraitTalk]) {
        if (target)
          fitDrawable(renderer, target, portraitBoxSize, scaleMultiplier);
      }
      const indicatorSize = advanceIndicator
        ? fitDrawable(
            renderer,
            advanceIndicator,
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

      if (style.placement.basis === "background") {
        centerX = 0;
        if (style.placement.region === "HEADER_LIKE") {
          centerY = stageTop - stageSafeMargin - bubbleHeight / 2;
        } else if (style.placement.region === "FOOTER_LIKE") {
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
          direction: style.placement.direction,
          distance: style.distance,
          tailLength: style.tailLength,
          offset: style.offset,
        });
        centerX = center.x;
        centerY = center.y;
      }

      centerX = clamp(centerX, minimumCenterX, maximumCenterX);
      centerY = clamp(centerY, minimumCenterY, maximumCenterY);
      const tailDirection =
        style.placement.basis === "actor"
          ? tailDirectionForPlacement(style.placement.direction)
          : null;
      const bodyOffset =
        style.placement.basis === "actor"
          ? ([
              style.offset.x,
              style.offset.y,
              style.offset.scalePercent,
            ] as const)
          : ([0, 0, 100] as const);
      const bodyCenterOffset =
        tailDirection === null
          ? { x: 0, y: 0 }
          : bubbleBodyCenterOffset({
              style: style.visualStyle,
              width: baseBubbleWidth,
              height: baseBubbleHeight,
              tailDirection,
              tailLength: style.tailLength,
              offset: bodyOffset,
            });
      const viewportExtraX =
        Math.abs(bodyOffset[0]) +
        baseBubbleWidth * Math.abs(scaleMultiplier - 1) +
        Math.max(0, style.tailLength - defaultBubbleTailLength) +
        8;
      const viewportExtraY =
        Math.abs(bodyOffset[1]) +
        baseBubbleHeight * Math.abs(scaleMultiplier - 1) +
        Math.max(0, style.tailLength - defaultBubbleTailLength) +
        8;
      const nextBodySkinSignature = JSON.stringify({
        baseBubbleHeight,
        baseBubbleWidth,
        bodyOffset,
        tailDirection,
        tailLength: style.tailLength,
        viewportExtraX,
        viewportExtraY,
        visualStyle: style.visualStyle,
      });
      if (nextBodySkinSignature !== cachedBodySkinSignature) {
        const rendered = renderBubbleSvg({
          style: style.visualStyle,
          lines: [],
          width: baseBubbleWidth,
          height: baseBubbleHeight,
          tailDirection,
          tailLength: style.tailLength,
          offset: bodyOffset,
          title: `${style.name} Bubble body`,
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
