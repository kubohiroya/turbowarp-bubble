import { actorRelativeBubbleCenter } from "./actor-transform.js";
import { bubbleBodyCenterOffset, renderBubbleSvg } from "./bubble-svg.js";
import {
  type BubbleAssetTarget,
  type BubbleImageCapability,
  type BubbleLayer,
  type BubbleMotionInput,
  type BubbleScheduler,
  type BubbleStyle,
  type BubbleSurface,
  type BubbleSurfaceTargets,
  type BubbleTextCapability,
  type BubbleVisualStyle,
} from "./composition.js";
import {
  bubbleDirectionVector,
  type BubbleDirectionName,
} from "./placement.js";
import {
  clampMotionProgress,
  easeMotionProgress,
  runMotionTimeline,
} from "./surface-motion.js";

const svgNamespace = "http://www.w3.org/2000/svg";
const xmlNamespace = "http://www.w3.org/XML/1998/namespace";
const portraitBoxSize = 96;
const indicatorBoxSize = 18;
const contentGap = 8;
const bubblePadding = 24;
const stageSafeMargin = 16;
const overlayTextTargetMarker = Symbol("BubbleSvgOverlayTextTarget");
const overlayImageTargetMarker = Symbol("BubbleSvgOverlayImageTarget");
let overlaySurfaceSequence = 0;

export type BubbleRenderBackend = "scratch-render" | "svg-overlay";
export type BubbleOverlayUnsupportedBehavior = "error" | "fallback";
export const bubbleRenderBackends = Object.freeze([
  "scratch-render",
  "svg-overlay",
] as const);
export const defaultBubbleRenderBackend: BubbleRenderBackend = "scratch-render";
export const defaultBubbleOverlayUnsupportedBehavior: BubbleOverlayUnsupportedBehavior =
  "error";

export interface BubbleSvgOverlayTextLine {
  /** Optional baseline relative to the center of the text layout. */
  readonly baseline?: number;
  readonly text: string;
  /** Optional x coordinate relative to the center of the text layout. */
  readonly x?: number;
}

export interface BubbleSvgOverlayTextLayout {
  readonly alignment: "center" | "left" | "right";
  readonly backgroundColor?: string;
  readonly backgroundCornerRadius?: number;
  readonly fill: string;
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly fontStyle?: "normal" | "italic";
  readonly fontWeight?: "normal" | "bold" | number;
  readonly height: number;
  readonly lineHeight: number;
  readonly lines: readonly (string | BubbleSvgOverlayTextLine)[];
  readonly preserveWhitespace?: boolean;
  readonly width: number;
}

export interface BubbleSvgOverlayTextCapability {
  layoutText(
    input: Readonly<{
      nativeSize: Readonly<{ height: number; width: number }>;
      styleName: string;
      text: string;
    }>,
  ): BubbleSvgOverlayTextLayout;
  measureText?(
    input: Readonly<{
      nativeSize: Readonly<{ height: number; width: number }>;
      styleName: string;
      text: string;
    }>,
  ): number;
}

export interface BubbleSvgOverlayImageResource {
  readonly height: number;
  readonly mimeType: string;
  /** A capability-owned blob URL or an approved raster data URL. */
  readonly src: string;
  /** Required when mimeType is image/svg+xml; the provider owns sanitizing bytes. */
  readonly svgSecurity?: "sanitized";
  readonly width: number;
  /** Required for blob URLs and called on replacement and disposal. */
  readonly release?: () => void | Promise<void>;
}

export interface BubbleSvgOverlayImageCapability {
  getMimeType(name: unknown): string;
  isRegistered(name: unknown): boolean;
  resolveImage(
    name: unknown,
  ): BubbleSvgOverlayImageResource | Promise<BubbleSvgOverlayImageResource>;
}

export interface BubbleSvgOverlayRenderer {
  addOverlay(element: Element, mode?: string): unknown;
  getNativeSize(): unknown;
  removeOverlay(element: Element): void;
  on?(event: string, listener: (...args: unknown[]) => void): void;
  off?(event: string, listener: (...args: unknown[]) => void): void;
}

export interface BubbleSvgOverlayActor {
  readonly id: string;
  readonly isStage: boolean;
  readonly visible?: boolean;
  readonly x?: number;
  readonly y?: number;
  getBoundsForBubble?(): {
    readonly bottom: number;
    readonly left: number;
    readonly right: number;
    readonly top: number;
  };
  onTargetVisualChange?: ((target?: BubbleSvgOverlayActor) => void) | null;
}

interface DrawableSize {
  readonly height: number;
  readonly width: number;
}

interface BubbleSvgOverlayTextTarget {
  readonly [overlayTextTargetMarker]: true;
  readonly group: SVGGElement;
  clear(): void;
  getSize(): DrawableSize;
  render(layout: BubbleSvgOverlayTextLayout): void;
}

