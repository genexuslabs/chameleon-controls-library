import {
  LazyLoadTreeItemsCallback,
  TreeViewItemModel,
  TreeViewItemModelExtended
} from "./types";

export const reloadItems = async (
  elementRef: HTMLChTreeViewRenderElement,
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
): Promise<boolean> => {
  const itemToReloadUIModel = flattenedTreeModel.get(itemId);

  if (
    !lazyLoadTreeItemsCallback ||
    !itemToReloadUIModel ||
    itemToReloadUIModel.item.leaf === true
  ) {
    return false;
  }

  const noProperties = !beforeProperties && !afterProperties;
  if (noProperties) {
    beforeProperties = { downloading: true };
    afterProperties = { downloading: false };
  }

  if (beforeProperties) {
    elementRef.updateItemsProperties([itemId], beforeProperties);
  }

  const newItems = await lazyLoadTreeItemsCallback(itemId);

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
    elementRef.updateItemsProperties([itemId], afterProperties);
  }

  // Reload child items that were lazy loaded
  await Promise.allSettled(
    reloadNewItemsQueue.map(itemToReload =>
      reloadItems(
        elementRef,
        itemToReload,
        flattenedTreeModel,
        lazyLoadTreeItemsCallback,
        loadLazyContent,
        removeItems
      )
    )
  );

  return true;
};
