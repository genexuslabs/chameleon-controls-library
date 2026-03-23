import typescript from "@rollup/plugin-typescript";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import { defineConfig, UserConfig } from "vite";

import {
  defaultMinifyOptions,
  minifyHTMLLiterals as minifyLiterals
} from "minify-html-literals";
import { resolve } from "path";
import pkgMinifyHTML from "rollup-plugin-minify-html-literals";
import { optimizeInlinesPlugin } from "../chameleon/optimize-inlines";

// @ts-expect-error wrong type. TODO: This is a WA to use the default exported function
const minifyHTML: typeof pkgMinifyHTML = pkgMinifyHTML.default;

// Mode → input HTML and output directory
const MODE_CONFIG: Record<string, { input: string; outDir: string }> = {
  "chameleon-6": {
    input: "./index-chameleon-6.html",
    outDir: "dist-chameleon-6"
  },
  "chameleon-7": {
    input: "./index-chameleon-7.html",
    outDir: "dist-chameleon-7"
  },
  "bundle-size-ch6": {
    input: "./bundle-size-ch6.html",
    outDir: "dist-bundle-size-ch6"
  },
  "bundle-size-ch7": {
    input: "./bundle-size-ch7.html",
    outDir: "dist-bundle-size-ch7"
  },
  "bundle-size-ch7-dynamic": {
    input: "./bundle-size-ch7-dynamic.html",
    outDir: "dist-bundle-size-ch7-dynamic"
  }
};

const CH7_MODES = new Set(["chameleon-7", "bundle-size-ch7", "bundle-size-ch7-dynamic"]);

export default defineConfig(({ mode }) => {
  const config = MODE_CONFIG[mode] ?? MODE_CONFIG["chameleon-6"];
  const isCh7 = CH7_MODES.has(mode);

  return {
    esbuild: {
      drop: ["console"],
      format: "esm",
      target: "ES2022",

      tsconfigRaw: {
        compilerOptions: {
          target: "ES2022",
          experimentalDecorators: true,
          useDefineForClassFields: false
        }
      }
    },

    // Use LightningCSS which is faster that PostCSS and also produces a more
    // compact CSS
    css: {
      transformer: "lightningcss",
      lightningcss: {
        targets: browserslistToTargets(browserslist(">= 0.75%"))
      }
    },

    build: {
      minify: "terser",

      rollupOptions: {
        input: [resolve(__dirname, config.input)]
      },

      terserOptions: {
        ecma: 2022 as never,
        module: true,
        compress: {
          unsafe: true,

          // An extra pass can squeeze out an extra byte or two.
          passes: 2
        }
      },

      emptyOutDir: true,
      outDir: config.outDir,
      target: "ES2022",
      assetsInlineLimit: 0
    },

    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
        outDir: config.outDir,
        noCheck: true
      }),

      minifyHTML({
        minifyHTMLLiterals: (source, options) =>
          minifyLiterals(source, {
            ...options,
            minifyOptions: {
              ...defaultMinifyOptions,
              // For some reason, Lit manages to work with complex attribute
              // binding expressions that don't have "" in the binding, so we
              // can enable this optimization. See more in:
              // https://lit.dev/docs/templates/expressions/#attribute-expressions
              removeAttributeQuotes: true
            }
          })
      }),

      // Optimize inlined string expressions in CH7 builds (runs after Terser)
      isCh7 && optimizeInlinesPlugin()
    ]
  } as UserConfig;
});