interface BubbleSvgOverlayImageTarget extends BubbleAssetTarget {
  readonly [overlayImageTargetMarker]: true;
  readonly group: SVGGElement;
  applyResource(resource: BubbleSvgOverlayImageResource): Promise<void>;
  getSize(): DrawableSize;
  release(): Promise<void>;
  setDisplaySize(size: DrawableSize): void;
  setVisible(visible: boolean): void;
}

export interface BubbleSvgOverlaySurfaceManager {
  readonly document: Document;
  readonly renderer: BubbleSvgOverlayRenderer;
  acquire(group: SVGGElement): void;
  release(group: SVGGElement): void;
  updateNativeSize(): Readonly<{ height: number; width: number }>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNativeSize(
  renderer: Pick<BubbleSvgOverlayRenderer, "getNativeSize">,
): Readonly<{ height: number; width: number }> {
  const raw = renderer.getNativeSize();
  const width = Array.isArray(raw) ? Number(raw[0]) : Number.NaN;
  const height = Array.isArray(raw) ? Number(raw[1]) : Number.NaN;
  return Object.freeze({
    width: width > 0 ? width : 480,
    height: height > 0 ? height : 360,
  });
}

function requireFiniteDimension(value: unknown, label: string): number {
  const result = Number(value);
  if (!Number.isFinite(result) || result <= 0) {
    throw new TypeError(`${label} must be a positive finite number.`);
  }
  return result;
}

function requireSafeColor(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 128) {
    throw new TypeError(`${label} must be a non-empty color string.`);
  }
  if (/url\s*\(|[<>;]/iu.test(value)) {
    throw new TypeError(`${label} contains a disallowed SVG value.`);
  }
  return value;
}

function requireSafeFontFamily(value: unknown): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > 256 ||
    /url\s*\(|[<>{};]/iu.test(value)
  ) {
    throw new TypeError("SVG overlay fontFamily is invalid.");
  }
  return value;
}

function normalizeTextLayout(value: unknown): BubbleSvgOverlayTextLayout {
  if (!isRecord(value) || !Array.isArray(value.lines)) {
    throw new TypeError("SVG overlay text layout is invalid.");
  }
  const alignment = value.alignment;
  if (alignment !== "left" && alignment !== "center" && alignment !== "right") {
    throw new TypeError("SVG overlay text alignment is invalid.");
  }
  const fontStyle = value.fontStyle;
  if (
    fontStyle !== undefined &&
    fontStyle !== "normal" &&
    fontStyle !== "italic"
  ) {
    throw new TypeError("SVG overlay fontStyle is invalid.");
  }
  const fontWeight = value.fontWeight;
  if (
    fontWeight !== undefined &&
    fontWeight !== "normal" &&
    fontWeight !== "bold" &&
    (!Number.isFinite(fontWeight) ||
      Number(fontWeight) < 1 ||
      Number(fontWeight) > 1000)
  ) {
    throw new TypeError("SVG overlay fontWeight is invalid.");
  }
  const lines = Object.freeze(
    value.lines.map((line) => {
      if (typeof line === "string") return line;
      if (!isRecord(line) || typeof line.text !== "string") {
        throw new TypeError(
          "SVG overlay text lines must be strings or positioned line records.",
        );
      }
      const hasX = line.x !== undefined;
      const hasBaseline = line.baseline !== undefined;
      if (hasX !== hasBaseline) {
        throw new TypeError(
          "SVG overlay positioned text lines require both x and baseline.",
        );
      }
      if (
        hasX &&
        (!Number.isFinite(line.x) || !Number.isFinite(line.baseline))
      ) {
        throw new TypeError(
          "SVG overlay text line coordinates must be finite numbers.",
        );
      }
      return Object.freeze({
        text: line.text,
        ...(hasX ? { x: Number(line.x), baseline: Number(line.baseline) } : {}),
      });
    }),
  );
  const backgroundColor =
    value.backgroundColor === undefined
      ? undefined
      : requireSafeColor(value.backgroundColor, "SVG overlay backgroundColor");
  const backgroundCornerRadius =
    value.backgroundCornerRadius === undefined
      ? undefined
      : Number(value.backgroundCornerRadius);
  if (
    backgroundCornerRadius !== undefined &&
    (!Number.isFinite(backgroundCornerRadius) || backgroundCornerRadius < 0)
  ) {
    throw new TypeError(
      "SVG overlay backgroundCornerRadius must be a non-negative finite number.",
    );
  }
  const preserveWhitespace = value.preserveWhitespace;
  if (
    preserveWhitespace !== undefined &&
    typeof preserveWhitespace !== "boolean"
  ) {
    throw new TypeError("SVG overlay preserveWhitespace must be a boolean.");
  }
  return Object.freeze({
    alignment,
    fill: requireSafeColor(value.fill, "SVG overlay text fill"),
    fontFamily: requireSafeFontFamily(value.fontFamily),
    fontSize: requireFiniteDimension(value.fontSize, "SVG overlay fontSize"),
    height: requireFiniteDimension(value.height, "SVG overlay text height"),
    lineHeight: requireFiniteDimension(
      value.lineHeight,
      "SVG overlay lineHeight",
    ),
    lines,
    width: requireFiniteDimension(value.width, "SVG overlay text width"),
    ...(backgroundColor === undefined ? {} : { backgroundColor }),
    ...(backgroundCornerRadius === undefined ? {} : { backgroundCornerRadius }),
    ...(fontStyle === undefined ? {} : { fontStyle }),
    ...(fontWeight === undefined
      ? {}
      : { fontWeight: fontWeight as "normal" | "bold" | number }),
    ...(preserveWhitespace === undefined ? {} : { preserveWhitespace }),
  });
}

