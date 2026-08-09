export const bubbleRevealUnits = Object.freeze([
  "CHARACTER",
  "WORD",
  "LINE",
  "BLOCK",
] as const);

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

function graphemes(text: string): string[] {
  const Segmenter = globalThis.Intl?.Segmenter;
  if (typeof Segmenter === "function") {
    const segmenter = new Segmenter(undefined, { granularity: "grapheme" });
    return [...segmenter.segment(text)].map(({ segment }) => segment);
  }
  return Array.from(text);
}

function requireUnit(value: unknown): BubbleRevealUnit {
  if (
    typeof value !== "string" ||
    !bubbleRevealUnits.includes(value as BubbleRevealUnit)
  ) {
    throw new TypeError(
      "Bubble reveal unit must be CHARACTER, WORD, LINE, or BLOCK.",
    );
  }
  return value as BubbleRevealUnit;
}

export function normalizeBubbleReveal(value: unknown): NormalizedBubbleReveal {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("Bubble reveal must be an object.");
  }
  const input = value as Record<string, unknown>;
  const allowed = new Set([
    "unit",
    "delimiters",
    "showDelimiters",
    "layout",
    "intervalSeconds",
    "sound",
  ]);
  const unknown = Object.keys(input).filter((key) => !allowed.has(key));
  if (unknown.length > 0 || input.unit === undefined) {
    throw new TypeError("Bubble reveal has unknown or missing properties.");
  }
  const unit = requireUnit(input.unit);
  const delimiters = input.delimiters ?? " \\t\\r\\n";
  if (typeof delimiters !== "string" || delimiters.length === 0) {
    throw new TypeError("Bubble WORD delimiters must be a non-empty string.");
  }
  const showDelimiters = input.showDelimiters ?? false;
  if (typeof showDelimiters !== "boolean") {
    throw new TypeError("Bubble reveal showDelimiters must be boolean.");
  }
  const layout = input.layout ?? "DYNAMIC";
  if (layout !== "DYNAMIC" && layout !== "RESERVED") {
    throw new TypeError("Bubble reveal layout must be DYNAMIC or RESERVED.");
  }
  const intervalSeconds = input.intervalSeconds ?? 0;
  if (
    typeof intervalSeconds !== "number" ||
    !Number.isFinite(intervalSeconds) ||
    intervalSeconds < 0
  ) {
    throw new TypeError(
      "Bubble reveal intervalSeconds must be zero or greater.",
    );
  }
  const sound = input.sound;
  if (
    sound !== undefined &&
    (typeof sound !== "string" || sound.trim() === "")
  ) {
    throw new TypeError("Bubble reveal sound must be a non-empty asset name.");
  }
  return Object.freeze({
    unit,
    delimiters,
    showDelimiters,
    layout,
    intervalSeconds,
    ...(sound === undefined ? {} : { sound: sound.trim() }),
  });
}

function splitWords(
  text: string,
  delimiters: string,
  showDelimiters: boolean,
): string[] {
  const delimiterSet = new Set(graphemes(delimiters));
  const result: string[] = [];
  let current = "";
  for (const character of graphemes(text)) {
    current += character;
    if (delimiterSet.has(character)) {
      if (showDelimiters || current.slice(0, -character.length).length > 0) {
        result.push(
          showDelimiters ? current : current.slice(0, -character.length),
        );
      }
      current = "";
    }
  }
  if (current.length > 0) result.push(current);
  return result.filter((part) => part.length > 0);
}

/** Returns append-only chunks; joining the first n chunks gives the visible text. */
export function splitBubbleText(
  text: string,
  reveal: NormalizedBubbleReveal,
): readonly string[] {
  if (text.length === 0) return Object.freeze([""]);
  if (reveal.unit === "CHARACTER") return Object.freeze(graphemes(text));
  if (reveal.unit === "WORD") {
    const parts = splitWords(text, reveal.delimiters, reveal.showDelimiters);
    if (reveal.showDelimiters) return Object.freeze(parts);
    // A hidden delimiter still advances the source cursor, so add it to the
    // preceding chunk only when it is not whitespace. This preserves readable
    // Japanese slash-delimited input while keeping normal spaces invisible.
    const result: string[] = [];
    let cursor = 0;
    for (const part of parts) {
      const index = text.indexOf(part, cursor);
      if (index < 0) result.push(part);
      else {
        result.push(part);
        cursor = index + part.length;
        while (
          cursor < text.length &&
          reveal.delimiters.includes(text[cursor] ?? "")
        )
          cursor += 1;
      }
    }
    return Object.freeze(result);
  }
  const separator = reveal.unit === "LINE" ? /(?<=\n)/u : /\n{2,}/u;
  const rawParts = text.split(separator).filter((part) => part.length > 0);
  if (reveal.unit === "BLOCK") {
    const separators = [...text.matchAll(/\n{2,}/gu)].map(([match]) => match);
    const parts = rawParts.map((part, index) =>
      index < separators.length ? `${part}${separators[index] ?? ""}` : part,
    );
    return Object.freeze(parts.length > 0 ? parts : [text]);
  }
  const parts = rawParts;
  return Object.freeze(parts.length > 0 ? parts : [text]);
}

export function revealedBubbleText(
  chunks: readonly string[],
  count: number,
): string {
  return chunks.slice(0, Math.max(0, Math.min(count, chunks.length))).join("");
}
