import { defineConfig } from "vite";
import terser from "@rollup/plugin-terser";

export default defineConfig({
  plugins: [
    // Minify JS
    terser({
      ecma: 2022,
      module: true,
      warnings: true,
      compress: true,
      format: {
        comments: false // TODO: Check if we can do this due to license
      }
    })
  ],

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
