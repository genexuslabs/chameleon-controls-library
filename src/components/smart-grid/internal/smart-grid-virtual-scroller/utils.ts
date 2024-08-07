import { inBetween } from "../../../../common/utils";
import { SmartGridModel } from "../../types";

export const isSmartCellVisible = (
  element: HTMLElement,
  smartGridBoundingBox: DOMRect
) => {
  const elementRect = element.getBoundingClientRect();

  const smartGridRectLeftX = smartGridBoundingBox.x;
  const smartGridRectRightX =
    smartGridBoundingBox.x + smartGridBoundingBox.width;

  const smartGridRectTopY = smartGridBoundingBox.y;
  const smartGridRectBottomY =
    smartGridBoundingBox.y + smartGridBoundingBox.height;

  const rectLeftX = elementRect.x;
  const rectRightX = elementRect.x + elementRect.width;

  const rectTopY = elementRect.y;
  const rectBottomY = elementRect.y + elementRect.height;

  return (
    // At least, the left or right edge is visible in the X axis
    (inBetween(smartGridRectLeftX, rectLeftX, smartGridRectRightX) ||
      inBetween(smartGridRectLeftX, rectRightX, smartGridRectRightX)) &&
    // At least, the top or bottom edge is visible in the Y axis
    (inBetween(smartGridRectTopY, rectTopY, smartGridRectBottomY) ||
      inBetween(smartGridRectTopY, rectBottomY, smartGridRectBottomY))
  );
};

export const emptyItems = (items: SmartGridModel) =>
  items === undefined || items.length === 0;

export const getSmartCells = (
  scroller: HTMLChSmartGridVirtualScrollerElement
) =>
  [
    ...scroller.querySelectorAll(":scope>ch-smart-grid-cell")
  ] as HTMLChSmartGridElement[];

// TODO: Use padding in the ch-smart-grid and see if this works well
export const cellsInViewportAreLoadedAndVisible = (
  scroller: HTMLChSmartGridVirtualScrollerElement,
  smartGrid: HTMLChSmartGridElement,
  inverseLoading: boolean
): boolean => {
  const cells = getSmartCells(scroller);
  const smartGridBoundingBox = smartGrid.getBoundingClientRect();

  const lastIndex = cells.length - 1;
  let startIndex = inverseLoading ? lastIndex : 0;
  const increment = inverseLoading ? -1 : 1;

  while (inBetween(0, startIndex, lastIndex)) {
    const currentCell = cells[startIndex];

    if (currentCell.hasAttribute("data-did-load")) {
      // The previous cells were visible, but we found a cell that is rendered
      // and its not in the viewport
      if (!isSmartCellVisible(currentCell, smartGridBoundingBox)) {
        return true;
      }
    }
    // There is a cell that isn't rendered, we can check its visibility, but
    // we can't ensure if when the cell is rendered, the next cells will be
    // visible or not
    else {
      return false;
    }

    startIndex += increment;
  }

  return true;
};

const CAN_NOT_CHECK_SHIFT_VALUES = {
  startShift: 0,
  endShift: 0,
  break: true
} as const satisfies ReturnType<typeof getAmountOfCellsToLoad>;

/**
 * Return to cells to load, depending of the amount of cells in the buffer that
 * are visible.
 */
export const getAmountOfCellsToLoad = (
  scroller: HTMLChSmartGridVirtualScrollerElement,
  smartGrid: HTMLChSmartGridElement,
  virtualItems: SmartGridModel,
  bufferSize: number
): { startShift: number; endShift: number; break?: boolean } => {
  const cells = getSmartCells(scroller);

  if (cells.length !== virtualItems.length) {
    console.log("SKIP DOM CHECK..............................................");
    return CAN_NOT_CHECK_SHIFT_VALUES;
  }
  const smartGridBoundingBox = smartGrid.getBoundingClientRect();

  const START_INDEX = bufferSize;
  const LAST_INDEX = cells.length - 1 - bufferSize;

  let startShift = bufferSize;
  let index = 0;

  // Check how many cells are visible in the buffer
  while (index <= LAST_INDEX) {
    const currentCell = cells[index];

    // The cell content must be rendered before trying to update the DOM
    if (!currentCell.hasAttribute("data-did-load")) {
      // console.log("+++++DENYYY CHECKK");
      return CAN_NOT_CHECK_SHIFT_VALUES;
    }

    if (isSmartCellVisible(currentCell, smartGridBoundingBox)) {
      console.log("BREAK... start");
      break;
    }

    startShift--;
    index++;
  }

  let endShift = bufferSize;
  index = cells.length - 1;

  // Check how many cells are visible in the buffer
  while (START_INDEX <= index) {
    const currentCell = cells[index];

    // The cell content must be rendered before trying to update the DOM
    if (!currentCell.hasAttribute("data-did-load")) {
      console.log("+++++DENYYY CHECKK");
      return CAN_NOT_CHECK_SHIFT_VALUES;
    }

    if (isSmartCellVisible(currentCell, smartGridBoundingBox)) {
      console.log("BREAK... end");
      break;
    }

    endShift--;
    index--;
  }

  console.log({ startShift, endShift });

  return { startShift, endShift };
};
