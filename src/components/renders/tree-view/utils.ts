import { forceUpdate } from "@stencil/core";
import { removeElement } from "../../../common/array";
import {
  TreeViewItemModel,
  TreeViewItemModelExtended,
  TreeViewRemoveItemsResult
} from "./types";

export const INITIAL_LEVEL = 0;

// Parts
export const EVEN_LEVEL = "even-level";
export const ODD_LEVEL = "odd-level";

export const getTreeItemLevelPart = (evenLevel: boolean) =>
  evenLevel ? EVEN_LEVEL : ODD_LEVEL;

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
export const scrollIntoVisiblePath = async (
  elementRef: HTMLChTreeViewRenderElement,
  path: string[],
  flattenedTreeModel: Map<string, TreeViewItemModelExtended>,
  rootNode: TreeViewItemModel,
  lazyLoadTreeItemsCallback: (
    treeItemId: string
  ) => Promise<TreeViewItemModel[]>
): Promise<boolean> => {
  const pathHasRepeatedElements = new Set(path).size !== path.length;

  if (pathHasRepeatedElements) {
    return false;
  }

  const indexOfLastItemInPath = path.length - 1;
  let lastRenderedItemInPath = indexOfLastItemInPath;

  // Start from the last item in the path
  let itemUIModel = flattenedTreeModel.get(path[lastRenderedItemInPath]);

  // Find the last item that is rendered
  while (itemUIModel === undefined && lastRenderedItemInPath > 0) {
    lastRenderedItemInPath--;
    itemUIModel = flattenedTreeModel.get(path[lastRenderedItemInPath]);
  }

  if (!itemUIModel) {
    return false;
  }

  const indexOfLastRenderItem = lastRenderedItemInPath;

  // At this point, we have the index of the last render item. We must check if
  // the rest of the path up to the root is valid
  while (lastRenderedItemInPath >= 0) {
    if (flattenedTreeModel.get(path[lastRenderedItemInPath]) === undefined) {
      return false;
    }

    lastRenderedItemInPath--;
  }

  // Check if the first item in the path is the root, to completely validate
  // the path
  if (flattenedTreeModel.get(path[0]).parentItem !== rootNode) {
    return false;
  }

  // - - - - - - - - - - - - - - - - - -
  // At this point, we now that the path starts from the root and is valid up to
  // the last rendered item
  // root, node1, node2, ..., indexOfLastRenderItem, unloadedNode1, unloadedNode2, ..., nodeToScrollIntoVisible
  // - - - - - - - - - - - - - - - - - -
  const thereAreMoreItemsToLazyLoad =
    indexOfLastRenderItem !== indexOfLastItemInPath;
  const canNotLazyLoadRemainingPath =
    thereAreMoreItemsToLazyLoad && !lazyLoadTreeItemsCallback;

  if (canNotLazyLoadRemainingPath) {
    return false;
  }

  // Expand all parent items
  let parentUIModel = flattenedTreeModel.get(
    path[indexOfLastRenderItem]
  ).parentItem;

  while (parentUIModel !== rootNode) {
    parentUIModel.expanded = true;
    parentUIModel = flattenedTreeModel.get(parentUIModel.id).parentItem;
  }

  forceUpdate(elementRef);

  // Load the remaining path (unloadedNode1, unloadedNode2, ..., nodeToScrollIntoVisible),
  // checking in each step if the next item to lazy load exists
  let nextIndexToLazyLoad = indexOfLastRenderItem;

  // The reloaded processing will end in the parent of the last item
  while (nextIndexToLazyLoad < indexOfLastItemInPath) {
    const itemId = path[nextIndexToLazyLoad];

    const itemUIModel = flattenedTreeModel.get(itemId);

    // Check if the rest of the path up to the last item is valid, if not,
    // cancel the scrollIntoVisible operation
    if (!itemUIModel) {
      return false;
    }

    const itemInfo = itemUIModel.item;

    // The remaining path is invalid, because there is an item that isn't a folder
    if (itemInfo.leaf === true) {
      return false;
    }

    // Expand the parent and set the downloading state
    itemInfo.downloading = true;
    itemInfo.expanded = true;
    itemInfo.lazy = false;
    forceUpdate(elementRef);

    const result = await lazyLoadTreeItemsCallback(itemId);
    await elementRef.loadLazyContent(itemId, result);

    nextIndexToLazyLoad++;
  }

  return true;
};
