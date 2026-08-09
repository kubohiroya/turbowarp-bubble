import type {
  BubbleTextCapability,
  BubbleTextTarget,
} from "./text-capability.js";

export interface TurboWarpSvgTextExtension {
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
