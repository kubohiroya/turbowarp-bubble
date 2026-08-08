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

const [quickStart, phaseGuide, lifecycle, manual] = await Promise.all([
  readFile(quickStartUrl, "utf8"),
  readFile(phaseGuideUrl, "utf8"),
  readFile(lifecycleUrl),
  readFile(manualUrl, "utf8"),
]);

requireText(quickStart, 'viewBox="0 0 1200 880"', "Quick-start SVG");
requireText(quickStart, "close this bubble", "Quick-start SVG");
requireText(phaseGuide, 'viewBox="0 0 1200 500"', "Phase-guide SVG");
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
]) {
  requireText(manual, text, "Block manual");
}
