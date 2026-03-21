import {
  ActionListItemModel,
  ActionListItemModelExtended,
  ActionListItemType,
  ActionListModel
} from "./types";
import { getParentArray } from "./utils";

export const updateItemProperty = (
  itemId: string,
  propertiesToUpdate: Partial<ActionListItemModel> & {
    type: ActionListItemType;
  },
  flattenedTreeModel: Map<string, ActionListItemModelExtended>,
  newSelectedItems: Set<string>
): ActionListModel | undefined => {
  const itemUIModel = flattenedTreeModel.get(itemId);
  if (!itemUIModel) {
    return undefined;
  }
  const itemInfo = itemUIModel.item;

  // Types doesn't match
  if (propertiesToUpdate.type !== itemInfo.type) {
    return undefined;
  }

  // Update properties
  for (const propertyName in propertiesToUpdate) {
    const propertyValue = propertiesToUpdate[propertyName];

    if (propertyValue !== undefined) {
      itemInfo[propertyName] = propertyValue;
    }
  }

  if (propertiesToUpdate.type === "separator") {
    return undefined;
  }

  // Accumulate selection/deselection
  if (propertiesToUpdate.selected) {
    newSelectedItems.add(itemId);
  } else if (propertiesToUpdate.selected === false) {
    newSelectedItems.delete(itemId);
  }

  return getParentArray(itemUIModel);
};
