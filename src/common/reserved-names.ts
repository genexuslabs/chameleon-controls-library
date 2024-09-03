import { ImageRender } from "./types";

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

/**
 * Utility class to globally style the scrollbars
 */
export const SCROLLABLE_CLASS = "ch-scrollable";

// - - - - - - - - - - - - - - - - - - - -
//                 Images
// - - - - - - - - - - - - - - - - - - - -
const START_IMAGE = "pseudo-img--start";
const END_IMAGE = "pseudo-img--end";
const BACKGROUND_IMAGE_TYPE: ImageRender = "background";
const MASK_IMAGE_TYPE: ImageRender = "mask";

const START_IMAGE_TYPE_PREFIX = "start-img-type--";
const END_IMAGE_TYPE_PREFIX = "end-img-type--";

// For classes
export const startPseudoImageTypeDictionary = {
  background: `${START_IMAGE_TYPE_PREFIX}${BACKGROUND_IMAGE_TYPE} ${START_IMAGE}`,
  mask: `${START_IMAGE_TYPE_PREFIX}${MASK_IMAGE_TYPE} ${START_IMAGE}`
} as const satisfies { [key in Exclude<ImageRender, "img">]: string };

// For classes
export const endPseudoImageTypeDictionary = {
  background: `${END_IMAGE_TYPE_PREFIX}${BACKGROUND_IMAGE_TYPE} ${END_IMAGE}`,
  mask: `${END_IMAGE_TYPE_PREFIX}${MASK_IMAGE_TYPE} ${END_IMAGE}`
} as const satisfies { [key in Exclude<ImageRender, "img">]: string };

// For classes
export const imageTypeDictionary = {
  background: `img img-type--${BACKGROUND_IMAGE_TYPE}`,
  mask: `img img-type--${MASK_IMAGE_TYPE}`
} as const satisfies { [key in Exclude<ImageRender, "img">]: string };

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

const CHECKBOX_INSIDE_SHADOW_TRANSFORMED_PARTS_DICTIONARY = {
  CONTAINER: `item__checkbox-${CHECKBOX_PARTS_DICTIONARY.CONTAINER}`,
  INPUT: `item__checkbox-${CHECKBOX_PARTS_DICTIONARY.INPUT}`,
  OPTION: `item__checkbox-${CHECKBOX_PARTS_DICTIONARY.OPTION}`
} as const;

const CHECKBOX_INSIDE_SHADOW_PARTS_DICTIONARY = {
  CHECKBOX_CONTAINER: `${CHECKBOX_PARTS_DICTIONARY.CONTAINER}:${CHECKBOX_INSIDE_SHADOW_TRANSFORMED_PARTS_DICTIONARY.CONTAINER}`,
  CHECKBOX_INPUT: `${CHECKBOX_PARTS_DICTIONARY.INPUT}:${CHECKBOX_INSIDE_SHADOW_TRANSFORMED_PARTS_DICTIONARY.INPUT}`,
  CHECKBOX_OPTION: `${CHECKBOX_PARTS_DICTIONARY.OPTION}:${CHECKBOX_INSIDE_SHADOW_TRANSFORMED_PARTS_DICTIONARY.OPTION}`,

  // - - - - - - - - States - - - - - - - -
  DISABLED: CHECKBOX_PARTS_DICTIONARY.DISABLED,
  CHECKED: CHECKBOX_PARTS_DICTIONARY.CHECKED,
  UNCHECKED: CHECKBOX_PARTS_DICTIONARY.UNCHECKED,
  INDETERMINATE: CHECKBOX_PARTS_DICTIONARY.INDETERMINATE
} as const;

export const TREE_VIEW_ITEM_CHECKBOX_EXPORT_PARTS = joinParts(
  CHECKBOX_INSIDE_SHADOW_PARTS_DICTIONARY
);

