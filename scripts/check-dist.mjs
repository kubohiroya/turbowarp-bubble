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

for (const name of ["createBubbleComposition", "BubbleCompositionError"]) {
  if (!composition.includes(name)) {
    throw new Error(`dist/composition.js does not export ${name}.`);
  }
}

for (const name of ["BubbleComposition", "BubbleHandle", "BubbleStyleInput"]) {
  if (!declaration.includes(name)) {
    throw new Error(`dist/types/composition.d.ts does not declare ${name}.`);
  }
}
