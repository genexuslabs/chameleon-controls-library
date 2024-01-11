import { ROOT_VIEW } from "../renders/flexible-layout/utils";
import {
  DragBarMouseDownEventInfo,
  LayoutSplitterDistribution,
  LayoutSplitterDistributionGroup,
  LayoutSplitterDistributionItem,
  LayoutSplitterDistributionItemExtended,
  LayoutSplitterSize
} from "./types";

export const FIXED_SIZES_SUM_CUSTOM_VAR =
  "--ch-layout-splitter-fixed-sizes-sum";

export const sizesToGridTemplate = (
  items: LayoutSplitterDistributionItem[],
  itemsInfo: Map<
    string,
    LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionItem>
  >,
  lastItemIndex: number
) =>
  items
    .map(
      (item, index) =>
        item.dragBar?.hidden !== true && index !== lastItemIndex
          ? `${itemsInfo.get(item.id).actualSize} ${item.dragBar?.size ?? 0}px` // Add a column to place the drag bar
          : itemsInfo.get(item.id).actualSize // Last item or not resizable
    )
    .join(" ");

export const getFrValue = (item: LayoutSplitterDistributionItem): number =>
  Number(item.size.replace("fr", "").trim());

export const getPxValue = (item: LayoutSplitterDistributionItem): number =>
  Number(item.size.replace("px", "").trim());

export const hasAbsoluteValue = (item: LayoutSplitterDistributionItem) =>
  item.size.includes("px");

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

export const updatePxSize = (
  itemUIModel: LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionItem>,
  increment: number
) => {
  const itemInfo = itemUIModel.item;
  const newValue: LayoutSplitterSize = `${getPxValue(itemInfo) + increment}px`;

  itemInfo.size = newValue;
  itemUIModel.actualSize = newValue;
};

export const updateFrSize = (
  itemUIModel: LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionItem>,
  increment: number
) => {
  const itemInfo = itemUIModel.item;
  const newValue: LayoutSplitterSize = `${getFrValue(itemInfo) + increment}fr`;

  itemInfo.size = newValue;
  itemUIModel.actualSize = getItemFrSize(itemInfo);
};

export const updateOffsetSize = (
  itemUIModel: LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionItem>,
  increment: number
) => {
  const itemInfo = itemUIModel.item;

  itemInfo.fixedOffsetSize ??= 0;
  itemInfo.fixedOffsetSize += increment;
  itemUIModel.actualSize = getComponentSize(itemInfo);
};

export const fixAndUpdateLayoutModel = (
  layout: LayoutSplitterDistribution,
  itemsInfo: Map<
    string,
    LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionItem>
  >
): number => fixAndUpdateSubModel(layout.items, itemsInfo, ROOT_VIEW);

function fixAndUpdateSubModel(
  items: LayoutSplitterDistributionItem[],
  itemsInfo: Map<
    string,
    LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionItem>
  >,
  parentItem: LayoutSplitterDistributionGroup
): number {
  let frSum = 0;
  let fixedSizesSum = 0;

  const lastItemIndex = items.length - 1;

  // Get the sum of all fr values. Also, store the sum of fixed sizes
  items.forEach((item, index) => {
    if (hasAbsoluteValue(item)) {
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
    const itemUIModel: LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionItem> =
      {
        item: item,
        parentItem: parentItem,
        actualSize: getComponentSize(item)
      };

    if ((item as LayoutSplitterDistributionGroup).items != null) {
      // eslint-disable-next-line prettier/prettier
      const group = item as LayoutSplitterDistributionGroup;
      const fixedSizesSum = fixAndUpdateSubModel(group.items, itemsInfo, group);

      (
        itemUIModel as LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionGroup>
      ).fixedSizesSum = fixedSizesSum;
    }

    itemsInfo.set(item.id, itemUIModel);
  });

  return fixedSizesSum;
}

export const updateComponentsAndDragBar = (
  info: DragBarMouseDownEventInfo,
  itemsInfo: Map<
    string,
    LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionItem>
  >,
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
      : (
          itemsInfo.get(
            startItemUIModel.parentItem.id
          ) as LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionGroup>
        ).fixedSizesSum;

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
    updateOffsetSize(endItemUIModel, -incrementInPxRTL);
  }
  // fr / px
  else if (hasAbsoluteValue(endItemUIModel.item)) {
    updateOffsetSize(startItemUIModel, incrementInPxRTL);
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
};

export const getMousePosition = (
  event: MouseEvent,
  direction: "columns" | "rows"
) => (direction === "columns" ? event.clientX : event.clientY);
