import { createHash } from "crypto";
import typescript from "@rollup/plugin-typescript";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import type { Plugin } from "rollup";
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

import {
  MINIFIED_ENTRIES,
  MINIFIED_OUTPUT_DIR
} from "./src/testing/bundle-size/entries";

const OUT_DIR = MINIFIED_OUTPUT_DIR;

// Original logger
const logger = createLogger();
const loggerInfo = logger.info;

const packageJson = await import("./package.json");

/**
 * Rollup plugin that shortens external import paths in the final output.
 *
 * Stencil (v6) bundles don't have visible import paths — all dependencies are
 * compiled into the runtime. Lit/Kasstor (v7) bundles keep external imports
 * as-is (e.g., `@genexus/kasstor-core/decorators/component.js`). These long
 * strings inflate the raw size unfairly in a comparison.
 *
 * This plugin replaces each unique import path with a short single-letter
 * identifier (e.g., `"a"`, `"b"`, ...) so the measured size reflects only
 * the component's own code, not the verbosity of its dependency specifiers.
 *
 * This is safe because minified bundles are only used for size measurement,
 * never executed.
 */
function minifyExternalImportPaths(): Plugin {
  return {
    name: "minify-external-import-paths",

    generateBundle(_options, bundle) {
      // Build a global map so the same specifier gets the same chunk name
      // across all entry files (matches real Rollup behavior).
      const seen = new Map<string, string>();

      const toChunkPath = (specifier: string): string => {
        // Keep relative paths (internal chunks) — they already have hashed
        // names produced by Rollup (e.g., `./lit-html.fkr2xVQZ.js`).
        if (specifier.startsWith(".")) {
          return specifier;
        }

        if (!seen.has(specifier)) {
          const hash = createHash("sha256")
            .update(specifier)
            .digest("hex")
            .slice(0, 8);
          seen.set(specifier, `./chunk-${hash}.js`);
        }

        return seen.get(specifier)!;
      };

      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== "chunk") {
          continue;
        }

        chunk.code = chunk.code
          // `from "path"` — import/export ... from "specifier"
          .replace(/\bfrom\s*"([^"]+)"/g, (_match, importPath: string) => {
            return `from"${toChunkPath(importPath)}"`;
          })
          // Side-effect imports: `import "path"` (preceded by ; or start)
          .replace(
            /(^|;)\s*import\s*"([^"]+)"/gm,
            (_match, prefix: string, importPath: string) => {
              return `${prefix}import"${toChunkPath(importPath)}"`;
            }
          );
      }
    }
  };
}

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
      preserveEntrySignatures: "strict" as const,
      input: MINIFIED_ENTRIES.map(entry => entry.path),

      output: {
        chunkFileNames: "[name].[hash].js",

        // It doesn't add a hash for the entry files configured in the
        // "rollupOptions.input" property
        entryFileNames: "[name].js"
      },

      external: [
        ...Object.keys(packageJson.dependencies ?? {}).map(
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
    }),

    // Shorten external import paths for fair size comparison with Chameleon 6.
    // Must be last so it runs after terser and summary.
    minifyExternalImportPaths()
  ]
};

