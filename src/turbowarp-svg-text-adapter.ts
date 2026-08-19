import type {
  BubbleTextCapability,
  BubbleTextTarget,
} from "./text-capability.js";
import type {
  BubbleSvgOverlayTextCapability,
  BubbleSvgOverlayTextLayout,
} from "./svg-overlay-surface.js";

export interface TurboWarpSvgTextExtension {
  getLayoutCapability?(): SvgTextLayoutCompositionLike;
  setText(
    args: Readonly<{ STYLE: unknown; TEXT: unknown }>,
    util: Readonly<{ target: unknown }>,
  ): void;
  measureText?(styleName: unknown, text: unknown): number;
  releaseTextActor(target: unknown): boolean;
}

interface SvgTextCompositionLike {
  setText(input: {
    readonly styleName: string;
    readonly target: unknown;
    readonly text: string;
  }): void;
  releaseTarget(target: unknown): void;
  measureText?(input: {
    readonly styleName: string;
    readonly text: string;
  }): number;
}

interface SvgTextLayoutLineLike {
  readonly baseline: number;
  readonly text: string;
  readonly width: number;
  readonly x: number;
}

interface SvgTextLayoutLike {
  readonly height: number;
  readonly lines: readonly SvgTextLayoutLineLike[];
  readonly preserveWhitespace: boolean;
  readonly style: Readonly<{
    alignment: "center" | "left" | "right";
    backgroundColor: string;
    cornerRadius: number;
    font: string;
    fontSize: number;
    lineHeight: number;
    textColor: string;
  }>;
  readonly width: number;
}

