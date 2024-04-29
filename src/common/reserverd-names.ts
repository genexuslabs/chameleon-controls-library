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
//             Checkbox Parts
// - - - - - - - - - - - - - - - - - - - -
export const CHECKBOX_PARTS_DICTIONARY = {
  CONTAINER: "container",
  INPUT: "input",
  OPTION: "option",
  LABEL: "label",

  // - - - - - - - - States - - - - - - - -
  CHECKED: "checked",
  DISABLED: "disabled",
  INDETERMINATE: "indeterminate",
  UNCHECKED: "unchecked"
} as const;

export const CHECKBOX_EXPORT_PARTS = joinParts(CHECKBOX_PARTS_DICTIONARY);

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

// - - - - - - - - - - - - - - - - - - - -
//            Radio item Parts
// - - - - - - - - - - - - - - - - - - - -
export const RADIO_ITEM_PARTS_DICTIONARY = {
  RADIO_ITEM: "radio-item",
  CONTAINER: "radio__container",
  INPUT: "radio__input",
  OPTION: "radio__option",
  LABEL: "radio__label",

  CHECKED: "checked",
  DISABLED: "disabled",
  UNCHECKED: "unchecked"
} as const;

export const RADIO_ITEM_EXPORT_PARTS = joinParts(RADIO_ITEM_PARTS_DICTIONARY);

// - - - - - - - - - - - - - - - - - - - -
//         Segmented control Parts
// - - - - - - - - - - - - - - - - - - - -
export const SEGMENTED_CONTROL_PARTS_DICTIONARY = {
  ACTION: "action",
  DISABLED: "disabled",
  SELECTED: "selected",
  UNSELECTED: "unselected",
  FIRST: "first",
  LAST: "last",
  BETWEEN: "between"
} as const;

export const SEGMENTED_CONTROL_EXPORT_PARTS = joinParts(
  SEGMENTED_CONTROL_PARTS_DICTIONARY
);

// - - - - - - - - - - - - - - - - - - - -
//             Tree view Parts
// - - - - - - - - - - - - - - - - - - - -
const TREE_VIEW_ITEM_CHECKBOX_TRANSFORMED_PARTS_DICTIONARY = {
  CONTAINER: `item__checkbox-${CHECKBOX_PARTS_DICTIONARY.CONTAINER}`,
  INPUT: `item__checkbox-${CHECKBOX_PARTS_DICTIONARY.INPUT}`,
  OPTION: `item__checkbox-${CHECKBOX_PARTS_DICTIONARY.OPTION}`
} as const;

const TREE_VIEW_ITEM_CHECKBOX_PARTS_DICTIONARY = {
  CHECKBOX_CONTAINER: `${CHECKBOX_PARTS_DICTIONARY.CONTAINER}:${TREE_VIEW_ITEM_CHECKBOX_TRANSFORMED_PARTS_DICTIONARY.CONTAINER}`,
  CHECKBOX_INPUT: `${CHECKBOX_PARTS_DICTIONARY.INPUT}:${TREE_VIEW_ITEM_CHECKBOX_TRANSFORMED_PARTS_DICTIONARY.INPUT}`,
  CHECKBOX_OPTION: `${CHECKBOX_PARTS_DICTIONARY.OPTION}:${TREE_VIEW_ITEM_CHECKBOX_TRANSFORMED_PARTS_DICTIONARY.OPTION}`,

  // - - - - - - - - States - - - - - - - -
  DISABLED: CHECKBOX_PARTS_DICTIONARY.DISABLED,
  CHECKED: CHECKBOX_PARTS_DICTIONARY.CHECKED,
  UNCHECKED: CHECKBOX_PARTS_DICTIONARY.UNCHECKED,
  INDETERMINATE: CHECKBOX_PARTS_DICTIONARY.INDETERMINATE
} as const;

export const TREE_VIEW_ITEM_CHECKBOX_EXPORT_PARTS = joinParts(
  TREE_VIEW_ITEM_CHECKBOX_PARTS_DICTIONARY
);

export const TREE_VIEW_ITEM_PARTS_DICTIONARY = {
  ACTION: "item__action",
  CHECKBOX: "item__checkbox",
  CHECKBOX_CONTAINER:
    TREE_VIEW_ITEM_CHECKBOX_TRANSFORMED_PARTS_DICTIONARY.CONTAINER,
  CHECKBOX_INPUT: TREE_VIEW_ITEM_CHECKBOX_TRANSFORMED_PARTS_DICTIONARY.INPUT,
  CHECKBOX_OPTION: TREE_VIEW_ITEM_CHECKBOX_TRANSFORMED_PARTS_DICTIONARY.OPTION,
  DOWNLOADING: "item__downloading",
  EDIT_CAPTION: "item__edit-caption",
  EXPANDABLE_BUTTON: "item__expandable-button",
  GROUP: "item__group", // Old "expandable"
  HEADER: "item__header",
  IMAGE: "item__img",
  LINE: "item__line", // Old "dashed-line"

  // - - - - - - - - States - - - - - - - -
  DISABLED: "disabled", // HEADER, EXPANDABLE_BUTTON, CHECKBOX

  EXPANDED: "expanded", // ACTION, EXPANDABLE_BUTTON, GROUP
  COLLAPSED: "collapsed", // ACTION, EXPANDABLE_BUTTON, GROUP

  EXPAND_BUTTON: "expand-button", // HEADER

  EVEN_LEVEL: "even-level", // HEADER, GROUP
  ODD_LEVEL: "odd-level", // HEADER, GROUP

  LAST_LINE: "last-line", // LINE

  LAZY_LOADED: "lazy-loaded", // GROUP

  START_IMAGE: "start-img", // IMAGE
  END_IMAGE: "end-img", // IMAGE

  EDITING: "editing", // HEADER, ACTION
  NOT_EDITING: "not-editing", // HEADER, ACTION

  SELECTED: "selected", // HEADER
  NOT_SELECTED: "not-selected", // HEADER

  CHECKED: TREE_VIEW_ITEM_CHECKBOX_PARTS_DICTIONARY.CHECKED, // CHECKBOX
  UNCHECKED: TREE_VIEW_ITEM_CHECKBOX_PARTS_DICTIONARY.UNCHECKED, // CHECKBOX
  INDETERMINATE: TREE_VIEW_ITEM_CHECKBOX_PARTS_DICTIONARY.INDETERMINATE, // CHECKBOX

  DRAG_ENTER: "drag-enter" // HEADER
} as const;

export const TREE_VIEW_ITEM_EXPORT_PARTS = joinParts(
  TREE_VIEW_ITEM_PARTS_DICTIONARY
);

export const TREE_VIEW_PARTS_DICTIONARY = {
  DRAG_INFO: "drag-info",
  DRAG_PREVIEW: "drag-preview",
  ITEM: "item",

  // - - - - - - - - States - - - - - - - -
  DRAG_ENTER: "drag-enter" // ITEM
};

export const TREE_VIEW_EXPORT_PARTS = joinParts(TREE_VIEW_PARTS_DICTIONARY);
