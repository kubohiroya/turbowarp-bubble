export interface LineBreakOpportunity {
    /** UTF-16 code unit offset immediately after the break. */
    readonly position: number;
    readonly required: boolean;
}
export interface LineBreakProvider {
    getBreakOpportunities(text: string): readonly LineBreakOpportunity[];
}
export type TextWidthMeasurer = (text: string) => number;
export interface WrapTextInput {
    readonly text: string;
    readonly maxWidth: number;
    readonly measureText: TextWidthMeasurer;
    readonly lineBreakProvider?: LineBreakProvider;
    readonly locale?: string;
}
export interface WrappedTextLine {
    readonly text: string;
    /** UTF-16 code unit offset in the original text. */
    readonly start: number;
    /** UTF-16 code unit offset in the original text, excluding a newline. */
    readonly end: number;
    readonly width: number;
}
export interface WrappedTextLayout {
    readonly lines: readonly WrappedTextLine[];
    readonly maxLineWidth: number;
}
/**
 * Adapts UAX #14 opportunities and removes positions inside grapheme clusters.
 */
export declare class UnicodeLineBreakProvider implements LineBreakProvider {
    #private;
    constructor(locale?: string);
    getBreakOpportunities(text: string): readonly LineBreakOpportunity[];
}
/**
 * Greedily chooses the last legal break that fits the measured pixel width.
 * Explicit newlines are preserved. Unbreakable overflow falls back to a
 * grapheme boundary, even when a single grapheme is wider than maxWidth.
 */
export declare function wrapText(input: WrapTextInput): WrappedTextLayout;
