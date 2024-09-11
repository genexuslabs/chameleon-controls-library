import { KEY_CODES } from "../../common/reserved-names";
import { ChameleonControlsTagName } from "../../common/types";
import { focusComposedPath, mouseEventModifierKey } from "../common/helpers";
import {
  ActionListItemActionable,
  ActionListItemGroup,
  ActionListItemModelExtended,
  ActionListItemModelExtendedGroup,
  ActionListItemModelExtendedRoot,
  ActionListModel
} from "./types";
import {
  ACTION_LIST_GROUP_SELECTOR,
  ACTION_LIST_ITEM_SELECTOR,
  getActionListOrGroupItemFromEvent,
  getActionListOrGroupItemIndex
} from "./utils";

const EDIT_KEY = KEY_CODES.F2;
const ACTION_LIST_ITEM_TAG_NAME =
  "ch-action-list-item" satisfies ChameleonControlsTagName;

const isActionListItem = (element: HTMLElement) =>
  element.tagName.toLowerCase() === ACTION_LIST_ITEM_TAG_NAME;

const getFocusedActionListItem = (): HTMLChActionListItemElement | undefined =>
  focusComposedPath().find(isActionListItem) as HTMLChActionListItemElement;

const focusItemById = (
  itemInfo: ActionListItemActionable | ActionListItemGroup,
  actionListRef: HTMLChActionListRenderElement,
  event: KeyboardEvent
) => {
  const itemRef = actionListRef.shadowRoot.querySelector(
    itemInfo.type === "actionable"
      ? ACTION_LIST_ITEM_SELECTOR(itemInfo.id)
      : ACTION_LIST_GROUP_SELECTOR(itemInfo.id)
  ) as HTMLChActionListItemElement | HTMLChActionListGroupElement;

  const ctrlKeyIsPressed = mouseEventModifierKey(event);

  if (itemInfo.type === "group") {
    (itemRef as HTMLChActionListGroupElement).setFocus();

    // Trigger item selection when the ctrl key is not pressed
    if (!ctrlKeyIsPressed) {
      // TODO: Update item selection
    }
  } else {
    itemRef.focus();

    // Trigger item selection when the ctrl key is not pressed
    if (!ctrlKeyIsPressed) {
      itemRef.click();
    }
  }
};

const getAndCheckItem = (
  event: KeyboardEvent,
  flattenedModel: Map<string, ActionListItemModelExtended>
) => {
  event.preventDefault();
  const eventTarget = getActionListOrGroupItemFromEvent(event);

  return eventTarget ? flattenedModel.get(eventTarget.id) : undefined;
};

const groupIsCollapsed = (group: ActionListItemGroup) =>
  group.expandable && group.expanded !== true;

const focusNextItemFirstLevel = (
  startIndex: number,
  items: ActionListModel,
  currentFocusedId: string,
  actionListRef: HTMLChActionListRenderElement,
  event: KeyboardEvent,
  increment: 1 | -1 // Determine the ARROW/focus direction
) => {
  for (
    let firstLevelIndex = startIndex;
    0 <= firstLevelIndex && firstLevelIndex <= items.length;
    firstLevelIndex += increment
  ) {
    const firstLevelSibling = items[firstLevelIndex];

    if (
      (firstLevelSibling.type === "actionable" &&
        !firstLevelSibling.disabled) ||
      // Group
      (firstLevelSibling.type === "group" &&
        !firstLevelSibling.disabled &&
        ((firstLevelSibling.expandable &&
          firstLevelSibling.id !== currentFocusedId &&
          increment === 1) ||
          groupIsCollapsed(firstLevelSibling)))
    ) {
      focusItemById(firstLevelSibling, actionListRef, event);
      return;
    }
    // The group is either expandable and it's expanded or it's always expanded (expandable !== true)
    if (
      firstLevelSibling.type === "group" &&
      !firstLevelSibling.disabled &&
      !groupIsCollapsed(firstLevelSibling)
    ) {
      const anItemWasFocused = focusNextItemSecondLevel(
        // Depending on the increment, its starts at the beginning or the end of the array
        increment === 1 ? 0 : firstLevelSibling.items.length - 1,
        firstLevelSibling.items,
        actionListRef,
        event,
        increment
      );

      if (anItemWasFocused) {
        return;
      }

      // Focus the parent group if any element of the second level can be focused,
      // the parent is expandable (it means its focusable) and the focus direction is up
      if (firstLevelSibling.expandable && increment === -1) {
        focusItemById(firstLevelSibling, actionListRef, event);
        return;
      }
    }
  }
};

/**
 * Try to focus an item of a group level (second level).
 * @returns if an item was focused
 */
function focusNextItemSecondLevel(
  startIndex: number,
  items: ActionListItemActionable[],
  actionListRef: HTMLChActionListRenderElement,
  event: KeyboardEvent,
  increment: 1 | -1
): boolean {
  for (
    let firstLevelIndex = startIndex;
    0 <= firstLevelIndex && firstLevelIndex <= items.length - 1;
    firstLevelIndex += increment
  ) {
    const firstLevelSibling = items[firstLevelIndex];

    if (!firstLevelSibling.disabled) {
      focusItemById(firstLevelSibling, actionListRef, event);
      return true;
    }
  }

  return false;
}

