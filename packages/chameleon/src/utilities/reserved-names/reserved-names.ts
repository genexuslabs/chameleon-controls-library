import { joinParts } from "./join-parts";
import {
  CHECKBOX_INSIDE_SHADOW_PARTS_DICTIONARY,
  CHECKBOX_INSIDE_SHADOW_TRANSFORMED_PARTS_DICTIONARY
} from "./parts/checkbox";

// - - - - - - - - - - - - - - - - - - - -
//               Edit Parts
// - - - - - - - - - - - - - - - - - - - -
export const EDIT_PARTS_DICTIONARY = {
  DATE_PLACEHOLDER: "date-placeholder",
  CLEAR_BUTTON: "clear-button",

  DISABLED: "disabled" // CLEAR_BUTTON
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

export const FLEXIBLE_LAYOUT_EXPORT_PARTS = joinParts(FLEXIBLE_LAYOUT_PARTS_DICTIONARY);

// - - - - - - - - - - - - - - - - - - - -
//            Paginator Parts
// - - - - - - - - - - - - - - - - - - - -
export const PAGINATOR_PARTS_DICTIONARY = {
  DISABLED: "disabled",
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
  PAGE_ACTIVE: "page-active",
  PAGE: "page",
  PAGES: "pages",
  PREV: "prev__button"
} as const;

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
  CHECKBOX_CONTAINER: CHECKBOX_INSIDE_SHADOW_TRANSFORMED_PARTS_DICTIONARY.CONTAINER,
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

export const TREE_VIEW_ITEM_EXPORT_PARTS = joinParts(TREE_VIEW_ITEM_PARTS_DICTIONARY);

export const TREE_VIEW_PARTS_DICTIONARY = {
  DRAG_PREVIEW: "drag-preview",
  ITEM: "item",

  // - - - - - - - - States - - - - - - - -
  DRAG_ENTER: "drag-enter" // ITEM
} as const;

export const TREE_VIEW_EXPORT_PARTS = joinParts(TREE_VIEW_PARTS_DICTIONARY);

