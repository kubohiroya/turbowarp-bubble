import { describe, expect, it, vi } from "vitest";
import {
  BubbleCompositionError,
  createBubbleComposition,
  type BubbleContent,
  type BubbleSurface,
  type BubbleTextCapability,
} from "../src/composition.js";

const sentence = Object.freeze([
  Object.freeze({ text: "私は ", type: "text" as const }),
  Object.freeze({ base: "中野", reading: "なかの", type: "ruby" as const }),
  Object.freeze({ text: " です", type: "text" as const }),
]);

function createHarness(options: { readonly rich: boolean }) {
  const setText = vi.fn();
  const setRichText = vi.fn();
  const releaseTarget = vi.fn();
  const textCapability: BubbleTextCapability = {
    setText,
    releaseTarget,
    measureText: ({ text }) => text.length * 10,
    ...(options.rich ? { setRichText } : {}),
  };
  const surface: BubbleSurface = {
    targets: { text: { drawableID: 7 } },
    setLayerVisible: vi.fn(async () => undefined),
    updateStyle: vi.fn(async () => undefined),
    show: vi.fn(async () => undefined),
    hide: vi.fn(async () => undefined),
    dispose: vi.fn(async () => undefined),
  };
  const composition = createBubbleComposition({
    textCapability,
    createSurface: vi.fn(async () => surface),
  });
  composition.defineStyle({ name: "plain", textStyle: "plain-text" });
  return { composition, releaseTarget, setRichText, setText, surface };
}

const show = (
  harness: ReturnType<typeof createHarness>,
  text: unknown,
  extra: Record<string, unknown> = {},
) =>
  harness.composition.show({
    actor: { id: "actor", isStage: false },
    actorKey: "actor",
    kind: "say",
    styleName: "plain",
    text,
    ...extra,
  } as Parameters<typeof harness.composition.show>[0]);

describe("Bubble composition content runs", () => {
  it("forwards ruby runs to the rich capability untouched", async () => {
    const harness = createHarness({ rich: true });
    const handle = await show(harness, sentence);
    expect(harness.setRichText).toHaveBeenCalledWith({
      runs: sentence,
      styleName: "plain-text",
      target: { drawableID: 7 },
    });
    expect(harness.setText).not.toHaveBeenCalled();
    await handle.close();
  });

  it("keeps using the plain path for a string", async () => {
    const harness = createHarness({ rich: true });
    const handle = await show(harness, "hello");
    expect(harness.setText).toHaveBeenCalledWith({
      styleName: "plain-text",
      target: { drawableID: 7 },
      text: "hello",
    });
    expect(harness.setRichText).not.toHaveBeenCalled();
    await handle.close();
  });

  it("keeps using the plain path for text-only runs", async () => {
    const harness = createHarness({ rich: true });
    const handle = await show(harness, [
      { text: "hel", type: "text" },
      { text: "lo", type: "text" },
    ]);
    expect(harness.setText).toHaveBeenCalledWith({
      styleName: "plain-text",
      target: { drawableID: 7 },
      text: "hello",
    });
    expect(harness.setRichText).not.toHaveBeenCalled();
    await handle.close();
  });

  it("fails explicitly when ruby runs meet a capability without setRichText", async () => {
    const harness = createHarness({ rich: false });
    await expect(show(harness, sentence)).rejects.toThrow(
      BubbleCompositionError,
    );
    await expect(show(harness, sentence)).rejects.toThrow(
      /requires the text capability setRichText method/u,
    );
  });

  it("accepts ruby runs through the handle setText", async () => {
    const harness = createHarness({ rich: true });
    const handle = await show(harness, "hello");
    await handle.setText(sentence);
    expect(harness.setRichText).toHaveBeenCalledWith({
      runs: sentence,
      styleName: "plain-text",
      target: { drawableID: 7 },
    });
    await handle.close();
  });

  it("rejects malformed runs from the handle setText", async () => {
    const harness = createHarness({ rich: true });
    const handle = await show(harness, "hello");
    await expect(handle.setText([{ type: "bold" }] as never)).rejects.toThrow(
      /type must be text or ruby/u,
    );
    await handle.close();
  });

  it("reveals ruby content one run at a time", async () => {
    const harness = createHarness({ rich: true });
    const handle = await show(harness, sentence, {
      reveal: { unit: "CHARACTER" },
    });
    const runsOf = (call: number): BubbleContent =>
      harness.setRichText.mock.calls[call]?.[0].runs;
    expect(runsOf(0)).toEqual([{ text: "私", type: "text" }]);
    await handle.revealNext();
    await handle.revealNext();
    await handle.revealNext();
    const latest = harness.setRichText.mock.calls.length - 1;
    expect(runsOf(latest)).toEqual([
      { text: "私は ", type: "text" },
      { base: "中野", reading: "なかの", type: "ruby" },
    ]);
    await handle.close();
  });

  it("delegates reveal splitting to a capability that provides splitRichText", async () => {
    const splitRichText = vi.fn(() => [
      Object.freeze([Object.freeze({ text: "私は ", type: "text" as const })]),
      Object.freeze([
        Object.freeze({
          base: "中野",
          reading: "なかの",
          type: "ruby" as const,
        }),
        Object.freeze({ text: " です", type: "text" as const }),
      ]),
    ]);
    const setRichText = vi.fn();
    const composition = createBubbleComposition({
      textCapability: {
        setText: vi.fn(),
        releaseTarget: vi.fn(),
        setRichText,
        splitRichText,
      },
      createSurface: vi.fn(async () => ({
        targets: { text: { drawableID: 7 } },
        setLayerVisible: vi.fn(async () => undefined),
        updateStyle: vi.fn(async () => undefined),
        show: vi.fn(async () => undefined),
        hide: vi.fn(async () => undefined),
        dispose: vi.fn(async () => undefined),
      })),
    });
    composition.defineStyle({ name: "plain", textStyle: "plain-text" });
    const handle = await composition.show({
      actor: { id: "actor", isStage: false },
      actorKey: "actor",
      kind: "say",
      styleName: "plain",
      text: sentence,
      reveal: { unit: "WORD" },
    });
    expect(splitRichText).toHaveBeenCalledWith({
      reveal: expect.objectContaining({ unit: "WORD" }),
      runs: sentence,
      styleName: "plain-text",
    });
    expect(setRichText.mock.calls[0]?.[0].runs).toEqual([
      { text: "私は ", type: "text" },
    ]);
    await handle.revealNext();
    const latest = setRichText.mock.calls.length - 1;
    expect(setRichText.mock.calls[latest]?.[0].runs).toEqual([
      { text: "私は ", type: "text" },
      { base: "中野", reading: "なかの", type: "ruby" },
      { text: " です", type: "text" },
    ]);
    await handle.close();
  });

  it("passes style maxWidth to the rich capability instead of pre-wrapping", async () => {
    const harness = createHarness({ rich: true });
    harness.composition.defineStyle({
      name: "narrow",
      textStyle: "narrow-text",
      maxWidth: 120,
    });
    const handle = await show(harness, sentence, { styleName: "narrow" });
    expect(harness.setRichText).toHaveBeenCalledWith({
      maxWidth: 120,
      runs: sentence,
      styleName: "narrow-text",
      target: { drawableID: 7 },
    });
    await handle.close();
  });
});
