import {
  DragBarMouseDownEventInfo,
  LayoutSplitterDistribution,
  LayoutSplitterModel,
  LayoutSplitterModelItem,
  LayoutSplitterModelGroup
} from "./types";

export const sizesToGridTemplate = (items: LayoutSplitterModelItem[]) =>
  items.map(item => item.actualSize).join(" ");

const getComponentSize = (
  comp: LayoutSplitterModelItem,
  fixedSizes: number
) => {
  // Pixel value
  if (comp.size.includes("px")) {
    return comp.size;
  }

  // If the component has fr value, take into account the sum of fixed values
  // to calculate the actual relative value
  const frValue = Number(comp.size.replace("fr", "").trim());

  if (fixedSizes === 0) {
    return `${frValue * 100}%`;
  }

  return comp.fixedOffsetSize
    ? `calc(${frValue * 100}% - ${fixedSizes * frValue}px + ${
        comp.fixedOffsetSize
      }px)`
    : `calc(${frValue * 100}% - ${fixedSizes * frValue}px)`;
};

const getFrSize = (comp: LayoutSplitterModelItem) =>
  Number(comp.size.replace("fr", "").trim());

const getPxSize = (comp: LayoutSplitterModelItem) =>
  Number(comp.size.replace("px", "").trim());

const hasAbsoluteValue = (component: LayoutSplitterModelItem) =>
  component.size.includes("px");

const getDragBarPosition = (
  items: LayoutSplitterModelItem[],
  index: number,
  componentSize: string
) =>
  index === 0
    ? componentSize
    : `${items[index - 1].dragBarPosition} + ${componentSize}`;

export const getLayoutModel = (
  layout: LayoutSplitterDistribution
): LayoutSplitterModel => {
  const layoutModel = structuredClone(layout) as LayoutSplitterModel;
  layoutModel.fixedSizesSum = completeLayoutModel(layoutModel.items);

  return layoutModel;
};

function completeLayoutModel(items: LayoutSplitterModelItem[]): number {
  let frSum = 0;
  let fixedSizes = 0;

  // Get the sum of all fr values. Also, store the sum of fixed sizes
  items.forEach(item => {
    if (hasAbsoluteValue(item)) {
      fixedSizes += getPxSize(item);
    } else {
      frSum += getFrSize(item);
    }
  });

  // If there are fr values, we must adjust the frs values to be relative to 1fr
  if (frSum > 0) {
    items.forEach(item => {
      if (!hasAbsoluteValue(item)) {
        const frValue = getFrSize(item);
        const adjustedFrValue = frValue / frSum;

        item.size = `${adjustedFrValue}fr`;
      }
    });
  }

  // Update sizes array and store drag-bar position (dragBarPositions array)
  items.forEach((item, index) => {
    const componentSize = getComponentSize(item, fixedSizes);
    item.actualSize = componentSize;

    // Store each drag bar position
    const dragBarPosition = getDragBarPosition(items, index, componentSize);
    item.dragBarPosition = dragBarPosition;

    if ((item as LayoutSplitterModelGroup).items != null) {
      (item as LayoutSplitterModelGroup).fixedSizesSum = completeLayoutModel(
        (item as LayoutSplitterModelGroup).items
      );
    }
  });

  return fixedSizes;
}

const updateSize = (
  component: LayoutSplitterModelItem,
  increment: number,
  fixedSizes: number,
  unitType: "fr" | "px"
) => {
  const currentValue =
    unitType === "px" ? getPxSize(component) : getFrSize(component);

  const newValue = currentValue + increment;
  component.size = `${newValue}${unitType}`;
  component.actualSize = getComponentSize(component, fixedSizes);
};

const updateOffsetSize = (
  component: LayoutSplitterModelItem,
  increment: number,
  fixedSizes: number
) => {
  component.fixedOffsetSize =
    component.fixedOffsetSize != null
      ? component.fixedOffsetSize + increment
      : increment;

  component.actualSize = getComponentSize(component, fixedSizes);
};

export const updateComponentsAndDragBar = (
  info: DragBarMouseDownEventInfo,
  dragBarPositionCustomVar: string,
  gridTemplateDirectionCustomVar: string
) => {
  // - - - - - - - - - Increments - - - - - - - - -
  let incrementInPx = info.newPosition - info.lastPosition;

  // When the language is RTL, the increment is in the opposite direction
  if (info.RTL) {
    incrementInPx = -incrementInPx;
  }

  const layoutItems = info.layoutItems;
  const fixedSizes = info.fixedSizesSum;

  const remainingRelativeSizeInPixels =
    info.dragBarContainerSize - info.fixedSizesSum;
  const incrementInFr = incrementInPx / remainingRelativeSizeInPixels;

  // Components at each position of the drag bar
  const leftIndex = info.index;
  const rightIndex = info.index + 1;

  const leftComp = layoutItems[leftIndex];
  const rightComp = layoutItems[rightIndex];

  // px / px
  if (hasAbsoluteValue(leftComp) && hasAbsoluteValue(rightComp)) {
    updateSize(leftComp, incrementInPx, fixedSizes, "px");
    updateSize(rightComp, -incrementInPx, fixedSizes, "px");
  }
  // px / fr
  else if (hasAbsoluteValue(leftComp)) {
    updateSize(leftComp, incrementInPx, fixedSizes, "px");
    updateOffsetSize(rightComp, -incrementInPx, fixedSizes);
  }
  // fr / px
  else if (hasAbsoluteValue(rightComp)) {
    updateOffsetSize(leftComp, incrementInPx, fixedSizes);
    updateSize(rightComp, -incrementInPx, fixedSizes, "px");
  }
  // fr / fr
  else {
    updateSize(leftComp, incrementInFr, fixedSizes, "fr");
    updateSize(rightComp, -incrementInFr, fixedSizes, "fr");
  }

  // Update drag-bar position
  const dragBarPosition = getDragBarPosition(
    layoutItems,
    leftIndex,
    leftComp.actualSize
  );
  leftComp.dragBarPosition = dragBarPosition;

  // Update in the DOM the grid distribution
  info.dragBarContainer.style.setProperty(
    gridTemplateDirectionCustomVar,
    sizesToGridTemplate(layoutItems)
  );

  // Update in the DOM the drag bar position
  info.dragBar.style.setProperty(
    dragBarPositionCustomVar,
    `calc(${dragBarPosition})`
  );
};

export const getMousePosition = (
  event: MouseEvent,
  direction: "columns" | "rows"
) => (direction === "columns" ? event.clientX : event.clientY);
