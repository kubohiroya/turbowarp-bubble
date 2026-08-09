/**
 * Host-neutral target owned by a text capability.
 *
 * The capability may be implemented by TurboWarp SVG Text or by another
 * renderer in a different host environment.
 */
/** Opaque host-owned target used by a text capability. */
export type BubbleTextTarget = object;
/**
 * Text rendering contract consumed by Bubble composition.
 *
 * Bubble owns placement, outer shape, portraits, reveal, and animation. A
 * text adapter owns text styles, SVG/text skin creation, measurement, and
 * target skin release.
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
}
