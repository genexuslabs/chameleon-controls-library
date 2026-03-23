import { joinParts } from "../join-parts";

/* #INLINE# */
export const ACTION_MENU_ITEM_PARTS_DICTIONARY = {
  CONTENT: "content",
  SHORTCUT: "shortcut",
  ACTION: "action",
  BUTTON: "button",
  LINK: "link",
  WINDOW: "window",
  SEPARATOR: "separator",

  // - - - - - - - - States - - - - - - - -
  EXPANDABLE: "expandable", // ACTION
  EXPANDED: "expanded", // ACTION
  COLLAPSED: "collapsed", // ACTION
  DISABLED: "disabled" // ACTION
} as const;

/* #INLINE# */
export const ACTION_MENU_PARTS_DICTIONARY = {
  EXPANDABLE_BUTTON: "expandable-button"
};

export const ACTION_MENU_ITEM_EXPORT_PARTS = joinParts(ACTION_MENU_ITEM_PARTS_DICTIONARY);
export const ACTION_MENU_EXPORT_PARTS = joinParts(ACTION_MENU_PARTS_DICTIONARY);

