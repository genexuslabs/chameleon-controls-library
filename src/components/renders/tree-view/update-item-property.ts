import { TreeViewItemModel } from "../../tree-view/tree-view/types";
import { TreeViewItemModelExtended } from "./types";

export const updateItemProperty = (
  itemId: string,
  properties: Partial<TreeViewItemModel>,
  flattenedTreeModel: Map<string, TreeViewItemModelExtended>
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
};
