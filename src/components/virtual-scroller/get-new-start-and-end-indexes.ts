import { inBetween } from "../common/utils";
import { SmartGridModel } from "../components/smart-grid/types";
import { SmartGridVirtualPosition, SmartGridCellVirtualSize } from "./types";
import {
  cellIsRendered,
  getSmartCells,
  isRenderedSmartCellVisible,
  isVirtualSizeCellVisible
} from "./utils";

const WAITING_FOR_CELLS_TO_BE_RENDERED = {
  type: "waiting-for-cells-to-render"
} as const satisfies SmartGridVirtualPosition;

const findFirstVirtualSizeThatIsNotVisible = (
  renderedCells: HTMLChSmartGridCellElement[],
  items: SmartGridModel,
  virtualSizes: Map<string, SmartGridCellVirtualSize>,
  bufferSize: number,
  smartGridScrollTop: number,
  smartGridBoundingRect: DOMRect,
  inverseLoading: boolean
): SmartGridVirtualPosition => {
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

  // Since we found the closer hidden virtual size, the shift is one cell smaller
  const startIndex = Math.max(0, closerVirtualItemIndex + 1 - bufferSize);
  const lastIndex = items.length - 1;
  let endIndex = closerVirtualItemIndex + 1; // Start in the first visible cell
  let renderedCellsCount = 0;
  let cellsThatAreNotVisible = 0;

  // When the virtual scroll has inverse loading enabled, all items on the end
  // of the viewport are always rendered, to avoid flickering issues with the
  // scroll. In other words, the endIndex is always the last index
  if (inverseLoading) {
    return {
      startIndex,
      endIndex: lastIndex,
      renderedCells,
      type: "index"
    };
  }

  // Find the endIndex to render the cells. This index takes into account the
  // cells that must be not visible in the buffer
  while (
    inBetween(0, endIndex, lastIndex) &&
    cellsThatAreNotVisible < bufferSize
  ) {
    const cellId = items[endIndex].id;
    const virtualSize = virtualSizes.get(cellId);

    if (virtualSize) {
      const isVirtualSizeVisible = isVirtualSizeCellVisible(
        virtualSize,
        smartGridScrollTop,
        smartGridBoundingRect
      );

      if (!isVirtualSizeVisible) {
        cellsThatAreNotVisible++;
      }
    }
    // We assume that the rendered cells are sorted
    else {
      const renderedCell = renderedCells[renderedCellsCount];

      const isRenderedCellVisible = isRenderedSmartCellVisible(
        renderedCell,
        smartGridBoundingRect
      );

      if (!isRenderedCellVisible) {
        cellsThatAreNotVisible++;
      }

      renderedCellsCount++;
    }

    endIndex++;
  }

  endIndex = Math.min(lastIndex, endIndex + bufferSize - 1);

  return {
    startIndex,
    endIndex,
    renderedCells,
    type: "index"
  };
};

const LOWER_BUFFER_RANGE = (index: number, firstIndex) => firstIndex <= index;
const UPPER_BUFFER_RANGE = (index: number, lastIndex) => index <= lastIndex;

const getAmountOfCellsThatAreVisibleInTheBuffer = (
  increment: -1 | 1,
  bufferSize: number,
  renderedCells: HTMLChSmartGridCellElement[],
  smartGridBoundingRect: DOMRect
): number => {
  const lastRenderedCellIndex = renderedCells.length - 1;

  const indexLimit =
    increment === 1 ? lastRenderedCellIndex - bufferSize : bufferSize;
  const checkIndexRange =
    increment === 1 ? UPPER_BUFFER_RANGE : LOWER_BUFFER_RANGE;

  // Depending on the direction, start from the first or last index of the
  // current rendered cells
  let currentIndex = increment === 1 ? 0 : lastRenderedCellIndex;
  let shift = bufferSize;

  // Check how many cells are visible in the buffer
  while (checkIndexRange(currentIndex, indexLimit)) {
    const currentCell = renderedCells[currentIndex];

    if (isRenderedSmartCellVisible(currentCell, smartGridBoundingRect)) {
      break;
    }

    shift--;
    currentIndex += increment;
  }

  return shift;
};

/**
 * Depending on the scroll position and the bufferSize, it returns the start
 * and end index of the virtual array to rendered the cells
 */
export const getNewStartAndEndIndexes = (
  scroller: HTMLChVirtualScrollerElement,
  smartGrid: HTMLChSmartGridElement,
  items: SmartGridModel,
  virtualSizes: Map<string, SmartGridCellVirtualSize>,
  virtualStartSize: number,
  virtualEndSize: number,
  bufferSize: number,
  inverseLoading: boolean
): SmartGridVirtualPosition => {
  const renderedCells = getSmartCells(scroller);
  const allCellsAreRendered = renderedCells.every(cellIsRendered);

  // All cells must be rendered before trying to update the DOM
  if (!allCellsAreRendered) {
    return WAITING_FOR_CELLS_TO_BE_RENDERED;
  }

  // DOM read operations
  const smartGridBoundingRect = smartGrid.getBoundingClientRect();
  const smartGridScrollTop = smartGrid.scrollTop;

  // TODO: Force the buffer to be at least 2
  const secondRenderedCell = renderedCells[1];

  const scrollIsAtVirtualStartSize =
    virtualStartSize > 0 &&
    secondRenderedCell.style.display !== "none" &&
    smartGridScrollTop < secondRenderedCell.offsetTop;

  if (scrollIsAtVirtualStartSize) {
    return findFirstVirtualSizeThatIsNotVisible(
      renderedCells,
      items,
      virtualSizes,
      bufferSize,
      smartGridScrollTop,
      smartGridBoundingRect,
      inverseLoading
    );
  }

  const secondLastCell = renderedCells.at(-2);

  const scrollIsAtVirtualEndSize =
    virtualEndSize > 0 &&
    secondLastCell.style.display !== "none" &&
    secondLastCell.offsetTop + secondLastCell.getBoundingClientRect().height <
      smartGridScrollTop;

  if (scrollIsAtVirtualEndSize) {
    return findFirstVirtualSizeThatIsNotVisible(
      renderedCells,
      items,
      virtualSizes,
      bufferSize,
      smartGridScrollTop,
      smartGridBoundingRect,
      inverseLoading
    );
  }

  const startShift = getAmountOfCellsThatAreVisibleInTheBuffer(
    1,
    bufferSize,
    renderedCells,
    smartGridBoundingRect
  );
  const endShift = inverseLoading
    ? // We could use zero instead of this value, but this value ensure that
      // dynamically added items at the end will always be rendered in the next
      // frame
      items.length - 1
    : getAmountOfCellsThatAreVisibleInTheBuffer(
        -1,
        bufferSize,
        renderedCells,
        smartGridBoundingRect
      );

  return { startShift, endShift, renderedCells, type: "shift" };
};
