import { turboWarpExtension } from "@kubohiroya/vite-plugin-turbowarp-extension";
import { defineConfig } from "vite";
import definitions from "./src/block-definitions.json" with { type: "json" };
import { extensionConfig } from "./src/config.js";
import { extensionManifestPlugin } from "./src/extension-manifest.js";

export default defineConfig(({ command }) => ({
  define: command === "build" ? { Buffer: "undefined" } : {},
  plugins: [
    turboWarpExtension({
      id: extensionConfig.id,
      name: extensionConfig.name,
      description: extensionConfig.description,
      author: extensionConfig.author,
      license: extensionConfig.license,
      fileName: `${extensionConfig.slug}.js`,
    }),
    extensionManifestPlugin({ id: extensionConfig.id, definitions }),
    {
      name: "normalize-generated-indentation",
      apply: "build",
      enforce: "post",
      generateBundle(_outputOptions, bundle) {
        for (const output of Object.values(bundle)) {
          if (output.type === "chunk") {
            output.code = output.code.replace(/^[\t ]+/gmu, (indentation) =>
              indentation.replaceAll("\t", "  "),
            );
          }
        }
      },
    },
  ],
}));
