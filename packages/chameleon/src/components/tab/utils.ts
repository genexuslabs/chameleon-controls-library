import { TabListPosition } from "./types";

// Ids
export const PANEL_ID = (name: string) => `panel-${name}`;

export const isBlockDirection = (direction: TabListPosition) =>
  direction === "block-start" || direction === "block-end";

export const isStartDirection = (direction: TabListPosition) =>
  direction === "block-start" || direction === "inline-start";

export const DEFAULT_TAB_LIST_POSITION = "block-start";

// Export part functions
export const DRAG_PREVIEW = "drag-preview";
export const DRAG_PREVIEW_OUTSIDE = "drag-preview--outside-tab-list";
export const DRAG_PREVIEW_INSIDE_BLOCK = "drag-preview--inside-tab-list__block";
export const DRAG_PREVIEW_INSIDE_INLINE =
  "drag-preview--inside-tab-list__inline";
