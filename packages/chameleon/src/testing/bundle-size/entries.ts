/**
 * Every entry that must be measured for bundle size.
 *
 * `path` is relative to the package root and points to the TypeScript source.
 * `outputName` is the flat filename produced in `dist/minified/browser/`.
 *
 * Entries are grouped by category so the test output is easy to scan.
 */

export const MINIFIED_OUTPUT_DIR = "dist/minified/browser";

// - - - - - - - - - - - - - - - - - - - -
//             Components
// - - - - - - - - - - - - - - - - - - - -
export const COMPONENT_ENTRIES = [
  {
    outputName: "accordion.lit.js",
    path: "src/components/accordion/accordion.lit.ts"
  },
  {
    outputName: "action-group-render.lit.js",
    path: "src/components/action-group/action-group-render.lit.ts"
  },
  {
    outputName: "action-list-render.lit.js",
    path: "src/components/action-list/action-list-render.lit.ts"
  },
  {
    outputName: "action-menu-render.lit.js",
    path: "src/components/action-menu/action-menu-render.lit.ts"
  },
  {
    outputName: "breadcrumb-render.lit.js",
    path: "src/components/breadcrumb/breadcrumb-render.lit.ts"
  },
  {
    outputName: "checkbox.lit.js",
    path: "src/components/checkbox/checkbox.lit.ts"
  },
  {
    outputName: "code.lit.js",
    path: "src/components/code/code.lit.ts"
  },
  {
    outputName: "combo-box.lit.js",
    path: "src/components/combo-box/combo-box.lit.ts"
  },
  {
    outputName: "image.lit.js",
    path: "src/components/image/image.lit.ts"
  },
  {
    outputName: "json-render.lit.js",
    path: "src/components/json-render/json-render.lit.ts"
  },
  {
    outputName: "layout-splitter.lit.js",
    path: "src/components/layout-splitter/layout-splitter.lit.ts"
  },
  {
    outputName: "math-viewer.lit.js",
    path: "src/components/math-viewer/math-viewer.lit.ts"
  },
  {
    outputName: "navigation-list-render.lit.js",
    path: "src/components/navigation-list/navigation-list-render.lit.ts"
  },
  {
    outputName: "popover.lit.js",
    path: "src/components/popover/popover.lit.ts"
  },
  {
    outputName: "progress.lit.js",
    path: "src/components/progress/progress.lit.ts"
  },
  {
    outputName: "qr.lit.js",
    path: "src/components/qr/qr.lit.ts"
  },
  {
    outputName: "radio-group-render.lit.js",
    path: "src/components/radio-group/radio-group-render.lit.ts"
  },
  {
    outputName: "router.lit.js",
    path: "src/components/router/router.lit.ts"
  },
  {
    outputName: "segmented-control-render.lit.js",
    path: "src/components/segmented-control/segmented-control-render.lit.ts"
  },
  {
    outputName: "sidebar.lit.js",
    path: "src/components/sidebar/sidebar.lit.ts"
  },
  {
    outputName: "slider.lit.js",
    path: "src/components/slider/slider.lit.ts"
  },
  {
    outputName: "status.lit.js",
    path: "src/components/status/status.lit.ts"
  },
  {
    outputName: "switch.lit.js",
    path: "src/components/switch/switch.lit.ts"
  },
  {
    outputName: "tab.lit.js",
    path: "src/components/tab/tab.lit.ts"
  },
  {
    outputName: "textblock.lit.js",
    path: "src/components/textblock/textblock.lit.ts"
  },
  {
    outputName: "theme.lit.js",
    path: "src/components/theme/theme.lit.ts"
  }
] as const;

// - - - - - - - - - - - - - - - - - - - -
//             Utilities
// - - - - - - - - - - - - - - - - - - - -
export const UTILITY_ENTRIES = [
  {
    outputName: "define-custom-elements.js",
    path: "src/utilities/bootstrap/define-custom-elements.ts"
  },
  {
    outputName: "web-components-path.js",
    path: "src/utilities/bootstrap/web-components-path.ts"
  },
  {
    outputName: "host.js",
    path: "src/utilities/host/host.ts"
  },
  {
    outputName: "image-path-registry.js",
    path: "src/utilities/register-properties/image-path-registry.ts"
  }
] as const;

export const MINIFIED_ENTRIES = [
  ...COMPONENT_ENTRIES,
  ...UTILITY_ENTRIES
] as const satisfies readonly { path: string; outputName: string }[];

export type EntryOutputName = (typeof MINIFIED_ENTRIES)[number]["outputName"];
