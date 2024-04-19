import {
  FlexibleLayoutLeafTabDirection,
  FlexibleLayoutLeafTabPosition,
  FlexibleLayoutWidget
} from "../flexible-layout/internal/flexible-layout/types";

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

export const INLINE_START_PARTS = PARTS + ",inline,inline:start";
export const INLINE_END_PARTS = PARTS + ",inline,inline:end";

export const BLOCK_START_PARTS = PARTS + ",block,block:start";
export const BLOCK_END_PARTS = PARTS + ",block,block:end";

export const CAPTION_PARTS = (widgets: FlexibleLayoutWidget[]) =>
  widgets.map(item => CAPTION_ID(item.id)).join(",");

export const tabTypeToPart: {
  [key in `${FlexibleLayoutLeafTabDirection}-${FlexibleLayoutLeafTabPosition}`]: (
    widgets: FlexibleLayoutWidget[]
  ) => string;
} = {
  "inline-start": widgets => INLINE_START_PARTS + "," + CAPTION_PARTS(widgets),
  "inline-end": widgets => INLINE_END_PARTS + "," + CAPTION_PARTS(widgets),
  "block-start": widgets => BLOCK_START_PARTS + "," + CAPTION_PARTS(widgets),
  "block-end": widgets => BLOCK_END_PARTS + "," + CAPTION_PARTS(widgets)
} as const;
