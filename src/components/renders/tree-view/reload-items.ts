import { forceUpdate } from "@stencil/core";
import { TreeViewItemModel } from "../../tree-view/tree-view/types";
import { LazyLoadTreeItemsCallback, TreeViewItemModelExtended } from "./types";
import { updateItemProperty } from "./update-item-property";

export const reloadItems = (
  classRef: any,
  itemId: string,
  flattenedTreeModel: Map<string, TreeViewItemModelExtended>,
  lazyLoadTreeItemsCallback: LazyLoadTreeItemsCallback,
  loadLazyContent: (itemId: string, items?: TreeViewItemModel[]) => void,
  beforeProperties?: Partial<TreeViewItemModel>,
  afterProperties?: Partial<TreeViewItemModel>
) => {
  if (!lazyLoadTreeItemsCallback || !flattenedTreeModel.has(itemId)) {
    return;
  }

  const noProperties = !beforeProperties && !afterProperties;
  if (noProperties) {
    beforeProperties = { downloading: true };
    afterProperties = { downloading: false };
  }

  // TODO: Further investigate whether this function must do a diffing to know
  // which items are removed, so we remove them from the flattenedTreeModel

  if (beforeProperties) {
    updateItemProperty(itemId, beforeProperties, flattenedTreeModel);
    forceUpdate(classRef);
  }

  const promise = lazyLoadTreeItemsCallback(itemId);

  promise.then(result => {
    loadLazyContent(itemId, result);

    if (afterProperties) {
      updateItemProperty(itemId, afterProperties, flattenedTreeModel);
    }
  });
};
