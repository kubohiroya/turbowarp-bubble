import { defineConfig } from "vite";

export default defineConfig({
  define: {
    Buffer: "undefined",
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: "src/composition.ts",
      fileName: "composition",
      formats: ["es"],
    },
  },
});