function createTextTarget(
  document: Document,
  group: SVGGElement,
): BubbleSvgOverlayTextTarget {
  let size: DrawableSize = { width: 180, height: 48 };
  return Object.freeze({
    [overlayTextTargetMarker]: true as const,
    group,
    clear(): void {
      group.replaceChildren();
      size = { width: 180, height: 48 };
    },
    getSize(): DrawableSize {
      return size;
    },
    render(layoutInput: BubbleSvgOverlayTextLayout): void {
      const layout = normalizeTextLayout(layoutInput);
      const children: SVGElement[] = [];
      if (
        layout.backgroundColor !== undefined &&
        layout.backgroundColor !== "transparent"
      ) {
        const background = document.createElementNS(svgNamespace, "rect");
        background.setAttribute("x", String(-layout.width / 2));
        background.setAttribute("y", String(-layout.height / 2));
        background.setAttribute("width", String(layout.width));
        background.setAttribute("height", String(layout.height));
        background.setAttribute("fill", layout.backgroundColor);
        if (layout.backgroundCornerRadius !== undefined) {
          background.setAttribute("rx", String(layout.backgroundCornerRadius));
        }
        children.push(background);
      }
      const text = document.createElementNS(svgNamespace, "text");
      const anchor =
        layout.alignment === "left"
          ? "start"
          : layout.alignment === "right"
            ? "end"
            : "middle";
      const x =
        layout.alignment === "left"
          ? -layout.width / 2
          : layout.alignment === "right"
            ? layout.width / 2
            : 0;
      text.setAttribute("text-anchor", anchor);
      text.setAttribute("fill", layout.fill);
      text.setAttribute("font-family", layout.fontFamily);
      text.setAttribute("font-size", String(layout.fontSize));
      if (layout.preserveWhitespace !== false) {
        text.setAttributeNS(xmlNamespace, "xml:space", "preserve");
      }
      if (layout.fontStyle !== undefined)
        text.setAttribute("font-style", layout.fontStyle);
      if (layout.fontWeight !== undefined)
        text.setAttribute("font-weight", String(layout.fontWeight));
      const contentHeight = Math.max(
        layout.fontSize,
        (layout.lines.length - 1) * layout.lineHeight + layout.fontSize,
      );
      const firstBaseline = -contentHeight / 2 + layout.fontSize;
      layout.lines.forEach((line, index) => {
        const tspan = document.createElementNS(svgNamespace, "tspan");
        const positionedLine = typeof line === "string" ? undefined : line;
        tspan.setAttribute("x", String(positionedLine?.x ?? x));
        tspan.setAttribute(
          "y",
          String(
            positionedLine?.baseline ??
              firstBaseline + index * layout.lineHeight,
          ),
        );
        tspan.textContent = typeof line === "string" ? line : line.text;
        text.appendChild(tspan);
      });
      children.push(text);
      group.replaceChildren(...children);
      size = { width: layout.width, height: layout.height };
    },
  });
}

function requireTextTarget(value: unknown): BubbleSvgOverlayTextTarget {
  const candidate = value as Partial<BubbleSvgOverlayTextTarget> | null;
  if (candidate?.[overlayTextTargetMarker] !== true) {
    throw new TypeError("SVG overlay text target is invalid.");
  }
  return candidate as BubbleSvgOverlayTextTarget;
}

export function createSvgOverlayTextAdapter(
  capabilityInput: BubbleSvgOverlayTextCapability,
  renderer: Pick<BubbleSvgOverlayRenderer, "getNativeSize">,
): BubbleTextCapability {
  if (
    !isRecord(capabilityInput) ||
    typeof capabilityInput.layoutText !== "function"
  ) {
    throw new TypeError(
      "SVG overlay backend requires a text layout capability.",
    );
  }
  const capability = capabilityInput;
  const adapter: BubbleTextCapability = {
    setText({
      styleName,
      target,
      text,
    }: Parameters<BubbleTextCapability["setText"]>[0]): void {
      const nativeSize = readNativeSize(renderer);
      requireTextTarget(target).render(
        capability.layoutText({ nativeSize, styleName, text }),
      );
    },
    releaseTarget(
      target: Parameters<BubbleTextCapability["releaseTarget"]>[0],
    ): void {
      requireTextTarget(target).clear();
    },
    measureText({
      styleName,
      text,
    }: Parameters<
      NonNullable<BubbleTextCapability["measureText"]>
    >[0]): number {
      const nativeSize = readNativeSize(renderer);
      const measured =
        capability.measureText?.({ nativeSize, styleName, text }) ??
        capability.layoutText({ nativeSize, styleName, text }).width;
      return requireFiniteDimension(
        measured,
        "SVG overlay measured text width",
      );
    },
  };
  return Object.freeze(adapter);
}

