import { ROOT_VIEW } from "../../common/utils";
import {
  DragBarMouseDownEventInfo,
  GroupExtended,
  ItemExtended,
  LayoutSplitterDistribution,
  LayoutSplitterDistributionGroup,
  LayoutSplitterDistributionItem,
  LayoutSplitterSize
} from "./types";

export const FIXED_SIZES_SUM_CUSTOM_VAR =
  "--ch-layout-splitter-fixed-sizes-sum";

export const findItemInParent = (itemToFind: ItemExtended) => {
  const itemId = itemToFind.item.id;
  return itemToFind.parentItem.items.findIndex(item => item.id === itemId);
};

export const getFrValue = (item: LayoutSplitterDistributionItem): number =>
  Number(item.size.replace("fr", "").trim());

export const getPxValue = (
  item: LayoutSplitterDistributionItem,
  type: "size" | "min" = "size"
): number => {
  const value = type === "size" ? item.size : item.minSize;
  return Number(value.replace("px", "").trim());
};

export const hasAbsoluteValue = (item: LayoutSplitterDistributionItem) =>
  item.size.includes("px");

export const hasMinSize = (item: LayoutSplitterDistributionItem) =>
  item.minSize && item.minSize !== "0px";

const getItemMinMaxSizeInTemplate = (itemUIModel: ItemExtended) =>
  !hasAbsoluteValue(itemUIModel.item) && hasMinSize(itemUIModel.item)
    ? `minmax(${itemUIModel.item.minSize},${itemUIModel.actualSize})`
    : itemUIModel.actualSize;

export const sizesToGridTemplate = (
  items: LayoutSplitterDistributionItem[],
  itemsInfo: Map<string, ItemExtended>,
  lastItemIndex: number
) =>
  items
    .map(
      (item, index) =>
        item.dragBar?.hidden !== true && index !== lastItemIndex
          ? `${getItemMinMaxSizeInTemplate(itemsInfo.get(item.id))} ${
              item.dragBar?.size ?? 0
            }px` // Add a column to place the drag bar
          : getItemMinMaxSizeInTemplate(itemsInfo.get(item.id)) // Last item or not resizable
    )
    .join(" ");

const getItemFrSize = (item: LayoutSplitterDistributionItem): string => {
  // If the component has fr value, take into account the sum of fixed values
  // to calculate the actual relative value
  const frValue = getFrValue(item);
  const frString = `${frValue * 100}%`;

  return item.fixedOffsetSize
    ? `calc(${frString} + var(${FIXED_SIZES_SUM_CUSTOM_VAR}) * ${-frValue} + ${
        item.fixedOffsetSize
      }px)`
    : `calc(${frString} + var(${FIXED_SIZES_SUM_CUSTOM_VAR}) * ${-frValue})`;
};

const getComponentSize = (item: LayoutSplitterDistributionItem): string =>
  hasAbsoluteValue(item) // Pixel value
    ? item.size
    : getItemFrSize(item);

export const setPxSize = (itemUIModel: ItemExtended, newValue: number) => {
  const newValueString: LayoutSplitterSize = `${newValue}px`;

  itemUIModel.item.size = newValueString;
  itemUIModel.actualSize = newValueString;
};

export const updatePxSize = (itemUIModel: ItemExtended, increment: number) =>
  setPxSize(itemUIModel, getPxValue(itemUIModel.item) + increment);

export const setFrSize = (itemUIModel: ItemExtended, newValue: number) => {
  const newValueString: LayoutSplitterSize = `${newValue}fr`;

  itemUIModel.item.size = newValueString;
  itemUIModel.actualSize = getItemFrSize(itemUIModel.item);
};

export const updateFrSize = (itemUIModel: ItemExtended, increment: number) =>
  setFrSize(itemUIModel, getFrValue(itemUIModel.item) + increment);

export const setOffsetSize = (itemUIModel: ItemExtended, newValue: number) => {
  const itemInfo = itemUIModel.item;

  itemInfo.fixedOffsetSize = newValue;
  itemUIModel.actualSize = getComponentSize(itemInfo);
};

export const incrementOffsetSize = (
  itemUIModel: ItemExtended,
  increment: number
) =>
  setOffsetSize(
    itemUIModel,
    increment + (itemUIModel.item.fixedOffsetSize ?? 0)
  );

/**
 * If the item has `minSize` and its greater that the `size` value, it updates
 * the `size` to be equal to the `minSize`.
 */
const checkAndSetInitialValue = (item: LayoutSplitterDistributionItem) => {
  if (hasMinSize(item) && getPxValue(item) < getPxValue(item, "min")) {
    item.size = item.minSize;
  }
};

