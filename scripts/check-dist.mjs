import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import { URL } from "node:url";

const composition = await readFile(
  new URL("../dist/composition.js", import.meta.url),
  "utf8",
);
const declaration = await readFile(
  new URL("../dist/types/composition.d.ts", import.meta.url),
  "utf8",
);
const reveal = await readFile(
  new URL("../dist/reveal.js", import.meta.url),
  "utf8",
);
const revealDeclaration = await readFile(
  new URL("../dist/types/reveal.d.ts", import.meta.url),
  "utf8",
);
const turboWarpAdapter = await readFile(
  new URL("../dist/turbowarp-adapter.js", import.meta.url),
  "utf8",
);
const turboWarpAdapterDeclaration = await readFile(
  new URL("../dist/types/turbowarp-adapter.d.ts", import.meta.url),
  "utf8",
);
const extension = await readFile(
  new URL("../dist/turbowarp-bubble.js", import.meta.url),
  "utf8",
);
const manifest = JSON.parse(
  await readFile(
    new URL("../dist/extension-manifest.json", import.meta.url),
    "utf8",
  ),
);
const packageManifest = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);
const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
const japaneseReadme = await readFile(
  new URL("../README_ja.md", import.meta.url),
  "utf8",
);
const manual = await readFile(
  new URL("../docs/block-manual.md", import.meta.url),
  "utf8",
);
const japaneseManual = await readFile(
  new URL("../docs/block-manual.ja.md", import.meta.url),
  "utf8",
);

const packageVersion = packageManifest.version;
if (
  typeof packageVersion !== "string" ||
  !/^\d+\.\d+\.\d+$/u.test(packageVersion)
) {
  throw new Error("package.json must contain a stable semantic version.");
}
if (!extension.includes(`EXTENSION_VERSION = "${packageVersion}"`)) {
  throw new Error(
    `dist/turbowarp-bubble.js does not report package version ${packageVersion}.`,
  );
}
for (const [source, expected, label] of [
  [readme, `current release is Bubble ${packageVersion}`, "README.md"],
  [japaneseReadme, `現在のリリースはBubble ${packageVersion}`, "README_ja.md"],
  [manual, `Bubble ${packageVersion}`, "docs/block-manual.md"],
  [japaneseManual, `Bubble ${packageVersion}`, "docs/block-manual.ja.md"],
]) {
  if (!source.includes(expected)) {
    throw new Error(`${label} does not identify release ${packageVersion}.`);
  }
}
const releaseUrl = `@kubohiroya/turbowarp-bubble@${packageVersion}/dist/turbowarp-bubble.js`;
for (const [source, label] of [
  [readme, "README.md"],
  [japaneseReadme, "README_ja.md"],
  [manual, "docs/block-manual.md"],
  [japaneseManual, "docs/block-manual.ja.md"],
]) {
  if (!source.includes(releaseUrl)) {
    throw new Error(`${label} does not use the ${packageVersion} CDN URL.`);
  }
}

for (const section of ["dependencies", "optionalDependencies"]) {
  for (const [name, specifier] of Object.entries(
    packageManifest[section] ?? {},
  )) {
    if (
      typeof specifier !== "string" ||
      /^(?:bitbucket:|file:|git(?:\+[^:]+)?:|github:|gitlab:|https?:|link:)/iu.test(
        specifier,
      )
    ) {
      throw new Error(
        `package.json ${section}.${name} must use a registry version specifier.`,
      );
    }
  }
}

for (const name of [
  "createBubbleComposition",
  "BubbleCompositionError",
  "UnicodeLineBreakProvider",
  "normalizeBubblePlacement",
  "normalizeBubblePortraitPlacement",
  "normalizeBubblePortraitOffset",
  "normalizeBubblePortraitCornerRadius",
  "renderBubbleSvg",
  "wrapText",
]) {
  if (!composition.includes(name)) {
    throw new Error(`dist/composition.js does not export ${name}.`);
  }
}