function isSafeImageSource(resource: BubbleSvgOverlayImageResource): boolean {
  const supportedMimeTypes = new Set([
    "image/avif",
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/svg+xml",
    "image/webp",
  ]);
  if (!supportedMimeTypes.has(resource.mimeType.toLowerCase())) return false;
  if (
    resource.mimeType.toLowerCase() === "image/svg+xml" &&
    resource.svgSecurity !== "sanitized"
  ) {
    return false;
  }
  if (resource.src.startsWith("blob:"))
    return typeof resource.release === "function";
  return /^data:image\/(?:avif|gif|jpeg|png|webp);base64,/iu.test(resource.src);
}

async function releaseImageResource(
  resource: BubbleSvgOverlayImageResource | undefined,
): Promise<void> {
  await resource?.release?.();
}

function createImageTarget(
  document: Document,
  id: string,
  group: SVGGElement,
): BubbleSvgOverlayImageTarget {
  const image = document.createElementNS(svgNamespace, "image");
  image.setAttribute("preserveAspectRatio", "xMidYMid meet");
  group.appendChild(image);
  let resource: BubbleSvgOverlayImageResource | undefined;
  let displaySize: DrawableSize = { width: 1, height: 1 };
  let resourceGeneration = 0;

  const applyDisplaySize = (): void => {
    image.setAttribute("x", String(-displaySize.width / 2));
    image.setAttribute("y", String(-displaySize.height / 2));
    image.setAttribute("width", String(displaySize.width));
    image.setAttribute("height", String(displaySize.height));
  };
  applyDisplaySize();

  return Object.freeze({
    id,
    isStage: false,
    [overlayImageTargetMarker]: true as const,
    group,
    async applyResource(
      nextResource: BubbleSvgOverlayImageResource,
    ): Promise<void> {
      const generation = resourceGeneration + 1;
      resourceGeneration = generation;
      try {
        requireFiniteDimension(nextResource.width, "SVG overlay image width");
        requireFiniteDimension(nextResource.height, "SVG overlay image height");
        if (
          typeof nextResource.mimeType !== "string" ||
          !nextResource.mimeType.startsWith("image/") ||
          typeof nextResource.src !== "string" ||
          !isSafeImageSource(nextResource)
        ) {
          throw new TypeError(
            "SVG overlay image resources must use a supported MIME type, a releasable blob URL or approved raster data URL, and sanitized SVG metadata when applicable.",
          );
        }
      } catch (error) {
        await releaseImageResource(nextResource);
        throw error;
      }
      if (generation !== resourceGeneration) {
        await releaseImageResource(nextResource);
        return;
      }
      const previous = resource;
      resource = nextResource;
      image.setAttribute("href", nextResource.src);
      await releaseImageResource(previous);
    },
    getSize(): DrawableSize {
      return resource
        ? { width: resource.width, height: resource.height }
        : { width: 1, height: 1 };
    },
    async release(): Promise<void> {
      resourceGeneration += 1;
      const previous = resource;
      resource = undefined;
      image.removeAttribute("href");
      await releaseImageResource(previous);
    },
    setDisplaySize(nextSize: DrawableSize): void {
      displaySize = nextSize;
      applyDisplaySize();
    },
    setVisible(visible: boolean): void {
      group.setAttribute("visibility", visible ? "visible" : "hidden");
    },
  });
}

function requireImageTarget(value: unknown): BubbleSvgOverlayImageTarget {
  const candidate = value as Partial<BubbleSvgOverlayImageTarget> | null;
  if (candidate?.[overlayImageTargetMarker] !== true) {
    throw new TypeError("SVG overlay image target is invalid.");
  }
  return candidate as BubbleSvgOverlayImageTarget;
}

export function createSvgOverlayImageAdapter(
  capabilityInput: BubbleSvgOverlayImageCapability,
): BubbleImageCapability {
  if (
    !isRecord(capabilityInput) ||
    typeof capabilityInput.isRegistered !== "function" ||
    typeof capabilityInput.getMimeType !== "function" ||
    typeof capabilityInput.resolveImage !== "function"
  ) {
    throw new TypeError("SVG overlay image capability is invalid.");
  }
  const capability = capabilityInput;
  const adapter: BubbleImageCapability = {
    isRegistered(name: unknown): boolean {
      return capability.isRegistered(name);
    },
    getMimeType(name: unknown): string {
      return capability.getMimeType(name);
    },
    async applyToTarget(
      name: unknown,
      target: BubbleAssetTarget,
    ): Promise<void> {
      await requireImageTarget(target).applyResource(
        await capability.resolveImage(name),
      );
    },
  };
  return Object.freeze(adapter);
}

