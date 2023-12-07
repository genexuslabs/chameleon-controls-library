import {
  LayoutSplitterComponent,
  DragBarMouseDownEventInfo,
  LayoutSplitterSize,
  LayoutSplitterDistribution,
  LayoutSplitterDragBarPosition
} from "./types";

export const sizesToGridTemplate = (sizes: LayoutSplitterSize[]) =>
  sizes.map(item => item.size).join(" ");

const getComponentSize = (
  comp: LayoutSplitterComponent,
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

export const setSizesAndDragBarPosition = (
  layout: LayoutSplitterDistribution
): {
  dragBarPositionsSubLayout: LayoutSplitterDragBarPosition[];
  subLayout: LayoutSplitterSize[];
  subLayoutFixedSizesSum: number;
} => {
  const dragBarPositions: LayoutSplitterDragBarPosition[] = [];
  const sizes: LayoutSplitterSize[] = [];

  let frSum = 0;
  let fixedSizes = 0;

  // Get the sum of all fr values. Also, store the sum of fixed sizes
  layout.items.map(comp => {
    if (comp.size.includes("fr")) {
      const frValue = Number(comp.size.replace("fr", "").trim());

      frSum += frValue;
    }
    // Pixel value
    else {
      const pxValue = Number(comp.size.replace("px", "").trim());

      fixedSizes += pxValue;
    }
  });

  // If there are fr values, we must adjust the frs values to be relative to 1fr
  if (frSum > 0) {
    layout.items.map(comp => {
      if (comp.size.includes("fr")) {
        const frValue = Number(comp.size.replace("fr", "").trim());

        const adjustedFrValue = frValue / frSum;
        comp.size = `${adjustedFrValue}fr`;
      }
    });
  }

  // Update sizes array and store drag-bar position (dragBarPositions array)
  layout.items.forEach((comp, index) => {
    const componentSize = getComponentSize(comp, fixedSizes);
    // Store each drag bar position
    const dragBarPosition =
      index === 0
        ? componentSize
        : `${dragBarPositions[index - 1].position} + ${componentSize}`;

    // Compute the sizes array in the subLayout
    if (comp.subLayout) {
      const { dragBarPositionsSubLayout, subLayout, subLayoutFixedSizesSum } =
        setSizesAndDragBarPosition(comp.subLayout);

      sizes.push({ size: componentSize, subLayout, subLayoutFixedSizesSum });
      dragBarPositions.push({
        position: dragBarPosition,
        subLayout: dragBarPositionsSubLayout
      });
    } else {
      sizes.push({ size: componentSize });
      dragBarPositions.push({ position: dragBarPosition });
    }
  });

  return {
    dragBarPositionsSubLayout: dragBarPositions,
    subLayout: sizes,
    subLayoutFixedSizesSum: fixedSizes
  };
};

const getFrSize = (sizeWithFr: string) => Number(sizeWithFr.replace("fr", ""));
const getPxSize = (sizeWithPx: string) => Number(sizeWithPx.replace("px", ""));

const hasAbsoluteValue = (component: LayoutSplitterComponent) =>
  component.size.includes("px");

const updateSize = (
  component: LayoutSplitterComponent,
  increment: number,
  index: number,
  sizes: LayoutSplitterSize[],
  fixedSizes: number,
  unitType: "fr" | "px"
) => {
  const currentValue =
    unitType === "px" ? getPxSize(component.size) : getFrSize(component.size);

  const newValue = currentValue + increment;
  component.size = `${newValue}${unitType}`;

  sizes[index].size = getComponentSize(component, fixedSizes);
};

const updateOffsetSize = (
  component: LayoutSplitterComponent,
  increment: number,
  index: number,
  sizes: LayoutSplitterSize[],
  fixedSizes: number
) => {
  component.fixedOffsetSize =
    component.fixedOffsetSize != null
      ? component.fixedOffsetSize + increment
      : increment;

  sizes[index].size = getComponentSize(component, fixedSizes);
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
    incrementInPx *= -1;
  }

  const dragBarPositions = info.dragBarPositions;
  const fixedSizes = info.fixedSizesSum;
  const layout = info.layout;
  const sizes = info.sizes;

  const remainingRelativeSizeInPixels =
    info.dragBarContainerSize - info.fixedSizesSum;
  const incrementInFr = incrementInPx / remainingRelativeSizeInPixels;

  // Components at each position of the drag bar
  const leftIndex = info.index;
  const rightIndex = info.index + 1;

  const leftComp = layout.items[leftIndex];
  const rightComp = layout.items[rightIndex];

  // px / px
  if (hasAbsoluteValue(leftComp) && hasAbsoluteValue(rightComp)) {
    updateSize(leftComp, incrementInPx, leftIndex, sizes, fixedSizes, "px");
    updateSize(rightComp, -incrementInPx, rightIndex, sizes, fixedSizes, "px");
  }
  // px / fr
  else if (hasAbsoluteValue(leftComp)) {
    updateSize(leftComp, incrementInPx, leftIndex, sizes, fixedSizes, "px");
    updateOffsetSize(rightComp, -incrementInPx, rightIndex, sizes, fixedSizes);
  }
  // fr / px
  else if (hasAbsoluteValue(rightComp)) {
    updateOffsetSize(leftComp, incrementInPx, leftIndex, sizes, fixedSizes);
    updateSize(rightComp, -incrementInPx, rightIndex, sizes, fixedSizes, "px");
  }
  // fr / fr
  else {
    updateSize(leftComp, incrementInFr, leftIndex, sizes, fixedSizes, "fr");
    updateSize(rightComp, -incrementInFr, rightIndex, sizes, fixedSizes, "fr");
  }

  // Update drag-bar position
  const dragBarPosition =
    leftIndex === 0
      ? sizes[leftIndex].size
      : `${dragBarPositions[leftIndex - 1].position} + ${
          sizes[leftIndex].size
        }`;
  dragBarPositions[leftIndex].position = dragBarPosition;

  // Update in the DOM the grid distribution
  info.dragBarContainer.style.setProperty(
    gridTemplateDirectionCustomVar,
    sizesToGridTemplate(sizes)
  );

  // Update in the DOM the drag bar position
  info.dragBar.style.setProperty(
    dragBarPositionCustomVar,
    `calc(${dragBarPositions[leftIndex].position})`
  );
};

export const getMousePosition = (
  event: MouseEvent,
  direction: "columns" | "rows"
) => (direction === "columns" ? event.clientX : event.clientY);
