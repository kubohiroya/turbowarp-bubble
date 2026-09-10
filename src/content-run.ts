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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireExactRunKeys(
  run: Record<string, unknown>,
  keys: readonly string[],
): void {
  const allowed = new Set(["type", ...keys]);
  const unknown = Object.keys(run).filter((key) => !allowed.has(key));
  if (unknown.length > 0) {
    throw new TypeError(
      `Bubble content run has unknown properties: ${unknown.join(", ")}.`,
    );
  }
  for (const key of keys) {
    if (typeof run[key] !== "string") {
      throw new TypeError(`Bubble content run ${key} must be a string.`);
    }
  }
}

function normalizeRun(value: unknown): BubbleContentRun {
  if (!isRecord(value)) {
    throw new TypeError("Bubble content run must be an object.");
  }
  if (value.type === "text") {
    requireExactRunKeys(value, ["text"]);
    return Object.freeze({ text: value.text as string, type: "text" as const });
  }
  if (value.type === "ruby") {
    requireExactRunKeys(value, ["base", "reading"]);
    const base = value.base as string;
    const reading = value.reading as string;
    if (base.length === 0) {
      throw new TypeError("Bubble ruby run base must not be empty.");
    }
    if (reading.length === 0) {
      throw new TypeError("Bubble ruby run reading must not be empty.");
    }
    return Object.freeze({ base, reading, type: "ruby" as const });
  }
  throw new TypeError("Bubble content run type must be text or ruby.");
}

/**
 * Accepts a plain string or a content run sequence and returns frozen runs.
 * A string always yields a single text run so the plain path stays unchanged.
 */
export function normalizeBubbleContent(value: unknown): BubbleContent {
  if (typeof value === "string") {
    return Object.freeze([
      Object.freeze({ text: value, type: "text" as const }),
    ]);
  }
  if (!Array.isArray(value)) {
    throw new TypeError("Bubble text must be a string or content run array.");
  }
  const runs = value
    .map((run) => normalizeRun(run))
    .filter((run) => run.type !== "text" || run.text.length > 0);
  if (runs.length === 0) {
    return Object.freeze([Object.freeze({ text: "", type: "text" as const })]);
  }
  return Object.freeze(runs);
}

/** True when the content carries no ruby run and can use the string path. */
export function isPlainBubbleContent(content: BubbleContent): boolean {
  return content.every((run) => run.type === "text");
}

/**
 * Projects content to plain text. Ruby runs contribute their base only, so the
 * projection matches what a reader sees on the baseline.
 */
export function bubbleContentPlainText(content: BubbleContent): string {
  return content
    .map((run) => (run.type === "ruby" ? run.base : run.text))
    .join("");
}

/** Projects content to the ruby reading layer, ignoring plain runs. */
export function bubbleContentReadingText(content: BubbleContent): string {
  return content
    .map((run) => (run.type === "ruby" ? run.reading : ""))
    .join("");
}

/** Merges adjacent text runs so revealed content stays compact. */
export function mergeBubbleContent(content: BubbleContent): BubbleContent {
  const runs: BubbleContentRun[] = [];
  for (const run of content) {
    const previous = runs[runs.length - 1];
    if (run.type === "text" && previous?.type === "text") {
      runs[runs.length - 1] = Object.freeze({
        text: `${previous.text}${run.text}`,
        type: "text" as const,
      });
      continue;
    }
    runs.push(run);
  }
  return Object.freeze(runs);
}
