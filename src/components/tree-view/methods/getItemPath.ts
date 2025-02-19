import { TreeViewItemModel, TreeViewItemModelExtended } from "../types";
import { ROOT_ID } from "../utils";

export const getItemPath = (
  itemId: string,
  flattenedTreeModel: Map<string, TreeViewItemModelExtended>
): TreeViewItemModel[] | null => {
  const itemUIModel = flattenedTreeModel.get(itemId);

  if (!itemUIModel) {
    return null;
  }

  const itemPath: TreeViewItemModel[] = [itemUIModel.item];
  let currentItemUIModel = itemUIModel;

  while (currentItemUIModel.parentItem.id !== ROOT_ID) {
    itemPath.push(currentItemUIModel.parentItem);
    currentItemUIModel = flattenedTreeModel.get(
      currentItemUIModel.parentItem.id
    );
  }

  return itemPath.reverse();
};
