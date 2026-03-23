import typescript from "@rollup/plugin-typescript";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import { createLogger, UserConfig } from "vite";

import { updateDevelopmentFlags } from "./update-development-flags";

import { defaultMinifyOptions, minifyHTMLLiterals as minifyLiterals } from "minify-html-literals";
import pkgMinifyHTML from "rollup-plugin-minify-html-literals";
import optimizeInlinesPlugin from "./optimize-inlines";

// @ts-expect-error wrong type. TODO: This is a WA to use the default exported function
const minifyHTML: typeof pkgMinifyHTML = pkgMinifyHTML.default;

import { MINIFIED_ENTRIES, MINIFIED_OUTPUT_DIR } from "./src/testing/bundle-size/entries";

const OUT_DIR = MINIFIED_OUTPUT_DIR;

// Original logger
const logger = createLogger();
const loggerInfo = logger.info;

// Build lookups for mapping source paths ↔ output chunk names
// e.g., "components/accordion/accordion.lit.ts" → "accordion.lit"
const PATH_TO_CHUNK = new Map(
  MINIFIED_ENTRIES.map(entry => [
    entry.path.replace(/^src\//, ""),
    entry.outputName.replace(".js", "")
  ])
);

// Set of all chunk names assigned to components/utilities (for chunkFileNames)
const COMPONENT_CHUNK_NAMES = new Set(PATH_TO_CHUNK.values());

/**
 * Build configuration that simulates a real consumer application.
 *
 * An HTML entry point dynamically imports every component and utility.
 * Rollup resolves all dependencies (zero externals), deduplicates shared code
 * into `shared/` chunks, and produces a navigable output. This allows
 * measuring:
 *
 * - **Per-component cost**: each component's async chunk (marginal cost).
 * - **Shared dependencies**: total size of `shared/` chunks (lit, kasstor,
 *   etc. — paid once).
 * - **Total application cost**: sum of all files = real download cost.
 *
 * Components whose unique dependencies are only used by them (e.g., KaTeX for
 * math-viewer, shiki for code) keep those deps inlined in their chunk,
 * correctly reflecting the true marginal cost.
 */
export const minifiedConfiguration: UserConfig = {
  customLogger: {
    ...logger,
    info(msg, options) {
      if (msg.includes("dist/") && (msg.includes("kB") || msg.includes("MB"))) {
        return;
      }
      loggerInfo(msg, options);
    }
  },

  esbuild: {
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
        passes: 2
      }
    },

    rollupOptions: {
      // HTML entry — a real navigable application
      input: { index: "src/testing/bundle-size/app.html" },

      output: {
        // The app-entry script
        entryFileNames: "app-entry.js",

        chunkFileNames(chunkInfo) {
          // Component/utility chunks get deterministic names for test
          // assertions. All other chunks use Rollup's default naming.
          if (COMPONENT_CHUNK_NAMES.has(chunkInfo.name)) {
            return "[name].js";
          }

          return "[name].[hash].js";
        },

        // Assign modules to named chunks:
        // 1. Component/utility entry modules → own named chunk
        // 2. Framework deps shared by many components → shared vendor chunk
        //    (prevents Rollup from duplicating them across async chunks)
        // 3. Internal shared utilities → shared chunk
        //
        // Component-specific deps (katex, qr-creator, shiki) are NOT forced
        // to shared — Rollup naturally keeps them in the component's chunk
        // since only one component imports them. This gives accurate marginal
        // cost per component.
        manualChunks(id) {
          const normalized = id.replace(/\\/g, "/");

          // Component/utility entry modules → own named chunk
          for (const [pathSuffix, chunkName] of PATH_TO_CHUNK) {
            if (normalized.endsWith(pathSuffix)) {
              return chunkName;
            }
          }

          // Framework deps shared by many components → vendor chunks
          if (normalized.includes("/node_modules/")) {
            if (
              normalized.includes("/lit/") ||
              normalized.includes("/lit-html/") ||
              normalized.includes("/lit-element/") ||
              normalized.includes("/@lit/")
            ) {
              return "vendor-lit";
            }
            if (normalized.includes("/@genexus/kasstor-core/")) {
              return "vendor-kasstor-core";
            }
            if (normalized.includes("/@genexus/kasstor-signals/")) {
              return "vendor-kasstor-signals";
            }
            if (normalized.includes("/@genexus/kasstor-webkit/")) {
              return "vendor-kasstor-webkit";
            }
            if (normalized.includes("/tslib/")) {
              return "vendor-tslib";
            }
            // katex, qr-creator, shiki, etc. are NOT assigned — Rollup
            // naturally keeps them in the component that imports them
          }

          // Internal shared utilities → shared chunk
          if (normalized.includes("/utilities/")) {
            return "internal-utilities";
          }

          return undefined;
        }
      }
    },

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
      transformers: {}
    }),

    minifyHTML({
      minifyHTMLLiterals: (source, options) =>
        minifyLiterals(source, {
          ...options,
          minifyOptions: {
            ...defaultMinifyOptions,
            removeAttributeQuotes: true
          }
        })
    }),

    optimizeInlinesPlugin()
  ]
};

