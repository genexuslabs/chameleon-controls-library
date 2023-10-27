import { Config } from "@stencil/core";
import { sass } from "@stencil/sass";

export const config: Config = {
  namespace: "chameleon",
  outputTargets: [
    {
      type: "dist",
      esmLoaderPath: "../loader"
    },
    {
      type: "dist-custom-elements-bundle"
    },
    {
      type: "docs-readme"
    },
    {
      type: "www",
      serviceWorker: null,
      copy: [{ src: "pages" }]
    }
  ],
  globalStyle: "src/globals/globals.scss",
  plugins: [sass()],
  bundles: [
    {
      components: [
        "ch-dropdown",
        "ch-dropdown-item",
        "ch-dropdown-item-separator"
      ]
    },
    {
      components: ["ch-next-data-modeling", "ch-next-data-modeling-item"]
    },
    {
      components: ["ch-tree-view", "ch-tree-view-item"]
    }
  ]
};
