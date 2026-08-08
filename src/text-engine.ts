export type BubbleTextAlignment = "center" | "left" | "right";

export interface BubbleTextStyleInput {
  readonly name: string;
  readonly alignment?: BubbleTextAlignment;
  readonly backgroundColor?: string;
  readonly font?: string;
  readonly fontPercent?: number;
  readonly textColor?: string;
}

export interface BubbleTextTarget {
  readonly drawableID: number;
}

export interface BubbleTextActorInput {
  readonly scaleToStage?: boolean;
  readonly styleName: string;
  readonly target: BubbleTextTarget;
  readonly text: string;
}

export interface BubbleTextEngine {
  defineStyle(input: BubbleTextStyleInput): void;
  releaseAll(): void;
  releaseTarget(target: BubbleTextTarget): void;
  setText(input: BubbleTextActorInput): void;
}

export interface BubbleTextEngineRenderer {
  createSVGSkin(svg: string): number;
  destroySkin(skinId: number): void;
  getNativeSize?(): unknown;
  updateDrawableSkinId(drawableId: number, skinId: number): void;
}

export interface BubbleTextEngineRuntime {
  readonly renderer: BubbleTextEngineRenderer;
  on?(event: string, listener: () => void): void;
  off?(event: string, listener: () => void): void;
  requestRedraw?(): void;
}

interface NormalizedTextStyle {
  readonly alignment: BubbleTextAlignment;
  readonly backgroundColor: string;
  readonly font: string;
  readonly fontPercent: number;
  readonly name: string;
  readonly textColor: string;
}

interface TextActorState {
  readonly scaleToStage: boolean;
  readonly skinId: number;
  readonly styleName: string;
  readonly text: string;
}

const defaultStyle: NormalizedTextStyle = Object.freeze({
  alignment: "left",
  backgroundColor: "#ffffff",
  font: "Helvetica",
  fontPercent: 100,
  name: "default",
  textColor: "#575e75",
});
const baseFontSize = 14;
const baseLineHeight = 16;
const baseStageWidth = 480;
const baseStageHeight = 360;
const maximumFontNameLength = 128;

function engineError(message: string): Error {
  const error = new Error(`[Bubble Text] ${message}`);
  Object.defineProperty(error, "code", { value: "BUBBLE-TEXT-001" });
  return error;
}

function requireName(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw engineError(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

function normalizeColor(value: unknown, fallback: string): string {
  if (value === undefined) return fallback;
  const color = requireName(value, "Text color");
  if (/^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/iu.test(color)) {
    return color;
  }
  if (globalThis.CSS?.supports?.("color", color)) return color;
  throw engineError(`Unsupported text color: ${color}`);
}

function normalizeStyle(input: unknown): NormalizedTextStyle {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw engineError("Text style must be an object.");
  }
  const value = input as Record<string, unknown>;
  const allowed = new Set([
    "alignment",
    "backgroundColor",
    "font",
    "fontPercent",
    "name",
    "textColor",
  ]);
  if (Object.keys(value).some((key) => !allowed.has(key))) {
    throw engineError("Text style has unknown properties.");
  }
  const alignment = value.alignment ?? defaultStyle.alignment;
  if (alignment !== "left" && alignment !== "center" && alignment !== "right") {
    throw engineError("Text alignment must be left, center, or right.");
  }
  const font =
    value.font === undefined
      ? defaultStyle.font
      : requireName(value.font, "Text font");
  if (
    font.length > maximumFontNameLength ||
    [...font].some((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint <= 31 || codePoint === 127 || ",;{}".includes(character);
    })
  ) {
    throw engineError("Text font contains unsupported characters.");
  }
  const fontPercent = value.fontPercent ?? defaultStyle.fontPercent;
  if (
    typeof fontPercent !== "number" ||
    !Number.isFinite(fontPercent) ||
    fontPercent < 1 ||
    fontPercent > 1000
  ) {
    throw engineError("Text fontPercent must be from 1 through 1000.");
  }
  return Object.freeze({
    alignment,
    backgroundColor: normalizeColor(
      value.backgroundColor,
      defaultStyle.backgroundColor,
    ),
    font,
    fontPercent,
    name: requireName(value.name, "Text style name"),
    textColor: normalizeColor(value.textColor, defaultStyle.textColor),
  });
}

function validateRuntime(value: unknown): BubbleTextEngineRuntime {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("Bubble text engine requires a runtime.");
  }
  const runtime = value as Partial<BubbleTextEngineRuntime>;
  const renderer = runtime.renderer;
  if (
    typeof renderer !== "object" ||
    renderer === null ||
    typeof renderer.createSVGSkin !== "function" ||
    typeof renderer.destroySkin !== "function" ||
    typeof renderer.updateDrawableSkinId !== "function"
  ) {
    throw new TypeError(
      "Bubble text engine renderer must provide SVG skin methods.",
    );
  }
  return value as BubbleTextEngineRuntime;
}

