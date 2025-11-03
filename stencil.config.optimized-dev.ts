import { Config } from "@stencil/core";
import { sass } from "@stencil/sass";
import { dependencies, peerDependencies } from "./package.json";
import { config as defaultConfig } from "./stencil.config.ts";

const argv = process.argv;

export const config: Config = {
  namespace: defaultConfig.namespace,
  outputTargets: [
    {
      type: "dist",
      esmLoaderPath: "../loader",

      // Don't generate the dist/collection output to save build time.
      collectionDir: null,

      polyfills: false
    }
  ],
  plugins: [sass()],
  testing: defaultConfig.testing,
  // bundles: defaultConfig.bundles?.filter(
  //   bundle => bundle.components[0] !== "ch-markdown"
  // ),
  tsconfig: "tsconfig-optimized-dev.json",

  extras: {
    // Enabling this flag will allow downstream projects that consume a Stencil
    // library and use a bundler such as Vite to lazily load the Stencil
    // library's components.
    enableImportInjection: true
  },

  watchIgnoredRegex: [
    /vite\.config\.ts$/,
    /vite-dev\.config\.ts$/,
    /index\.html$/,
    /package\.json$/,
    /start-dev-server\.js$/,
    /node_modules/,
    /src\/deprecated-globals/,
    /src\/deprecated-components/,
    /dist/
  ],

  sourceMap: false,
  // excludeUnusedDependencies: true,

  // Include dev mode speed, but without removing the dist output
  devMode: true,
  buildDist: true,

  minifyJs: false,
  minifyCss: false,

  rollupPlugins: {
    before: [
      // Don't bundle any direct dependency or peer dependency
      {
        name: "external-deps",
        options(options: any) {
          return {
            ...options,
            external: [
              /^lit/,
              /^@lit/,
              ...Object.keys(dependencies).slice(1),
              ...Object.keys(peerDependencies)
            ]
          };
        }
      }
    ]
  }
};
