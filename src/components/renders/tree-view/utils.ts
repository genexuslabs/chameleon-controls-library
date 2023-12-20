import { removeElement } from "../../../common/array";
import { TreeViewItemModel } from "../../tree-view/tree-view/types";
import { TreeViewItemModelExtended, TreeViewRemoveItemsResult } from "./types";

export const removeTreeViewItems = (
  items: string[] | undefined,
  flattenedTreeModel: Map<string, TreeViewItemModelExtended>,
  flattenedCheckboxTreeModel: Map<string, TreeViewItemModelExtended>,
  selectedItems: Set<string>
): TreeViewRemoveItemsResult => {
  let atLeastOneElement = false;
  let atLeastOneCheckbox = false;
  let atLeastOneSelected = false;

  items.forEach(itemId => {
    const itemUIModel = flattenedTreeModel.get(itemId);

    if (itemUIModel) {
      const itemInfo = itemUIModel.item;
      const parentArray = itemUIModel.parentItem.items;

      // Remove subitems
      if (itemInfo.leaf !== true && itemInfo.items?.length > 0) {
        const subItemsId = itemInfo.items.map(item => item.id);

        removeTreeViewItems(
          subItemsId,
          flattenedTreeModel,
          flattenedCheckboxTreeModel,
          selectedItems
        );
      }

      // Remove item
      atLeastOneElement ||= flattenedTreeModel.delete(itemId);
      atLeastOneCheckbox ||= flattenedCheckboxTreeModel.delete(itemId);
      atLeastOneSelected ||= selectedItems.delete(itemId);
      removeElement(
        parentArray,
        parentArray.findIndex(element => element.id === itemId)
      );
    }
  });

  return {
    atLeastOneElement: atLeastOneElement,
    atLeastOneCheckbox: atLeastOneCheckbox,
    atLeastOneSelected: atLeastOneSelected
  };
};

const resolveNewPromise = <T>(value: T): Promise<T> =>
  new Promise(resolve => resolve(value));

/**
 * Given an item id, it displays and scrolls into the item view.
 *
 * @returns If the operation was completed successfully.
 */
export const scrollIntoVisibleId = (
  path: string,
  flattenedTreeModel: Map<string, TreeViewItemModelExtended>
): Promise<boolean> => {
  const itemUIModel = flattenedTreeModel.get(path);

  if (!itemUIModel) {
    return resolveNewPromise(false);
  }

  let visitedNode = itemUIModel.parentItem as TreeViewItemModel;

  // While the parent is not the root, update the UI Models
  while (visitedNode && visitedNode.id != null) {
    // Expand the item
    visitedNode.expanded = true;

    const visitedNodeUIModel = flattenedTreeModel.get(visitedNode.id);
    visitedNode = visitedNodeUIModel.parentItem as TreeViewItemModel;
  }

  return resolveNewPromise(true);
};

/**
 * Given the path of the item (represent by a sorted array containing all ids
 * from the root to the item), it displays and scrolls into the item view.
 *
 * @returns If the operation was completed successfully.
 */
export const scrollIntoVisiblePath = (
  path: string[],
  flattenedTreeModel: Map<string, TreeViewItemModelExtended>,
  rootNode: TreeViewItemModel,
  lazyLoadTreeItemsCallback: (
    treeItemId: string
  ) => Promise<TreeViewItemModel[]>
): Promise<boolean> => {
  let lastRenderedItemInPath = path.length - 1;

  // Initialize item
  let itemUIModel = flattenedTreeModel.get(path[lastRenderedItemInPath]);

  // Find the last item that is rendered
  while (itemUIModel === undefined && lastRenderedItemInPath > 0) {
    lastRenderedItemInPath--;
    itemUIModel = flattenedTreeModel.get(path[lastRenderedItemInPath]);
  }

  if (!itemUIModel) {
    return resolveNewPromise(false);
  }

  const indexOfLastRenderItem = lastRenderedItemInPath;

  // Check if the rest of the path up to the root is valid
  while (lastRenderedItemInPath >= 0) {
    if (flattenedTreeModel.get(path[lastRenderedItemInPath]) === undefined) {
      return resolveNewPromise(false);
    }

    lastRenderedItemInPath--;
  }

  // Check if the first item in the path is the root, to completely validate
  // the path
  if (flattenedTreeModel.get(path[0]).parentItem !== rootNode) {
    return resolveNewPromise(false);
  }

  // - - - - - - - - - - - - - - - - - -
  // At this point, we now that the path starts from the root and is valid up to
  // the last rendered item
  // - - - - - - - - - - - - - - - - - -
  const canNotLazyLoadRemainingPath =
    indexOfLastRenderItem !== path.length - 1 && !lazyLoadTreeItemsCallback;

  if (canNotLazyLoadRemainingPath) {
    return resolveNewPromise(false);
  }

  // USE RELOAD ITEMS FOR THE NEXT PART

  // let visitedNode = itemUIModel.parentItem as TreeViewItemModel;

  // // While the parent is not the root, update the UI Models
  // while (visitedNode && visitedNode.id != null) {
  //   // Expand the item
  //   visitedNode.expanded = true;

  //   const visitedNodeUIModel = flattenedTreeModel.get(visitedNode.id);
  //   visitedNode = visitedNodeUIModel.parentItem as TreeViewItemModel;
  // }

  return resolveNewPromise(true);
};
