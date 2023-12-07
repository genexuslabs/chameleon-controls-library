import { DragBarComponent, DragBarMouseDownEventInfo } from "./types";

const getComponentSize = (comp: DragBarComponent, fixedSizes: number) => {
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
  components: DragBarComponent[],
  sizes: string[],
  dragBarPositions: string[]
): number => {
  let frSum = 0;
  let fixedSizes = 0;

  // Get the sum of all fr values. Also, store the sum of fixed sizes
  components.map(comp => {
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
    components.map(comp => {
      if (comp.size.includes("fr")) {
        const frValue = Number(comp.size.replace("fr", "").trim());

        const adjustedFrValue = frValue / frSum;
        comp.size = `${adjustedFrValue}fr`;
      }
    });
  }

  // Update sizes array and store drag-bar position (dragBarPositions array)
  components.forEach((comp, index) => {
    const componentSize = getComponentSize(comp, fixedSizes);
    sizes.push(componentSize);

    // Store each drag bar position
    const dragBarPosition =
      index === 0
        ? componentSize
        : `${dragBarPositions[index - 1]} + ${componentSize}`;

    dragBarPositions.push(dragBarPosition);
  });

  return fixedSizes;
};

const getFrSize = (sizeWithFr: string) => Number(sizeWithFr.replace("fr", ""));
const getPxSize = (sizeWithPx: string) => Number(sizeWithPx.replace("px", ""));

const hasAbsoluteValue = (component: DragBarComponent) =>
  component.size.includes("px");

const updateSize = (
  component: DragBarComponent,
  increment: number,
  index: number,
  sizes: string[],
  fixedSizes: number,
  unitType: "fr" | "px"
) => {
  const currentValue =
    unitType === "px" ? getPxSize(component.size) : getFrSize(component.size);

  const newValue = currentValue + increment;
  component.size = `${newValue}${unitType}`;

  sizes[index] = getComponentSize(component, fixedSizes);
};

const updateOffsetSize = (
  component: DragBarComponent,
  increment: number,
  index: number,
  sizes: string[],
  fixedSizes: number
) => {
  component.fixedOffsetSize =
    component.fixedOffsetSize != null
      ? component.fixedOffsetSize + increment
      : increment;

  sizes[index] = getComponentSize(component, fixedSizes);
};

export const updateComponentsAndDragBar = (
  info: DragBarMouseDownEventInfo,
  components: DragBarComponent[],
  sizes: string[],
  dragBarPositions: string[],
  fixedSizes: number,
  dragBarPositionCustomVar: string
) => {
  // - - - - - - - - - Increments - - - - - - - - -
  let incrementInPx = info.newPosition - info.lastPosition;

  // When the language is RTL, the increment is in the opposite direction
  if (info.RTL) {
    incrementInPx *= -1;
  }

  const remainingRelativeSizeInPixels =
    info.dragBarContainer.clientWidth - fixedSizes;
  const incrementInFr = incrementInPx / remainingRelativeSizeInPixels;

  // Components at each position of the drag bar
  const leftComp = components[info.index];
  const rightComp = components[info.index + 1];

  const leftIndex = info.index;
  const rightIndex = info.index + 1;

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
      ? sizes[leftIndex]
      : `${dragBarPositions[leftIndex - 1]} + ${sizes[leftIndex]}`;
  dragBarPositions[leftIndex] = dragBarPosition;

  // Update in the DOM the grid distribution
  info.dragBarContainer.style.setProperty(
    "grid-template-columns",
    sizes.join(" ")
  );

  // Update in the DOM the drag bar position
  info.dragBar.style.setProperty(
    dragBarPositionCustomVar,
    `calc(${dragBarPositions[leftIndex]})`
  );
};

export const getMousePosition = (event: MouseEvent) => event.clientX;