function validateTarget(value: unknown): BubbleTextTarget {
  if (
    typeof value !== "object" ||
    value === null ||
    !Number.isInteger((value as { drawableID?: unknown }).drawableID) ||
    Number((value as { drawableID?: unknown }).drawableID) < 0
  ) {
    throw engineError("Text target must provide a drawableID.");
  }
  return value as BubbleTextTarget;
}

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/gu, (character) => {
    if (character === "&") return "&amp;";
    if (character === "<") return "&lt;";
    if (character === ">") return "&gt;";
    if (character === '"') return "&quot;";
    return "&apos;";
  });
}

function formatNumber(value: number): string {
  return String(Math.round(value * 1000) / 1000);
}

function measureTextWidth(text: string, fontSize: number): number {
  let units = 0;
  for (const character of text) {
    if (/\p{Mark}/u.test(character)) continue;
    if (/\s/u.test(character)) {
      units += 0.35;
      continue;
    }
    units += (character.codePointAt(0) ?? 0) <= 0x7f ? 0.62 : 1;
  }
  return units * fontSize;
}

function stageScale(renderer: BubbleTextEngineRenderer): number {
  const size = renderer.getNativeSize?.();
  if (!Array.isArray(size) || size.length < 2) return 1;
  const width = Number(size[0]);
  const height = Number(size[1]);
  if (!(width > 0) || !(height > 0)) return 1;
  return Math.min(width / baseStageWidth, height / baseStageHeight);
}