// - - - - - - - - - - - - - - - - - - - -
//             Accordion Parts
// - - - - - - - - - - - - - - - - - - - -
export const ACCORDION_PARTS_DICTIONARY = {
  HEADER: "header",
  PANEL: "panel",
  SECTION: "section",

  DISABLED: "disabled", // HEADER, PANEL and SECTION
  EXPANDED: "expanded", // HEADER, PANEL and SECTION
  COLLAPSED: "collapsed" // HEADER, PANEL and SECTION
} as const;

export const ACCORDION_EXPORT_PARTS = joinParts(ACCORDION_PARTS_DICTIONARY);

// - - - - - - - - - - - - - - - - - - - -
//           Action Group Parts
// - - - - - - - - - - - - - - - - - - - -
export const ACTION_LIST_ITEM_PARTS_DICTIONARY = {
  ACTION: "item__action",
  ADDITIONAL_ITEM: "item__additional-item",
  CAPTION: "item__caption",
  CHECKBOX: "item__checkbox",
  CHECKBOX_CONTAINER:
    CHECKBOX_INSIDE_SHADOW_TRANSFORMED_PARTS_DICTIONARY.CONTAINER,
  CHECKBOX_INPUT: CHECKBOX_INSIDE_SHADOW_TRANSFORMED_PARTS_DICTIONARY.INPUT,
  CHECKBOX_OPTION: CHECKBOX_INSIDE_SHADOW_TRANSFORMED_PARTS_DICTIONARY.OPTION,
  // EXPANDABLE_BUTTON: "item__expandable-button",
  // GROUP: "item__group",

  ADDITIONAL_ACTION: "action", // ADDITIONAL_ITEM
  ADDITIONAL_IMAGE: "image", // ADDITIONAL_ITEM
  ADDITIONAL_TEXT: "text", // ADDITIONAL_ITEM

  // - - - - - - - - States - - - - - - - -
  ACTION_FIX: "action--fix", // ADDITIONAL_ACTION
  ACTION_MODIFY: "action--modify", // ADDITIONAL_ACTION
  ACTION_REMOVE: "action--remove", // ADDITIONAL_ACTION
  ACTION_CUSTOM: "action--custom", // ADDITIONAL_ACTION

  FIXED: "fixed", // ACTION_FIX
  NOT_FIXED: "not-fixed", // ACTION_FIX

  DISABLED: "disabled", // EXPANDABLE_BUTTON, CHECKBOX, ADDITIONAL_ACTION

  NESTED: "nested", // ACTION
  NESTED_EXPANDABLE: "nested-expandable", // ACTION

  // EXPANDED: "expanded", // ACTION, EXPANDABLE_BUTTON, GROUP
  // COLLAPSED: "collapsed", // ACTION, EXPANDABLE_BUTTON, GROUP

  // EXPAND_BUTTON: "expand-button", // HEADER

  // LAZY_LOADED: "lazy-loaded", // GROUP

  // START_IMAGE: "start-img", // IMAGE
  // END_IMAGE: "end-img", // IMAGE

  // EDITING: "editing", // ACTION
  // NOT_EDITING: "not-editing", // ACTION

  SELECTABLE: "selectable", // ACTION
  NOT_SELECTABLE: "not-selectable", // ACTION
  SELECTED: "selected", // ACTION
  NOT_SELECTED: "not-selected", // ACTION

  CHECKED: CHECKBOX_INSIDE_SHADOW_PARTS_DICTIONARY.CHECKED, // CHECKBOX
  UNCHECKED: CHECKBOX_INSIDE_SHADOW_PARTS_DICTIONARY.UNCHECKED, // CHECKBOX
  INDETERMINATE: CHECKBOX_INSIDE_SHADOW_PARTS_DICTIONARY.INDETERMINATE // CHECKBOX

  // DRAG_ENTER: "drag-enter" // HEADER
} as const;

export const ACTION_LIST_ITEM_EXPORT_PARTS = joinParts(
  ACTION_LIST_ITEM_PARTS_DICTIONARY
);