export function createSvgOverlaySurfaceManager(
  renderer: BubbleSvgOverlayRenderer,
  documentInput: Document,
): BubbleSvgOverlaySurfaceManager {
  const root = documentInput.createElementNS(svgNamespace, "svg");
  root.setAttribute("xmlns", svgNamespace);
  root.setAttribute("aria-hidden", "true");
  root.setAttribute("focusable", "false");
  root.setAttribute("data-bubble-render-backend", "svg-overlay");
  root.style.display = "block";
  root.style.overflow = "hidden";
  root.style.pointerEvents = "none";
  const groups = new Set<SVGGElement>();
  let attached = false;

  const updateNativeSize = (): Readonly<{ height: number; width: number }> => {
    const size = readNativeSize(renderer);
    root.setAttribute("width", String(size.width));
    root.setAttribute("height", String(size.height));
    root.setAttribute("viewBox", `0 0 ${size.width} ${size.height}`);
    return size;
  };

  return Object.freeze({
    document: documentInput,
    renderer,
    acquire(group: SVGGElement): void {
      if (groups.has(group)) return;
      updateNativeSize();
      if (!attached) {
        try {
          renderer.addOverlay(root, "scale");
          attached = true;
        } catch (error) {
          renderer.removeOverlay(root);
          throw error;
        }
      }
      root.appendChild(group);
      groups.add(group);
    },
    release(group: SVGGElement): void {
      if (!groups.delete(group)) return;
      group.remove();
      if (groups.size === 0 && attached) {
        renderer.removeOverlay(root);
        attached = false;
      }
    },
    updateNativeSize,
  });
}

function targetBounds(target: BubbleSvgOverlayActor) {
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
    // Fall back to the actor position when the host cannot calculate bounds.
  }
  const x = Number.isFinite(target.x) ? Number(target.x) : 0;
  const y = Number.isFinite(target.y) ? Number(target.y) : 0;
  return { bottom: y, left: x, right: x, top: y };
}

function clamp(value: number, minimum: number, maximum: number): number {
  if (maximum < minimum) return (minimum + maximum) / 2;
  return Math.min(maximum, Math.max(minimum, value));
}

function tailDirectionForPlacement(
  direction: BubbleDirectionName | number,
): number {
  const vector = bubbleDirectionVector(direction);
  const degrees = (Math.atan2(-vector.x, -vector.y) * 180) / Math.PI;
  return ((degrees % 360) + 360) % 360;
}

const allowedBodyElements = new Set(["circle", "g", "path", "rect", "title"]);
const allowedBodyAttributes = new Set([
  "cx",
  "cy",
  "d",
  "data-boolean-operation",
  "data-tail-base-on-border",
  "fill",
  "fill-rule",
  "height",
  "opacity",
  "r",
  "rx",
  "stroke",
  "stroke-dasharray",
  "stroke-linejoin",
  "stroke-width",
  "transform",
  "width",
  "x",
  "y",
]);

