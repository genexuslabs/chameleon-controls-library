import type { FilterKeys } from "./types";

// Filter custom elements that start with "ch-"
export type ChameleonControlsTagName = FilterKeys<
  HTMLElementTagNameMap,
  `ch-${string}`
>;

export type ChameleonPublicControlsTagName = Exclude<
  ChameleonControlsTagName,
  | "ch-component-render"
  | "ch-navigation-list-item"
  | "ch-performance-scan-item"
  | "ch-segmented-control-item"
  | "ch-tabular-grid-column"
>;

export type ChameleonControls = {
  [key in ChameleonControlsTagName]: HTMLElementTagNameMap[key];
};

export type ChameleonPublicControls = {
  [key in ChameleonPublicControlsTagName]: HTMLElementTagNameMap[key];
};

export type ChameleonImagePathCallbackControlsTagName = Extract<
  ChameleonControlsTagName,
  | "ch-accordion-render"
  | "ch-action-list-render"
  | "ch-action-menu-render"
  | "ch-checkbox"
  | "ch-combo-box-render"
  | "ch-edit"
  | "ch-image"
  | "ch-navigation-list-render"
  | "ch-tab-render"
  | "ch-tree-view-render"
>;

export type ChameleonImagePathCallbackControls = {
  [key in ChameleonImagePathCallbackControlsTagName]: ChameleonControls[key];
};

