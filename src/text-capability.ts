import type { BubbleContent } from "./content-run.js";
import type { NormalizedBubbleReveal } from "./reveal.js";

/**
 * Opaque host-owned target used by a text capability.
 *
 * The capability may be implemented by TurboWarp-SVG-Text or by another
 * renderer in a different host environment.
 */
export type BubbleTextTarget = object;

/**
 * Text rendering contract consumed by Bubble composition.
 *
 * Bubble owns placement, outer shape, portraits, reveal, and animation. A
 * text adapter owns text styles, layout or rendering, measurement, and target
 * resource release.
 *
 * The rich methods are optional. A capability that omits them keeps working
 * for plain text; Bubble fails explicitly rather than dropping annotations
 * when content runs carry ruby and no rich method is available.
 */
export interface BubbleTextCapability {
  setText(input: {
    readonly styleName: string;
    readonly target: BubbleTextTarget;
    readonly text: string;
  }): void;
  releaseTarget(target: BubbleTextTarget): void;
  measureText?(input: {
    readonly styleName: string;
    readonly text: string;
  }): number;
  setRichText?(input: {
    readonly maxWidth?: number;
    readonly runs: BubbleContent;
    readonly styleName: string;
    readonly target: BubbleTextTarget;
  }): void;
  measureRichText?(input: {
    readonly maxWidth?: number;
    readonly runs: BubbleContent;
    readonly styleName: string;
  }): number;
  /**
   * Optional reveal splitting owned by the text capability. A renderer that
   * lays out the runs itself can split more accurately than Bubble; when it is
   * absent Bubble splits the runs and keeps each ruby run whole.
   */
  splitRichText?(input: {
    readonly reveal: NormalizedBubbleReveal;
    readonly runs: BubbleContent;
    readonly styleName: string;
  }): readonly BubbleContent[];
}

export type {
  BubbleContent,
  BubbleContentInput,
  BubbleContentRubyRun,
  BubbleContentRun,
  BubbleContentTextRun,
} from "./content-run.js";
