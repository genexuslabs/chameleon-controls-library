import type { ImageRender } from "../../../typings/multi-state-images";
import { joinParts } from "../join-parts";
import {
  CHECKBOX_INSIDE_SHADOW_PARTS_DICTIONARY,
  CHECKBOX_INSIDE_SHADOW_TRANSFORMED_PARTS_DICTIONARY
} from "./checkbox";

/* #INLINE# */
export const ACTION_LIST_ITEM_PARTS_DICTIONARY = {
  ACTION: "item__action",
  ADDITIONAL_ITEM: "item__additional-item",
  ADDITIONAL_ITEM_CONFIRM: "item__additional-item-confirm",
  CAPTION: "item__caption",
  CHECKBOX: "item__checkbox",
  CHECKBOX_CONTAINER: CHECKBOX_INSIDE_SHADOW_TRANSFORMED_PARTS_DICTIONARY.CONTAINER,
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

export const ACTION_LIST_ITEM_EXPORT_PARTS = joinParts(ACTION_LIST_ITEM_PARTS_DICTIONARY);

/* #INLINE# */
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

export const ACTION_LIST_GROUP_EXPORT_PARTS = joinParts(ACTION_LIST_GROUP_PARTS_DICTIONARY);

/* #INLINE# */
export const ACTION_LIST_PARTS_DICTIONARY = {
  GROUP: "group",
  ITEM: "item"
} as const;

export const ACTION_LIST_EXPORT_PARTS = joinParts(ACTION_LIST_GROUP_PARTS_DICTIONARY);

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

