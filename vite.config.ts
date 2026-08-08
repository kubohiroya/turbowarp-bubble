import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: "src/composition.ts",
      fileName: "composition",
      formats: ["es"],
    },
  },
});
