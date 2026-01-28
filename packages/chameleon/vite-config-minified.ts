import typescript from "@rollup/plugin-typescript";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import summary from "rollup-plugin-summary";
import { createLogger, UserConfig } from "vite";

import { updateDevelopmentFlags } from "./update-development-flags";

import {
  defaultMinifyOptions,
  minifyHTMLLiterals as minifyLiterals
} from "minify-html-literals";
import pkgMinifyHTML from "rollup-plugin-minify-html-literals";
import optimizeInlinesPlugin from "./optimize-inlines";
// import { createMinifyProtectedTransformer } from "./rollup-plugin-minify-protected-methods";

// @ts-expect-error wrong type. TODO: This is a WA to use the default exported function
const minifyHTML: typeof pkgMinifyHTML = pkgMinifyHTML.default;

const OUT_DIR = "dist/minified/browser";

// Original logger
const logger = createLogger();
const loggerInfo = logger.info;

const packageJson = await import("./package.json");

export const minifiedConfiguration: UserConfig = {
  // Custom Logger to avoid duplicating the chunk info
  customLogger: {
    ...logger,
    info(msg, options) {
      // Remove default Vite output for the chunk size
      if (msg.includes("dist/") && (msg.includes("kB") || msg.includes("MB"))) {
        return;
      }
      // Otherwise, use the default logger
      loggerInfo(msg, options);
    }
  },

  esbuild: {
    format: "esm",
    target: "ES2022",

    tsconfigRaw: {
      compilerOptions: {
        target: "ES2022", // Cambia de ESNext a ES2022
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

    terserOptions: {
      ecma: 2022 as never,
      module: true,
      compress: {
        unsafe: true,

        // An extra pass can squeeze out an extra byte or two.
        passes: 2
      }
    },

    rollupOptions: {
      input: "./src/index.ts",

      output: {
        chunkFileNames: "[name].[hash].js",

        // It doesn't add a hash for the entry files configured in the
        // "rollupOptions.input" property
        entryFileNames: "[name].js"
      },

      external: [
        ...Object.keys(packageJson.dependencies).map(
          dependency => new RegExp(`^${dependency}`)
        ),
        /^tslib/,
        /^@/
      ]
    },

    // We must not empty the outDir, otherwise watch mode won't work at all,
    // because types are not regenerated
    emptyOutDir: true,
    outDir: OUT_DIR,
    target: "ES2022",
    assetsInlineLimit: 0
  },

  plugins: [
    updateDevelopmentFlags(false, true),

    typescript({
      tsconfig: "./tsconfig.json",
      outDir: OUT_DIR,
      transformers: {
        // before: [createMinifyProtectedTransformer()]
      }
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

    // Optimize inline expressions after Terser minification
    optimizeInlinesPlugin(),

    // Print bundle summary
    summary({
      // Each bundle
      warnHigh: 120000, // RED >= 120KB
      warnLow: 40000, // GREEN < 40KB,

      // Bundle summary
      totalHigh: 800000, // RED >= 800KB
      totalLow: 300000, // GREEN < 300KB,

      // Different compress methods
      showGzippedSize: true,
      showBrotliSize: true
    })
  ]
};

