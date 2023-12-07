import { FlexibleLayoutGroup } from "./types";

export const flexibleLayoutGroupMap = {
  "inline-start": "inlineStart",
  main: "main",
  "inline-end": "inlineEnd",
  "block-end": "blockEnd"
} as const;

// Classes and parts
export const BUTTON_CLASS = (group: FlexibleLayoutGroup) => `${group}__button`;
export const IMAGE_CLASS = (group: FlexibleLayoutGroup) => `${group}__img`;
export const PAGE_CLASS = (group: FlexibleLayoutGroup) => `${group}__page`;
export const PAGE_CONTAINER_CLASS = (group: FlexibleLayoutGroup) =>
  `${group}__page-container`;
export const PAGE_NAME_CLASS = (group: FlexibleLayoutGroup) =>
  `${group}__page-name`;
export const TAB_LIST_CLASS = (group: FlexibleLayoutGroup) =>
  `${group}__tab-list`;

// Ids
export const CAPTION_ID = (name: string) => `caption-${name}`;
export const PAGE_ID = (name: string) => `page-${name}`;