export const fixAndUpdateLayoutModel = (
  layout: LayoutSplitterDistribution,
  itemsInfo: Map<string, ItemExtended>
): number => fixAndUpdateSubModel(layout.items, itemsInfo, ROOT_VIEW);

function fixAndUpdateSubModel(
  items: LayoutSplitterDistributionItem[],
  itemsInfo: Map<string, ItemExtended>,
  parentItem: LayoutSplitterDistributionGroup
): number {
  let frSum = 0;
  let fixedSizesSum = 0;

  const lastItemIndex = items.length - 1;

  // Get the sum of all fr values. Also, store the sum of fixed sizes
  items.forEach((item, index) => {
    if (hasAbsoluteValue(item)) {
      checkAndSetInitialValue(item);

      fixedSizesSum += getPxValue(item);
    } else {
      frSum += getFrValue(item);
    }

    // Take into account previous resizes (fixedOffsetSize values) and add drag
    // bar sizes if this is not the last item
    fixedSizesSum +=
      (item.fixedOffsetSize ?? 0) +
      (index !== lastItemIndex ? item.dragBar?.size ?? 0 : 0);
  });

  // If there are fr values, we must adjust the frs values to be relative to 1fr
  if (frSum > 0) {
    items.forEach(item => {
      if (!hasAbsoluteValue(item)) {
        const frValue = getFrValue(item);
        const adjustedFrValue = frValue / frSum;

        item.size = `${adjustedFrValue}fr`;
      }
    });
  }

  // Update the actualSizes and fixedSizes maps
  items.forEach(item => {
    const itemUIModel: ItemExtended = {
      item: item,
      parentItem: parentItem,
      actualSize: getComponentSize(item)
    };

    if ((item as LayoutSplitterDistributionGroup).items != null) {
      // eslint-disable-next-line prettier/prettier
      const group = item as LayoutSplitterDistributionGroup;
      const fixedSizesSum = fixAndUpdateSubModel(group.items, itemsInfo, group);

      (itemUIModel as GroupExtended).fixedSizesSum = fixedSizesSum;
    }

    itemsInfo.set(item.id, itemUIModel);
  });

  return fixedSizesSum;
}

export const updateComponentsAndDragBar = (
  info: DragBarMouseDownEventInfo,
  itemsInfo: Map<string, ItemExtended>,
  incrementInPx: number,
  gridTemplateDirectionCustomVar: string
) => {
  // - - - - - - - - - Increments - - - - - - - - -
  // When the language is RTL, the increment is in the opposite direction
  const incrementInPxRTL =
    info.direction === "columns" && info.RTL ? -incrementInPx : incrementInPx;

  // Components at each position of the drag bar
  const startItemUIModel = itemsInfo.get(info.itemStartId);
  const endItemUIModel = itemsInfo.get(info.itemEndId);

  const fixedSizesSumParent =
    startItemUIModel.parentItem === ROOT_VIEW
      ? info.fixedSizesSumRoot
      : (itemsInfo.get(startItemUIModel.parentItem.id) as GroupExtended)
          .fixedSizesSum;

  const layoutItems = info.layoutItems;

  const remainingRelativeSizeInPixels =
    info.containerSize - fixedSizesSumParent;
  const incrementInFr = incrementInPxRTL / remainingRelativeSizeInPixels;

  // px / px
  if (
    hasAbsoluteValue(startItemUIModel.item) &&
    hasAbsoluteValue(endItemUIModel.item)
  ) {
    updatePxSize(startItemUIModel, incrementInPxRTL);
    updatePxSize(endItemUIModel, -incrementInPxRTL);
  }
  // px / fr
  else if (hasAbsoluteValue(startItemUIModel.item)) {
    updatePxSize(startItemUIModel, incrementInPxRTL);
    incrementOffsetSize(endItemUIModel, -incrementInPxRTL);
  }
  // fr / px
  else if (hasAbsoluteValue(endItemUIModel.item)) {
    incrementOffsetSize(startItemUIModel, incrementInPxRTL);
    updatePxSize(endItemUIModel, -incrementInPxRTL);
  }
  // fr / fr
  else {
    updateFrSize(startItemUIModel, incrementInFr);
    updateFrSize(endItemUIModel, -incrementInFr);
  }

  // Update in the DOM the grid distribution
  info.container.style.setProperty(
    gridTemplateDirectionCustomVar,
    sizesToGridTemplate(layoutItems, itemsInfo, layoutItems.length - 1)
  );

  // Update the current value in the drag bar
  info.dragBarContainer.ariaValueText = startItemUIModel.actualSize;
};

export const getMousePosition = (
  event: MouseEvent,
  direction: "columns" | "rows"
) => (direction === "columns" ? event.clientX : event.clientY);
