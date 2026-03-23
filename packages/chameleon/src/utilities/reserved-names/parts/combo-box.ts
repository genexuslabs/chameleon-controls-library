import { joinParts } from "../join-parts";

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

