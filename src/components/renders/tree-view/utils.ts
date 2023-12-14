import { removeElement } from "../../../common/array";
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
