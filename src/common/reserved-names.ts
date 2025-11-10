import { ImageRender } from "./types";

/**
 * This Symbol allow us to add metadata to UI models, without making it
 * available to the UI model host.
 *
 * Additionally, object entries that are Symbols are not serialize
 * (JSON.stringify), which is perfect for further hiding even more this
 * metadata that must be internal to each component's implementation.
 */
export const MODEL_METADATA = Symbol("metadata");

const joinParts = (parts: { [key in string]: string }) =>
  Object.values(parts).join(",");

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
  F2: "F2",
  HOME: "Home",
  NUMPAD_ENTER: "NumpadEnter",
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
export const ACTION_GROUP_PARTS_DICTIONARY = {
  ACTIONS: "actions",
  MORE_ACTIONS: "more-actions",
  MORE_ACTIONS_BUTTON: "more-actions-button",
  MORE_ACTIONS_WINDOW: "more-actions-window",

  // - - - - - - - - States - - - - - - - -
  VERTICAL: "vertical" // SEPARATOR (comes from dropdown dictionary)
} as const;

export const ACTION_GROUP_EXPORT_PARTS = joinParts(
  ACTION_GROUP_PARTS_DICTIONARY
);

// - - - - - - - - - - - - - - - - - - - -
//            Action List Parts
// - - - - - - - - - - - - - - - - - - - -
export const ACTION_LIST_ITEM_PARTS_DICTIONARY = {
  ACTION: "item__action",
  ADDITIONAL_ITEM: "item__additional-item",
  ADDITIONAL_ITEM_CONFIRM: "item__additional-item-confirm",
  CAPTION: "item__caption",
  CHECKBOX: "item__checkbox",
  CHECKBOX_CONTAINER:
    CHECKBOX_INSIDE_SHADOW_TRANSFORMED_PARTS_DICTIONARY.CONTAINER,
  CHECKBOX_INPUT: CHECKBOX_INSIDE_SHADOW_TRANSFORMED_PARTS_DICTIONARY.INPUT,
  CHECKBOX_OPTION: CHECKBOX_INSIDE_SHADOW_TRANSFORMED_PARTS_DICTIONARY.OPTION,
  // EXPANDABLE_BUTTON: "item__expandable-button",
  // GROUP: "item__group",

  EDIT_CAPTION: "item__edit-caption",

  ADDITIONAL_ACTION: "action", // ADDITIONAL_ITEM
  ADDITIONAL_IMAGE: "image", // ADDITIONAL_ITEM
  ADDITIONAL_TEXT: "text", // ADDITIONAL_ITEM

  // - - - - - - - - States - - - - - - - -
  ACTION_FIX: "action--fix", // ADDITIONAL_ACTION
  ACTION_MODIFY: "action--modify", // ADDITIONAL_ACTION
  ACTION_REMOVE: "action--remove", // ADDITIONAL_ACTION
  ACTION_CUSTOM: "action--custom", // ADDITIONAL_ACTION

  ACTION_ACCEPT: "action--accept", // ADDITIONAL_ITEM_CONFIRM
  ACTION_CANCEL: "action--cancel", // ADDITIONAL_ITEM_CONFIRM

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

  EDITING: "editing", // ACTION
  NOT_EDITING: "not-editing", // ACTION

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
//            Action Menu Parts
// - - - - - - - - - - - - - - - - - - - -
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

export const ACTION_MENU_PARTS_DICTIONARY = {
  EXPANDABLE_BUTTON: "expandable-button"
};

export const ACTION_MENU_ITEM_EXPORT_PARTS = joinParts(
  ACTION_MENU_ITEM_PARTS_DICTIONARY
);
export const ACTION_MENU_EXPORT_PARTS = joinParts(ACTION_MENU_PARTS_DICTIONARY);

// - - - - - - - - - - - - - - - - - - - -
//             Color Picker Parts
// - - - - - - - - - - - - - - - - - - - -
export const COLOR_PICKER_PARTS_DICTIONARY = {
  ALPHA_SLIDER_LABEL: "alpha__slider-label",
  ALPHA_SLIDER: "alpha__slider",
  ALPHA_INPUT_GROUP: "alpha__input-group",
  ALPHA_INPUT_LABEL: "alpha__input-label",
  ALPHA_INPUT: "alpha__input",
  ALPHA_SUFFIX: "alpha-suffix",
  COLOR_FIELD: "color-field",
  COLOR_FIELD_LABEL: "color-field__label",
  COLOR_FORMAT_SELECTOR: "color-format-selector",
  COLOR_FORMAT__COMBO_BOX: "color-format__combo-box",
  COLOR_INPUTS: "color-inputs",
  COLOR_PREVIEW_CONTAINER: "color-preview-container",
  COLOR_PREVIEW_TEXT: "color-preview__text",
  COLOR_PREVIEW: "color-preview",
  FORMAT_SELECTOR_HEADER: "format-selector__header",
  FORMAT_SELECTOR_LABEL: "format-selector__label",
  HEX_INPUT_GROUP: "hex__input-group",
  HEX_INPUT_LABEL: "hex__input-label",
  HEX_INPUT: "hex__input",
  HSL_INPUTS_GROUP: "hsl-inputs__group",
  HSL_H_GROUP: "hsl-h__group",
  HSL_S_GROUP: "hsl-s__group",
  HSL_L_GROUP: "hsl-l__group",
  HSL_H_LABEL: "hsl-h__label",
  HSL_S_LABEL: "hsl-s__label",
  HSL_L_LABEL: "hsl-l__label",
  HSL_H_INPUT: "hsl-h__input",
  HSL_S_INPUT: "hsl-s__input",
  HSL_L_INPUT: "hsl-l__input",
  HSL_S_SUFFIX: "hsl-s-suffix",
  HSL_L_SUFFIX: "hsl-l-suffix",
  HSV_INPUTS_GROUP: "hsv-inputs__group",
  HSV_H_GROUP: "hsv-h__group",
  HSV_S_GROUP: "hsv-s__group",
  HSV_V_GROUP: "hsv-v__group",
  HSV_H_LABEL: "hsv-h__label",
  HSV_S_LABEL: "hsv-s__label",
  HSV_V_LABEL: "hsv-v__label",
  HSV_H_INPUT: "hsv-h__input",
  HSV_S_INPUT: "hsv-s__input",
  HSV_V_INPUT: "hsv-v__input",
  HSV_S_SUFFIX: "hsv-s-suffix",
  HSV_V_SUFFIX: "hsv-v-suffix",
  HUE_SLIDER_LABEL: "hue-slider__label",
  HUE_SLIDER: "hue__slider",
  MARKER: "marker",
  COLOR_PALETTE_BUTTON: "color-palette__button",
  COLOR_PALETTES_GRID: "color-palette-grid",
  COLOR_PALETTES_LABEL: "color-palette__label",
  RGB_INPUTS_GROUP: "rgb-inputs__group",
  RGB_R_GROUP: "rgb-r__group",
  RGB_G_GROUP: "rgb-g__group",
  RGB_B_GROUP: "rgb-b__group",
  RGB_R_LABEL: "rgb-r__label",
  RGB_G_LABEL: "rgb-g__label",
  RGB_B_LABEL: "rgb-b__label",
  RGB_R_INPUT: "rgb-r__input",
  RGB_G_INPUT: "rgb-g__input",
  RGB_B_INPUT: "rgb-b__input",

  // - - - - - - - - States - - - - - - - -
  DISABLED: "disabled", // MARKER
  READONLY: "readonly" // MARKER
} as const;

// - - - - - - - - - - - - - - - - - - - -
//             Combo Box Parts
// - - - - - - - - - - - - - - - - - - - -
export const COMBO_BOX_PARTS_DICTIONARY = {
  EXPANDABLE: "expandable",
  GROUP: "group",
  GROUP_HEADER: "group__header",
  GROUP_HEADER_CAPTION: "group__header-caption",
  GROUP_CONTENT: "group__content",
  ITEM: "item",
  SECTION: "section",
  WINDOW: "window",

  DISABLED: "disabled", // GROUP, EXPANDABLE
  EXPANDED: "expanded", // GROUP_HEADER, EXPANDABLE
  COLLAPSED: "collapsed", // GROUP_HEADER, EXPANDABLE
  NESTED: "nested", // ITEM
  SELECTED: "selected" // ITEM
} as const;

export const COMBO_BOX_EXPORT_PARTS = joinParts(COMBO_BOX_PARTS_DICTIONARY);

export const COMBO_BOX_HOST_PARTS = {
  PLACEHOLDER: "ch-combo-box-render--placeholder"
} as const;

// - - - - - - - - - - - - - - - - - - - -
//               Edit Parts
// - - - - - - - - - - - - - - - - - - - -
export const EDIT_PARTS_DICTIONARY = {
  DATE_PLACEHOLDER: "date-placeholder",
  SHOW_PASSWORD: "show-password-button",
  CLEAR_BUTTON: "clear-button",

  DISABLED: "disabled", // CLEAR_BUTTON, TOGGLE_PASSWORD_VISIBILITY
  PASSWORD_DISPLAYED: "password-displayed",
  PASSWORD_HIDDEN: "password-hidden"
} as const;

export const EDIT_EXPORT_PARTS = joinParts(EDIT_PARTS_DICTIONARY);

export const EDIT_HOST_PARTS = {
  EMPTY_VALUE: "ch-edit--empty-value"
} as const;

// - - - - - - - - - - - - - - - - - - - -
//          Flexible Layout Parts
// - - - - - - - - - - - - - - - - - - - -
export const FLEXIBLE_LAYOUT_PARTS_DICTIONARY = {
  DROPPABLE_AREA: "droppable-area",
  LEAF: "leaf"

  // - - - - - - - - States - - - - - - - -
} as const;

export const FLEXIBLE_LAYOUT_EXPORT_PARTS = joinParts(
  FLEXIBLE_LAYOUT_PARTS_DICTIONARY
);

// - - - - - - - - - - - - - - - - - - - -
//          Layout Splitter Parts
// - - - - - - - - - - - - - - - - - - - -
export const LAYOUT_SPLITTER_PARTS_DICTIONARY = {
  BAR: "bar"

  // - - - - - - - - States - - - - - - - -
} as const;

export const LAYOUT_SPLITTER_EXPORT_PARTS = joinParts(
  LAYOUT_SPLITTER_PARTS_DICTIONARY
);

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

// - - - - - - - - - - - - - - - - - - - -
//            Paginator Parts
// - - - - - - - - - - - - - - - - - - - -
export const PAGINATOR_PARTS_DICTIONARY = {
  ELLIPSIS: "ellipsis",
  FIRST: "first__button",
  GO_TO__INPUT: "go-to__input",
  GO_TO__LABEL: "go-to__label",
  GO_TO: "go-to",
  ITEMS_PER_PAGE__COMBO_BOX: "items-per-page__combo-box",
  ITEMS_PER_PAGE__LABEL: "items-per-page__label",
  ITEMS_PER_PAGE_INFO__TEXT: "items-per-page-info__text",
  ITEMS_PER_PAGE_INFO: "items-per-page-info",
  ITEMS_PER_PAGE: "items-per-page",
  LAST: "last__button",
  NAVIGATION_INFO__TEXT: "navigation-info__text",
  NAVIGATION_INFO: "navigation-info",
  NEXT: "next__button",
  PAGE: "page",
  PAGES: "pages",
  PREV: "prev__button",

  // - - - - - - - - States - - - - - - - -

  DISABLED: "disabled", // FIRST, LAST, NEXT, PREV
  PAGE_SELECTED: "selected", // PAGE
  PAGE_NOT_SELECTED: "not-selected" // PAGE
} as const;

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
//                Tab Parts
// - - - - - - - - - - - - - - - - - - - -
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

// - - - - - - - - - - - - - - - - - - - -
//         Tabular Grid view Parts
// - - - - - - - - - - - - - - - - - - - -
export const TABULAR_GRID_PARTS_DICTIONARY = {
  COLUMNSET: "columnset",
  COLUMN: "column",
  ROWSET_LEGEND: "rowset-legend",
  ROW: "row",
  CELL: "cell"
} as const;

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
  LEVEL_0_LEAF: "level-0-leaf", // HEADER

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
} as const;

export const TREE_VIEW_EXPORT_PARTS = joinParts(TREE_VIEW_PARTS_DICTIONARY);
