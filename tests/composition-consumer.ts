import { createAssetManagerComposition } from "@kubohiroya/turbowarp-asset-manager/composition";
import { createSvgTextComposition } from "@kubohiroya/turbowarp-svg-text/composition";
import {
  createBubbleComposition,
  renderBubbleSvg,
  wrapText,
  type BubbleComposition,
  type BubbleHandle,
  type WrappedTextLayout,
} from "@kubohiroya/turbowarp-bubble/composition";
import {
  BubbleRuntimeAdapterError,
  createSvgTextCompositionCapability,
  createTurboWarpBubbleComposition,
  type TurboWarpBubbleCompositionOptions,
  type TurboWarpBubbleRuntime,
  type TurboWarpBubbleTarget,
} from "@kubohiroya/turbowarp-bubble/turbowarp-adapter";
import {
  normalizeBubbleReveal,
  splitBubbleText,
  type NormalizedBubbleReveal,
} from "@kubohiroya/turbowarp-bubble/reveal";

declare const runtime: Parameters<
  typeof createSvgTextComposition
>[0]["runtime"];
const imageResolver = createAssetManagerComposition();
const textCapability = createSvgTextCompositionCapability(
  createSvgTextComposition({ runtime }),
);

const bubbles: BubbleComposition = createBubbleComposition({
  imageResolver,
  textCapability,
  createSurface(input) {
    return {
      targets: {
        text: { drawableID: 1 },
        portraitBase: { id: `${input.actorKey}:base`, isStage: false },
        portraitBlink: { id: `${input.actorKey}:blink`, isStage: false },
        portraitLipSync: { id: `${input.actorKey}:lip-sync`, isStage: false },
        continueIndicator: { id: `${input.actorKey}:next`, isStage: false },
      },
      setLayerVisible() {},
      updateStyle() {},
      show() {},
      hide() {},
      dispose() {},
    };
  },
});

bubbles.defineStyle({
  name: "dialogue",
  textStyle: "dialogue-text",
  placement: "north-northeast",
  distance: 12,
  tailLength: 18,
  offset: [10, -10, 120],
  visualStyle: "WAVY",
  portrait: {
    base: "HeroFace",
    placement: "top-left",
    offset: [-4, 6, 120],
    cornerRadius: 12,
    blink: { frames: ["EyesOpen", "EyesClosed"], frameIntervalSeconds: 0.4 },
    lipSync: {
      frames: ["MouthClosed", "MouthOpen"],
      frameIntervalSeconds: 0.1,
    },
  },
  continueIndicator: {
    frames: ["Next1", "Next2"],
    frameIntervalSeconds: 0.2,
  },
});

bubbles.defineStyle({
  name: "narration",
  textStyle: "dialogue-text",
  placement: "FOOTER_LIKE",
});

const handle: Promise<BubbleHandle> = bubbles.show({
  actor: {},
  actorKey: "Hero",
  kind: "say",
  text: "Hello",
  styleName: "dialogue",
});
void handle;

const wrapped: WrappedTextLayout = wrapText({
  text: "これは長いセリフです。",
  maxWidth: 320,
  measureText: (text) => text.length * 16,
});
void wrapped;

const bubbleSvg: string = renderBubbleSvg({
  style: "NORMAL",
  lines: wrapped.lines.map(({ text }) => text),
  width: 368,
  height: 120,
  tailDirection: 225,
});
void bubbleSvg;

declare const turboWarpRuntime: TurboWarpBubbleRuntime;
const turboWarpOptions: TurboWarpBubbleCompositionOptions = {};
const turboWarpBubbles: BubbleComposition = createTurboWarpBubbleComposition(
  turboWarpRuntime,
  turboWarpOptions,
);
const turboWarpTarget: TurboWarpBubbleTarget = {
  id: "hero",
  isStage: false,
  drawableID: 1,
};
const turboWarpError: Error = new BubbleRuntimeAdapterError(
  "BUBBLE-RUNTIME-001",
  "invalid runtime",
);
void turboWarpBubbles;
void turboWarpTarget;
void turboWarpError;

const reveal: NormalizedBubbleReveal = normalizeBubbleReveal({
  unit: "CHARACTER",
});
const revealChunks: readonly string[] = splitBubbleText("A👩‍🚀B", reveal);
void revealChunks;
