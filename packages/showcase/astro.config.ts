import { kasstor } from "@genexus/vite-plugin-kasstor";
import { mercury } from "@genexus/vite-plugin-mercury";
import lit from "@semantic-ui/astro-lit";
import { defineConfig } from "astro/config";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import { createLogger } from "vite";

// import { DEFAULT_LOCALE, LOCALES } from "./src/constants/constants";

import summary from "rollup-plugin-summary";

// Original logger
const logger = createLogger();
const loggerInfo = logger.info;

export default defineConfig({
  integrations: [lit()],

  vite: {
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
      drop:
        process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
      target: "esnext",
      format: "esm",
      tsconfigRaw: {
        compilerOptions: {
          target: "es2022"
        }
      }
    },

    build: {
      minify: "terser", // When downloading the bundles in the browser this compression is better than ESBuild
      target: "esnext", // Necessary to force the ECMA script target version

      rollupOptions: {
        output: {
          // manualChunks: (id, meta) => {
          //   const moduleInfo = meta.getModuleInfo(id)!;
          //   const moduleId = moduleInfo.id;

          //   // Merge common chunks of the initial load
          //   if (
          //     moduleId.includes("BaseLayout.astro") ||
          //     moduleId.includes("router")
          //   ) {
          //     return "base-layout";
          //   }
          // },

          // Optimize chunk sizes by trying to group chunks that their raw size
          // is smaller than 10KB. This only happen to chunks that "make sense"
          // to group.
          // https://rollupjs.org/configuration-options/#output-experimentalminchunksize
          experimentalMinChunkSize: 10 * 1024 // 10 KB
        }
      },

      terserOptions: {
        ecma: 2022 as never,
        module: true,

        compress: {
          unsafe: true,

          // An extra pass can squeeze out an extra byte or two.
          passes: 2
        }
      }
    },

    plugins:
      process.env.NODE_ENV === "production"
        ? [
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
            mercury({ avoidHash: { "base/base": true, "base/icons": true } })
          ]
        : [mercury({ avoidHash: { "base/base": true, "base/icons": true } }), kasstor()]
  }
  // i18n: {
  //   // locales: LOCALES,
  //   // defaultLocale: DEFAULT_LOCALE,
  //   routing: {
  //     prefixDefaultLocale: true,
  //     redirectToDefaultLocale: true
  //   }
  // }
});
