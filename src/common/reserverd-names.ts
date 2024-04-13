const joinParts = (parts: { [key in string]: string }) =>
  [...Object.values(parts)].join(",");

/**
 * Useful key codes that must be used in KeyboardEvent.code
 */
export const KEY_CODES = {
  ARROW_UP: "ArrowUp",
  ARROW_RIGHT: "ArrowRight",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  END: "End",
  ENTER: "Enter",
  ESCAPE: "Escape",
  HOME: "Home",
  SPACE: "Space",
  TAB: "Tab"
} as const;

export const DISABLED_CLASS = "ch-disabled";

// - - - - - - - - - - - - - - - - - - - -
//               Line clamp
// - - - - - - - - - - - - - - - - - - - -
export const HEIGHT_MEASURING = "height-measuring";
export const LINE_CLAMP = "line-clamp";
export const LINE_MEASURING = "line-measuring";

// - - - - - - - - - - - - - - - - - - - -
//           Action Group Parts
// - - - - - - - - - - - - - - - - - - - -
export const ACTION_GROUP_PARTS_DICTIONARY = {
  ACTIONS: "actions",
  MORE_ACTIONS: "more-actions",
  MORE_ACTIONS_BUTTON: "more-actions-button",
  MORE_ACTIONS_WINDOW: "more-actions-window"
} as const;

export const ACTION_GROUP_EXPORT_PARTS = joinParts(
  ACTION_GROUP_PARTS_DICTIONARY
);

// - - - - - - - - - - - - - - - - - - - -
//             Dropdown Parts
// - - - - - - - - - - - - - - - - - - - -
export const DROPDOWN_PARTS_DICTIONARY = {
  CONTENT: "content",
  SHORTCUT: "shortcut",
  ACTION: "action",
  BUTTON: "button",
  LINK: "link",
  EXPANDABLE_BUTTON: "expandable-button",
  EXPANDABLE: "expandable",
  WINDOW: "window"
} as const;

export const DROPDOWN_EXPORT_PARTS = joinParts(DROPDOWN_PARTS_DICTIONARY);
