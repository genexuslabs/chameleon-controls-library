import { FlexibleLayoutWidget } from "../flexible-layout/types";
import { TabType } from "./types";

// Classes and parts
export const BUTTON_CLASS = (type: TabType) => `${type}__button`;
export const IMAGE_CLASS = (type: TabType) => `${type}__img`;
export const PAGE_CLASS = (type: TabType) => `${type}__page`;
export const PAGE_CONTAINER_CLASS = (type: TabType) =>
  `${type}__page-container`;
export const PAGE_NAME_CLASS = (type: TabType) => `${type}__page-name`;
export const TAB_LIST_CLASS = (type: TabType) => `${type}__tab-list`;

// Ids
export const CAPTION_ID = (name: string) => `caption-${name}`;
export const PAGE_ID = (name: string) => `page-${name}`;

// Export part functions
export const CLOSE_BUTTON_PART = "close-button";
export const SELECTED_PART = "selected";

const additionalParts = `,${CLOSE_BUTTON_PART},${SELECTED_PART}`;

export const TAB_TYPE_PARTS = [
  BUTTON_CLASS,
  IMAGE_CLASS,
  PAGE_CLASS,
  PAGE_CONTAINER_CLASS,
  PAGE_NAME_CLASS,
  TAB_LIST_CLASS
];

export const INLINE_START_PARTS =
  TAB_TYPE_PARTS.map(partFunction => partFunction("inlineStart")).join(",") +
  additionalParts;

export const MAIN_PARTS =
  TAB_TYPE_PARTS.map(partFunction => partFunction("main")).join(",") +
  additionalParts;

export const INLINE_END_PARTS =
  TAB_TYPE_PARTS.map(partFunction => partFunction("inlineEnd")).join(",") +
  additionalParts;

export const BLOCK_END_PARTS =
  TAB_TYPE_PARTS.map(partFunction => partFunction("blockEnd")).join(",") +
  additionalParts;

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
