import { joinParts } from "../join-parts";

export const LAYOUT_SPLITTER_PARTS_DICTIONARY = {
  BAR: "bar"

  // - - - - - - - - States - - - - - - - -
} as const;

export const LAYOUT_SPLITTER_EXPORT_PARTS = joinParts(
  LAYOUT_SPLITTER_PARTS_DICTIONARY
);
