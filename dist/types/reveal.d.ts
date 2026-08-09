export declare const bubbleRevealUnits: readonly ["CHARACTER", "WORD", "LINE", "BLOCK"];
export type BubbleRevealUnit = (typeof bubbleRevealUnits)[number];
export type BubbleRevealLayout = "DYNAMIC" | "RESERVED";
export interface BubbleRevealInput {
    readonly unit: BubbleRevealUnit;
    /** Characters used to separate WORD units. Whitespace is used by default. */
    readonly delimiters?: string;
    /** Keep WORD delimiters in the rendered text when true. */
    readonly showDelimiters?: boolean;
    readonly layout?: BubbleRevealLayout;
    /** Automatically advance after this many seconds. Zero disables auto advance. */
    readonly intervalSeconds?: number;
    /** Optional named audio asset played once per revealed unit. */
    readonly sound?: string;
}
export interface NormalizedBubbleReveal extends BubbleRevealInput {
    readonly delimiters: string;
    readonly showDelimiters: boolean;
    readonly layout: BubbleRevealLayout;
    readonly intervalSeconds: number;
    readonly sound?: string;
}
export declare function normalizeBubbleReveal(value: unknown): NormalizedBubbleReveal;
/** Returns append-only chunks; joining the first n chunks gives the visible text. */
export declare function splitBubbleText(text: string, reveal: NormalizedBubbleReveal): readonly string[];
export declare function revealedBubbleText(chunks: readonly string[], count: number): string;
