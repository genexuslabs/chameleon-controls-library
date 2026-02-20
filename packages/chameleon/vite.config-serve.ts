import { kasstor } from "@genexus/vite-plugin-kasstor";
import { mercury } from "@genexus/vite-plugin-mercury";
import {
  defaultMinifyOptions,
  DefaultOptions,
  minifyHTMLLiterals as minifyLiterals
} from "minify-html-literals";
import pkgMinifyHTML from "rollup-plugin-minify-html-literals";
import summary from "rollup-plugin-summary";
import { defineConfig, PluginOption } from "vite";

// @ts-expect-error wrong type. TODO: This is a WA to use the default exported function
const minifyHTML: typeof pkgMinifyHTML = pkgMinifyHTML.default;

export default defineConfig({
  build: {
    cssMinify: "lightningcss",
    // sourcemap: true,
    emptyOutDir: true
  },

  oxc: {
    target: "es2021"
  },

  plugins: [
    mercury({
      cssPreload: {
        "components/edit": true
      }
    }),

    kasstor({
      hmr: { component: true }
    }),

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
    }),

    // Print bundle summary
    summary({
      // Each bundle
      warnHigh: 120000, // RED >= 120KB
      warnLow: 55000, // GREEN < 55KB,

      // Bundle summary
      totalHigh: 600000, // RED >= 600KB
      totalLow: 250000, // GREEN < 250KB,

      // Different compress methods
      showGzippedSize: true,
      showBrotliSize: true
    })
  ] as PluginOption[]
});

