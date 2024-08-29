import { NAVIGATION_LIST_ITEM_PARTS_DICTIONARY } from "../../../../common/reserved-names";

export const getNavigationListItemLevelPart = (evenLevel: boolean) =>
  evenLevel
    ? NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.EVEN_LEVEL
    : NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.ODD_LEVEL;

export const getNavigationListItemExpandedPart = (expanded: boolean) =>
  expanded
    ? NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.EXPANDED
    : NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.COLLAPSED;
