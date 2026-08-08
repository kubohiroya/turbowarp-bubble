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

for (const name of [
  "createBubbleComposition",
  "BubbleCompositionError",
  "UnicodeLineBreakProvider",
  "wrapText",
]) {
  if (!composition.includes(name)) {
    throw new Error(`dist/composition.js does not export ${name}.`);
  }
}

for (const name of [
  "BubbleComposition",
  "BubbleHandle",
  "BubbleStyleInput",
  "LineBreakProvider",
  "WrappedTextLayout",
]) {
  if (!declaration.includes(name)) {
    throw new Error(`dist/types/composition.d.ts does not declare ${name}.`);
  }
}

for (const nodeApi of ["node:", "process.", "Buffer."]) {
  for (const [fileName, output] of [
    ["dist/composition.js", composition],
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
  "sayWithBubbleStyle",
  "setBubblePhase",
  "kubohiroyaassetmanager",
  "kubohiroyasvgtext",
]) {
  if (!extension.includes(value)) {
    throw new Error(`dist/turbowarp-bubble.js does not contain ${value}.`);
  }
}

if (manifest.id !== "kubohiroyabubble" || manifest.blocks.length !== 10) {
  throw new Error(
    "dist/extension-manifest.json has an unexpected block contract.",
  );
}
