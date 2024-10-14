import type { ChameleonControlsTagName } from "./common/types";

// This object must include all Chameleon's components.
const chameleonComponents: {
  [key in
    | ChameleonControlsTagName
    | ("gx-grid-chameleon" | "gx-grid-chameleon-column-filter")]: 0;
} = {
  "ch-accordion": 0,
  "ch-accordion-render": 0,
  "ch-action-group": 0,
  "ch-action-group-render": 0,
  "ch-action-group-item": 0,
  "ch-action-list-group": 0,
  "ch-action-list-item": 0,
  "ch-action-list-render": 0,
  "ch-alert": 0,
  "ch-barcode-scanner": 0,
  "ch-chat": 0,
  "ch-checkbox": 0,
  "ch-code": 0,
  "ch-code-diff-editor": 0,
  "ch-code-editor": 0,
  "ch-combo-box-render": 0,
  "ch-dialog": 0,
  "ch-dropdown": 0,
  "ch-dropdown-render": 0,
  "ch-edit": 0,
  "ch-file-picker": 0,
  "ch-flexible-layout": 0,
  "ch-flexible-layout-render": 0,
  "ch-form-checkbox": 0,
  "ch-grid": 0,
  "ch-grid-action-refresh": 0,
  "ch-grid-action-settings": 0,
  "ch-grid-actionbar": 0,
  "ch-grid-column": 0,
  "ch-grid-column-display": 0,
  "ch-grid-column-resize": 0,
  "ch-grid-column-settings": 0,
  "ch-grid-columnset": 0,
  "ch-grid-infinite-scroll": 0,
  "ch-grid-row-actions": 0,
  "ch-grid-rowset-empty": 0,
  "ch-grid-rowset-legend": 0,
  "ch-grid-settings": 0,
  "ch-grid-settings-columns": 0,
  "ch-grid-virtual-scroller": 0,
  "ch-icon": 0,
  "ch-image": 0,
  "ch-infinite-scroll": 0,
  "ch-intersection-observer": 0,
  "ch-layout-splitter": 0,
  "ch-markdown": 0,
  "ch-markdown-viewer": 0,
  "ch-navigation-list-item": 0,
  "ch-navigation-list-render": 0,
  "ch-next-data-modeling": 0,
  "ch-next-data-modeling-item": 0,
  "ch-next-data-modeling-render": 0,
  "ch-next-progress-bar": 0,
  "ch-notifications": 0,
  "ch-notifications-item": 0,
  "ch-paginator": 0,
  "ch-paginator-navigate": 0,
  "ch-paginator-pages": 0,
  "ch-popover": 0,
  "ch-qr": 0,
  "ch-radio-group-render": 0,
  "ch-segmented-control-item": 0,
  "ch-segmented-control-render": 0,
  "ch-select": 0,
  "ch-select-option": 0,
  "ch-shortcuts": 0,
  "ch-showcase": 0,
  "ch-sidebar": 0,
  "ch-sidebar-menu": 0,
  "ch-sidebar-menu-list": 0,
  "ch-sidebar-menu-list-item": 0,
  "ch-slider": 0,
  "ch-smart-grid": 0,
  "ch-smart-grid-cell": 0,
  "ch-step-list": 0,
  "ch-step-list-item": 0,
  "ch-style": 0,
  "ch-suggest": 0,
  "ch-suggest-list": 0,
  "ch-suggest-list-item": 0,
  "ch-switch": 0,
  "ch-tab-render": 0,
  "ch-tabular-grid": 0,
  "ch-tabular-grid-action-refresh": 0,
  "ch-tabular-grid-action-settings": 0,
  "ch-tabular-grid-actionbar": 0,
  "ch-tabular-grid-column": 0,
  "ch-tabular-grid-column-display": 0,
  "ch-tabular-grid-column-resize": 0,
  "ch-tabular-grid-column-settings": 0,
  "ch-tabular-grid-columnset": 0,
  "ch-tabular-grid-infinite-scroll": 0,
  "ch-tabular-grid-render": 0,
  "ch-tabular-grid-row-actions": 0,
  "ch-tabular-grid-rowset-empty": 0,
  "ch-tabular-grid-rowset-legend": 0,
  "ch-tabular-grid-settings": 0,
  "ch-tabular-grid-settings-columns": 0,
  "ch-tabular-grid-virtual-scroller": 0,
  "ch-test-flexible-layout": 0,
  "ch-test-suggest": 0,
  "ch-textblock": 0,
  "ch-theme": 0,
  "ch-timer": 0,
  "ch-tooltip": 0,
  "ch-tree": 0,
  "ch-tree-item": 0,
  "ch-tree-view": 0,
  "ch-tree-view-drop": 0,
  "ch-tree-view-item": 0,
  "ch-tree-view-render": 0,
  "ch-virtual-scroller": 0,
  "ch-window": 0,
  "ch-window-close": 0,

  "gx-grid-chameleon": 0,
  "gx-grid-chameleon-column-filter": 0
};

/**
 * Components to make a React wrapper for.
 */
const reactOutputComponentWrappers: Set<any> = new Set([
  "ch-accordion-render",
  // "ch-action-group-render",

  // There is no need to include components that the custom elements renders
  "ch-action-list-render",
  // "ch-alert",
  "ch-barcode-scanner",
  "ch-chat",
  "ch-checkbox",
  "ch-code",
  "ch-code-diff-editor",
  "ch-code-editor",
  "ch-combo-box-render",
  "ch-dialog",
  // "ch-dropdown-render",
  "ch-edit",
  "ch-flexible-layout-render",
  "ch-image",
  "ch-intersection-observer",
  "ch-layout-splitter",
  "ch-markdown-viewer",
  "ch-navigation-list-render",
  // "ch-notifications",
  // "ch-notifications-item",
  "ch-paginator",
  "ch-paginator-navigate",
  "ch-paginator-pages",
  "ch-popover",
  "ch-qr",
  "ch-radio-group-render",
  "ch-segmented-control-render",
  // "ch-shortcuts",
  "ch-sidebar",
  "ch-slider",
  // "ch-smart-grid",
  // "ch-smart-grid-cell",
  "ch-switch",
  "ch-tab-render",
  "ch-tabular-grid",
  "ch-tabular-grid-action-refresh",
  "ch-tabular-grid-action-settings",
  "ch-tabular-grid-actionbar",
  "ch-tabular-grid-column",
  "ch-tabular-grid-column-display",
  "ch-tabular-grid-column-resize",
  "ch-tabular-grid-column-settings",
  "ch-tabular-grid-columnset",
  "ch-tabular-grid-infinite-scroll",
  "ch-tabular-grid-row-actions",
  "ch-tabular-grid-rowset-empty",
  "ch-tabular-grid-rowset-legend",
  "ch-tabular-grid-settings",
  "ch-tabular-grid-settings-columns",
  "ch-tabular-grid-virtual-scroller",
  "ch-textblock",
  "ch-theme",
  // "ch-timer",
  "ch-tooltip",
  "ch-tree-view-render"
] satisfies ChameleonControlsTagName[]);

export const reactOutputExcludedComponents = Object.keys(
  chameleonComponents
).filter(
  chameleonComponent =>
    !reactOutputComponentWrappers.has(chameleonComponent as any)
);

export const allChameleonComponents = Object.keys(chameleonComponents);
