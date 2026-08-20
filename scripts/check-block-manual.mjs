import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import { URL } from "node:url";

const quickStartUrl = new URL(
  "../docs/assets/block-quick-start.svg",
  import.meta.url,
);
const animationModeGuideUrl = new URL(
  "../docs/assets/animation-mode-guide.svg",
  import.meta.url,
);
const placementGuideUrl = new URL(
  "../docs/assets/placement-guide.svg",
  import.meta.url,
);
const actorTransformGuideUrl = new URL(
  "../docs/assets/actor-transform-guide.svg",
  import.meta.url,
);
const widthLinebreakGuideUrl = new URL(
  "../docs/assets/width-linebreak-guide.svg",
  import.meta.url,
);
const bubbleStyleGalleryUrl = new URL(
  "../docs/assets/bubble-style-gallery.svg",
  import.meta.url,
);
const stageComparisonUrl = new URL(
  "../docs/assets/turbowarp-say-think-stage-comparison.png",
  import.meta.url,
);
const blockComparisonUrl = new URL(
  "../docs/assets/turbowarp-say-think-block-comparison.png",
  import.meta.url,
);
const lifecycleUrl = new URL(
  "../docs/assets/bubble-lifecycle.gif",
  import.meta.url,
);
const manualUrl = new URL("../docs/block-manual.md", import.meta.url);
const japaneseManualUrl = new URL(
  "../docs/block-manual.ja.md",
  import.meta.url,
);

function requireText(source, expected, label) {
  if (!source.includes(expected)) {
    throw new Error(`${label} does not contain ${expected}.`);
  }
}

function forbidText(source, forbidden, label) {
  if (source.includes(forbidden)) {
    throw new Error(`${label} must not contain ${forbidden}.`);
  }
}

function skipSubBlocks(buffer, startOffset) {
  let offset = startOffset;
  while (offset < buffer.length) {
    const size = buffer[offset];
    offset += 1;
    if (size === 0) return offset;
    offset += size;
  }
  throw new Error("GIF sub-block data is truncated.");
}

function inspectGif(buffer) {
  if (buffer.subarray(0, 6).toString("ascii") !== "GIF89a") {
    throw new Error("Lifecycle animation must use the GIF89a format.");
  }
  const width = buffer.readUInt16LE(6);
  const height = buffer.readUInt16LE(8);
  const packed = buffer[10];
  let offset = 13;
  if ((packed & 0x80) !== 0) {
    offset += 3 * 2 ** ((packed & 0x07) + 1);
  }

  let frames = 0;
  let loops = false;
  while (offset < buffer.length) {
    const introducer = buffer[offset];
    offset += 1;
    if (introducer === 0x3b) break;
    if (introducer === 0x21) {
      const label = buffer[offset];
      offset += 1;
      if (label === 0xff) loops = true;
      offset = skipSubBlocks(buffer, offset);
      continue;
    }
    if (introducer !== 0x2c) {
      throw new Error(`Unexpected GIF block introducer: ${introducer}.`);
    }
    frames += 1;
    if (offset + 9 > buffer.length) {
      throw new Error("GIF image descriptor is truncated.");
    }
    const imagePacked = buffer[offset + 8];
    offset += 9;
    if ((imagePacked & 0x80) !== 0) {
      offset += 3 * 2 ** ((imagePacked & 0x07) + 1);
    }
    offset += 1;
    offset = skipSubBlocks(buffer, offset);
  }
  return { frames, height, loops, width };
}

