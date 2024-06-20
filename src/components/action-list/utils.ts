import {
  ActionListItemActionable,
  ActionListItemGroup,
  ActionListModel
} from "./types";

// Tags
const ACTION_LIST_ITEM_TAG = "ch-action-list-item";
const ACTION_LIST_GROUP_TAG = "ch-action-list-group";

// Selectors
export const ACTION_LIST_ITEM_SELECTOR = (id: string) =>
  `${ACTION_LIST_ITEM_TAG}[id="${id}"]`;

export const ACTION_LIST_GROUP_SELECTOR = (id: string) =>
  `${ACTION_LIST_GROUP_TAG}[id="${id}"]`;

export const getActionListOrGroupItemFromEvent = (
  event: KeyboardEvent | PointerEvent
): HTMLChActionListItemElement | HTMLChActionGroupElement | undefined => {
  event.stopPropagation();

  return event.composedPath().find(el => {
    const tagName = (el as HTMLElement).tagName?.toLowerCase();

    return (
      tagName === ACTION_LIST_ITEM_TAG || tagName === ACTION_LIST_GROUP_TAG
    );
  }) as HTMLChActionListItemElement | HTMLChActionGroupElement | undefined;
};

export const getActionListOrGroupItemIndex = (
  item: ActionListItemActionable | ActionListItemGroup,
  items: ActionListModel
) =>
  items.findIndex(
    (el: ActionListItemActionable | ActionListItemGroup) =>
      el.id && el.id === item.id
  );
