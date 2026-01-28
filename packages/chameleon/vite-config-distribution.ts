import typescript from "@rollup/plugin-typescript";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import { resolve } from "path";
import summary from "rollup-plugin-summary";
import { createLogger, PluginOption, UserConfig } from "vite";

import { optimizeInlinesPlugin } from "./optimize-inlines";
import { updateDevelopmentFlags } from "./update-development-flags";

import {
  defaultMinifyOptions,
  DefaultOptions,
  minifyHTMLLiterals as minifyLiterals
} from "minify-html-literals";
import pkgMinifyHTML from "rollup-plugin-minify-html-literals";
// import { createMinifyProtectedTransformer } from "./rollup-plugin-minify-protected-methods";

// @ts-expect-error wrong type. TODO: This is a WA to use the default exported function
const minifyHTML: typeof pkgMinifyHTML = pkgMinifyHTML.default;

const packageJson = await import("./package.json");

// Original logger
const logger = createLogger();
const loggerInfo = logger.info;

const RELATIVE_SRC_PATH = "packages/chameleon/src/";
const RELATIVE_SRC_PATH_LENGTH = RELATIVE_SRC_PATH.length;

export const defineDistributionConfiguration = (
  isNode: boolean,
  isProduction: boolean
): UserConfig => {
  const envFolder = isProduction ? "production" : "development";
  const nodeOrBrowserFolder = isNode ? "node/" : "browser/";
  const outDir = `dist/${nodeOrBrowserFolder}${envFolder}`;

  return {
    // Custom Logger to avoid duplicating the chunk info
    customLogger: {
      ...logger,
      info(msg, options) {
        // Remove default Vite output for the chunk size
        if (
          msg.includes("dist/") &&
          (msg.includes("kB") || msg.includes("MB"))
        ) {
          return;
        }
        // Otherwise, use the default logger
        loggerInfo(msg, options);
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

    esbuild: {
      // Only remove console logs in the production environment ("build" command)
      // drop: isProduction ? ["console", "debugger"] : [],
      format: "esm",
      target: "esnext"
    },

    build: {
      lib: {
        entry: resolve(__dirname, "./src/index.ts"),
        name: "chameleon-controls-library",
        formats: ["es"],
        fileName: () => `[name].js`
      },
      minify: isProduction ? "terser" : false,

      // We must not empty the outDir, otherwise watch mode won't work at all,
      // because types are not regenerated
      emptyOutDir: false,
      outDir: outDir,
      sourcemap: isProduction,
      target: "esnext",
      assetsInlineLimit: 0,

      terserOptions: {
        ecma: 2024 as never,
        module: true,
        compress: isProduction
          ? {
              unsafe: true,
              // An extra pass can squeeze out an extra byte or two.
              passes: 2
            }
          : false
      },

      rollupOptions: {
        external: [
          ...Object.keys(packageJson.peerDependencies).map(
            dependency => new RegExp(`^${dependency}`)
          ),
          /^tslib/,
          /^@/
        ],
        output: {
          // Keep file structure
          preserveModules: true,

          // Replace the file structure from src/ to dist/
          entryFileNames: ({ name: fileName }) => {
            const relativePath = fileName.startsWith(RELATIVE_SRC_PATH)
              ? fileName.substring(RELATIVE_SRC_PATH_LENGTH)
              : fileName;
            return `${relativePath}.js`;
          },

          chunkFileNames: ({ name: fileName }) => {
            const relativePath = fileName.startsWith(RELATIVE_SRC_PATH)
              ? fileName.substring(RELATIVE_SRC_PATH_LENGTH)
              : fileName;
            return `${relativePath}.js`;
          }
        }
      }
    },
    plugins: [
      // Update all DEV_MODE and IS_SERVER variable assignment values using
      // their respective environment setting. Terser's dead code removal will
      // then remove any blocks that are conditioned on these variable when
      // false.
      //
      // Code in our <node|browser>/development/ directory looks like this:
      //   if (DEV_MODE) {
      //     dev mode cool stuff
      //   }
      updateDevelopmentFlags(isNode, isProduction),

      // Transpile after minifying the template literals
      isProduction &&
        (typescript({
          tsconfig: "./tsconfig.json",
          outDir,
          transformers: {
            // before: !isNode ? [createMinifyProtectedTransformer()] : []
          }
        }) as PluginOption),

      minifyHTML({
        minifyHTMLLiterals: (
          source: string,
          options: DefaultOptions | undefined
        ) =>
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
      }) as PluginOption,

      // Optimize inline expressions after Terser minification
      isProduction && (optimizeInlinesPlugin() as PluginOption),

      // Print bundle summary
      isProduction &&
        !isNode &&
        (summary({
          // Each bundle
          warnHigh: 120000, // RED >= 120KB
          warnLow: 40000, // GREEN < 40KB,

          // Bundle summary
          totalHigh: 800000, // RED >= 800KB
          totalLow: 300000, // GREEN < 300KB,

          // Different compress methods
          showGzippedSize: true,
          showBrotliSize: true
        }) as PluginOption)
    ]
  };
};

