import { insertIntoIndex } from "../../common/array";
import {
  GroupExtended,
  ItemExtended,
  LayoutSplitterDistributionLeaf,
  LayoutSplitterItemAddResult,
  LeafExtended
} from "./types";
import {
  findItemInParent,
  getFrValue,
  getPxValue,
  hasAbsoluteValue,
  setFrSize,
  setOffsetSize,
  setPxSize
} from "./utils";

/**
 *
 * @param parentGroup
 * @param siblingItem
 * @param placedInTheSibling
 * @param leafInfo
 * @param itemsInfo
 * @param takeHalfTheSpaceOfTheSiblingItem
 *   When `true` the `fixedOffsetSize` and size member of the leaf will be
 *   ignored. Those members will be deduced from the sibling item as the half
 *   value of each one.
 * @returns
 */
export const addSiblingLeaf = (
  parentGroup: string,
  siblingItem: string,
  placedInTheSibling: "before" | "after",
  leafInfo: LayoutSplitterDistributionLeaf,
  itemsInfo: Map<string, ItemExtended>,
  takeHalfTheSpaceOfTheSiblingItem: boolean
): LayoutSplitterItemAddResult => {
  // TODO: Add support for adding in the root node <----------------------

  const parentGroupUIModel = itemsInfo.get(parentGroup) as
    | GroupExtended
    | undefined;
  if (!parentGroupUIModel) {
    return { success: false };
  }

  const siblingItemUIModel = itemsInfo.get(siblingItem);
  if (!siblingItemUIModel) {
    return { success: false };
  }

  // Get the index of the leaf
  const siblingIndex = findItemInParent(siblingItemUIModel);
  const leafIndex =
    placedInTheSibling === "before"
      ? Math.max(0, siblingIndex - 1)
      : siblingIndex + 1;

  const parentGroupItems = parentGroupUIModel.item.items;

  // Set the leaf index. Last index case
  if (leafIndex === parentGroupItems.length) {
    parentGroupItems.push(leafInfo);
  }
  // 0 <= leafIndex < totalItems
  else {
    insertIntoIndex(parentGroupItems, leafInfo, leafIndex);
  }

  const leafUIModel: LeafExtended = {
    item: leafInfo,
    parentItem: parentGroupUIModel.item,
    actualSize: undefined
  };

  // Update the size of the leaf and its sibling. Each one will have half of
  // the sibling size
  if (takeHalfTheSpaceOfTheSiblingItem) {
    const siblingHasAbsoluteValue = hasAbsoluteValue(siblingItemUIModel.item);

    const siblingHalfSize =
      (siblingHasAbsoluteValue
        ? getPxValue(siblingItemUIModel.item)
        : getFrValue(siblingItemUIModel.item)) / 2;

    // Absolute value. Update the size member
    if (siblingHasAbsoluteValue) {
      setPxSize(leafUIModel, siblingHalfSize);
      setPxSize(siblingItemUIModel, siblingHalfSize);
    }
    // Relative value. Update the size and fixedOffsetSize members
    else {
      const siblingFixedOffsetSize = siblingItemUIModel.item.fixedOffsetSize;

      // Set the fixedOffsetSize if the sibling has
      if (siblingFixedOffsetSize) {
        setOffsetSize(leafUIModel, siblingFixedOffsetSize / 2);
        setOffsetSize(siblingItemUIModel, siblingFixedOffsetSize / 2);
      }

      setFrSize(leafUIModel, siblingHalfSize);
      setFrSize(siblingItemUIModel, siblingHalfSize);
    }
  }

  // TODO: Emit the new dragBar parts <----------------------

  // Add the leaf to the itemsInfo Map
  itemsInfo.set(leafInfo.id, leafUIModel);

  return { success: true, fixedSizesSumIncrement: leafInfo.dragBar?.size };
};
