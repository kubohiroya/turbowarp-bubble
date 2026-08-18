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
import {
  clampMotionProgress,
  easeMotionProgress,
  runMotionTimeline,
} from "./surface-motion.js";
import {
  createSvgOverlayImageAdapter,
  createSvgOverlaySurface,
  createSvgOverlaySurfaceManager,
  createSvgOverlayTextAdapter,
  defaultBubbleOverlayUnsupportedBehavior,
  defaultBubbleRenderBackend,
  type BubbleOverlayUnsupportedBehavior,
  type BubbleRenderBackend,
  type BubbleSvgOverlayActor,
  type BubbleSvgOverlayImageCapability,
  type BubbleSvgOverlayRenderer,
  type BubbleSvgOverlayTextCapability,
} from "./svg-overlay-surface.js";

export {
  createSvgOverlayImageAdapter,
  createSvgOverlaySurface,
  createSvgOverlaySurfaceManager,
  createSvgOverlayTextAdapter,
  bubbleRenderBackends,
  defaultBubbleOverlayUnsupportedBehavior,
  defaultBubbleRenderBackend,
  type BubbleOverlayUnsupportedBehavior,
  type BubbleRenderBackend,
  type BubbleSvgOverlayActor,
  type BubbleSvgOverlayImageCapability,
  type BubbleSvgOverlayImageResource,
  type BubbleSvgOverlayRenderer,
  type BubbleSvgOverlaySurfaceManager,
  type BubbleSvgOverlayTextCapability,
  type BubbleSvgOverlayTextLayout,
} from "./svg-overlay-surface.js";

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
  addOverlay?(element: Element, mode?: string): unknown;
  removeOverlay?(element: Element): void;
  on?(event: string, listener: (...args: unknown[]) => void): void;
  off?(event: string, listener: (...args: unknown[]) => void): void;
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
  /** Defaults to scratch-render; svg-overlay is explicitly opt-in. */
  readonly bubbleRenderBackend?: BubbleRenderBackend;
  /** Defaults to error so an opt-in request never silently changes semantics. */
  readonly svgOverlayUnsupportedBehavior?: BubbleOverlayUnsupportedBehavior;
  /** Host-neutral text layout supplied by turbowarp-svg-text or another host. */
  readonly svgOverlayTextCapability?: BubbleSvgOverlayTextCapability;
  /** Releasable DOM image resources supplied by Asset Manager or another host. */
  readonly svgOverlayImageCapability?: BubbleSvgOverlayImageCapability;
  /** Browser document override for packaged players and deterministic tests. */
  readonly document?: Document;
  readonly imageResolver?: BubbleImageCapability;
  readonly audio?: BubbleAudioCapability;
  readonly textCapability?: BubbleTextCapability;
  readonly scheduler?: BubbleScheduler;
  readonly onAnimationError?: BubbleCompositionOptions["onAnimationError"];
}

export type BubbleRuntimeAdapterErrorCode =
  | "BUBBLE-RUNTIME-001"
  | "BUBBLE-RUNTIME-002"
  | "BUBBLE-RUNTIME-003"
  | "BUBBLE-RUNTIME-004";

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

