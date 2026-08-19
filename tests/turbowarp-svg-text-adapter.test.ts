import { createSvgTextLayoutComposition } from "@kubohiroya/turbowarp-svg-text/composition";
import { describe, expect, it, vi } from "vitest";
import {
  createSvgTextCompositionCapability,
  createSvgTextOverlayTextCapability,
  createTurboWarpSvgTextCapability,
  createTurboWarpSvgTextOverlayTextCapability,
  type SvgTextLayoutCompositionLike,
  type TurboWarpSvgTextExtension,
} from "../src/turbowarp-svg-text-adapter.js";

describe("TurboWarp SVG Text adapter", () => {
  it("maps the host-neutral text contract to the extension API", () => {
    const target = { drawableID: 12 };
    const extension: TurboWarpSvgTextExtension = {
      setText: vi.fn(),
      measureText: vi.fn(() => 42),
      releaseTextActor: vi.fn(() => true),
    };
    const capability = createTurboWarpSvgTextCapability(extension);

    capability.setText({
      styleName: "dialogue",
      target,
      text: "Hello",
    });
    expect(extension.setText).toHaveBeenCalledWith(
      { STYLE: "dialogue", TEXT: "Hello" },
      { target },
    );
    expect(
      capability.measureText?.({ styleName: "dialogue", text: "Hello" }),
    ).toBe(42);

    capability.releaseTarget(target);
    expect(extension.releaseTextActor).toHaveBeenCalledWith(target);
  });

  it("rejects an incomplete extension and reports missing measurement", () => {
    expect(() => createTurboWarpSvgTextCapability({})).toThrow(
      "setText and releaseTextActor",
    );

    const capability = createTurboWarpSvgTextCapability({
      setText: vi.fn(),
      releaseTextActor: vi.fn(),
    });
    expect(() =>
      capability.measureText?.({ styleName: "dialogue", text: "Hello" }),
    ).toThrow("does not provide text measurement");
  });

  it("adapts the SVG Text composition API without exposing its target type", () => {
    const target = { drawableID: 8 };
    const composition = {
      setText: vi.fn(),
      measureText: vi.fn(() => 24),
      releaseTarget: vi.fn(),
    };
    const capability = createSvgTextCompositionCapability(composition);

    capability.setText({ styleName: "dialogue", target, text: "Hi" });
    expect(composition.setText).toHaveBeenCalledWith({
      styleName: "dialogue",
      target,
      text: "Hi",
    });
    expect(
      capability.measureText?.({ styleName: "dialogue", text: "Hi" }),
    ).toBe(24);
    capability.releaseTarget(target);
    expect(composition.releaseTarget).toHaveBeenCalledWith(target);
  });

  it("maps SVG Text 0.6 layout geometry to centered overlay coordinates", () => {
    const composition = createSvgTextLayoutComposition();
    composition.defineStyle({
      name: "dialogue",
      alignment: "right",
      backgroundColor: "#ffffff",
      font: "Helvetica",
      fontPercent: 100,
      textColor: "#575e75",
    });
    const capability = createSvgTextOverlayTextCapability(composition);
    const upstream = composition.layoutText({
      nativeSize: [480, 360],
      styleName: "dialogue",
      text: "Hi\nthere",
    });
    const layout = capability.layoutText({
      nativeSize: { width: 480, height: 360 },
      styleName: "dialogue",
      text: "Hi\nthere",
    });

    expect(layout).toMatchObject({
      alignment: "right",
      backgroundColor: upstream.style.backgroundColor,
      backgroundCornerRadius: upstream.style.cornerRadius,
      fill: upstream.style.textColor,
      fontFamily: upstream.style.font,
      fontSize: upstream.style.fontSize,
      height: upstream.height,
      lineHeight: upstream.style.lineHeight,
      preserveWhitespace: true,
      width: upstream.width,
    });
    expect(layout.lines).toEqual(
      upstream.lines.map((line) => ({
        baseline: line.baseline - upstream.height / 2,
        text: line.text,
        x: line.x - upstream.width / 2,
      })),
    );
    expect(
      capability.measureText?.({
        nativeSize: { width: 480, height: 360 },
        styleName: "dialogue",
        text: "Hi\nthere",
      }),
    ).toBe(Math.max(...upstream.lines.map((line) => line.width)));
  });

  it("adapts the stock extension named-style layout handoff", () => {
    const layouts = createSvgTextLayoutComposition();
    layouts.defineStyle({
      name: "dialogue",
      alignment: "right",
      font: "Noto Sans JP",
      fontPercent: 150,
      textColor: "#123456",
    });
    const getLayoutCapability = vi.fn(() => layouts);
    const capability = createTurboWarpSvgTextOverlayTextCapability({
      getLayoutCapability,
    });

    const layout = capability.layoutText({
      nativeSize: { width: 480, height: 360 },
      styleName: "dialogue",
      text: "existing style",
    });

    expect(getLayoutCapability).toHaveBeenCalledOnce();
    expect(layout).toMatchObject({
      alignment: "right",
      fill: "#123456",
      fontFamily: "Noto Sans JP",
      fontSize: 21,
    });
  });

  it("rejects a layout composition without the public layout API", () => {
    expect(() =>
      createSvgTextOverlayTextCapability(
        {} as unknown as SvgTextLayoutCompositionLike,
      ),
    ).toThrow("layoutText composition API");
    expect(() => createTurboWarpSvgTextOverlayTextCapability({})).toThrow(
      "SVG Text 0.8.1 getLayoutCapability",
    );
  });
});
