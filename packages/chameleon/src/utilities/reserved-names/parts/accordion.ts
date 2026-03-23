import { joinParts } from "../join-parts";

export const ACCORDION_PARTS_DICTIONARY = {
  HEADER: "header",
  PANEL: "panel",
  SECTION: "section",

  DISABLED: "disabled", // HEADER, PANEL and SECTION
  EXPANDED: "expanded", // HEADER, PANEL and SECTION
  COLLAPSED: "collapsed" // HEADER, PANEL and SECTION
} as const;

export const ACCORDION_EXPORT_PARTS = joinParts(ACCORDION_PARTS_DICTIONARY);

