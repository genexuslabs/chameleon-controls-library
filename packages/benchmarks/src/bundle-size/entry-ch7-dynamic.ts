/**
 * CH7 bundle-size entry point — dynamic imports variant.
 *
 * Uses dynamic import() for each matched component, simulating a real
 * lazy-loading app. Vite code-splits each component into its own chunk
 * with shared dependencies deduplicated.
 */

import { MATCHED_COMPONENTS } from "./components.js";

// Dynamic imports — Vite creates separate chunks for each
const loaders: Record<string, () => Promise<unknown>> = {
  "ch-accordion-render": () =>
    import("../../../chameleon/src/components/accordion/accordion.lit"),
  "ch-action-group-render": () =>
    import(
      "../../../chameleon/src/components/action-group/action-group-render.lit"
    ),
  "ch-action-list-render": () =>
    import(
      "../../../chameleon/src/components/action-list/action-list-render.lit"
    ),
  "ch-action-menu-render": () =>
    import(
      "../../../chameleon/src/components/action-menu/action-menu-render.lit"
    ),
  "ch-checkbox": () =>
    import("../../../chameleon/src/components/checkbox/checkbox.lit"),
  "ch-combo-box-render": () =>
    import("../../../chameleon/src/components/combo-box/combo-box.lit"),
  "ch-image": () =>
    import("../../../chameleon/src/components/image/image.lit"),
  "ch-layout-splitter": () =>
    import(
      "../../../chameleon/src/components/layout-splitter/layout-splitter.lit"
    ),
  "ch-navigation-list-render": () =>
    import(
      "../../../chameleon/src/components/navigation-list/navigation-list-render.lit"
    ),
  "ch-popover": () =>
    import("../../../chameleon/src/components/popover/popover.lit"),
  "ch-progress": () =>
    import("../../../chameleon/src/components/progress/progress.lit"),
  "ch-qr": () => import("../../../chameleon/src/components/qr/qr.lit"),
  "ch-radio-group-render": () =>
    import(
      "../../../chameleon/src/components/radio-group/radio-group-render.lit"
    ),
  "ch-segmented-control-render": () =>
    import(
      "../../../chameleon/src/components/segmented-control/segmented-control-render.lit"
    ),
  "ch-sidebar": () =>
    import("../../../chameleon/src/components/sidebar/sidebar.lit"),
  "ch-slider": () =>
    import("../../../chameleon/src/components/slider/slider.lit"),
  "ch-status": () =>
    import("../../../chameleon/src/components/status/status.lit"),
  "ch-switch": () =>
    import("../../../chameleon/src/components/switch/switch.lit"),
  "ch-tab-render": () =>
    import("../../../chameleon/src/components/tab/tab.lit"),
  "ch-textblock": () =>
    import("../../../chameleon/src/components/textblock/textblock.lit"),
  "ch-theme": () =>
    import("../../../chameleon/src/components/theme/theme.lit")
};

// Load all matched components in parallel
await Promise.all(
  MATCHED_COMPONENTS.map(tag => {
    const loader = loaders[tag];
    return loader?.();
  })
);

// Render each component into the DOM
for (const tag of MATCHED_COMPONENTS) {
  document.body.appendChild(document.createElement(tag));
}

declare global {
  interface Window {
    __bundleSizeReady?: boolean;
  }
}
window.__bundleSizeReady = true;
