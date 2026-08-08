import { describe, expect, it, vi } from "vitest";
import {
  createBubbleTextEngine,
  renderTextActorSvg,
  type BubbleTextEngineRenderer,
} from "../src/text-engine.js";

function harness() {
  let nextSkinId = 1;
  const svg = new Map<number, string>();
  const drawableSkins = new Map<number, number>();
  const listeners = new Map<string, () => void>();
  const renderer: BubbleTextEngineRenderer = {
    createSVGSkin: vi.fn((source) => {
      const skinId = nextSkinId;
      nextSkinId += 1;
      svg.set(skinId, source);
      return skinId;
    }),
    destroySkin: vi.fn((skinId) => {
      svg.delete(skinId);
    }),
    getNativeSize: () => [480, 360],
    updateDrawableSkinId: vi.fn((drawableId, skinId) => {
      drawableSkins.set(drawableId, skinId);
    }),
  };
  const engine = createBubbleTextEngine({
    renderer,
    on(event, listener) {
      listeners.set(event, listener);
    },
    off(event) {
      listeners.delete(event);
    },
    requestRedraw: vi.fn(),
  });
  return { drawableSkins, engine, listeners, renderer, svg };
}

describe("Bubble text engine", () => {
  it("renders escaped multiline SVG text with named styles", () => {
    const source = renderTextActorSvg("A&B\\n第2行", {
      name: "title",
      alignment: "center",
      backgroundColor: "#000000",
      font: "Noto Sans JP",
      fontPercent: 200,
      textColor: "#ffffff",
    });

    expect(source).toContain('data-bubble-presentation="TEXT_ACTOR"');
    expect(source).toContain("A&amp;B");
    expect(source.match(/<tspan/gu)).toHaveLength(2);
    expect(source).toContain('text-anchor="middle"');
    expect(source).toContain('font-size="28"');
  });

  it("owns skins, restyles active actors, and rerenders on stage resize", () => {
    const state = harness();
    const target = { drawableID: 7 };
    state.engine.defineStyle({ name: "title", textColor: "#112233" });
    state.engine.setText({ styleName: "title", target, text: "First" });
    const firstSkin = state.drawableSkins.get(7);

    state.engine.defineStyle({ name: "title", textColor: "#445566" });
    const restyledSkin = state.drawableSkins.get(7);
    expect(restyledSkin).not.toBe(firstSkin);
    expect(state.renderer.destroySkin).toHaveBeenCalledWith(firstSkin);
    expect(state.svg.get(restyledSkin!)).toContain("#445566");

    state.listeners.get("STAGE_SIZE_CHANGED")?.();
    expect(state.drawableSkins.get(7)).not.toBe(restyledSkin);

    state.engine.releaseTarget(target);
    expect(state.svg.size).toBe(0);
    state.engine.releaseAll();
    expect(state.listeners.has("STAGE_SIZE_CHANGED")).toBe(false);
  });

  it("rejects invalid styles and unowned target release", () => {
    const state = harness();
    expect(() =>
      state.engine.defineStyle({ name: "bad", fontPercent: 0 }),
    ).toThrow("fontPercent must be from 1 through 1000");
    expect(() => state.engine.releaseTarget({ drawableID: 1 })).toThrow(
      "not owned",
    );
  });
});
