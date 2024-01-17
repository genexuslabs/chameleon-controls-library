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
        "ch-action-group",
        "ch-action-group-item",
        "ch-action-group-render"
      ]
    },

    {
      components: [
        "ch-dropdown",
        "ch-dropdown-item",
        "ch-dropdown-item-separator"
        // "ch-dropdown-render" TODO: Consider adding the ch-dropdown-render, even if the action-group uses it
      ]
    },
    {
      components: ["ch-flexible-layout", "ch-flexible-layout-render"]
    },
    {
      components: ["ch-layout-splitter"] // Make sure the ch-layout-splitter control is not bundled with other components
    },
    {
      components: ["ch-next-data-modeling", "ch-next-data-modeling-item"]
    },
    {
      components: ["ch-tab"] // Make sure the ch-tab control is not bundled with other components
    },
    {
      components: ["ch-tree-view", "ch-tree-view-item", "ch-tree-view-render"]
    }
  ]
};
