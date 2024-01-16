import { removeElement } from "../../common/array";
import {
  GroupExtended,
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
  incrementOffsetSize,
  updatePxSize,
  findItemInParent
} from "./utils";

/**
 * [parentArray, indexToRemove, idOfTheItem]
 */
type ItemToRemove = [LayoutSplitterDistributionItem[], number, string];

export const NO_FIXED_SIZES_TO_UPDATE = 0;

export const removeItem = (
  itemId: string,
  itemsInfo: Map<
    string,
    LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionItem>
  >
): LayoutSplitterItemRemoveResult => {
  const itemToRemoveUIModel = itemsInfo.get(itemId);
  let fixedSizesSumDecrement: number = NO_FIXED_SIZES_TO_UPDATE;

  if (!itemToRemoveUIModel) {
    return {
      success: false,
      renamedItems: [],
      fixedSizesSumDecrement: fixedSizesSumDecrement
    };
  }

  // TODO: Valid whether the parent is the root node or not. If it is the root, update the fixedSizesSum

  const itemsToRemove: ItemToRemove[] = [];

  const itemToRemoveIndex = findItemInParent(itemToRemoveUIModel);
  const parentItem = itemToRemoveUIModel.parentItem;
  const parentItemItems = parentItem.items;

  const itemToAddSpaceIndex =
    itemToRemoveIndex === 0 ? 1 : itemToRemoveIndex - 1;
  const itemToAddSpace = parentItemItems[itemToAddSpaceIndex];
  const renamedItems: LayoutSplitterRenamedItem[] = [];

  // const itemToAddSpaceUIModel = itemsInfo.get(itemToAddSpace.id);

  // Queue to remove the item in a future iteration
  itemsToRemove.push([parentItemItems, itemToRemoveIndex, itemId]);

  // The space reserved for the item can be given to a sibling item
  if (parentItemItems.length > 2) {
    fixedSizesSumDecrement = addSpaceToItemAndGetNewFixesSizes(
      itemToRemoveUIModel,
      itemsInfo.get(itemToAddSpace.id),
      itemToAddSpaceIndex < itemToRemoveIndex
    );

    // TODO: CHECK WHAT HAPPENS WITH THE DRAG BAR SIZE OF THE REMOVED ITEM IN THE fixedSizesSumDecrement <----------------
  }

  // The current group will have one child. Remove the group and and reconnect
  // the child item with the parent of its group
  else if (parentItemItems.length === 2) {
    // - - - - - - - - - - - - - - - - - - - - - - - - -
    // INPUT MODEL:
    //                     secondParentItem
    //                            / \
    //                         /       \
    //                      /             \
    //            (Id x) parentItem   Other items...
    //                     / \
    //                  /       \
    //               /             \
    //  (Id y) itemToRemove   (Id z) itemToAddSpace
    //
    //
    // OUTPUT MODEL:
    //                secondParentItem
    //                       / \
    //                    /       \
    //                 /             \
    //  (Id x) itemToAddSpace    Other items...
    // - - - - - - - - - - - - - - - - - - - - - - - - -

    // TODO: CHECK PARENT ROOT <-----------------------------------------------------
    const parentItemUIModel = itemsInfo.get(parentItem.id) as GroupExtended;
    const itemToAddSpaceUIModel = itemsInfo.get(
      itemToAddSpace.id
    ) as GroupExtended;

    // Push the item rename
    renamedItems.push({
      oldId: itemToAddSpace.id,
      newId: parentItem.id
    });

    // Update the fixedSizesSum even if it does not exists in the "itemToAddSpace"
    parentItemUIModel.fixedSizesSum = itemToAddSpaceUIModel.fixedSizesSum;

    // This property is no longer valid in the new parent
    delete parentItem.items;

    // Update all properties in the new parent, except for some specific properties
    Object.keys(itemToAddSpace).forEach(
      (key: keyof LayoutSplitterDistributionItem) => {
        if (
          key !== "id" &&
          key !== "size" &&
          key !== "dragBar" &&
          key !== "fixedOffsetSize"
        ) {
          parentItem[key] = itemToAddSpace[key];
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

  // TODO: Remove the dragBar parts that no longer apply???? <----------------------

  return {
    success: true,
    renamedItems: renamedItems,
    fixedSizesSumDecrement: fixedSizesSumDecrement
  };
};

function addSpaceToItemAndGetNewFixesSizes(
  itemToSubtractUIModel: LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionItem>,
  itemToAddUIModel: LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionItem>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _itemToAddSpaceIsBefore: boolean
): number {
  // TODO: Add implementation. Ensure the given space is relative to 100% (1fr)
  // TODO: Remove drag bar Size from fixedSizesSum

  const itemToSubtractInfo = itemToSubtractUIModel.item;
  const itemToAddInfo = itemToAddUIModel.item;

  // px / px
  if (hasAbsoluteValue(itemToSubtractInfo) && hasAbsoluteValue(itemToAddInfo)) {
    updatePxSize(itemToAddUIModel, getPxValue(itemToSubtractInfo));
    return NO_FIXED_SIZES_TO_UPDATE;
  }

  // itemToSubtract ----> px / itemToAdd ---> fr
  if (hasAbsoluteValue(itemToSubtractInfo)) {
    const pxValue = getPxValue(itemToSubtractInfo);
    let fixedSizesSumDecrement = pxValue;

    const itemToAddSpaceOffsetSize = itemToAddInfo.fixedOffsetSize;

    // It means we must reset the fixedOffsetSize value, since it could be set
    // by any resize that has occurred
    if (itemToAddSpaceOffsetSize != null) {
      // Remove the space that the resize introduced
      fixedSizesSumDecrement += itemToAddSpaceOffsetSize;

      incrementOffsetSize(itemToAddUIModel, -itemToAddSpaceOffsetSize);
    }

    return fixedSizesSumDecrement;
  }

  // itemToSubtract ----> fr / itemToAdd ---> px
  if (hasAbsoluteValue(itemToAddInfo)) {
    // updateOffsetSize(startItemUIModel, incrementInPxRTL, fixedSizes);
    // updateSize(endItemUIModel, -incrementInPxRTL, fixedSizes, "px");

    // const pxValue = getPxValue(itemToSubtractInfo);
    // let fixedSizesSumDecrement = pxValue;

    // // It means we must reset the fixedOffsetSize value, since it could be set
    // // by any resize that has occurred
    // if (itemToAddSpaceIsBefore) {
    //   fixedSizesSumDecrement -= itemToAddInfo.fixedOffsetSize ?? 0;

    //   updateOffsetSize(itemToAddUIModel, 0);
    // }

    return NO_FIXED_SIZES_TO_UPDATE;
  }
  // fr / fr

  // Update fixedOffsetSize if the removed item had
  if (itemToSubtractInfo.fixedOffsetSize != null) {
    incrementOffsetSize(
      itemToSubtractUIModel,
      itemToSubtractInfo.fixedOffsetSize
    );
  }

  const newFrSize = getFrValue(itemToSubtractInfo) + getFrValue(itemToAddInfo);
  updateFrSize(itemToAddUIModel, newFrSize);

  return NO_FIXED_SIZES_TO_UPDATE;
}
