import { inBetween } from "../../../../common/utils";
import { SmartGridCellVirtualSize } from "./types";
import { cellIsRendered } from "./utils";

/**
 * Update the virtual sizes and returns the removed cells.
 */
export const updateVirtualScrollSize = (
  removeAllRenderedCells: boolean,
  newRenderedCellStartIndex: number,
  newRenderedCellEndIndex: number,
  virtualSizes: Map<string, SmartGridCellVirtualSize>,
  renderedCells: HTMLChSmartGridCellElement[]
): HTMLChSmartGridCellElement[] => {
  const removedCells: HTMLChSmartGridCellElement[] = [];

  // All current rendered cells are still being rendered
  if (
    newRenderedCellStartIndex <= 0 &&
    newRenderedCellEndIndex >= renderedCells.length - 1
  ) {
    return [];
  }

  // Remove cells
  renderedCells.forEach((renderedCell, cellIndex) => {
    if (
      (removeAllRenderedCells ||
        !inBetween(
          newRenderedCellStartIndex,
          cellIndex,
          newRenderedCellEndIndex
        )) &&
      cellIsRendered(renderedCell) &&
      renderedCell.style.display !== "none"
    ) {
      const { offsetTop, offsetLeft } = renderedCell;
      const cellBoundingRect = renderedCell.getBoundingClientRect();

      removedCells.push(renderedCell);

      virtualSizes.set(renderedCell.cellId, {
        width: cellBoundingRect.width,
        height: cellBoundingRect.height,
        offsetTop: offsetTop,
        offsetLeft: offsetLeft
      });
    }
  });

  return removedCells;
};
