import { Config } from "@stencil/core";
import { OutputTarget } from "@stencil/core/internal";
import { reactOutputTarget } from "@stencil/react-output-target";
import { sass } from "@stencil/sass";

import { reactOutputExcludedComponents } from "./src/framework-integrations.ts";

const isTesting = process.env.npm_lifecycle_script?.startsWith("stencil test");
const isShowcaseBuild =
  process.env.npm_lifecycle_event?.startsWith("build.showcase") ||
  process.env.npm_lifecycle_event?.startsWith("start");

const outputTargets: OutputTarget[] = [
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
  },
  reactOutputTarget({
    componentCorePackage: "@genexus/chameleon-controls-library",
    proxiesFile: "dist/react/chameleon-components/index.ts",

    // All Web Components will automatically be registered with the Custom
    // Elements Registry. This can only be used when lazy loading Web
    // Components and will not work when includeImportCustomElements is true.
    includeDefineCustomElements: true,
    loaderDir: "loader",

    excludeComponents: reactOutputExcludedComponents,
    customElementsDir: "dist/components"
  })
];

export const config: Config = {
  namespace: "chameleon",
  outputTargets,
  plugins: [sass()],
  extras: {
    // Enabling this flag will allow downstream projects that consume a Stencil
    // library and use a bundler such as Vite to lazily load the Stencil
    // library's components.
    enableImportInjection: true
  },

  // Don't apply external dependencies when running test, because Stencil won't
  // be able resolve the imports
  rollupPlugins: {
    before:
      // Don't mark lit and open-wc dependencies as external when testing or building the showcase
      isTesting || isShowcaseBuild
        ? []
        : [
            {
              name: "external-deps",
              options(options) {
                return {
                  ...options,
                  external: [/^lit/, /^@lit/, /^@open-wc/]
                };
              }
            }
          ]
  },
  testing: {
    browserArgs: ["--no-sandbox", "--disable-setuid-sandbox"],
    verbose: true,
    browserHeadless: "new",
    testPathIgnorePatterns: [
      "node_modules/",
      "src/testing/constants.e2e.ts",
      "src/testing/form.e2e.ts",
      "src/testing/utils.e2e.ts",
      "dist/",
      "src/components/chat/tests/utils.e2e.ts",
      "src/components/theme/tests/utils.e2e.ts",
      "src/components/tree-view/tests/utils.e2e.ts"
    ]
  },
  bundles: [
    {
      components: ["ch-accordion-render"] // Make sure the ch-accordion-render control is not bundled with other components
    },
    {
      components: ["ch-action-menu", "ch-action-menu-render"]
    },
    {
      components: [
        "ch-action-list-render",
        "ch-action-list-item",
        "ch-action-list-group"
      ] // Make sure the Action List control is not bundled with other components
    },
    {
      components: ["ch-action-group-render"] // Make sure the ch-action-group-render control is not bundled with other components
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
      components: ["ch-test-flexible-layout"]
    },
    {
      components: ["ch-virtual-scroller"] // Make sure the ch-virtual-scroller control is not bundled with other components
    }
  ]
};
