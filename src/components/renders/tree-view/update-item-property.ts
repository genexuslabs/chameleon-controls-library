import { TreeViewItemModel } from "../../tree-view/tree-view/types";
import { itemHasCheckbox } from "./helpers";
import { TreeViewItemModelExtended } from "./types";

export const updateItemProperty = (
  itemId: string,
  properties: Partial<TreeViewItemModel>,
  flattenedTreeModel: Map<string, TreeViewItemModelExtended>,
  newSelectedItems: Set<string>,
  newCheckboxItems: Map<string, TreeViewItemModelExtended>,
  defaultCheckbox: boolean
) => {
  const itemUIModel = flattenedTreeModel.get(itemId);
  if (!itemUIModel) {
    return;
  }

  const itemInfo = itemUIModel.item;

  Object.keys(properties).forEach(propertyName => {
    if (properties[propertyName] !== undefined) {
      itemInfo[propertyName] = properties[propertyName];
    }
  });

  // Accumulate selection/deselection
  if (properties.selected) {
    newSelectedItems.add(itemId);
  } else if (properties.selected === false) {
    newSelectedItems.delete(itemId);
  }

  // Accumulate/remove items with checkbox
  if (itemHasCheckbox(itemInfo, defaultCheckbox)) {
    newCheckboxItems.set(itemId, itemUIModel);
  } else {
    newCheckboxItems.delete(itemId);
  }
};