for (const name of [
  "bubbleRevealUnits",
  "normalizeBubbleReveal",
  "revealedBubbleText",
  "splitBubbleText",
]) {
  if (!reveal.includes(name)) {
    throw new Error(`dist/reveal.js does not export ${name}.`);
  }
}

for (const name of [
  "BubbleRevealInput",
  "BubbleRevealLayout",
  "BubbleRevealUnit",
  "NormalizedBubbleReveal",
]) {
  if (!revealDeclaration.includes(name)) {
    throw new Error(`dist/types/reveal.d.ts does not declare ${name}.`);
  }
}

if (Buffer.byteLength(reveal, "utf8") > 12 * 1024) {
  throw new Error("dist/reveal.js exceeds the 12 KiB standalone budget.");
}

for (const bundledCompositionMarker of [
  "createBubbleComposition",
  "renderBubbleSvg",
  "ClipperLib",
]) {
  if (reveal.includes(bundledCompositionMarker)) {
    throw new Error(
      `dist/reveal.js unexpectedly contains ${bundledCompositionMarker}.`,
    );
  }
}

for (const name of [
  "createTurboWarpBubbleComposition",
  "BubbleRuntimeAdapterError",
]) {
  if (!turboWarpAdapter.includes(name)) {
    throw new Error(`dist/turbowarp-adapter.js does not export ${name}.`);
  }
}

for (const name of [
  "TurboWarpBubbleCompositionOptions",
  "TurboWarpBubbleRuntime",
  "TurboWarpBubbleTarget",
]) {
  if (!turboWarpAdapterDeclaration.includes(name)) {
    throw new Error(
      `dist/types/turbowarp-adapter.d.ts does not declare ${name}.`,
    );
  }
}

for (const name of [
  "BubbleComposition",
  "BubbleHandle",
  "BubbleStyleInput",
  "BubblePlacement",
  "BubblePortraitPlacement",
  "BubblePortraitOffsetInput",
  "BubbleBodyCenterOffsetInput",
  "BubbleVisualStyle",
  "LineBreakProvider",
  "WrappedTextLayout",
  "BubbleRevealInput",
  "BubbleMotionInput",
  "BubbleFinishInput",
]) {
  if (!declaration.includes(name)) {
    throw new Error(`dist/types/composition.d.ts does not declare ${name}.`);
  }
}

for (const nodeApi of ["node:", "process.", "Buffer."]) {
  for (const [fileName, output] of [
    ["dist/composition.js", composition],
    ["dist/reveal.js", reveal],
    ["dist/turbowarp-adapter.js", turboWarpAdapter],
    ["dist/turbowarp-bubble.js", extension],
  ]) {
    if (output.includes(nodeApi)) {
      throw new Error(`${fileName} contains Node.js API: ${nodeApi}`);
    }
  }
}

for (const value of [
  "kubohiroyabubble",
  "defineBubbleStyle",
  "defineBubbleClosePolicy",
  "setBubblePlacement",
  "setBubbleDistance",
  "setBubbleVisualStyle",
  "setBubbleTailLength",
  "setBubbleOffset",
  "setPortraitLayout",
  "https://kubohiroya.github.io/turbowarp-bubble/",
  '"opcode": "say"',
  '"opcode": "think"',
  "showWithBubbleStyle",
  "sayWithBubbleStyle",
  "setBubbleAnimationMode",
  "waitForBubbleContinue",
  "waitAndCloseBubbleWithPolicy",
  "kubohiroyaassetmanager",
  "kubohiroyasvgtext",
]) {
  if (!extension.includes(value)) {
    throw new Error(`dist/turbowarp-bubble.js does not contain ${value}.`);
  }
}

if (manifest.id !== "kubohiroyabubble" || manifest.blocks.length !== 33) {
  throw new Error(
    "dist/extension-manifest.json has an unexpected block contract.",
  );
}
