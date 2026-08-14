import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: "src/reveal.ts",
      fileName: "reveal",
      formats: ["es"],
    },
  },
});
