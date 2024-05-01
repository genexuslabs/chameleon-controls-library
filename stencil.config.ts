import { Config } from "@stencil/core";
import { sass } from "@stencil/sass";

export const config: Config = {
  namespace: "chameleon",
  outputTargets: [
    {
      type: "dist",
      esmLoaderPath: "../loader",
      copy: [
        { src: "components/code-editor/monaco/output/assets", dest: "assets" }
      ]
    },
    {
      type: "docs-readme"
    },
    {
      type: "www",
      serviceWorker: null,
      copy: [
        { src: "components/code-editor/monaco/output/assets", dest: "assets" },
        { src: "showcase" }
      ]
    }
  ],
  globalStyle: "src/globals/global.scss",
  plugins: [sass()],
  bundles: [
    {
      components: [
        "ch-action-group",
        "ch-action-group-item",
        "ch-action-group-render"
      ]
    },

    { components: ["ch-markdown"] }, // Make sure the ch-markdown control is not bundled with other components

    {
      components: [
        "ch-dropdown"
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
      components: ["ch-list"] // Make sure the ch-list control is not bundled with other components
    },
    {
      components: ["ch-next-data-modeling", "ch-next-data-modeling-item"]
    },
    {
      components: ["ch-popover"] // Make sure the ch-popover control is not bundled with other components
    },
    {
      components: [
        "ch-tree-view",
        "ch-tree-view-drop",
        "ch-tree-view-item",
        "ch-tree-view-render"
      ]
    }
  ]
};