const keyboardDictionary = {
  [KEY_CODES.ARROW_UP]: (
    actionListRef: HTMLChActionListRenderElement,
    flattenedModel: Map<string, ActionListItemModelExtended>,
    event: KeyboardEvent
  ) => {
    const itemUIModel = getAndCheckItem(event, flattenedModel);
    if (!itemUIModel) {
      return;
    }
    const itemInfo = itemUIModel.item as
      | ActionListItemActionable
      | ActionListItemGroup;

    // First level (root level)
    if ((itemUIModel as ActionListItemModelExtendedRoot).root) {
      const root = (itemUIModel as ActionListItemModelExtendedRoot).root;
      const itemIndex = getActionListOrGroupItemIndex(itemInfo, root);

      focusNextItemFirstLevel(
        itemIndex - 1,
        root,
        itemInfo.id,
        actionListRef,
        event,
        -1
      );
    }
    // Second level (group level)
    else {
      const parentItem = (itemUIModel as ActionListItemModelExtendedGroup)
        .parentItem;
      const root = (
        flattenedModel.get(parentItem.id) as ActionListItemModelExtendedRoot
      ).root;

      const secondLevelIndex = getActionListOrGroupItemIndex(
        itemInfo,
        parentItem.items
      );

      const anItemWasFocused = focusNextItemSecondLevel(
        secondLevelIndex - 1,
        parentItem.items,
        actionListRef,
        event,
        -1
      );

      if (anItemWasFocused) {
        return;
      }

      // Focus the parent group if any element of the second level can be focused
      // and the parent is expandable (it means its focusable)
      if (parentItem.expandable) {
        focusItemById(parentItem, actionListRef, event);
        return;
      }

      const firstLevelIndex = getActionListOrGroupItemIndex(parentItem, root);
      focusNextItemFirstLevel(
        firstLevelIndex - 1,
        root,
        itemInfo.id,
        actionListRef,
        event,
        -1
      );
    }
  },

  [KEY_CODES.ARROW_DOWN]: (
    actionListRef: HTMLChActionListRenderElement,
    flattenedModel: Map<string, ActionListItemModelExtended>,
    event: KeyboardEvent
  ) => {
    const itemUIModel = getAndCheckItem(event, flattenedModel);
    if (!itemUIModel) {
      return;
    }
    const itemInfo = itemUIModel.item as
      | ActionListItemActionable
      | ActionListItemGroup;

    // First level (root level)
    if ((itemUIModel as ActionListItemModelExtendedRoot).root) {
      const root = (itemUIModel as ActionListItemModelExtendedRoot).root;
      const itemIndex = getActionListOrGroupItemIndex(itemInfo, root);

      focusNextItemFirstLevel(
        itemInfo.type === "group" && !groupIsCollapsed(itemInfo)
          ? itemIndex
          : itemIndex + 1,
        root,
        itemInfo.id,
        actionListRef,
        event,
        1
      );
    }
    // Second level (group level)
    else {
      const parentItem = (itemUIModel as ActionListItemModelExtendedGroup)
        .parentItem;
      const root = (
        flattenedModel.get(parentItem.id) as ActionListItemModelExtendedRoot
      ).root;

      const secondLevelIndex = getActionListOrGroupItemIndex(
        itemInfo,
        parentItem.items
      );

      const anItemWasFocused = focusNextItemSecondLevel(
        secondLevelIndex + 1,
        parentItem.items,
        actionListRef,
        event,
        1
      );

      if (anItemWasFocused) {
        return;
      }

      const firstLevelIndex = getActionListOrGroupItemIndex(parentItem, root);
      focusNextItemFirstLevel(
        firstLevelIndex + 1,
        root,
        itemInfo.id,
        actionListRef,
        event,
        1
      );
    }
  },

  [EDIT_KEY]: (actionListRef, _, event) => {
    const actionListItem = getFocusedActionListItem();

    // TODO: Add support to edit items even if editable === undefined. This case
    // applies when an item has a "modify" type action
    if (
      !actionListItem ||
      (!actionListItem.editable && !actionListRef.editableItems) ||
      actionListItem.editing ||
      actionListItem.deleting
    ) {
      return;
    }

    event.preventDefault();
    actionListItem.editing = true;
  }
} satisfies {
  [key: string]: (
    actionListRef: HTMLChActionListRenderElement,
    flattenedModel: Map<string, ActionListItemModelExtended>,
    event: KeyboardEvent
  ) => void;
};

export const actionListKeyboardNavigation =
  (
    actionListRef: HTMLChActionListRenderElement,
    flattenedModel: Map<string, ActionListItemModelExtended>
  ) =>
  (event: KeyboardEvent) => {
    const keyboardEventHandler = keyboardDictionary[event.code];

    if (keyboardEventHandler) {
      keyboardEventHandler(actionListRef, flattenedModel, event);
    }
  };
