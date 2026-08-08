import { defineConfig } from "vite";

export default defineConfig({
  define: {
    Buffer: "undefined",
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: "src/turbowarp-adapter.ts",
      fileName: "turbowarp-adapter",
      formats: ["es"],
    },
  },
});
