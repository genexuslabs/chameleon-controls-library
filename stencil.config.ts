import { Config } from "@stencil/core";
import { sass } from "@stencil/sass";

export const config: Config = {
  namespace: "chameleon",
  outputTargets: [
    {
      type: "dist",
      esmLoaderPath: "../loader",
      copy: [{ src: "common/monaco/output/assets", dest: "assets" }]
    },
    {
      type: "docs-readme"
    },
    {
      type: "www",
      serviceWorker: null,
      copy: [
        { src: "common/monaco/output/assets", dest: "assets" },
        { src: "showcase" }
      ]
    }
  ],
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
      components: ["ch-code"] // Make sure the ch-code control is not bundled with other components
    },
    {
      components: ["ch-combo-box-render"] // Make sure the ch-combo-box-render control is not bundled with other components
    },
    {
      components: ["ch-dialog"] // Make sure the ch-dialog control is not bundled with other components
    },
    {
      components: ["ch-markdown"] // Make sure the ch-markdown control is not bundled with other components
    },
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
      components: ["ch-tab-render"] // Make sure the ch-tab-render control is not bundled with other components
    },
    {
      components: ["ch-next-data-modeling", "ch-next-data-modeling-item"]
    },
    {
      components: ["ch-segmented-control-item", "ch-segmented-control-render"]
    },
    {
      components: ["ch-popover"] // Make sure the ch-popover control is not bundled with other components
    },
    {
      components: ["ch-qr"] // Make sure the ch-qr control is not bundled with other components
    },
    {
      components: ["ch-showcase"] // Make sure the ch-showcase control is not bundled with other components
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
