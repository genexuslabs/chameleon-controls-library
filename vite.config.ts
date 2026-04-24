import { defineConfig } from "vite";

export default defineConfig({
  // Bundles
  build: {
    assetsDir: "./assets",

    lib: {
      entry: {
        monaco: "src/common/monaco/monaco.ts"
      },
      formats: ["es"]
    },

    rollupOptions: {
      output: {
        dir: "src/common/monaco/output"
      }
    }
  }
});
