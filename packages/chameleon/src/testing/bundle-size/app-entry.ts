/**
 * App entry point that dynamically imports every Chameleon component and
 * utility. This simulates a real consumer application — Rollup/Vite resolves
 * all dependencies, deduplicates shared code into shared chunks, and produces
 * a navigable output with realistic chunk sizes.
 *
 * Each `import()` creates a separate async chunk for that component.
 */

// - - - - - - - - - - Components - - - - - - - - - -
const components = {
  accordion: () => import("../../components/accordion/accordion.lit"),
  "action-group-render": () => import("../../components/action-group/action-group-render.lit"),
  "action-list-render": () => import("../../components/action-list/action-list-render.lit"),
  "action-menu-render": () => import("../../components/action-menu/action-menu-render.lit"),
  "breadcrumb-render": () => import("../../components/breadcrumb/breadcrumb-render.lit"),
  checkbox: () => import("../../components/checkbox/checkbox.lit"),
  // code: () => import("../../components/code/code.lit"),
  "combo-box": () => import("../../components/combo-box/combo-box.lit"),
  image: () => import("../../components/image/image.lit"),
  "json-render": () => import("../../components/json-render/json-render.lit"),
  "layout-splitter": () => import("../../components/layout-splitter/layout-splitter.lit"),
  "math-viewer": () => import("../../components/math-viewer/math-viewer.lit"),
  "navigation-list-render": () =>
    import("../../components/navigation-list/navigation-list-render.lit"),
  popover: () => import("../../components/popover/popover.lit"),
  progress: () => import("../../components/progress/progress.lit"),
  qr: () => import("../../components/qr/qr.lit"),
  "radio-group-render": () => import("../../components/radio-group/radio-group-render.lit"),
  router: () => import("../../components/router/router.lit"),
  "segmented-control-render": () =>
    import("../../components/segmented-control/segmented-control-render.lit"),
  sidebar: () => import("../../components/sidebar/sidebar.lit"),
  slider: () => import("../../components/slider/slider.lit"),
  status: () => import("../../components/status/status.lit"),
  switch: () => import("../../components/switch/switch.lit"),
  tab: () => import("../../components/tab/tab.lit"),
  textblock: () => import("../../components/textblock/textblock.lit"),
  theme: () => import("../../components/theme/theme.lit")
};

// - - - - - - - - - - Utilities - - - - - - - - - -
const utilities = {
  host: () => import("../../utilities/host/host"),
  "image-path-registry": () => import("../../utilities/register-properties/image-path-registry")
};

// Load everything
Promise.all([
  ...Object.values(components).map(load => load()),
  ...Object.values(utilities).map(load => load())
]);