interface FittedDrawableSize extends DrawableSize {
  readonly scalePercent: number;
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

function normalizeRenderBackend(value: unknown): BubbleRenderBackend {
  const backend = value ?? defaultBubbleRenderBackend;
  if (backend !== "scratch-render" && backend !== "svg-overlay") {
    throw new BubbleRuntimeAdapterError(
      "BUBBLE-RUNTIME-004",
      "Bubble bubbleRenderBackend must be scratch-render or svg-overlay.",
    );
  }
  return backend;
}

function normalizeOverlayUnsupportedBehavior(
  value: unknown,
): BubbleOverlayUnsupportedBehavior {
  const behavior = value ?? defaultBubbleOverlayUnsupportedBehavior;
  if (behavior !== "error" && behavior !== "fallback") {
    throw new BubbleRuntimeAdapterError(
      "BUBBLE-RUNTIME-004",
      "Bubble svgOverlayUnsupportedBehavior must be error or fallback.",
    );
  }
  return behavior;
}

function resolveOverlayDocument(value: unknown): Document | undefined {
  const documentValue =
    value ??
    (typeof globalThis.document === "undefined"
      ? undefined
      : globalThis.document);
  if (documentValue === undefined) return undefined;
  if (
    !isRecord(documentValue) ||
    typeof documentValue.createElementNS !== "function"
  ) {
    throw new BubbleRuntimeAdapterError(
      "BUBBLE-RUNTIME-004",
      "Bubble SVG overlay document must provide createElementNS().",
    );
  }
  return documentValue as unknown as Document;
}

function overlayUnavailableReason(
  renderer: TurboWarpBubbleRenderer,
  documentValue: Document | undefined,
  textCapability: BubbleSvgOverlayTextCapability | undefined,
): string | undefined {
  if (
    typeof renderer.addOverlay !== "function" ||
    typeof renderer.removeOverlay !== "function"
  ) {
    return "the renderer does not provide addOverlay() and removeOverlay()";
  }
  if (documentValue === undefined)
    return "the host does not provide a DOM document";
  if (typeof documentValue.defaultView?.DOMParser !== "function") {
    return "the host document does not provide DOMParser";
  }
  if (
    !isRecord(textCapability) ||
    typeof textCapability.layoutText !== "function"
  ) {
    return "a host-neutral svgOverlayTextCapability is not available";
  }
  return undefined;
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

function fitDrawable(
  renderer: TurboWarpBubbleRenderer,
  target: DrawableTarget,
  boxSize: number,
  scaleMultiplier = 1,
): FittedDrawableSize {
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
    scalePercent: effectiveScale * 100,
  };
}

function renderPortraitCornerMaskSvg(
  width: number,
  height: number,
  radius: number,
): string {
  const roundedRadius = Math.min(radius, width / 2, height / 2);
  const right = width - roundedRadius;
  const bottom = height - roundedRadius;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <path d="M0 0H${width}V${height}H0Z M${roundedRadius} 0H${right}A${roundedRadius} ${roundedRadius} 0 0 1 ${width} ${roundedRadius}V${bottom}A${roundedRadius} ${roundedRadius} 0 0 1 ${right} ${height}H${roundedRadius}A${roundedRadius} ${roundedRadius} 0 0 1 0 ${bottom}V${roundedRadius}A${roundedRadius} ${roundedRadius} 0 0 1 ${roundedRadius} 0Z" fill="#fff4cc" fill-rule="evenodd" data-bubble-portrait-corner-radius="${roundedRadius}"/>
</svg>`;
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
  let portraitMaskSkinId: number | undefined;

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
    const portraitMask = style.portrait
      ? createTarget("portrait-corner-mask")
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
    let cachedPortraitMaskSignature = "";
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
      if (portraitMask) {
        renderer.updateDrawableVisible(
          portraitMask.drawableID,
          surfaceVisible &&
            actorVisible &&
            currentStyle.portrait !== undefined &&
            currentStyle.portrait.cornerRadius > 0 &&
            currentStyle.visualStyle !== "NO_BUBBLE" &&
            (layerVisibility.get("portraitBase") ?? false) &&
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
      const portraitZoomMultiplier =
        (currentStyle.portrait?.offset.zoomPercent ?? 100) / 100;
      const portraitFitBoxSize = portraitBoxSize * portraitZoomMultiplier;
      const hasPortrait =
        portraitBase !== undefined && currentStyle.portrait !== undefined;
      const portraitSize = hasPortrait
        ? fitDrawable(
            renderer,
            portraitBase,
            portraitFitBoxSize,
            scaleMultiplier,
          )
        : { width: 0, height: 0, scalePercent: 0 };
      const portraitLayerScales = new Map<number, number>();
      if (hasPortrait) {
        portraitLayerScales.set(
          portraitBase.drawableID,
          portraitSize.scalePercent,
        );
      }
      for (const target of [portraitBlink, portraitLipSync]) {
        if (target && hasPortrait) {
          const fitted = fitDrawable(
            renderer,
            target,
            portraitFitBoxSize,
            scaleMultiplier,
          );
          portraitLayerScales.set(target.drawableID, fitted.scalePercent);
        }
      }
      const indicatorSize = continueIndicator
        ? fitDrawable(
            renderer,
            continueIndicator,
            indicatorBoxSize,
            scaleMultiplier,
          )
        : { width: 0, height: 0, scalePercent: 0 };
      const totalWidth =
        portraitSize.width +
        (hasPortrait ? contentGap * scaleMultiplier : 0) +
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
      const portraitPlacement = currentStyle.portrait?.placement ?? "left";
      const portraitOnRight = portraitPlacement.endsWith("right");
      const portraitOffsetX =
        (currentStyle.portrait?.offset.x ?? 0) * scaleMultiplier;
      const portraitOffsetY =
        (currentStyle.portrait?.offset.y ?? 0) * scaleMultiplier;
      const portraitX =
        (portraitOnRight
          ? left + textSize.width + contentGap * scaleMultiplier
          : left) +
        portraitSize.width / 2 +
        portraitOffsetX;
      let portraitY = centerY;
      if (portraitPlacement.startsWith("top-")) {
        portraitY = centerY + contentHeight / 2 - portraitSize.height / 2;
      } else if (portraitPlacement.startsWith("bottom-")) {
        portraitY = centerY - contentHeight / 2 + portraitSize.height / 2;
      }
      portraitY += portraitOffsetY;
      const textX =
        (portraitOnRight || !hasPortrait
          ? left
          : left + portraitSize.width + contentGap * scaleMultiplier) +
        textSize.width / 2;
      for (const target of [portraitBase, portraitBlink, portraitLipSync]) {
        if (target) {
          renderer.updateDrawablePosition(target.drawableID, [
            portraitX,
            portraitY,
          ]);
        }
      }
      if (portraitMask) {
        const maskWidth = portraitSize.width / scaleMultiplier;
        const maskHeight = portraitSize.height / scaleMultiplier;
        const radius = Math.min(
          currentStyle.portrait?.cornerRadius ?? 0,
          maskWidth / 2,
          maskHeight / 2,
        );
        const nextPortraitMaskSignature =
          radius > 0 ? JSON.stringify({ maskHeight, maskWidth, radius }) : "";
        if (nextPortraitMaskSignature !== cachedPortraitMaskSignature) {
          const previousPortraitMaskSkinId = portraitMaskSkinId;
          portraitMaskSkinId = undefined;
          cachedPortraitMaskSignature = nextPortraitMaskSignature;
          if (radius > 0) {
            const nextSkinId = renderer.createSVGSkin(
              renderPortraitCornerMaskSvg(maskWidth, maskHeight, radius),
            );
            if (!Number.isInteger(nextSkinId) || nextSkinId < 0) {
              throw new BubbleRuntimeAdapterError(
                "BUBBLE-RUNTIME-001",
                "TurboWarp did not create the Bubble portrait corner mask SVG skin.",
              );
            }
            try {
              renderer.updateDrawableSkinId(
                portraitMask.drawableID,
                nextSkinId,
              );
              portraitMaskSkinId = nextSkinId;
            } catch (error) {
              renderer.destroySkin(nextSkinId);
              throw error;
            }
          }
          if (previousPortraitMaskSkinId !== undefined) {
            renderer.destroySkin(previousPortraitMaskSkinId);
          }
        }
        renderer.updateDrawablePosition(portraitMask.drawableID, [
          portraitX,
          portraitY,
        ]);
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
      remember(portraitBase, [portraitX, portraitY]);
      remember(portraitBlink, [portraitX, portraitY]);
      remember(portraitLipSync, [portraitX, portraitY]);
      remember(portraitMask, [portraitX, portraitY]);
      layoutScales.set(body.drawableID, [100, 100]);
      layoutScales.set(text.drawableID, [
        scaleMultiplier * 100,
        scaleMultiplier * 100,
      ]);
      for (const target of [portraitBase, portraitBlink, portraitLipSync]) {
        if (!target) continue;
        const portraitScale = portraitLayerScales.get(target.drawableID) ?? 0;
        layoutScales.set(target.drawableID, [portraitScale, portraitScale]);
      }
      if (portraitMask) {
        layoutScales.set(portraitMask.drawableID, [
          scaleMultiplier * 100,
          scaleMultiplier * 100,
        ]);
      }
      if (continueIndicator)
        layoutScales.set(continueIndicator.drawableID, [
          indicatorSize.scalePercent,
          indicatorSize.scalePercent,
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
          easeMotionProgress(progress, motion.ease ?? "easeInOut");
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
                : clampMotionProgress((progress * Math.max(speed, 1)) / 1);
            shapeTransition = {
              from: fromStyle,
              to: targetStyle,
              progress: easeMotionProgress(
                speedProgress,
                motion.ease ?? "easeInOut",
              ),
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
        if (portraitMaskSkinId !== undefined) {
          renderer.destroySkin(portraitMaskSkinId);
          portraitMaskSkinId = undefined;
        }
        runtime.requestRedraw?.();
      },
    });
  } catch (error) {
    for (const target of [...drawables].reverse()) {
      renderer.destroyDrawable(target.drawableID, spriteLayer);
    }
    if (bodySkinId !== undefined) renderer.destroySkin(bodySkinId);
    if (portraitMaskSkinId !== undefined)
      renderer.destroySkin(portraitMaskSkinId);
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
  const requestedBackend = normalizeRenderBackend(options.bubbleRenderBackend);
  const unsupportedBehavior = normalizeOverlayUnsupportedBehavior(
    options.svgOverlayUnsupportedBehavior,
  );
  const overlayDocument =
    requestedBackend === "svg-overlay"
      ? resolveOverlayDocument(options.document)
      : undefined;
  const unavailableReason =
    requestedBackend === "svg-overlay"
      ? overlayUnavailableReason(
          renderer,
          overlayDocument,
          options.svgOverlayTextCapability,
        )
      : undefined;
  if (
    requestedBackend === "svg-overlay" &&
    unavailableReason !== undefined &&
    unsupportedBehavior === "error"
  ) {
    throw new BubbleRuntimeAdapterError(
      "BUBBLE-RUNTIME-004",
      `Bubble SVG overlay backend is unavailable because ${unavailableReason}. Use scratch-render or install the required public upstream capability.`,
    );
  }
  const renderBackend: BubbleRenderBackend =
    requestedBackend === "svg-overlay" && unavailableReason === undefined
      ? "svg-overlay"
      : "scratch-render";
  const scheduler = options.scheduler ?? {
    setTimeout: (callback: () => void, milliseconds: number) =>
      globalThis.setTimeout(callback, milliseconds),
    clearTimeout: (handle: unknown) =>
      globalThis.clearTimeout(handle as ReturnType<typeof setTimeout>),
  };
  const getAssetExtension = (): TurboWarpAssetManagerExtension =>
    requireAssetManager(runtime.ext_kubohiroyaassetmanager);
  let textCapability: BubbleTextCapability;
  if (renderBackend === "svg-overlay") {
    try {
      textCapability = createSvgOverlayTextAdapter(
        options.svgOverlayTextCapability as BubbleSvgOverlayTextCapability,
        renderer,
      );
    } catch (error) {
      throw new BubbleRuntimeAdapterError(
        "BUBBLE-RUNTIME-004",
        `Bubble SVG overlay text capability is invalid: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  } else if (options.textCapability !== undefined) {
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
  let imageResolver: BubbleImageCapability | undefined;
  if (renderBackend === "svg-overlay") {
    if (options.svgOverlayImageCapability !== undefined) {
      try {
        imageResolver = createSvgOverlayImageAdapter(
          options.svgOverlayImageCapability,
        );
      } catch (error) {
        throw new BubbleRuntimeAdapterError(
          "BUBBLE-RUNTIME-004",
          `Bubble SVG overlay image capability is invalid: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  } else {
    imageResolver = options.imageResolver ?? {
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
  }
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
  const overlayManager =
    renderBackend === "svg-overlay"
      ? createSvgOverlaySurfaceManager(
          renderer as unknown as BubbleSvgOverlayRenderer,
          overlayDocument as Document,
        )
      : undefined;
  return createBubbleComposition({
    ...(imageResolver === undefined ? {} : { imageResolver }),
    audio,
    textCapability,
    createSurface({ actor, actorKey, style }) {
      if (!isRecord(actor) || typeof actor.id !== "string") {
        throw new BubbleRuntimeAdapterError(
          "BUBBLE-RUNTIME-001",
          "Bubble actor target is invalid.",
        );
      }
      return renderBackend === "svg-overlay"
        ? createSvgOverlaySurface(
            overlayManager as NonNullable<typeof overlayManager>,
            actor as unknown as BubbleSvgOverlayActor,
            actorKey,
            style,
            scheduler,
          )
        : createSurface(
            runtime,
            actor as unknown as TurboWarpBubbleTarget,
            actorKey,
            style,
            scheduler,
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
