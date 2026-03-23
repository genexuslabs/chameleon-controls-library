import { joinParts } from "../join-parts";

export const TAB_PARTS_DICTIONARY = {
  TAB: "tab",
  TAB_CAPTION: "tab-caption",
  CLOSE_BUTTON: "close-button",
  LIST: "tab-list",
  LIST_START: "tab-list-start",
  LIST_END: "tab-list-end",
  PANEL: "tab-panel",
  PANEL_CONTAINER: "tab-panel-container",
  IMAGE: "img",

  // - - - - - - - - States - - - - - - - -
  CLOSABLE: "closable", // TAB, TAB_CAPTION
  NOT_CLOSABLE: "not-closable", // TAB, TAB_CAPTION
  DISABLED: "disabled", // TAB, TAB_CAPTION, PANEL, CLOSE_BUTTON
  DRAGGING: "dragging", // TAB, TAB_CAPTION, CLOSE_BUTTON, LIST
  DRAGGING_OVER_TAB_LIST: "dragging-over-tab-list", // TAB, CLOSE_BUTTON, LIST
  DRAGGING_OUT_OF_TAB_LIST: "dragging-out-of-tab-list", // TAB, CLOSE_BUTTON, LIST
  EXPANDED: "expanded", // PANEL_CONTAINER
  COLLAPSED: "collapsed", // PANEL_CONTAINER
  SELECTED: "selected", // TAB, TAB_CAPTION, PANEL, CLOSE_BUTTON
  NOT_SELECTED: "not-selected", // TAB, TAB_CAPTION, PANEL, CLOSE_BUTTON

  BLOCK: "block", // TAB, TAB_CAPTION, CLOSE_BUTTON, LIST, LIST_START, LIST_END, PANEL, PANEL_CONTAINER
  INLINE: "inline", // TAB, TAB_CAPTION, CLOSE_BUTTON, LIST, LIST_START, LIST_END, PANEL, PANEL_CONTAINER
  START: "start", // TAB, TAB_CAPTION, CLOSE_BUTTON, LIST, LIST_START, LIST_END, PANEL, PANEL_CONTAINER
  END: "end" // TAB, TAB_CAPTION, CLOSE_BUTTON, LIST, LIST_START, LIST_END, PANEL, PANEL_CONTAINER
} as const;

export const TAB_EXPORT_PARTS = joinParts(TAB_PARTS_DICTIONARY);

