import { ChActionListRender } from "./action-list-render";
import { ActionListItemModelExtended, ActionListModel } from "./types";
import { getActionListItemOrGroupInfo } from "./utils";

export const setActionListSelectedItems = (
  model: ActionListModel,
  selectedItems: Set<string>
) => {
  for (let index = 0; index < model.length; index++) {
    const itemUIModel = model[index];

    if (itemUIModel.type === "actionable" && itemUIModel.selected) {
      selectedItems.add(itemUIModel.id);
    } else if (itemUIModel.type === "group" && itemUIModel.items != null) {
      setActionListSelectedItems(itemUIModel.items, selectedItems);
    }
  }
};

export const selectedItemsDiffer = (
  currentSelectedItems: Set<string>,
  newSelectedItems: Set<string>
): boolean => {
  if (currentSelectedItems.size !== newSelectedItems.size) {
    return true;
  }

  // Check if every item is on both Sets
  for (const key of currentSelectedItems) {
    if (!newSelectedItems.has(key)) {
      return true;
    }
  }
  return false;
};

const removeAllSelectedItemsExceptForTheLast = (
  selectedItems: Set<string>,
  flattenedModel: Map<string, ActionListItemModelExtended>
) => {
  const selectedItemsArray = [...selectedItems.values()];
  const lastItemIndex = selectedItems.size - 1;

  // Deselect all items except the last
  for (let index = 0; index < lastItemIndex; index++) {
    const itemId = selectedItemsArray[index];
    getActionListItemOrGroupInfo(itemId, flattenedModel).selected = false;
  }

  // Create a new Set with only the last item
  selectedItems.clear();
  selectedItems.add(selectedItemsArray[lastItemIndex]);
};

export const selectedItemsChangeShouldBeEmitted = (
  currentSelectedItems: Set<string>,
  newSelectedItems: Set<string>,
  flattenedModel: Map<string, ActionListItemModelExtended>,
  selection: ChActionListRender["selection"]
): boolean => {
  if (selection === "single") {
    if (newSelectedItems.size > 1) {
      removeAllSelectedItemsExceptForTheLast(newSelectedItems, flattenedModel);
      return true;
    }
    if (selectedItemsDiffer(currentSelectedItems, newSelectedItems)) {
      return true;
    }

    return false;
  }
  if (selectedItemsDiffer(currentSelectedItems, newSelectedItems)) {
    return true;
  }

  return false;
};
