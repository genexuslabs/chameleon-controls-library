import { joinParts } from "../join-parts";

export const NAVIGATION_LIST_ITEM_PARTS_DICTIONARY = {
  ACTION: "item__action",
  BUTTON: "item__button",
  CAPTION: "item__caption",
  GROUP: "item__group",
  LINK: "item__link",

  INDICATOR: "indicator",

  // - - - - - - - - States - - - - - - - -
  DISABLED: "disabled", // ACTION, CAPTION, GROUP, INDICATOR

  EXPANDED: "expanded", // ACTION, GROUP
  COLLAPSED: "collapsed", // ACTION, GROUP

  EXPAND_BUTTON: "expand-button", // ACTION
  START: "start", // ACTION, GROUP
  END: "end", // ACTION, GROUP

  SELECTED: "selected", // CAPTION, GROUP, LINK
  NOT_SELECTED: "not-selected", // CAPTION, GROUP, LINK

  NAVIGATION_LIST_COLLAPSED: "navigation-list-collapsed", // ACTION, CAPTION
  TOOLTIP: "tooltip", // CAPTION

  EVEN_LEVEL: "even-level", // ACTION, GROUP
  ODD_LEVEL: "odd-level" // ACTION, GROUP

  // START_IMAGE: "start-img", // IMAGE
  // END_IMAGE: "end-img" // IMAGE
} as const;

export const NAVIGATION_LIST_ITEM_EXPORT_PARTS = joinParts(
  NAVIGATION_LIST_ITEM_PARTS_DICTIONARY
);