function inspectPng(buffer, label) {
  const signature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);
  if (!buffer.subarray(0, signature.length).equals(signature)) {
    throw new Error(`${label} must use the PNG format.`);
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

const [
  quickStart,
  animationModeGuide,
  placementGuide,
  actorTransformGuide,
  widthLinebreakGuide,
  bubbleStyleGallery,
  stageComparison,
  blockComparison,
  lifecycle,
  manual,
  japaneseManual,
] = await Promise.all([
  readFile(quickStartUrl, "utf8"),
  readFile(animationModeGuideUrl, "utf8"),
  readFile(placementGuideUrl, "utf8"),
  readFile(actorTransformGuideUrl, "utf8"),
  readFile(widthLinebreakGuideUrl, "utf8"),
  readFile(bubbleStyleGalleryUrl, "utf8"),
  readFile(stageComparisonUrl),
  readFile(blockComparisonUrl),
  readFile(lifecycleUrl),
  readFile(manualUrl, "utf8"),
  readFile(japaneseManualUrl, "utf8"),
]);

requireText(quickStart, 'viewBox="0 0 1200 880"', "Quick-start SVG");
requireText(quickStart, "close this bubble", "Quick-start SVG");
requireText(
  quickStart,
  "wait with this bubble until condition",
  "Quick-start SVG",
);
requireText(quickStart, "set runtime variable", "Quick-start SVG");
requireText(quickStart, "listen for key", "Quick-start SVG");
for (const asset of ["Next1", "Next2"]) {
  requireText(quickStart, `costume:Assets:${asset}`, "Quick-start SVG");
  requireText(quickStart, `>${asset}<`, "Quick-start SVG");
}
forbidText(quickStart, "Next1 / Next2", "Quick-start SVG");
requireText(
  animationModeGuide,
  'viewBox="0 0 1200 500"',
  "Animation-mode-guide SVG",
);
requireText(placementGuide, 'viewBox="0 0 1600 1560"', "Placement-guide SVG");
requireText(
  actorTransformGuide,
  'viewBox="0 0 1532 486"',
  "Actor-transform-guide SVG",
);
for (const value of [
  'data-actor-transform-scene="distance-tail"',
  'data-actor-transform-scene="offset"',
  'data-actor-transform-scene="scale"',
  'data-actor-bounds="true"',
  'data-boolean-operation="union"',
  'font-size="18"',
]) {
  requireText(actorTransformGuide, value, "Actor-transform-guide SVG");
}
for (const placement of [
  "up-up-right",
  "HEADER_LIKE",
  "CENTER",
  "FOOTER_LIKE",
]) {
  requireText(placementGuide, placement, "Placement-guide SVG");
}
const productionRendererPanels = placementGuide.match(
  /data-bubble-renderer="canonical"/gu,
);
if (productionRendererPanels?.length !== 19) {
  throw new Error(
    `Placement-guide SVG must contain 19 production-rendered panels, found ${productionRendererPanels?.length ?? 0}.`,
  );
}
const unionedActorBubbles = placementGuide.match(
  /data-boolean-operation="union"/gu,
);
if (unionedActorBubbles?.length !== 16) {
  throw new Error(
    `Placement-guide SVG must contain 16 JSClipper-unioned actor bubbles, found ${unionedActorBubbles?.length ?? 0}.`,
  );
}
requireText(
  placementGuide,
  'data-tail-base-on-border="true"',
  "Placement-guide SVG",
);
for (const direction of ["up", "right", "down", "left"]) {
  requireText(
    placementGuide,
    `data-placement-scene="${direction}"`,
    "Placement-guide SVG",
  );
}
for (const region of ["HEADER_LIKE", "CENTER", "FOOTER_LIKE"]) {
  requireText(
    placementGuide,
    `data-background-placement-scene="${region}"`,
    "Placement-guide SVG",
  );
}
requireText(
  widthLinebreakGuide,
  'viewBox="0 0 1600 950"',
  "Width-linebreak-guide SVG",
);
requireText(
  widthLinebreakGuide,
  'data-layout-engine="wrapText"',
  "Width-linebreak-guide SVG",
);
for (const example of [
  "行頭禁則",
  "行末禁則",
  "小書き・長音",
  "書記素cluster",
]) {
  requireText(widthLinebreakGuide, example, "Width-linebreak-guide SVG");
}
requireText(
  bubbleStyleGallery,
  'viewBox="0 0 1600 750"',
  "Bubble-style-gallery SVG",
);
for (const style of [
  "NORMAL",
  "THINKING",
  "DREAMING",
  "YELLING",
  "OFF_PANEL",
  "WAVY",
  "WHISPERING",
  "ANNOUNCEMENT",
  "NARRATION",
  "NO_BUBBLE",
]) {
  requireText(
    bubbleStyleGallery,
    `data-style-gallery-card="${style}"`,
    "Bubble-style-gallery SVG",
  );
  requireText(
    bubbleStyleGallery,
    `data-bubble-style="${style}"`,
    "Bubble-style-gallery SVG",
  );
}
for (const mode of ["talking", "awaiting-continue", "idle"]) {
  requireText(animationModeGuide, mode, "Animation-mode-guide SVG");
}
const animationModeBubbles = animationModeGuide.match(
  /data-bubble-renderer="canonical"/gu,
);
if (animationModeBubbles?.length !== 3) {
  throw new Error(
    `Animation-mode-guide SVG must contain 3 canonical Bubble previews, found ${animationModeBubbles?.length ?? 0}.`,
  );
}
const animationModeUnionedTails = animationModeGuide.match(
  /data-boolean-operation="union"/gu,
);
if (animationModeUnionedTails?.length !== 3) {
  throw new Error(
    `Animation-mode-guide SVG must contain 3 unioned Bubble tails, found ${animationModeUnionedTails?.length ?? 0}.`,
  );
}
const animationModeUnionPaths = animationModeGuide.match(
  /data-animation-mode-bubble-path="union"/gu,
);
if (animationModeUnionPaths?.length !== 3) {
  throw new Error(
    `Animation-mode-guide SVG must contain 3 single-path Bubble drawings, found ${animationModeUnionPaths?.length ?? 0}.`,
  );
}
const animationModeTailDirections = animationModeGuide.match(
  /data-bubble-tail-direction="270"/gu,
);
if (animationModeTailDirections?.length !== 3) {
  throw new Error(
    `Animation-mode-guide SVG must contain 3 left-facing Bubble tails, found ${animationModeTailDirections?.length ?? 0}.`,
  );
}
forbidText(animationModeGuide, "<svg x=", "Animation-mode-guide SVG");
forbidText(
  animationModeGuide,
  "set this bubble phase",
  "Animation-mode-guide SVG",
);

const gif = inspectGif(lifecycle);
if (
  gif.width !== 960 ||
  gif.height !== 540 ||
  gif.frames !== 16 ||
  !gif.loops
) {
  throw new Error(`Unexpected lifecycle GIF metadata: ${JSON.stringify(gif)}`);
}

const stageComparisonMetadata = inspectPng(
  stageComparison,
  "TurboWarp Stage comparison",
);
if (
  stageComparisonMetadata.width !== 1008 ||
  stageComparisonMetadata.height !== 852
) {
  throw new Error(
    `Unexpected TurboWarp Stage comparison dimensions: ${JSON.stringify(stageComparisonMetadata)}`,
  );
}
const blockComparisonMetadata = inspectPng(
  blockComparison,
  "TurboWarp block comparison",
);
if (
  blockComparisonMetadata.width !== 888 ||
  blockComparisonMetadata.height !== 344
) {
  throw new Error(
    `Unexpected TurboWarp block comparison dimensions: ${JSON.stringify(blockComparisonMetadata)}`,
  );
}

const requiredManualReferences = [
  "define bubble style",
  "set bubble placement",
  "set bubble distance",
  "set bubble visual style",
  "set bubble tail length",
  "set bubble offset x",
  "set portrait base",
  "set blink frames",
  "set lip-sync frames",
  "set continue frames",
  "say [MESSAGE] with bubble style",
  "think [MESSAGE] with bubble style",
  "set this bubble animation mode",
  "wait with this bubble until condition",
  "close this bubble",
  "Bubble version",
  "./assets/block-quick-start.svg",
  "./assets/bubble-lifecycle.gif",
  "./assets/animation-mode-guide.svg",
  "./assets/placement-guide.svg",
  "./assets/actor-transform-guide.svg",
  "./assets/width-linebreak-guide.svg",
  "./assets/bubble-style-gallery.svg",
  "./assets/turbowarp-say-think-stage-comparison.png",
  "./assets/turbowarp-say-think-block-comparison.png",
];
for (const text of requiredManualReferences) {
  requireText(manual, text, "English block manual");
  requireText(japaneseManual, text, "Japanese block manual");
}

requireText(manual, "TurboWarp Bubble Block Manual", "English block manual");
requireText(
  japaneseManual,
  "TurboWarp Bubble ブロック利用マニュアル",
  "Japanese block manual",
);
for (const [manualSource, label] of [
  [manual, "English block manual"],
  [japaneseManual, "Japanese block manual"],
]) {
  forbidText(manualSource, "set this bubble phase", label);
  forbidText(
    manualSource,
    "wait until <space key pressed? or mouse down?>",
    label,
  );
  requireText(manualSource, "awaiting-continue", label);
  requireText(manualSource, "turbowarp-async-input", label);
  requireText(manualSource, "turbowarp-runtime-expression", label);
}
