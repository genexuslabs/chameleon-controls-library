import { removeElement } from "../../common/array";
import {
  LayoutSplitterDistributionGroup,
  LayoutSplitterDistributionItem,
  LayoutSplitterDistributionItemExtended,
  LayoutSplitterItemRemoveResult,
  LayoutSplitterRenamedItem
} from "./types";
import {
  getFrValue,
  getPxValue,
  hasAbsoluteValue,
  updateFrSize,
  updateOffsetSize,
  updatePxSize
} from "./utils";

/**
 * [parentArray, indexToRemove, idOfTheItem]
 */
type ItemToRemove = [LayoutSplitterDistributionItem[], number, string];

const findItemInParent = (
  itemToFind: LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionItem>
) => {
  const itemId = itemToFind.item.id;
  return itemToFind.parentItem.items.findIndex(item => item.id === itemId);
};

export const removeItem = (
  itemId: string,
  itemsInfo: Map<
    string,
    LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionItem>
  >
): LayoutSplitterItemRemoveResult => {
  const itemToRemoveUIModel = itemsInfo.get(itemId);

  if (!itemToRemoveUIModel) {
    return { success: false, renamedItems: [] };
  }

  // TODO: Valid whether the parent is the root node or not. If it is the root, update the fixedSizesSum

  const itemsToRemove: ItemToRemove[] = [];

  const itemToRemoveIndex = findItemInParent(itemToRemoveUIModel);
  const parentItem = itemToRemoveUIModel.parentItem;
  const parentItemItems = parentItem.items;

  const itemToAddSpace =
    parentItemItems[itemToRemoveIndex === 0 ? 1 : itemToRemoveIndex - 1];
  const renamedItems: LayoutSplitterRenamedItem[] = [];

  // const itemToAddSpaceUIModel = itemsInfo.get(itemToAddSpace.id);

  // Remove the item in a future iteration
  itemsToRemove.push([parentItemItems, itemToRemoveIndex, itemId]);

  // The space reserved for the item can be given to a sibling item
  if (parentItemItems.length > 2) {
    addSpaceToItem(itemToRemoveUIModel, itemsInfo.get(itemToAddSpace.id));
  }

  // The current group will have one child. Remove the group and and reconnect
  // the child item with the parent of its group
  else if (parentItemItems.length === 2) {
    // TODO: CHECK PARENT ROOT
    const parentItemUIModel = itemsInfo.get(parentItem.id);
    const secondParentItem = parentItemUIModel.parentItem;
    const parentItemIndex = findItemInParent(parentItemUIModel);

    const itemToReplace = secondParentItem.items[
      parentItemIndex
    ] as LayoutSplitterDistributionGroup;

    // Push the item rename
    renamedItems.push({ oldId: itemToAddSpace.id, newId: itemToReplace.id });

    // This property is no longer valid in the new parent
    delete itemToReplace.items;

    // Update all properties in the new parent, except for some specific properties
    Object.keys(itemToAddSpace).forEach(
      (key: keyof LayoutSplitterDistributionItem) => {
        if (
          key !== "id" &&
          key !== "size" &&
          key !== "dragBar" &&
          key !== "fixedOffsetSize"
        ) {
          itemToReplace[key] = itemToAddSpace[key];
        }
      }
    );

    itemsInfo.delete(itemToAddSpace.id);
  } else {
    // Remove the item and its group parent
  }

  // Delete the item and all its descendants...
  // TODO: Add recursive removal

  itemsToRemove.forEach(itemToRemove => {
    removeElement(itemToRemove[0], itemToRemove[1]);
    itemsInfo.delete(itemToRemove[2]);
  });

  return { success: true, renamedItems: renamedItems };
};

function addSpaceToItem(
  itemToSubtractUIModel: LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionItem>,
  itemToAddUIModel: LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionItem>
) {
  console.log(itemToSubtractUIModel, itemToAddUIModel);
  // TODO: Add implementation. Ensure the given space is relative to 100% (1fr)
  // TODO: Remove drag bar Size from fixedSizesSum

  const itemToSubtractInfo = itemToSubtractUIModel.item;
  const itemToAddInfo = itemToAddUIModel.item;

  // px / px
  if (hasAbsoluteValue(itemToSubtractInfo) && hasAbsoluteValue(itemToAddInfo)) {
    // TODO: FixedSizesSum does not make sense when adding pixels. Update implementation to improve this
    updatePxSize(itemToAddUIModel, getPxValue(itemToSubtractInfo));
  }
  // px / fr
  else if (hasAbsoluteValue(itemToSubtractInfo)) {
    // TODO: UPDATE FIXED SIZES SUM IN THE PARENT
    // updateSize(startItemUIModel, incrementInPxRTL, fixedSizes, "px");
    // updateOffsetSize(endItemUIModel, -incrementInPxRTL, fixedSizes);
  }
  // fr / px
  else if (hasAbsoluteValue(itemToAddInfo)) {
    // updateOffsetSize(startItemUIModel, incrementInPxRTL, fixedSizes);
    // updateSize(endItemUIModel, -incrementInPxRTL, fixedSizes, "px");
  }
  // fr / fr
  else {
    // Update fixedOffsetSize if the removed item had
    if (itemToSubtractInfo.fixedOffsetSize != null) {
      updateOffsetSize(
        itemToSubtractUIModel,
        itemToSubtractInfo.fixedOffsetSize
      );
    }

    const newFrSize =
      getFrValue(itemToSubtractInfo) + getFrValue(itemToAddInfo);
    updateFrSize(itemToAddUIModel, newFrSize);
  }
}
