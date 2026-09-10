/**
 * Content runs carry rich text structure between a host DSL and a text
 * capability. A run is either plain text or a ruby annotation whose base and
 * reading belong together.
 *
 * The shape mirrors `SvgTextContentRun` from `@kubohiroya/turbowarp-svg-text`
 * so a rich adapter can forward runs without converting them.
 */
export interface BubbleContentTextRun {
    readonly text: string;
    readonly type: "text";
}
export interface BubbleContentRubyRun {
    readonly base: string;
    readonly reading: string;
    readonly type: "ruby";
}
export type BubbleContentRun = BubbleContentRubyRun | BubbleContentTextRun;
/** A normalized, frozen sequence of content runs. */
export type BubbleContent = readonly BubbleContentRun[];
/** Text accepted by `show()` and `setText()`: a plain string or content runs. */
export type BubbleContentInput = string | readonly BubbleContentRun[];
/**
 * Accepts a plain string or a content run sequence and returns frozen runs.
 * A string always yields a single text run so the plain path stays unchanged.
 */
export declare function normalizeBubbleContent(value: unknown): BubbleContent;
/** True when the content carries no ruby run and can use the string path. */
export declare function isPlainBubbleContent(content: BubbleContent): boolean;
/**
 * Projects content to plain text. Ruby runs contribute their base only, so the
 * projection matches what a reader sees on the baseline.
 */
export declare function bubbleContentPlainText(content: BubbleContent): string;
/** Projects content to the ruby reading layer, ignoring plain runs. */
export declare function bubbleContentReadingText(content: BubbleContent): string;
/** Merges adjacent text runs so revealed content stays compact. */
export declare function mergeBubbleContent(content: BubbleContent): BubbleContent;
