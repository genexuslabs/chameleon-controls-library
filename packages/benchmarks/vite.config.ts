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

// @ts-expect-error wrong type. TODO: This is a WA to use the default exported function
const minifyHTML: typeof pkgMinifyHTML = pkgMinifyHTML.default;

export default defineConfig(
  ({ mode }) =>
    ({
      esbuild: {
        drop: [],
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

        rollupOptions: {
          input: [
            resolve(
              __dirname,
              mode === "chameleon-7"
                ? "./index-chameleon-7.html"
                : "./index-chameleon-6.html"
            )
          ]
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

        // We must not empty the outDir, otherwise watch mode won't work at all,
        // because types are not regenerated
        emptyOutDir: true,
        outDir:
          mode === "chameleon-7" ? "dist-chameleon-7" : "dist-chameleon-6",
        target: "ES2022",
        assetsInlineLimit: 0
      },

      plugins: [
        typescript({
          tsconfig: "./tsconfig.json",
          outDir:
            mode === "chameleon-7" ? "dist-chameleon-7" : "dist-chameleon-6"
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
        })
      ]
    }) as UserConfig
);
