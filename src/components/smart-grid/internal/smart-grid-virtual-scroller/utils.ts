import { inBetween } from "../../../../common/utils";
import { SmartGridModel } from "../../types";
import { SmartGridCellVirtualSize } from "./types";

const CAN_NOT_CHECK_SHIFT_VALUES = {
  startShift: 0,
  endShift: 0,
  break: true,
  renderedCells: []
} as const satisfies ReturnType<typeof getAmountOfCellsToLoad>;

export const isRenderedSmartCellVisible = (
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
  ] as HTMLChSmartGridCellElement[];

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
      if (!isRenderedSmartCellVisible(currentCell, smartGridBoundingBox)) {
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

const findFirstVirtualSizeThatIsNotVisible = (
  renderedCells: HTMLChSmartGridCellElement[],
  items: SmartGridModel,
  virtualSizes: Map<string, SmartGridCellVirtualSize>,
  bufferSize: number,
  smartGridScrollTop: number
) => {
  const virtualKeys = [...virtualSizes.keys()];
  let closerVirtualSizeKey = "0";
  let closerVirtualSizeBottomY = 0;

  // Find the key of the closer virtual size to the viewport that isn't visible
  for (
    let virtualIndex = 0;
    virtualIndex < virtualKeys.length;
    virtualIndex++
  ) {
    const virtualSizeKey = virtualKeys[virtualIndex];
    const virtualSize = virtualSizes.get(virtualSizeKey);
    const virtualSizeBottomY = virtualSize.offsetTop + virtualSize.height;
    const virtualSizeIsHidden = virtualSizeBottomY <= smartGridScrollTop;

    if (virtualSizeIsHidden && closerVirtualSizeBottomY <= virtualSizeBottomY) {
      closerVirtualSizeBottomY = virtualSizeBottomY;
      closerVirtualSizeKey = virtualSizeKey;
    }
  }

  // TODO: Use memory to retrieve the index given the cellId

  console.log(
    "Closer virtual item to the top of the viewport that is not visible",
    "key:" + closerVirtualSizeKey,
    "bottomY:" + closerVirtualSizeBottomY
  );
};

/**
 * Return to cells to load, depending of the amount of cells in the buffer that
 * are visible.
 */
export const getAmountOfCellsToLoad = (
  scroller: HTMLChSmartGridVirtualScrollerElement,
  smartGrid: HTMLChSmartGridElement,
  items: SmartGridModel,
  virtualSizes: Map<string, SmartGridCellVirtualSize>,
  bufferSize: number
): {
  startShift: number;
  endShift: number;
  renderedCells: HTMLChSmartGridCellElement[];
  break?: boolean;
} => {
  const renderedCells = getSmartCells(scroller);
  const smartGridBoundingBox = smartGrid.getBoundingClientRect();
  const smartGridScrollTop = smartGrid.scrollTop;

  // TODO: Force the buffer to be at least 2
  const scrollIsAtVirtualStartSize =
    smartGridScrollTop < renderedCells[1].offsetTop;

  // if (cells.length !== virtualItems.length) {
  //   console.log("SKIP DOM CHECK..............................................");
  //   return CAN_NOT_CHECK_SHIFT_VALUES;
  // }

  if (scrollIsAtVirtualStartSize) {
    console.log("///////////VIRTUAL START SIZE///////////");
    findFirstVirtualSizeThatIsNotVisible(
      renderedCells,
      items,
      virtualSizes,
      bufferSize,
      smartGridScrollTop
    );
    return CAN_NOT_CHECK_SHIFT_VALUES;
  }

  const START_INDEX = bufferSize;
  const LAST_INDEX = renderedCells.length - 1 - bufferSize;

  let startShift = bufferSize;
  let index = 0;

  // Check how many cells are visible in the buffer
  while (index <= LAST_INDEX) {
    const currentCell = renderedCells[index];

    // The cell content must be rendered before trying to update the DOM
    if (!currentCell.hasAttribute("data-did-load")) {
      // console.log("+++++DENYYY CHECKK");
      return CAN_NOT_CHECK_SHIFT_VALUES;
    }

    if (isRenderedSmartCellVisible(currentCell, smartGridBoundingBox)) {
      // console.log("BREAK... start");
      break;
    }

    startShift--;
    index++;
  }

  let endShift = bufferSize;
  index = renderedCells.length - 1;

  // Check how many cells are visible in the buffer
  while (START_INDEX <= index) {
    const currentCell = renderedCells[index];

    // The cell content must be rendered before trying to update the DOM
    if (!currentCell.hasAttribute("data-did-load")) {
      console.log("+++++DENYYY CHECKK");
      return CAN_NOT_CHECK_SHIFT_VALUES;
    }

    if (isRenderedSmartCellVisible(currentCell, smartGridBoundingBox)) {
      // console.log("BREAK... end");
      break;
    }

    endShift--;
    index--;
  }

  // console.log({ startShift, endShift });

  return { startShift, endShift, renderedCells };
};
