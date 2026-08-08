import { Rules } from "@cto.af/linebreak";

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

function graphemeBoundaries(text: string, locale: string): Set<number> {
  const segmenter = new Intl.Segmenter(locale, { granularity: "grapheme" });
  const boundaries = new Set<number>([0]);
  for (const item of segmenter.segment(text)) {
    boundaries.add(item.index + item.segment.length);
  }
  return boundaries;
}

/**
 * Adapts UAX #14 opportunities and removes positions inside grapheme clusters.
 */
export class UnicodeLineBreakProvider implements LineBreakProvider {
  readonly #rules = new Rules();
  readonly #locale: string;

  public constructor(locale = "ja") {
    this.#locale = locale;
  }

  public getBreakOpportunities(text: string): readonly LineBreakOpportunity[] {
    const boundaries = graphemeBoundaries(text, this.#locale);
    const opportunities = new Map<number, boolean>();

    for (const candidate of this.#rules.breaks(text)) {
      if (!boundaries.has(candidate.position)) continue;
      opportunities.set(
        candidate.position,
        (opportunities.get(candidate.position) ?? false) || candidate.required,
      );
    }

    return Object.freeze(
      [...opportunities]
        .sort(([left], [right]) => left - right)
        .map(([position, required]) => Object.freeze({ position, required })),
    );
  }
}

const defaultLineBreakProviders = new Map<string, UnicodeLineBreakProvider>();
const newlinePattern = /\r\n|[\n\r\v\f\u0085\u2028\u2029]/gu;

function defaultLineBreakProvider(locale: string): UnicodeLineBreakProvider {
  const existing = defaultLineBreakProviders.get(locale);
  if (existing) return existing;
  const provider = new UnicodeLineBreakProvider(locale);
  defaultLineBreakProviders.set(locale, provider);
  return provider;
}

function requireWidth(width: number, label: string): number {
  if (!Number.isFinite(width) || width < 0) {
    throw new TypeError(`${label} must return a non-negative finite number.`);
  }
  return width;
}

function normalizeOpportunities(
  text: string,
  provider: LineBreakProvider,
  boundaries: ReadonlySet<number>,
): readonly LineBreakOpportunity[] {
  const normalized = new Map<number, boolean>();
  for (const opportunity of provider.getBreakOpportunities(text)) {
    const { position, required } = opportunity;
    if (
      !Number.isInteger(position) ||
      position <= 0 ||
      position > text.length ||
      !boundaries.has(position)
    ) {
      continue;
    }
    normalized.set(position, (normalized.get(position) ?? false) || required);
  }
  normalized.set(text.length, true);
  return [...normalized]
    .sort(([left], [right]) => left - right)
    .map(([position, required]) => ({ position, required }));
}

function wrapParagraph(
  text: string,
  originalStart: number,
  input: WrapTextInput,
  provider: LineBreakProvider,
  locale: string,
): WrappedTextLine[] {
  if (text.length === 0) {
    return [{ text: "", start: originalStart, end: originalStart, width: 0 }];
  }

  const boundarySet = graphemeBoundaries(text, locale);
  const boundaries = [...boundarySet].sort((left, right) => left - right);
  const opportunities = normalizeOpportunities(text, provider, boundarySet);
  const lines: WrappedTextLine[] = [];
  let start = 0;

  while (start < text.length) {
    const requiredEnd =
      opportunities.find(
        (opportunity) => opportunity.position > start && opportunity.required,
      )?.position ?? text.length;
    let selected: number | undefined;
    let selectedWidth = 0;

    for (const opportunity of opportunities) {
      if (opportunity.position <= start || opportunity.position > requiredEnd) {
        continue;
      }
      const candidate = text.slice(start, opportunity.position);
      const width = requireWidth(input.measureText(candidate), "measureText");
      if (width <= input.maxWidth) {
        selected = opportunity.position;
        selectedWidth = width;
      }
    }

    if (selected === undefined) {
      const fallbackBoundaries = boundaries.filter(
        (position) => position > start && position <= requiredEnd,
      );
      for (const position of fallbackBoundaries) {
        const candidate = text.slice(start, position);
        const width = requireWidth(input.measureText(candidate), "measureText");
        if (width <= input.maxWidth) {
          selected = position;
          selectedWidth = width;
        }
      }

      if (selected === undefined) {
        selected = fallbackBoundaries[0] ?? requiredEnd;
        selectedWidth = requireWidth(
          input.measureText(text.slice(start, selected)),
          "measureText",
        );
      }
    }

    lines.push({
      text: text.slice(start, selected),
      start: originalStart + start,
      end: originalStart + selected,
      width: selectedWidth,
    });
    start = selected;
  }

  return lines;
}

/**
 * Greedily chooses the last legal break that fits the measured pixel width.
 * Explicit newlines are preserved. Unbreakable overflow falls back to a
 * grapheme boundary, even when a single grapheme is wider than maxWidth.
 */
export function wrapText(input: WrapTextInput): WrappedTextLayout {
  if (typeof input.text !== "string") {
    throw new TypeError("text must be a string.");
  }
  if (!Number.isFinite(input.maxWidth) || input.maxWidth <= 0) {
    throw new TypeError("maxWidth must be a positive finite number.");
  }
  if (typeof input.measureText !== "function") {
    throw new TypeError("measureText must be a function.");
  }

  const locale = input.locale ?? "ja";
  const provider = input.lineBreakProvider ?? defaultLineBreakProvider(locale);
  const lines: WrappedTextLine[] = [];
  let paragraphStart = 0;

  for (const newline of input.text.matchAll(newlinePattern)) {
    const newlineStart = newline.index;
    lines.push(
      ...wrapParagraph(
        input.text.slice(paragraphStart, newlineStart),
        paragraphStart,
        input,
        provider,
        locale,
      ),
    );
    paragraphStart = newlineStart + newline[0].length;
  }

  lines.push(
    ...wrapParagraph(
      input.text.slice(paragraphStart),
      paragraphStart,
      input,
      provider,
      locale,
    ),
  );

  return Object.freeze({
    lines: Object.freeze(lines.map((line) => Object.freeze(line))),
    maxLineWidth: Math.max(0, ...lines.map((line) => line.width)),
  });
}
