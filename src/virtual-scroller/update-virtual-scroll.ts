import { SmartGridModel } from "../components/smart-grid/types";
import {
  SmartGridCellVirtualSize,
  SmartGridVirtualPositionIndex
} from "./types";
import { cellIsRendered } from "./utils";

/**
 * Update the virtual sizes and returns the removed cells.
 */
export const updateVirtualScrollSize = (
  virtualPosition: SmartGridVirtualPositionIndex,
  virtualSizes: Map<string, SmartGridCellVirtualSize>,
  items: SmartGridModel
): HTMLChSmartGridCellElement[] => {
  const removedCells: HTMLChSmartGridCellElement[] = [];

  const renderedItemKeys: Set<string> = new Set();

  // Store the keys of the items that must be rendered
  for (
    let index = virtualPosition.startIndex;
    index <= virtualPosition.endIndex;
    index++
  ) {
    const smartGridItem = items[index];
    renderedItemKeys.add(smartGridItem.id);
  }

  // Remove rendered cells that are will be no longer displayed
  virtualPosition.renderedCells.forEach(renderedCell => {
    if (
      !renderedItemKeys.has(renderedCell.cellId) &&
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
