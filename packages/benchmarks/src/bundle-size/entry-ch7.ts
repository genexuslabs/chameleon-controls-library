/**
 * CH7 bundle-size entry point.
 *
 * Directly imports every matched component from source (each self-registers
 * its custom element), then renders them into the DOM.
 *
 * Uses relative source paths since not all components have package.json
 * exports yet. The Vite build with @rollup/plugin-typescript compiles them.
 */

// Direct component imports from source
import "../../../chameleon/src/components/accordion/accordion.lit";
import "../../../chameleon/src/components/action-group/action-group-render.lit";
import "../../../chameleon/src/components/action-list/action-list-render.lit";
import "../../../chameleon/src/components/action-menu/action-menu-render.lit";
import "../../../chameleon/src/components/checkbox/checkbox.lit";
import "../../../chameleon/src/components/combo-box/combo-box.lit";
import "../../../chameleon/src/components/image/image.lit";
import "../../../chameleon/src/components/layout-splitter/layout-splitter.lit";
// import "../../../chameleon/src/components/math-viewer/math-viewer.lit";
import "../../../chameleon/src/components/navigation-list/navigation-list-render.lit";
import "../../../chameleon/src/components/popover/popover.lit";
import "../../../chameleon/src/components/progress/progress.lit";
import "../../../chameleon/src/components/qr/qr.lit";
import "../../../chameleon/src/components/radio-group/radio-group-render.lit";
import "../../../chameleon/src/components/segmented-control/segmented-control-render.lit";
import "../../../chameleon/src/components/sidebar/sidebar.lit";
import "../../../chameleon/src/components/slider/slider.lit";
import "../../../chameleon/src/components/status/status.lit";
import "../../../chameleon/src/components/switch/switch.lit";
import "../../../chameleon/src/components/tab/tab.lit";
import "../../../chameleon/src/components/textblock/textblock.lit";
import "../../../chameleon/src/components/theme/theme.lit";

import { MATCHED_COMPONENTS } from "./components.js";

// Render each component into the DOM
for (const tag of MATCHED_COMPONENTS) {
  document.body.appendChild(document.createElement(tag));
}

// Signal that all imports resolved and elements are in the DOM
declare global {
  interface Window {
    __bundleSizeReady?: boolean;
  }
}
window.__bundleSizeReady = true;
