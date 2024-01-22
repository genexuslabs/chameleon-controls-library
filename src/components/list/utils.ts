import { FlexibleLayoutWidget } from "../flexible-layout/types";
import { ListType } from "./types";

// Classes and parts
export const BUTTON_CLASS = "button";
export const IMAGE_CLASS = "img";
export const PAGE_CLASS = "page";
export const PAGE_CONTAINER_CLASS = "page-container";
export const PAGE_NAME_CLASS = "page-name";
export const TAB_LIST_CLASS = "tab-list";

export const LIST_CLASSES = {
  BUTTON: BUTTON_CLASS,
  IMAGE: IMAGE_CLASS,
  PAGE: PAGE_CLASS,
  PAGE_CONTAINER: PAGE_CONTAINER_CLASS,
  PAGE_NAME: PAGE_NAME_CLASS,
  TAB_LIST: TAB_LIST_CLASS
};

export const LIST_PART_BLOCK = {
  BUTTON: BUTTON_CLASS + " block",
  IMAGE: IMAGE_CLASS + " block",
  PAGE: PAGE_CLASS + " block",
  PAGE_CONTAINER: PAGE_CONTAINER_CLASS + " block",
  PAGE_NAME: PAGE_NAME_CLASS + " block",
  TAB_LIST: TAB_LIST_CLASS + " block"
};

export const LIST_PART_INLINE = {
  BUTTON: BUTTON_CLASS + " inline",
  IMAGE: IMAGE_CLASS + " inline",
  PAGE: PAGE_CLASS + " inline",
  PAGE_CONTAINER: PAGE_CONTAINER_CLASS + " inline",
  PAGE_NAME: PAGE_NAME_CLASS + " inline",
  TAB_LIST: TAB_LIST_CLASS + " inline"
};

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

const partsArray = [
  ...Object.values(LIST_CLASSES),
  CLOSE_BUTTON_PART,
  DRAG_PREVIEW,
  DRAG_PREVIEW_ELEMENT,
  DRAG_PREVIEW_OUTSIDE,
  DRAG_PREVIEW_INSIDE_BLOCK,
  DRAG_PREVIEW_INSIDE_INLINE,
  SELECTED_PART
];

const PARTS = partsArray.join(",");

export const INLINE_START_PARTS = PARTS + ",inline,inline:inlineStart";

export const MAIN_PARTS = PARTS + ",block,block:main";

export const INLINE_END_PARTS = PARTS + ",inline,inline:inlineEnd";

export const BLOCK_END_PARTS = PARTS + ",block,block:blockEnd";

export const CAPTION_PARTS = (widgets: FlexibleLayoutWidget[]) =>
  widgets.map(item => CAPTION_ID(item.id)).join(",");

export const tabTypeToPart: {
  [key in ListType]: (widgets: FlexibleLayoutWidget[]) => string;
} = {
  inlineStart: widgets => INLINE_START_PARTS + "," + CAPTION_PARTS(widgets),
  main: widgets => MAIN_PARTS + "," + CAPTION_PARTS(widgets),
  inlineEnd: widgets => INLINE_END_PARTS + "," + CAPTION_PARTS(widgets),
  blockEnd: widgets => BLOCK_END_PARTS + "," + CAPTION_PARTS(widgets)
};
