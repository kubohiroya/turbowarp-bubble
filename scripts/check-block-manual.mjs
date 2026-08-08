import { readFile } from "node:fs/promises";
import { URL } from "node:url";

const quickStartUrl = new URL(
  "../docs/assets/block-quick-start.svg",
  import.meta.url,
);
const phaseGuideUrl = new URL(
  "../docs/assets/phase-guide.svg",
  import.meta.url,
);
const placementGuideUrl = new URL(
  "../docs/assets/placement-guide.svg",
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
const lifecycleUrl = new URL(
  "../docs/assets/bubble-lifecycle.gif",
  import.meta.url,
);
const manualUrl = new URL("../docs/block-manual.md", import.meta.url);

function requireText(source, expected, label) {
  if (!source.includes(expected)) {
    throw new Error(`${label} does not contain ${expected}.`);
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

const [
  quickStart,
  phaseGuide,
  placementGuide,
  widthLinebreakGuide,
  bubbleStyleGallery,
  lifecycle,
  manual,
] = await Promise.all([
  readFile(quickStartUrl, "utf8"),
  readFile(phaseGuideUrl, "utf8"),
  readFile(placementGuideUrl, "utf8"),
  readFile(widthLinebreakGuideUrl, "utf8"),
  readFile(bubbleStyleGalleryUrl, "utf8"),
  readFile(lifecycleUrl),
  readFile(manualUrl, "utf8"),
]);

requireText(quickStart, 'viewBox="0 0 1200 880"', "Quick-start SVG");
requireText(quickStart, "close this bubble", "Quick-start SVG");
requireText(phaseGuide, 'viewBox="0 0 1200 500"', "Phase-guide SVG");
requireText(placementGuide, 'viewBox="0 0 1600 1560"', "Placement-guide SVG");
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
for (const phase of ["speaking", "waiting", "idle"]) {
  requireText(phaseGuide, phase, "Phase-guide SVG");
}

const gif = inspectGif(lifecycle);
if (
  gif.width !== 960 ||
  gif.height !== 540 ||
  gif.frames !== 16 ||
  !gif.loops
) {
  throw new Error(`Unexpected lifecycle GIF metadata: ${JSON.stringify(gif)}`);
}

for (const text of [
  "define bubble style",
  "set bubble placement",
  "set portrait base",
  "set blink frames",
  "set talk frames",
  "set advance frames",
  "say [MESSAGE] with bubble style",
  "think [MESSAGE] with bubble style",
  "set this bubble phase",
  "close this bubble",
  "Bubble version",
  "./assets/block-quick-start.svg",
  "./assets/bubble-lifecycle.gif",
  "./assets/phase-guide.svg",
  "./assets/placement-guide.svg",
  "./assets/width-linebreak-guide.svg",
  "./assets/bubble-style-gallery.svg",
]) {
  requireText(manual, text, "Block manual");
}
