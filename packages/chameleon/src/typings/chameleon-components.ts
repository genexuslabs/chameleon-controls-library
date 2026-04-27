import type { FilterKeys } from "./types";

// Filter custom elements that start with "ch-"
export type ChameleonControlsTagName = FilterKeys<HTMLElementTagNameMap, `ch-${string}`>;

export type ChameleonPublicControlsTagName = Exclude<
  ChameleonControlsTagName,
  | "ch-action-list-group"
  | "ch-action-list-item"
  | "ch-action-menu"
  | "ch-component-render"
  | "ch-navigation-list-item"
  | "ch-performance-scan-item"
  | "ch-segmented-control-item"
  | "ch-tabular-grid-column"
  | "ch-breadcrumb-render"
  | "ch-breadcrumb-item"
>;

export type ChameleonControls = {
  [key in ChameleonControlsTagName]: HTMLElementTagNameMap[key];
};

export type ChameleonPublicControls = {
  [key in ChameleonPublicControlsTagName]: HTMLElementTagNameMap[key];
};
