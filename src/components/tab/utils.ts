import { FlexibleLayoutWidget } from "../flexible-layout/types";
import { TabDirection, TabType } from "./types";

// Classes and parts
export const BUTTON_CLASS = (direction: TabDirection) => `${direction}__button`;
export const IMAGE_CLASS = (direction: TabDirection) => `${direction}__img`;
export const PAGE_CLASS = (direction: TabDirection) => `${direction}__page`;
export const PAGE_CONTAINER_CLASS = (direction: TabDirection) =>
  `${direction}__page-container`;
export const PAGE_NAME_CLASS = (direction: TabDirection) =>
  `${direction}__page-name`;
export const TAB_LIST_CLASS = (direction: TabDirection) =>
  `${direction}__tab-list`;

// Ids
export const CAPTION_ID = (name: string) => `caption-${name}`;
export const PAGE_ID = (name: string) => `page-${name}`;

// Export part functions
export const CLOSE_BUTTON_PART = "close-button";
export const DRAG_PREVIEW = "drag-preview";
export const DRAG_PREVIEW_ELEMENT = "drag-preview-element";
export const DRAG_PREVIEW_OUTSIDE = "drag-preview--outside-tab-list";
export const DRAG_PREVIEW_INSIDE_BLOCK = "drag-preview--inside-tab-list__block";
export const DRAG_PREVIEW_INSIDE_INLINE =
  "drag-preview--inside-tab-list__inline";
export const SELECTED_PART = "selected";

const additionalParts = [
  CLOSE_BUTTON_PART,
  DRAG_PREVIEW,
  DRAG_PREVIEW_ELEMENT,
  DRAG_PREVIEW_OUTSIDE,
  DRAG_PREVIEW_INSIDE_BLOCK,
  DRAG_PREVIEW_INSIDE_INLINE,
  SELECTED_PART
].join(",");

export const TAB_TYPE_PARTS = [
  BUTTON_CLASS,
  IMAGE_CLASS,
  PAGE_CLASS,
  PAGE_CONTAINER_CLASS,
  PAGE_NAME_CLASS,
  TAB_LIST_CLASS
];

const BLOCK_PARTS = TAB_TYPE_PARTS.map(partFunction =>
  partFunction("block")
).join(",");

const INLINE_PARTS = TAB_TYPE_PARTS.map(partFunction =>
  partFunction("inline")
).join(",");

export const INLINE_START_PARTS =
  INLINE_PARTS + ",inlineStart," + additionalParts;

export const MAIN_PARTS = BLOCK_PARTS + ",main," + additionalParts;

export const INLINE_END_PARTS = INLINE_PARTS + ",inlineEnd," + additionalParts;

export const BLOCK_END_PARTS = BLOCK_PARTS + ",blockEnd," + additionalParts;

export const CAPTION_PARTS = (widgets: FlexibleLayoutWidget[]) =>
  widgets.map(item => CAPTION_ID(item.id)).join(",");

export const tabTypeToPart: {
  [key in TabType]: (widgets: FlexibleLayoutWidget[]) => string;
} = {
  inlineStart: widgets => INLINE_START_PARTS + "," + CAPTION_PARTS(widgets),
  main: widgets => MAIN_PARTS + "," + CAPTION_PARTS(widgets),
  inlineEnd: widgets => INLINE_END_PARTS + "," + CAPTION_PARTS(widgets),
  blockEnd: widgets => BLOCK_END_PARTS + "," + CAPTION_PARTS(widgets)
};
