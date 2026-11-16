import type {
  BubbleContent,
  BubbleTextCapability,
  BubbleTextTarget,
} from "./text-capability.js";
import type {
  BubbleSvgOverlayRichTextFragment,
  BubbleSvgOverlayRichTextGlyph,
  BubbleSvgOverlayRichTextLayout,
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
  setRichText?(input: {
    readonly maxWidth?: number;
    readonly runs: BubbleContent;
    readonly styleName: string;
    readonly target: unknown;
  }): void;
  measureRichText?(input: {
    readonly maxWidth?: number;
    readonly runs: BubbleContent;
    readonly styleName: string;
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

interface SvgTextRichLayoutGlyphLike {
  readonly baseline: number;
  readonly fontSize: number;
  readonly text: string;
  readonly x: number;
}

type SvgTextRichLayoutFragmentLike =
  | Readonly<{
      base: SvgTextRichLayoutGlyphLike;
      reading: SvgTextRichLayoutGlyphLike;
      type: "ruby";
    }>
  | Readonly<{ baseline: number; text: string; type: "text"; x: number }>;

interface SvgTextRichLayoutLike extends Omit<SvgTextLayoutLike, "lines"> {
  readonly lines: readonly Readonly<{
    fragments: readonly SvgTextRichLayoutFragmentLike[];
  }>[];
}

export interface SvgTextLayoutCompositionLike {
  layoutText(
    input: Readonly<{
      nativeSize: readonly [width: number, height: number];
      styleName: string;
      text: string;
    }>,
  ): SvgTextLayoutLike;
  /** SVG Text 0.14 lays out content runs, including ruby, without skins. */
  layoutRichText?(
    input: Readonly<{
      maxWidth?: number;
      nativeSize: readonly [width: number, height: number];
      runs: BubbleContent;
      styleName: string;
    }>,
  ): SvgTextRichLayoutLike;
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
      "TurboWarp-SVG-Text adapter requires setText and releaseTextActor.",
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

function adaptSvgTextRichLayout(
  value: unknown,
): BubbleSvgOverlayRichTextLayout {
  if (!isRecord(value) || !Array.isArray(value.lines)) {
    throw new TypeError("SVG Text rich layout result is invalid.");
  }
  // Style fields and the center offset follow the plain layout adaptation.
  const { lines: _plainLines, ...style } = adaptSvgTextLayout({
    ...value,
    lines: [],
  });
  void _plainLines;
  const offsetX = style.width / 2;
  const offsetY = style.height / 2;
  const adaptGlyph = (
    glyph: unknown,
    label: string,
  ): BubbleSvgOverlayRichTextGlyph => {
    if (!isRecord(glyph) || typeof glyph.text !== "string") {
      throw new TypeError(`SVG Text ruby ${label} is invalid.`);
    }
    return Object.freeze({
      baseline:
        requireFiniteNumber(glyph.baseline, `SVG Text ruby ${label} baseline`) -
        offsetY,
      fontSize: requireFiniteNumber(
        glyph.fontSize,
        `SVG Text ruby ${label} font size`,
      ),
      text: glyph.text,
      x: requireFiniteNumber(glyph.x, `SVG Text ruby ${label} x`) - offsetX,
    });
  };
  const adaptFragment = (
    fragment: unknown,
  ): BubbleSvgOverlayRichTextFragment => {
    if (!isRecord(fragment)) {
      throw new TypeError("SVG Text rich layout fragment is invalid.");
    }
    if (fragment.type === "ruby") {
      return Object.freeze({
        base: adaptGlyph(fragment.base, "base"),
        reading: adaptGlyph(fragment.reading, "reading"),
        type: "ruby" as const,
      });
    }
    if (fragment.type !== "text" || typeof fragment.text !== "string") {
      throw new TypeError("SVG Text rich layout fragment is invalid.");
    }
    return Object.freeze({
      baseline:
        requireFiniteNumber(fragment.baseline, "SVG Text fragment baseline") -
        offsetY,
      text: fragment.text,
      type: "text" as const,
      x: requireFiniteNumber(fragment.x, "SVG Text fragment x") - offsetX,
    });
  };
  const lines = Object.freeze(
    value.lines.map((line: unknown) => {
      if (!isRecord(line) || !Array.isArray(line.fragments)) {
        throw new TypeError("SVG Text rich layout line is invalid.");
      }
      return Object.freeze({
        fragments: Object.freeze(line.fragments.map(adaptFragment)),
      });
    }),
  );
  return Object.freeze({ ...style, lines });
}

/**
 * Adapt the TurboWarp-SVG-Text extension to Bubble's host-neutral text
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
          "TurboWarp-SVG-Text does not provide text measurement.",
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
  // Content runs share SVG Text's shape, so they pass through unconverted.
  if (typeof composition.setRichText === "function") {
    capability.setRichText = ({ maxWidth, runs, styleName, target }): void => {
      composition.setRichText?.({
        runs,
        styleName,
        target,
        ...(maxWidth === undefined ? {} : { maxWidth }),
      });
    };
  }
  if (typeof composition.measureRichText === "function") {
    capability.measureRichText = ({ maxWidth, runs, styleName }): number =>
      composition.measureRichText?.({
        runs,
        styleName,
        ...(maxWidth === undefined ? {} : { maxWidth }),
      }) ?? 0;
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
  const capability: BubbleSvgOverlayTextCapability = {
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
  };
  // Ruby needs SVG Text's rich layout. Without it Bubble reports
  // BUBBLE-COMPOSITION-007 instead of dropping the reading.
  if (typeof composition.layoutRichText === "function") {
    capability.layoutRichText = ({
      maxWidth,
      nativeSize,
      runs,
      styleName,
    }): BubbleSvgOverlayRichTextLayout =>
      adaptSvgTextRichLayout(
        composition.layoutRichText?.({
          nativeSize: [nativeSize.width, nativeSize.height],
          runs,
          styleName,
          ...(maxWidth === undefined ? {} : { maxWidth }),
        }),
      );
  }
  return Object.freeze(capability);
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
      "TurboWarp-SVG-Text overlay adapter requires SVG Text 0.8.1 getLayoutCapability().",
    );
  }
  return createSvgTextOverlayTextCapability(
    extensionInput.getLayoutCapability(),
  );
}
