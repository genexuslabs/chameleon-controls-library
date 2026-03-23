/**
 * Component tag names present in BOTH Chameleon 6 and Chameleon 7.
 *
 * Used by the bundle-size comparison to ensure a fair measurement: both
 * apps render the exact same set of components.
 *
 * Derived from COMPONENT_ENTRIES in
 * packages/chameleon/src/testing/bundle-size/entries.ts, excluding:
 *   - breadcrumb-render  (v7-only, new component)
 *   - json-render        (v7-only, new component)
 *   - router             (v7 internal utility, not a UI component)
 *
 * The v7 tag name is listed. For v6, Stencil registers the same tag via
 * its component metadata. The mapping between v7 output filenames and
 * tag names:
 *   accordion.lit.js → ch-accordion-render
 *   combo-box.lit.js → ch-combo-box-render
 *   tab.lit.js       → ch-tab-render
 *   (all others)     → ch-<basename without .lit.js>
 */
export const MATCHED_COMPONENTS = [
  "ch-accordion-render",
  "ch-action-group-render",
  "ch-action-list-render",
  "ch-action-menu-render",
  "ch-checkbox",
  "ch-combo-box-render",
  "ch-image",
  "ch-layout-splitter",
  // "ch-math-viewer",
  "ch-navigation-list-render",
  "ch-popover",
  "ch-progress",
  "ch-qr",
  "ch-radio-group-render",
  "ch-segmented-control-render",
  "ch-sidebar",
  "ch-slider",
  "ch-status",
  "ch-switch",
  "ch-tab-render",
  "ch-textblock",
  "ch-theme"
] as const;

/**
 * Maps each matched component tag to the CH7 import path.
 *
 * The import path is the subpath export from the CH7 npm package
 * (@genexus/chameleon-controls-library-lit).
 */
export const CH7_IMPORTS: Record<string, string> = {
  "ch-accordion-render": "accordion",
  "ch-action-group-render": "action-group-render",
  "ch-action-list-render": "action-list-render",
  "ch-action-menu-render": "action-menu-render",
  "ch-checkbox": "checkbox",
  "ch-combo-box-render": "combo-box",
  "ch-image": "image",
  "ch-layout-splitter": "layout-splitter",
  // "ch-math-viewer": "math-viewer",
  "ch-navigation-list-render": "navigation-list-render",
  "ch-popover": "popover",
  "ch-progress": "progress",
  "ch-qr": "qr",
  "ch-radio-group-render": "radio-group-render",
  "ch-segmented-control-render": "segmented-control-render",
  "ch-sidebar": "sidebar",
  "ch-slider": "slider",
  "ch-status": "status",
  "ch-switch": "switch",
  "ch-tab-render": "tab",
  "ch-textblock": "textblock",
  "ch-theme": "theme"
};