export function renderTextActorSvg(
  text: string,
  style: BubbleTextStyleInput,
  scale = 1,
): string {
  const definition = normalizeStyle(style);
  if (typeof text !== "string") throw engineError("Text must be a string.");
  if (!(scale > 0) || !Number.isFinite(scale)) {
    throw engineError("Text stage scale must be positive and finite.");
  }
  const fontScale = scale * (definition.fontPercent / 100);
  const fontSize = baseFontSize * fontScale;
  const lineHeight = baseLineHeight * fontScale;
  const padding = 12 * scale;
  const cornerRadius = 8 * scale;
  const lines = text.replace(/\\r\\n|\\n|\\r/gu, "\n").split("\n");
  const contentWidth = Math.max(
    1,
    ...lines.map((line) => measureTextWidth(line, fontSize)),
  );
  const width = Math.max(1, Math.ceil(contentWidth + padding * 2));
  const height = Math.max(
    1,
    Math.ceil(lineHeight * lines.length + padding * 2),
  );
  const textAnchor =
    definition.alignment === "center"
      ? "middle"
      : definition.alignment === "right"
        ? "end"
        : "start";
  const x =
    definition.alignment === "center"
      ? width / 2
      : definition.alignment === "right"
        ? width - padding
        : padding;
  const tspans = lines
    .map((line, index) => {
      const y = padding + fontSize + lineHeight * index;
      return `<tspan x="${formatNumber(x)}" y="${formatNumber(y)}">${escapeXml(line)}</tspan>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" data-bubble-presentation="TEXT_ACTOR"><title>${escapeXml(text)}</title><rect width="${width}" height="${height}" rx="${formatNumber(cornerRadius)}" fill="${escapeXml(definition.backgroundColor)}"/><text xml:space="preserve" fill="${escapeXml(definition.textColor)}" font-family="${escapeXml(definition.font)}" font-size="${formatNumber(fontSize)}" text-anchor="${textAnchor}">${tspans}</text></svg>`;
}

export function createBubbleTextEngine(
  runtimeInput: BubbleTextEngineRuntime,
): BubbleTextEngine {
  const runtime = validateRuntime(runtimeInput);
  const styles = new Map<string, NormalizedTextStyle>([
    [defaultStyle.name, defaultStyle],
  ]);
  const actors = new Map<BubbleTextTarget, TextActorState>();
  let disposed = false;

  const ensureActive = (): void => {
    if (disposed) throw engineError("Text engine has been released.");
  };
  const apply = (
    target: BubbleTextTarget,
    text: string,
    styleName: string,
    scaleToStage: boolean,
  ): void => {
    const style = styles.get(styleName);
    if (!style) throw engineError(`Text style is not defined: ${styleName}`);
    const skinId = runtime.renderer.createSVGSkin(
      renderTextActorSvg(
        text,
        style,
        scaleToStage ? stageScale(runtime.renderer) : 1,
      ),
    );
    if (!Number.isInteger(skinId) || skinId < 0) {
      throw engineError("TurboWarp did not create an SVG text skin.");
    }
    try {
      runtime.renderer.updateDrawableSkinId(target.drawableID, skinId);
    } catch (error) {
      runtime.renderer.destroySkin(skinId);
      throw error;
    }
    const previous = actors.get(target);
    actors.set(target, { scaleToStage, skinId, styleName, text });
    if (previous && previous.skinId !== skinId) {
      runtime.renderer.destroySkin(previous.skinId);
    }
    runtime.requestRedraw?.();
  };
  const rerender = (): void => {
    if (disposed) return;
    for (const [target, state] of [...actors]) {
      apply(target, state.text, state.styleName, state.scaleToStage);
    }
  };
  runtime.on?.("STAGE_SIZE_CHANGED", rerender);

  return Object.freeze({
    defineStyle(input: BubbleTextStyleInput): void {
      ensureActive();
      const style = normalizeStyle(input);
      styles.set(style.name, style);
      for (const [target, state] of [...actors]) {
        if (state.styleName === style.name)
          apply(target, state.text, style.name, state.scaleToStage);
      }
    },
    setText(input: BubbleTextActorInput): void {
      ensureActive();
      if (typeof input !== "object" || input === null) {
        throw engineError("Text actor input must be an object.");
      }
      const target = validateTarget(input.target);
      const styleName = requireName(input.styleName, "Text style name");
      if (typeof input.text !== "string")
        throw engineError("Text must be a string.");
      if (
        input.scaleToStage !== undefined &&
        typeof input.scaleToStage !== "boolean"
      ) {
        throw engineError("Text scaleToStage must be a boolean.");
      }
      apply(
        target,
        input.text.replace(/\\r\\n|\\n|\\r/gu, "\n"),
        styleName,
        input.scaleToStage !== false,
      );
    },
    releaseTarget(value: BubbleTextTarget): void {
      ensureActive();
      const target = validateTarget(value);
      const state = actors.get(target);
      if (!state) throw engineError("Text target is not owned by this engine.");
      actors.delete(target);
      runtime.renderer.destroySkin(state.skinId);
      runtime.requestRedraw?.();
    },
    releaseAll(): void {
      if (disposed) return;
      disposed = true;
      runtime.off?.("STAGE_SIZE_CHANGED", rerender);
      for (const state of actors.values())
        runtime.renderer.destroySkin(state.skinId);
      actors.clear();
      styles.clear();
      runtime.requestRedraw?.();
    },
  });
}
