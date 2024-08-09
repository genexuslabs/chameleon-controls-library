import { inBetween } from "../../../../common/utils";
import { SmartGridModel } from "../../types";
import { SmartGridCellsToLoad, SmartGridCellVirtualSize } from "./types";

const CAN_NOT_CHECK_SHIFT_VALUES = {
  type: "break"
} as const satisfies SmartGridCellsToLoad;

export const cellIsRendered = (cell: HTMLElement) =>
  cell.hasAttribute("data-did-load");

export const isRenderedSmartCellVisible = (
  element: HTMLElement,
  smartGridBoundingRect: DOMRect
) => {
  const elementRect = element.getBoundingClientRect();

  const smartGridRectLeftX = smartGridBoundingRect.x;
  const smartGridRectRightX =
    smartGridBoundingRect.x + smartGridBoundingRect.width;

  const smartGridRectTopY = smartGridBoundingRect.y;
  const smartGridRectBottomY =
    smartGridBoundingRect.y + smartGridBoundingRect.height;

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

export const isVirtualSizeCellVisible = (
  virtualSize: SmartGridCellVirtualSize,
  smartGridScrollTop: number,
  smartGridBoundingRect: DOMRect
): boolean => {
  const smartGridRectTopY = smartGridScrollTop;
  const smartGridRectBottomY =
    smartGridScrollTop + smartGridBoundingRect.height;
  const rectTopY = virtualSize.offsetTop;
  const rectBottomY = virtualSize.offsetTop + virtualSize.height;

  // At least, the top or bottom edge is visible in the Y axis
  return (
    inBetween(smartGridRectTopY, rectTopY, smartGridRectBottomY) ||
    inBetween(smartGridRectTopY, rectBottomY, smartGridRectBottomY)
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

    if (cellIsRendered(currentCell)) {
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
  smartGridScrollTop: number,
  smartGridBoundingRect: DOMRect
): SmartGridCellsToLoad => {
  let closerVirtualSizeId = "";
  let closerVirtualSizeBottomY = 0;

  // Find the key of the closer virtual size to the viewport that isn't visible
  virtualSizes.forEach((virtualSize, virtualSizeId) => {
    const virtualSizeBottomY = virtualSize.offsetTop + virtualSize.height;
    const virtualSizeIsHidden = virtualSizeBottomY <= smartGridScrollTop;

    if (virtualSizeIsHidden && closerVirtualSizeBottomY <= virtualSizeBottomY) {
      closerVirtualSizeBottomY = virtualSizeBottomY;
      closerVirtualSizeId = virtualSizeId;
    }
  });

  // TODO: Use memory to retrieve the index given the cellId
  const closerVirtualItemIndex = items.findIndex(
    el => el.id === closerVirtualSizeId
  );

  const startIndex = Math.max(0, closerVirtualItemIndex - bufferSize - 1);
  const lastIndex = items.length - 1;
  let endIndex = closerVirtualItemIndex + 1; // Start in the first visible cell
  let renderedCellsCount = 0;
  let cellsThatAreNotVisible = 0;

  console.log(
    "////Closer virtual item to the top of the viewport that is not visible",
    "key:" + closerVirtualSizeId,
    "bottomY:" + closerVirtualSizeBottomY
  );

  // Find the endIndex to render the cells. This index takes into account the
  // cells that must be not visible in the buffer
  while (
    inBetween(0, endIndex, lastIndex) &&
    cellsThatAreNotVisible < bufferSize
  ) {
    const cellId = items[endIndex].id;

    console.log(cellId);

    const virtualSize = virtualSizes.get(cellId);

    if (virtualSize) {
      console.log("IS VIRTUAL SIZE...");
      const isVirtualSizeVisible = isVirtualSizeCellVisible(
        virtualSize,
        smartGridScrollTop,
        smartGridBoundingRect
      );

      if (!isVirtualSizeVisible) {
        cellsThatAreNotVisible++;

        // endIndex = Math.min(lastIndex, endIndex + bufferSize - 1);

        // console.log("////RESULT ", {
        //   startIndex,
        //   endIndex,
        //   renderedCells,
        //   // TODO: Improve this
        //   newRenderedCellStartIndex: renderedCellsCount === 0 ? -1 : 0,
        //   newRenderedCellEndIndex: renderedCellsCount,
        //   type: "index"
        // });

        // return {
        //   startIndex,
        //   endIndex,
        //   renderedCells,
        //   // TODO: Improve this
        //   newRenderedCellStartIndex: renderedCellsCount === 0 ? -1 : 0,
        //   newRenderedCellEndIndex: renderedCellsCount,
        //   type: "index"
        // };
      }
    }
    // We assume that the rendered cells are sorted
    else {
      const renderedCell = renderedCells[renderedCellsCount];
      console.log("IS RENDERED CELL...");

      // // The cell content must be rendered before trying to update the DOM
      // if (!cellIsRendered(renderedCell)) {
      //   console.log("+++++DENYYY CHECKK IN NEW STRATEGY");
      //   return CAN_NOT_CHECK_SHIFT_VALUES;
      // }

      const isRenderedCellVisible = isRenderedSmartCellVisible(
        renderedCell,
        smartGridBoundingRect
      );

      if (!isRenderedCellVisible) {
        cellsThatAreNotVisible++;
        // endIndex = Math.min(lastIndex, endIndex + bufferSize - 1);

        // console.log("////RESULT ", {
        //   startIndex,
        //   endIndex,
        //   renderedCells,
        //   // TODO: Improve this
        //   newRenderedCellStartIndex: renderedCellsCount === 0 ? -1 : 0,
        //   newRenderedCellEndIndex: renderedCellsCount,
        //   type: "index"
        // });

        // return {
        //   startIndex,
        //   endIndex,
        //   renderedCells,
        //   newRenderedCellStartIndex: renderedCellsCount === 0 ? -1 : 0,
        //   newRenderedCellEndIndex: renderedCellsCount,
        //   type: "index"
        // };
      }

      renderedCellsCount++;
    }

    endIndex++;
  }

  endIndex = Math.min(lastIndex, endIndex + bufferSize - 1);

  console.log(
    "////IS THIS CASE MEET??????????",
    JSON.stringify([...virtualSizes.entries()])
  );

  console.log("////RESULT ", {
    startIndex,
    endIndex,
    renderedCells,
    // TODO: Improve this
    newRenderedCellStartIndex: renderedCellsCount === 0 ? -1 : 0,
    newRenderedCellEndIndex: renderedCellsCount,
    type: "index"
  });

  return {
    startIndex,
    endIndex,
    renderedCells,
    newRenderedCellStartIndex: renderedCellsCount === 0 ? -1 : 0,
    newRenderedCellEndIndex: renderedCellsCount,
    type: "index"
  };
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
  virtualStartSize: number,
  virtualEndSize: number,
  bufferSize: number
): SmartGridCellsToLoad => {
  const renderedCells = getSmartCells(scroller);

  const allCellsAreRendered = renderedCells.every(cellIsRendered);

  if (!allCellsAreRendered) {
    // console.log("NOT ALL CELLS ARE RENDERED...........................");
    return CAN_NOT_CHECK_SHIFT_VALUES;
  }

  const smartGridBoundingRect = smartGrid.getBoundingClientRect();
  const smartGridScrollTop = smartGrid.scrollTop;
  // console.log(
  //   "////getAmountOfCellsToLoad, smartGridScrollTop",
  //   smartGridScrollTop
  // );

  // TODO: Force the buffer to be at least 2
  const secondRenderedCell = renderedCells[1];

  const scrollIsAtVirtualStartSize =
    virtualStartSize > 0 && smartGridScrollTop < secondRenderedCell.offsetTop;

  // if (cells.length !== virtualItems.length) {
  //   console.log("SKIP DOM CHECK..............................................");
  //   return CAN_NOT_CHECK_SHIFT_VALUES;
  // }

  if (scrollIsAtVirtualStartSize) {
    console.log(
      "///////////VIRTUAL START SIZE///////////",
      "cellId " + secondRenderedCell.cellId,

      "smartGridScrollTop " + smartGridScrollTop,
      "renderedCells[1].offsetTop " + renderedCells[1].offsetTop
    );

    return findFirstVirtualSizeThatIsNotVisible(
      renderedCells,
      items,
      virtualSizes,
      bufferSize,
      smartGridScrollTop,
      smartGridBoundingRect
    );
  }

  const secondLastCell = renderedCells.at(-2);

  const scrollIsAtVirtualEndSize =
    virtualEndSize > 0 &&
    secondLastCell.offsetTop + secondLastCell.getBoundingClientRect().height <
      smartGridScrollTop;

  if (scrollIsAtVirtualEndSize) {
    console.log(
      "///////////VIRTUAL END SIZE///////////",
      "cellId " + secondLastCell.cellId,

      "secondLastCell.bottomY " +
        (secondLastCell.offsetTop +
          secondLastCell.getBoundingClientRect().height),

      "smartGridScrollTop" + smartGridScrollTop
    );
  }

  const START_INDEX = bufferSize;
  const LAST_INDEX = renderedCells.length - 1 - bufferSize;

  let startShift = bufferSize;
  let index = 0;

  // Check how many cells are visible in the buffer
  while (index <= LAST_INDEX) {
    const currentCell = renderedCells[index];

    // The cell content must be rendered before trying to update the DOM
    if (!cellIsRendered(currentCell)) {
      // console.log("+++++DENYYY CHECKK");
      return CAN_NOT_CHECK_SHIFT_VALUES;
    }

    if (isRenderedSmartCellVisible(currentCell, smartGridBoundingRect)) {
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
    if (!cellIsRendered(currentCell)) {
      console.log("+++++DENYYY CHECKK");
      return CAN_NOT_CHECK_SHIFT_VALUES;
    }

    if (isRenderedSmartCellVisible(currentCell, smartGridBoundingRect)) {
      // console.log("BREAK... end");
      break;
    }

    endShift--;
    index--;
  }

  console.log("///////////NORMAL SHIFT///////////", { startShift, endShift });

  return { startShift, endShift, renderedCells, type: "shift" };
};
