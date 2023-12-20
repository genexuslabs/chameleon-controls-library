import { forceUpdate } from "@stencil/core";
import { TreeViewItemModel } from "../../tree-view/tree-view/types";
import { LazyLoadTreeItemsCallback, TreeViewItemModelExtended } from "./types";
import { updateItemProperty } from "./update-item-property";

export const reloadItems = (
  classRef: any,
  itemId: string,
  flattenedTreeModel: Map<string, TreeViewItemModelExtended>,
  lazyLoadTreeItemsCallback: LazyLoadTreeItemsCallback,
  loadLazyContent: (
    itemId: string,
    items?: TreeViewItemModel[]
  ) => Promise<void>,
  removeItems: (items: string[]) => void,
  beforeProperties?: Partial<TreeViewItemModel>,
  afterProperties?: Partial<TreeViewItemModel>
) => {
  const itemToReloadUIModel = flattenedTreeModel.get(itemId);

  if (
    !lazyLoadTreeItemsCallback ||
    !itemToReloadUIModel ||
    itemToReloadUIModel.item.leaf === true
  ) {
    return;
  }

  const noProperties = !beforeProperties && !afterProperties;
  if (noProperties) {
    beforeProperties = { downloading: true };
    afterProperties = { downloading: false };
  }

  if (beforeProperties) {
    updateItemProperty(itemId, beforeProperties, flattenedTreeModel);
    forceUpdate(classRef);
  }

  const promise = lazyLoadTreeItemsCallback(itemId);

  promise.then(async newItems => {
    // Store previous ids in a Set for efficient access
    const oldItemsSet = new Set(
      itemToReloadUIModel.item.items.map(item => item.id)
    );

    const reloadNewItemsQueue: string[] = [];

    // Reconcile the state of old items to new ones
    newItems.forEach(newItem => {
      const newItemOldUIModel = flattenedTreeModel.get(newItem.id);

      // If the item previously existed in the client
      if (newItemOldUIModel && oldItemsSet.has(newItem.id)) {
        const newItemOldInfo = newItemOldUIModel.item;

        // Reconciliate the state
        newItem.checked = newItemOldInfo.checked;
        newItem.expanded = newItemOldInfo.expanded;
        newItem.indeterminate = newItemOldInfo.indeterminate;
        newItem.selected = newItemOldInfo.selected;

        const newItemWasLazyLoaded =
          newItem.lazy && newItemOldInfo.lazy === false;

        if (newItemWasLazyLoaded) {
          newItem.lazy = false;

          // Don't remove items until the child item is reloaded
          newItem.items = newItemOldInfo.items;

          // Add the item to be reloaded after its parent has finished its reload
          reloadNewItemsQueue.push(newItem.id);
        }

        // Remove the item from the set to properly count items that no longer
        // exist in the node
        oldItemsSet.delete(newItem.id);
      }
    });

    // Remove all the items that no longer exists in the node
    if (oldItemsSet.size > 0) {
      removeItems([...oldItemsSet.keys()]);
    }

    // Update the items of the reloaded node
    await loadLazyContent(itemId, newItems);

    if (afterProperties) {
      updateItemProperty(itemId, afterProperties, flattenedTreeModel);
    }

    // Reload child items that were lazy loaded
    reloadNewItemsQueue.forEach(itemToReload =>
      reloadItems(
        classRef,
        itemToReload,
        flattenedTreeModel,
        lazyLoadTreeItemsCallback,
        loadLazyContent,
        removeItems
      )
    );
  });
};