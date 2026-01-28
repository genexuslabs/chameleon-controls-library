export const NAVIGATION_LIST_INITIAL_LEVEL = 0;

export const NAVIGATION_LIST_NO_ATTRIBUTE = { attribute: false };

/**
 * Symbol to mark navigation-list items that were expanded at least one time.
 * Useful for not rendering the content of items that were not expanded for the
 * first time.
 */
export const NAVIGATION_LIST_ITEM_WAS_EXPANDED = Symbol(
  "navigation-list-item-was-expanded"
);
