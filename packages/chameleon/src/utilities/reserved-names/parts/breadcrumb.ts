import { joinParts } from "../join-parts";

export const BREADCRUMB_ITEM_PARTS_DICTIONARY = {
  ACTION: "item__action",
  BUTTON: "item__button",
  CAPTION: "item__caption",
  LINK: "item__link",

  INDICATOR: "indicator",

  // - - - - - - - - States - - - - - - - -
  DISABLED: "disabled", // ACTION, CAPTION, GROUP, INDICATOR

  SELECTED: "selected", // CAPTION, GROUP, LINK
  NOT_SELECTED: "not-selected" // CAPTION, GROUP, LINK
} as const;

export const BREADCRUMB_ITEM_EXPORT_PARTS = joinParts(
  BREADCRUMB_ITEM_PARTS_DICTIONARY
);
