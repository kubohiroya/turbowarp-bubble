import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: "src/composition.ts",
      fileName: "composition",
      formats: ["es"],
    },
  },
});
