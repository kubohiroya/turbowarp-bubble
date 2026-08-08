import { createAssetManagerComposition } from "@kubohiroya/turbowarp-asset-manager/composition";
import { createSvgTextComposition } from "@kubohiroya/turbowarp-svg-text/composition";
import {
  createBubbleComposition,
  wrapText,
  type BubbleComposition,
  type BubbleHandle,
  type WrappedTextLayout,
} from "@kubohiroya/turbowarp-bubble/composition";

declare const runtime: Parameters<
  typeof createSvgTextComposition
>[0]["runtime"];
const assetManager = createAssetManagerComposition();
const svgText = createSvgTextComposition({ runtime });

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

bubbles.defineStyle({
  name: "dialogue",
  textStyle: "dialogue-text",
  placement: "north-northeast",
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

const wrapped: WrappedTextLayout = wrapText({
  text: "これは長いセリフです。",
  maxWidth: 320,
  measureText: (text) => text.length * 16,
});
void wrapped;
