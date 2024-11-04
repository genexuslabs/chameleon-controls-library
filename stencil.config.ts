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
    // dist-custom-elements output target is required for the React output target.
    // It generates the dist/components folder
    { type: "dist-custom-elements" },
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
  extras: {
    // Enabling this flag will allow downstream projects that consume a Stencil
    // library and use a bundler such as Vite to lazily load the Stencil
    // library's components.
    enableImportInjection: true
  },
  testing: {
    browserArgs: ["--no-sandbox", "--disable-setuid-sandbox"],
    verbose: true,
    browserHeadless: "new",
    testPathIgnorePatterns: [
      "node_modules/",
      "src/testing/",
      "dist/",
      "src/components/tree-view/tests/utils.e2e.ts"
    ]
  },
  bundles: [
    {
      components: ["ch-accordion-render"] // Make sure the ch-accordion-render control is not bundled with other components
    },
    {
      components: [
        "ch-action-group",
        "ch-action-group-item",
        "ch-action-group-render"
      ]
    },
    {
      components: ["ch-code", "ch-markdown-viewer"] // Make sure the ch-code and ch-markdown-viewer control are not bundled with other components
    },
    {
      components: ["ch-combo-box-render"] // Make sure the ch-combo-box-render control is not bundled with other components
    },
    {
      components: ["ch-dialog"] // Make sure the ch-dialog control is not bundled with other components
    },
    {
      components: ["ch-edit"] // Make sure the ch-edit control is not bundled with other components
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
      components: ["ch-navigation-list-render", "ch-navigation-list-item"]
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
      components: ["ch-smart-grid", "ch-smart-grid-cell", "ch-infinite-scroll"]
    },
    {
      components: ["ch-textblock"] // Make sure the ch-textblock control is not bundled with other components
    },
    {
      components: [
        "ch-tree-view",
        "ch-tree-view-drop",
        "ch-tree-view-item",
        "ch-tree-view-render"
      ]
    },
    {
      components: ["ch-virtual-scroller"] // Make sure the ch-virtual-scroller control is not bundled with other components
    }
  ]
};
