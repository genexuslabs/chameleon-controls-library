// Selectors
const ACTION_LIST_ITEM_SELECTOR = "ch-action-list-item";

export const getActionListItemFromClickEvent = (
  event: PointerEvent
): HTMLChActionListItemElement | undefined => {
  event.stopPropagation();

  return event
    .composedPath()
    .find(
      el =>
        (el as HTMLElement).tagName?.toLowerCase() === ACTION_LIST_ITEM_SELECTOR
    ) as HTMLChActionListItemElement | undefined;
};