export const ACTION_LIST_GROUP_PARTS_DICTIONARY = {
  ACTION: "group__action",
  CAPTION: "group__caption",
  EXPANDABLE: "group__expandable",

  // - - - - - - - - States - - - - - - - -
  DISABLED: "disabled", // ACTION, CAPTION

  EXPANDED: "expanded", // EXPANDABLE
  COLLAPSED: "collapsed", // EXPANDABLE

  LAZY_LOADED: "lazy-loaded", // EXPANDABLE

  SELECTED: "selected", // HEADER
  NOT_SELECTED: "not-selected" // HEADER

  // DRAG_ENTER: "drag-enter" // HEADER
} as const;

export const ACTION_LIST_GROUP_EXPORT_PARTS = joinParts(
  ACTION_LIST_GROUP_PARTS_DICTIONARY
);

export const ACTION_LIST_PARTS_DICTIONARY = {
  GROUP: "group",
  ITEM: "item"
} as const;

export const ACTION_LIST_EXPORT_PARTS = joinParts(
  ACTION_LIST_GROUP_PARTS_DICTIONARY
);

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

// - - - - - - - - - - - - - - - - - - - -
//          Navigation List Parts
// - - - - - - - - - - - - - - - - - - - -
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
  AFTER: "after", // ACTION, GROUP
  BEFORE: "before", // ACTION, GROUP

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
//              Switch Parts
// - - - - - - - - - - - - - - - - - - - -
export const SWITCH_PARTS_DICTIONARY = {
  TRACK: "track",
  THUMB: "thumb",
  CAPTION: "caption",

  // - - - - - - - - States - - - - - - - -
  CHECKED: "checked",
  DISABLED: "disabled",
  UNCHECKED: "unchecked"
} as const;

export const SWITCH_EXPORT_PARTS = joinParts(SWITCH_PARTS_DICTIONARY);

// - - - - - - - - - - - - - - - - - - - -
//             Tree view Parts
// - - - - - - - - - - - - - - - - - - - -
export const TREE_VIEW_ITEM_PARTS_DICTIONARY = {
  ACTION: "item__action",
  CHECKBOX: "item__checkbox",
  CHECKBOX_CONTAINER:
    CHECKBOX_INSIDE_SHADOW_TRANSFORMED_PARTS_DICTIONARY.CONTAINER,
  CHECKBOX_INPUT: CHECKBOX_INSIDE_SHADOW_TRANSFORMED_PARTS_DICTIONARY.INPUT,
  CHECKBOX_OPTION: CHECKBOX_INSIDE_SHADOW_TRANSFORMED_PARTS_DICTIONARY.OPTION,
  DOWNLOADING: "item__downloading",
  EDIT_CAPTION: "item__edit-caption",
  EXPANDABLE_BUTTON: "item__expandable-button",
  GROUP: "item__group",
  HEADER: "item__header",
  IMAGE: "item__img",
  LINE: "item__line",

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

  CHECKED: CHECKBOX_INSIDE_SHADOW_PARTS_DICTIONARY.CHECKED, // CHECKBOX
  UNCHECKED: CHECKBOX_INSIDE_SHADOW_PARTS_DICTIONARY.UNCHECKED, // CHECKBOX
  INDETERMINATE: CHECKBOX_INSIDE_SHADOW_PARTS_DICTIONARY.INDETERMINATE, // CHECKBOX

  DRAG_ENTER: "drag-enter" // HEADER
} as const;

export const TREE_VIEW_ITEM_EXPORT_PARTS = joinParts(
  TREE_VIEW_ITEM_PARTS_DICTIONARY
);

export const TREE_VIEW_PARTS_DICTIONARY = {
  DRAG_PREVIEW: "drag-preview",
  ITEM: "item",

  // - - - - - - - - States - - - - - - - -
  DRAG_ENTER: "drag-enter" // ITEM
};

export const TREE_VIEW_EXPORT_PARTS = joinParts(TREE_VIEW_PARTS_DICTIONARY);
