import { createAssetManagerComposition } from "@kubohiroya/turbowarp-asset-manager/composition";
import {
  createBubbleTextEngine,
  createBubbleComposition,
  renderBubbleSvg,
  wrapText,
  type BubbleComposition,
  type BubbleHandle,
  type WrappedTextLayout,
} from "@kubohiroya/turbowarp-bubble/composition";
import {
  BubbleRuntimeAdapterError,
  createTurboWarpBubbleComposition,
  type TurboWarpBubbleCompositionOptions,
  type TurboWarpBubbleRuntime,
  type TurboWarpBubbleTarget,
} from "@kubohiroya/turbowarp-bubble/turbowarp-adapter";

declare const runtime: Parameters<typeof createBubbleTextEngine>[0];
const assetManager = createAssetManagerComposition();
const svgText = createBubbleTextEngine(runtime);

const bubbles: BubbleComposition = createBubbleComposition({
  assetManager,
  svgText,
  createSurface(input) {
    return {
      targets: {
        text: { drawableID: 1 },
        portraitBase: { id: `${input.actorKey}:base`, isStage: false },
        portraitBlink: { id: `${input.actorKey}:blink`, isStage: false },
        portraitTalk: { id: `${input.actorKey}:talk`, isStage: false },
        advanceIndicator: { id: `${input.actorKey}:next`, isStage: false },
      },
      setLayerVisible() {},
      show() {},
      hide() {},
      dispose() {},
    };
  },
});

bubbles.defineTextStyle({
  name: "dialogue-text",
  alignment: "left",
  font: "Noto Sans JP",
  fontPercent: 100,
  textColor: "#332200",
});

bubbles.defineStyle({
  name: "dialogue",
  textStyle: "dialogue-text",
  presentationMode: "POP_OUT_BUBBLE",
  placement: "north-northeast",
  distance: 12,
  tailLength: 18,
  offset: [10, -10, 120],
  visualStyle: "WAVY",
  portrait: {
    base: "HeroFace",
    blink: { frames: ["EyesOpen", "EyesClosed"], frameIntervalSeconds: 0.4 },
    talk: { frames: ["MouthClosed", "MouthOpen"], frameIntervalSeconds: 0.1 },
  },
  advanceIndicator: {
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

const textActor: Promise<void> = bubbles.setTextActor({
  actor: { drawableID: 2 },
  actorKey: "Title",
  styleName: "dialogue-text",
  text: "Chapter 1",
});
void textActor;

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