function copyAllowedBodyNode(source: Element, document: Document): SVGElement {
  const name = source.localName;
  if (!allowedBodyElements.has(name)) {
    throw new TypeError(`Bubble body SVG element is not allowed: ${name}`);
  }
  const result = document.createElementNS(svgNamespace, name);
  for (const attribute of source.getAttributeNames()) {
    if (!allowedBodyAttributes.has(attribute)) {
      throw new TypeError(
        `Bubble body SVG attribute is not allowed: ${attribute}`,
      );
    }
    const value = source.getAttribute(attribute) ?? "";
    if (/javascript:|url\s*\(/iu.test(value)) {
      throw new TypeError(
        "Bubble body SVG contains an unsafe attribute value.",
      );
    }
    result.setAttribute(attribute, value);
  }
  if (name === "title") result.textContent = source.textContent ?? "";
  for (const child of Array.from(source.children)) {
    result.appendChild(copyAllowedBodyNode(child, document));
  }
  return result;
}

function replaceBodyFromCanonicalSvg(
  group: SVGGElement,
  svg: string,
  document: Document,
): void {
  const Parser = document.defaultView?.DOMParser;
  if (!Parser) {
    throw new TypeError("SVG overlay backend requires DOMParser.");
  }
  const parsed = new Parser().parseFromString(svg, "image/svg+xml");
  if (parsed.querySelector("parsererror")) {
    throw new TypeError("Canonical Bubble body SVG could not be parsed.");
  }
  const children = Array.from(parsed.documentElement.children).map((child) =>
    copyAllowedBodyNode(child, document),
  );
  group.replaceChildren(...children);
}

function fitImage(
  target: BubbleSvgOverlayImageTarget,
  boxSize: number,
  scaleMultiplier = 1,
): DrawableSize {
  const native = target.getSize();
  const scale = Math.min(boxSize / native.width, boxSize / native.height);
  const size = {
    width: native.width * scale * scaleMultiplier,
    height: native.height * scale * scaleMultiplier,
  };
  target.setDisplaySize(size);
  return size;
}

export function createSvgOverlaySurface(
  manager: BubbleSvgOverlaySurfaceManager,
  actor: BubbleSvgOverlayActor,
  actorKey: string,
  style: BubbleStyle,
  scheduler: BubbleScheduler,
): BubbleSurface {
  const { document, renderer } = manager;
  const sequence = overlaySurfaceSequence;
  overlaySurfaceSequence += 1;
  const surfaceGroup = document.createElementNS(svgNamespace, "g");
  surfaceGroup.setAttribute("data-bubble-surface", `${actorKey}:${sequence}`);
  const bodyGroup = document.createElementNS(svgNamespace, "g");
  bodyGroup.setAttribute("data-bubble-layer", "body");
  surfaceGroup.appendChild(bodyGroup);

  const createLayerGroup = (layer: string): SVGGElement => {
    const group = document.createElementNS(svgNamespace, "g");
    group.setAttribute("data-bubble-layer", layer);
    group.setAttribute("visibility", "hidden");
    surfaceGroup.appendChild(group);
    return group;
  };

  const portraitBase = createImageTarget(
    document,
    `bubble:${actorKey}:${sequence}:portrait-base`,
    createLayerGroup("portrait-base"),
  );
  const portraitBlink = createImageTarget(
    document,
    `bubble:${actorKey}:${sequence}:portrait-blink`,
    createLayerGroup("portrait-blink"),
  );
  const portraitLipSync = createImageTarget(
    document,
    `bubble:${actorKey}:${sequence}:portrait-lip-sync`,
    createLayerGroup("portrait-lip-sync"),
  );
  const textGroup = createLayerGroup("text");
  const text = createTextTarget(document, textGroup);
  const continueIndicator = createImageTarget(
    document,
    `bubble:${actorKey}:${sequence}:continue-indicator`,
    createLayerGroup("continue-indicator"),
  );
  const targets: BubbleSurfaceTargets = Object.freeze({
    text,
    portraitBase,
    portraitBlink,
    portraitLipSync,
    continueIndicator,
  });
  const layerTargets = new Map<BubbleLayer, BubbleSvgOverlayImageTarget>([
    ["portraitBase", portraitBase],
    ["portraitBlink", portraitBlink],
    ["portraitLipSync", portraitLipSync],
    ["continueIndicator", continueIndicator],
  ]);
  const layerVisibility = new Map<BubbleLayer, boolean>();
  const clipId = `bubble-portrait-clip-${sequence}`;
  const definitions = document.createElementNS(svgNamespace, "defs");
  const clipPath = document.createElementNS(svgNamespace, "clipPath");
  const clipRect = document.createElementNS(svgNamespace, "rect");
  clipPath.setAttribute("id", clipId);
  clipPath.appendChild(clipRect);
  definitions.appendChild(clipPath);
  surfaceGroup.insertBefore(definitions, bodyGroup);

  let currentStyle = style;
  let disposed = false;
  let surfaceVisible = false;
  let reservedTextSize: DrawableSize | undefined;
  let bodySignature = "";
  let motionTranslation: [number, number] = [0, 0];
  let motionScaleMultiplier = 1;
  let motionOpacity = 1;
  let center: [number, number] = [0, 0];
  let shapeTransition:
    | {
        readonly from: BubbleVisualStyle;
        readonly progress: number;
        readonly to: BubbleVisualStyle;
      }
    | undefined;

  const applyMotionTransform = (): void => {
    const native = manager.updateNativeSize();
    const centerX = native.width / 2 + center[0];
    const centerY = native.height / 2 - center[1];
    const translatedX = centerX + motionTranslation[0];
    const translatedY = centerY - motionTranslation[1];
    surfaceGroup.setAttribute(
      "transform",
      `translate(${translatedX} ${translatedY}) scale(${motionScaleMultiplier}) translate(${-centerX} ${-centerY})`,
    );
    surfaceGroup.setAttribute("opacity", String(motionOpacity));
  };

  const layerAllowedByStyle = (layer: BubbleLayer): boolean => {
    if (layer === "continueIndicator")
      return currentStyle.continueIndicator !== undefined;
    if (layer === "portraitBase") return currentStyle.portrait !== undefined;
    if (layer === "portraitBlink")
      return currentStyle.portrait?.blink !== undefined;
    return currentStyle.portrait?.lipSync !== undefined;
  };

  const updateVisibility = (): void => {
    const actorVisible =
      currentStyle.placement.basis === "background" || actor.visible !== false;
    const visible = surfaceVisible && actorVisible && motionOpacity > 0;
    surfaceGroup.setAttribute("visibility", visible ? "visible" : "hidden");
    bodyGroup.setAttribute(
      "visibility",
      visible && currentStyle.visualStyle !== "NO_BUBBLE"
        ? "visible"
        : "hidden",
    );
    textGroup.setAttribute("visibility", visible ? "visible" : "hidden");
    for (const [layer, target] of layerTargets) {
      target.setVisible(
        visible &&
          layerAllowedByStyle(layer) &&
          (layerVisibility.get(layer) ?? false),
      );
    }
    applyMotionTransform();
  };

  const position = (): void => {
    if (disposed) return;
    const native = manager.updateNativeSize();
    const scaleMultiplier =
      currentStyle.placement.basis === "actor"
        ? currentStyle.offset.scalePercent / 100
        : 1;
    const nativeTextSize = reservedTextSize ?? text.getSize();
    const textSize = {
      width: nativeTextSize.width * scaleMultiplier,
      height: nativeTextSize.height * scaleMultiplier,
    };
    const portraitZoomMultiplier =
      (currentStyle.portrait?.offset.zoomPercent ?? 100) / 100;
    const hasPortrait = currentStyle.portrait !== undefined;
    const portraitSize = hasPortrait
      ? fitImage(
          portraitBase,
          portraitBoxSize * portraitZoomMultiplier,
          scaleMultiplier,
        )
      : { width: 0, height: 0 };
    for (const target of [portraitBlink, portraitLipSync]) {
      if (hasPortrait)
        fitImage(
          target,
          portraitBoxSize * portraitZoomMultiplier,
          scaleMultiplier,
        );
    }
    const indicatorSize = fitImage(
      continueIndicator,
      indicatorBoxSize,
      scaleMultiplier,
    );
    const totalWidth =
      portraitSize.width +
      (hasPortrait ? contentGap * scaleMultiplier : 0) +
      textSize.width;
    const contentHeight = Math.max(portraitSize.height, textSize.height);
    const baseBubbleWidth = totalWidth / scaleMultiplier + bubblePadding * 2;
    const baseBubbleHeight =
      contentHeight / scaleMultiplier + bubblePadding * 2;
    const stageLeft = -native.width / 2;
    const stageRight = native.width / 2;
    const stageTop = native.height / 2;
    const stageBottom = -native.height / 2;
    let centerX: number;
    let centerY: number;
    if (currentStyle.placement.basis === "background") {
      centerX = 0;
      if (currentStyle.placement.region === "HEADER_LIKE") {
        centerY = stageTop - stageSafeMargin - contentHeight / 2;
      } else if (currentStyle.placement.region === "FOOTER_LIKE") {
        centerY = stageBottom + stageSafeMargin + contentHeight / 2;
      } else {
        centerY = 0;
      }
    } else {
      const nextCenter = actorRelativeBubbleCenter({
        bounds: targetBounds(actor),
        bubbleWidth: totalWidth,
        bubbleHeight: contentHeight,
        direction: currentStyle.placement.direction,
        distance: currentStyle.distance,
        tailLength: currentStyle.tailLength,
        offset: currentStyle.offset,
      });
      centerX = nextCenter.x;
      centerY = nextCenter.y;
    }
    centerX = clamp(
      centerX,
      stageLeft + totalWidth / 2,
      stageRight - totalWidth / 2,
    );
    centerY = clamp(
      centerY,
      stageBottom + contentHeight / 2,
      stageTop - contentHeight / 2,
    );
    center = [centerX, centerY];

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
    const nextBodySignature = JSON.stringify({
      baseBubbleHeight,
      baseBubbleWidth,
      bodyOffset,
      shapeTransition,
      tailDirection,
      tailLength: currentStyle.tailLength,
      visualStyle: currentStyle.visualStyle,
    });
    if (nextBodySignature !== bodySignature) {
      replaceBodyFromCanonicalSvg(
        bodyGroup,
        renderBubbleSvg({
          style: currentStyle.visualStyle,
          lines: [],
          width: baseBubbleWidth,
          height: baseBubbleHeight,
          tailDirection,
          tailLength: currentStyle.tailLength,
          offset: bodyOffset,
          title: `${currentStyle.name} Bubble body`,
          ...(shapeTransition === undefined ? {} : { shapeTransition }),
        }),
        document,
      );
      bodySignature = nextBodySignature;
    }
    bodyGroup.setAttribute("data-bubble-style", currentStyle.visualStyle);
    if (shapeTransition === undefined) {
      bodyGroup.removeAttribute("data-bubble-shape-transition-from");
      bodyGroup.removeAttribute("data-bubble-shape-transition-to");
      bodyGroup.removeAttribute("data-bubble-shape-transition-progress");
    } else {
      bodyGroup.setAttribute(
        "data-bubble-shape-transition-from",
        shapeTransition.from,
      );
      bodyGroup.setAttribute(
        "data-bubble-shape-transition-to",
        shapeTransition.to,
      );
      bodyGroup.setAttribute(
        "data-bubble-shape-transition-progress",
        String(shapeTransition.progress),
      );
    }
    const bodyDrawableX = centerX - bodyCenterOffset.x;
    const bodyDrawableY = centerY + bodyCenterOffset.y;
    bodyGroup.setAttribute(
      "transform",
      `translate(${native.width / 2 + bodyDrawableX - baseBubbleWidth / 2} ${native.height / 2 - bodyDrawableY - baseBubbleHeight / 2})`,
    );

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
    const toDomTransform = (x: number, y: number): string =>
      `translate(${native.width / 2 + x} ${native.height / 2 - y})`;
    for (const target of [portraitBase, portraitBlink, portraitLipSync]) {
      target.group.setAttribute(
        "transform",
        toDomTransform(portraitX, portraitY),
      );
    }
    textGroup.setAttribute(
      "transform",
      `${toDomTransform(textX, centerY)} scale(${scaleMultiplier})`,
    );
    const indicatorX =
      textX +
      textSize.width / 2 -
      indicatorSize.width / 2 -
      contentGap * scaleMultiplier;
    const indicatorY =
      centerY -
      textSize.height / 2 +
      indicatorSize.height / 2 +
      contentGap * scaleMultiplier;
    continueIndicator.group.setAttribute(
      "transform",
      toDomTransform(indicatorX, indicatorY),
    );

    const radius = Math.min(
      currentStyle.portrait?.cornerRadius ?? 0,
      portraitSize.width / 2,
      portraitSize.height / 2,
    );
    clipRect.setAttribute("x", String(-portraitSize.width / 2));
    clipRect.setAttribute("y", String(-portraitSize.height / 2));
    clipRect.setAttribute("width", String(portraitSize.width));
    clipRect.setAttribute("height", String(portraitSize.height));
    clipRect.setAttribute("rx", String(radius));
    for (const target of [portraitBase, portraitBlink, portraitLipSync]) {
      if (radius > 0) target.group.setAttribute("clip-path", `url(#${clipId})`);
      else target.group.removeAttribute("clip-path");
    }
    applyMotionTransform();
    updateVisibility();
  };

  const originalVisualChange = actor.onTargetVisualChange;
  const visualChangeHook = (changedTarget?: BubbleSvgOverlayActor): void => {
    originalVisualChange?.(changedTarget);
    position();
  };
  const nativeSizeHook = (): void => position();
  manager.acquire(surfaceGroup);
  if (currentStyle.placement.basis === "actor") {
    actor.onTargetVisualChange = visualChangeHook;
  }
  renderer.on?.("NativeSizeChanged", nativeSizeHook);

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
      bodySignature = "";
      if (nextStyle.reveal?.layout !== "RESERVED") reservedTextSize = undefined;
      const isActorRelative = currentStyle.placement.basis === "actor";
      if (wasActorRelative && !isActorRelative) {
        if (actor.onTargetVisualChange === visualChangeHook)
          actor.onTargetVisualChange = originalVisualChange ?? null;
      } else if (!wasActorRelative && isActorRelative) {
        actor.onTargetVisualChange = visualChangeHook;
      }
      position();
    },
    captureTextLayout(): void {
      if (disposed) return;
      reservedTextSize = text.getSize();
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
        applyMotionTransform();
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
        const vector = bubbleDirectionVector(direction);
        await runMotionTimeline(scheduler, animationDuration, (progress) => {
          const displacement =
            Math.sin(eased(progress) * count * Math.PI * 2) * 5;
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
          const wave = Math.abs(Math.sin(eased(progress) * count * Math.PI));
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
        shapeTransition = { from: fromStyle, to: targetStyle, progress: 0 };
        position();
        await runMotionTimeline(scheduler, durationSeconds, (progress) => {
          const speedProgress =
            durationSeconds === 0
              ? 1
              : clampMotionProgress(progress * Math.max(speed, 1));
          shapeTransition = {
            from: fromStyle,
            to: targetStyle,
            progress: easeMotionProgress(
              speedProgress,
              motion.ease ?? "easeInOut",
            ),
          };
          bodySignature = "";
          position();
        });
        shapeTransition = undefined;
        bodySignature = "";
        position();
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
    async dispose(): Promise<void> {
      if (disposed) return;
      disposed = true;
      if (actor.onTargetVisualChange === visualChangeHook)
        actor.onTargetVisualChange = originalVisualChange ?? null;
      renderer.off?.("NativeSizeChanged", nativeSizeHook);
      manager.release(surfaceGroup);
      text.clear();
      await Promise.all(
        [...layerTargets.values()].map((target) => target.release()),
      );
    },
  });
}
