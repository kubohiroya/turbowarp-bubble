import { describe, expect, it, vi } from "vitest";
import {
  createSvgTextCompositionCapability,
  createTurboWarpSvgTextCapability,
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
});
