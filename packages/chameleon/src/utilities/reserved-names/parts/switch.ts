import { joinParts } from "../join-parts";

export const SWITCH_PARTS_DICTIONARY = {
  TRACK: "track",
  THUMB: "thumb",
  CAPTION: "caption",

  // - - - - - - - - States - - - - - - - -
  CHECKED: "checked",
  DISABLED: "disabled",
  READONLY: "readonly",
  UNCHECKED: "unchecked"
} as const;

export const SWITCH_EXPORT_PARTS = joinParts(SWITCH_PARTS_DICTIONARY);