export interface SvgTextLayoutCompositionLike {
  layoutText(
    input: Readonly<{
      nativeSize: readonly [width: number, height: number];
      styleName: string;
      text: string;
    }>,
  ): SvgTextLayoutLike;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateExtension(value: unknown): TurboWarpSvgTextExtension {
  if (
    !isRecord(value) ||
    typeof value.setText !== "function" ||
    typeof value.releaseTextActor !== "function"
  ) {
    throw new TypeError(
      "TurboWarp SVG Text adapter requires setText and releaseTextActor.",
    );
  }
  return value as unknown as TurboWarpSvgTextExtension;
}

function validateComposition(value: unknown): SvgTextCompositionLike {
  if (
    !isRecord(value) ||
    typeof value.setText !== "function" ||
    typeof value.releaseTarget !== "function"
  ) {
    throw new TypeError(
      "SVG Text composition adapter requires setText and releaseTarget.",
    );
  }
  return value as unknown as SvgTextCompositionLike;
}

function validateLayoutComposition(
  value: unknown,
): SvgTextLayoutCompositionLike {
  if (!isRecord(value) || typeof value.layoutText !== "function") {
    throw new TypeError(
      "SVG Text overlay adapter requires the layoutText composition API.",
    );
  }
  return value as unknown as SvgTextLayoutCompositionLike;
}

function requireFiniteNumber(value: unknown, label: string): number {
  const result = Number(value);
  if (!Number.isFinite(result)) {
    throw new TypeError(`${label} must be a finite number.`);
  }
  return result;
}

function adaptSvgTextLayout(value: unknown): BubbleSvgOverlayTextLayout {
  if (
    !isRecord(value) ||
    !isRecord(value.style) ||
    !Array.isArray(value.lines)
  ) {
    throw new TypeError("SVG Text layout result is invalid.");
  }
  const style = value.style;
  const alignment = style.alignment;
  if (alignment !== "left" && alignment !== "center" && alignment !== "right") {
    throw new TypeError("SVG Text layout alignment is invalid.");
  }
  const width = requireFiniteNumber(value.width, "SVG Text layout width");
  const height = requireFiniteNumber(value.height, "SVG Text layout height");
  const lines = Object.freeze(
    value.lines.map((line) => {
      if (!isRecord(line) || typeof line.text !== "string") {
        throw new TypeError("SVG Text layout line is invalid.");
      }
      return Object.freeze({
        baseline:
          requireFiniteNumber(line.baseline, "SVG Text line baseline") -
          height / 2,
        text: line.text,
        x: requireFiniteNumber(line.x, "SVG Text line x") - width / 2,
      });
    }),
  );
  return Object.freeze({
    alignment,
    backgroundColor: String(style.backgroundColor),
    backgroundCornerRadius: requireFiniteNumber(
      style.cornerRadius,
      "SVG Text corner radius",
    ),
    fill: String(style.textColor),
    fontFamily: String(style.font),
    fontSize: requireFiniteNumber(style.fontSize, "SVG Text font size"),
    height,
    lineHeight: requireFiniteNumber(style.lineHeight, "SVG Text line height"),
    lines,
    preserveWhitespace: value.preserveWhitespace !== false,
    width,
  });
}

/**
 * Adapt the TurboWarp SVG Text extension to Bubble's host-neutral text
 * capability contract.
 */
export function createTurboWarpSvgTextCapability(
  extensionInput: unknown,
): BubbleTextCapability {
  const extension = validateExtension(extensionInput);
  return Object.freeze({
    setText({
      styleName,
      target,
      text,
    }: Parameters<BubbleTextCapability["setText"]>[0]): void {
      extension.setText({ STYLE: styleName, TEXT: text }, { target });
    },
    releaseTarget(target: BubbleTextTarget): void {
      extension.releaseTextActor(target);
    },
    measureText({
      styleName,
      text,
    }: Parameters<
      NonNullable<BubbleTextCapability["measureText"]>
    >[0]): number {
      if (typeof extension.measureText !== "function") {
        throw new Error(
          "TurboWarp SVG Text does not provide text measurement.",
        );
      }
      return extension.measureText(styleName, text);
    },
  });
}

/**
 * Adapt the SVG Text package's composition API to Bubble's text capability.
 * This helper keeps the core package independent from SVG Text's target type.
 */
export function createSvgTextCompositionCapability(
  compositionInput: unknown,
): BubbleTextCapability {
  const composition = validateComposition(compositionInput);
  const capability: BubbleTextCapability = {
    setText({ styleName, target, text }): void {
      composition.setText({ styleName, target, text });
    },
    releaseTarget(target: BubbleTextTarget): void {
      composition.releaseTarget(target);
    },
  };
  if (typeof composition.measureText === "function") {
    capability.measureText = ({ styleName, text }): number =>
      composition.measureText?.({ styleName, text }) ?? 0;
  }
  return Object.freeze(capability);
}

/**
 * Adapt SVG Text's host-neutral layout composition to Bubble's SVG overlay.
 * The adapter preserves SVG Text's line coordinates without creating skins.
 */
export function createSvgTextOverlayTextCapability(
  compositionInput: SvgTextLayoutCompositionLike,
): BubbleSvgOverlayTextCapability {
  const composition = validateLayoutComposition(compositionInput);
  return Object.freeze({
    layoutText({
      nativeSize,
      styleName,
      text,
    }: Parameters<
      BubbleSvgOverlayTextCapability["layoutText"]
    >[0]): BubbleSvgOverlayTextLayout {
      return adaptSvgTextLayout(
        composition.layoutText({
          nativeSize: [nativeSize.width, nativeSize.height],
          styleName,
          text,
        }),
      );
    },
    measureText({
      nativeSize,
      styleName,
      text,
    }: Parameters<
      NonNullable<BubbleSvgOverlayTextCapability["measureText"]>
    >[0]): number {
      const layout = composition.layoutText({
        nativeSize: [nativeSize.width, nativeSize.height],
        styleName,
        text,
      });
      return Math.max(
        1,
        ...layout.lines.map((line) =>
          requireFiniteNumber(line.width, "SVG Text line width"),
        ),
      );
    },
  });
}

/**
 * Adapts the stock SVG Text extension's shared named-style layout registry.
 */
export function createTurboWarpSvgTextOverlayTextCapability(
  extensionInput: unknown,
): BubbleSvgOverlayTextCapability {
  if (
    !isRecord(extensionInput) ||
    typeof extensionInput.getLayoutCapability !== "function"
  ) {
    throw new TypeError(
      "TurboWarp SVG Text overlay adapter requires SVG Text 0.8.1 getLayoutCapability().",
    );
  }
  return createSvgTextOverlayTextCapability(
    extensionInput.getLayoutCapability(),
  );
}
