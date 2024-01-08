import { removeElement } from "../../common/array";
import {
  LayoutSplitterDistributionGroup,
  LayoutSplitterDistributionItem,
  LayoutSplitterDistributionItemExtended
} from "./types";
import {
  getFrSize,
  getPxSize,
  hasAbsoluteValue,
  updateOffsetSize,
  updateSize
} from "./utils";

/**
 * [parentArray, indexToRemove, idOfTheItem]
 */
type ItemToRemove = [LayoutSplitterDistributionItem[], number, string];

export const removeItem = (
  itemId: string,
  itemsInfo: Map<
    string,
    LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionItem>
  >
): boolean => {
  const itemToRemoveUIModel = itemsInfo.get(itemId);

  if (!itemToRemoveUIModel) {
    return false;
  }

  // TODO: Valid whether the parent is the root node or not. If it is the root, update the fixedSizesSum

  const itemsToRemove: ItemToRemove[] = [];

  const itemIndex = itemToRemoveUIModel.index;
  const parentItem = itemToRemoveUIModel.parentItem;
  const parentItemItems = parentItem.items;
  const itemToAddSpace = parentItemItems[itemIndex === 0 ? 1 : itemIndex - 1];

  // Remove the item in a future iteration
  itemsToRemove.push([parentItemItems, itemIndex, itemId]);

  // The space reserved for the item can be given to a sibling item
  if (parentItemItems.length > 2) {
    addSpaceToItem(
      itemToRemoveUIModel,
      itemsInfo.get(itemToAddSpace.id),
      itemsInfo
    );
  }

  // The current group will have one child. Remove the group and and reconnect
  // the child item with the parent of its group
  else if (parentItemItems.length === 2) {
    // TODO: CHECK PARENT ROOT
    // const parentItemUIModel = itemsInfo.get(parentItem.id);
    // const parentItemIndex = parentItemUIModel.index;
    // const secondParentItem = parentItemUIModel.parentItem;
    // itemsInfo.delete(parentItem.id);
    // secondParentItem.items[parentItemIndex] = itemToAddSpace;
    // TODO: Add implementation
  } else {
    // Remove the item and its group parent
  }

  // Delete the item and all its descendants...
  // TODO: Add recursive removal

  itemsToRemove.forEach(itemToRemove => {
    removeElement(itemToRemove[0], itemToRemove[1]);
    itemsInfo.delete(itemToRemove[2]);
  });

  return true;
};

function addSpaceToItem(
  itemToSubtractUIModel: LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionItem>,
  itemToAddUIModel: LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionItem>,
  itemsInfo: Map<
    string,
    LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionItem>
  >
) {
  console.log(itemToSubtractUIModel, itemToAddUIModel);
  // TODO: Add implementation. Ensure the given space is relative to 100% (1fr)
  // TODO: Remove drag bar Size from fixedSizesSum

  const itemToSubtractInfo = itemToSubtractUIModel.item;
  const itemToAddInfo = itemToAddUIModel.item;

  // px / px
  if (hasAbsoluteValue(itemToSubtractInfo) && hasAbsoluteValue(itemToAddInfo)) {
    // TODO: FixedSizesSum does not make sense when adding pixels. Update implementation to improve this
    updateSize(itemToAddUIModel, getPxSize(itemToSubtractInfo), 0, "px");
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
    // TODO: Check if the node is the root
    const fixedSizesSum = (
      itemsInfo.get(
        itemToSubtractUIModel.parentItem.id
      ) as LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionGroup>
    ).fixedSizesSum;

    // Update fixedOffsetSize if the removed item had
    if (itemToSubtractInfo.fixedOffsetSize != null) {
      updateOffsetSize(
        itemToSubtractUIModel,
        itemToSubtractInfo.fixedOffsetSize,
        fixedSizesSum
      );
    }

    const newFrSize = getFrSize(itemToSubtractInfo) + getFrSize(itemToAddInfo);

    // TODO: In some situations, this should be avoided (fixedSizesSum). Find a way to remove the use of fixedSizesSum
    updateSize(itemToAddUIModel, newFrSize, fixedSizesSum, "fr");
  }
}
