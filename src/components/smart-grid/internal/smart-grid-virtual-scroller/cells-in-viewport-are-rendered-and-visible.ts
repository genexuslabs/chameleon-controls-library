import { inBetween } from "../../../../common/utils";
import {
  cellIsRendered,
  getSmartCells,
  isRenderedSmartCellVisible
} from "./utils";

// TODO: Use padding in the ch-smart-grid and see if this works well
export const cellsInViewportAreLoadedAndVisible = (
  scroller: HTMLChVirtualScrollerElement,
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
      // and its not in the viewport. Assume that the cell won't be displayed
      // in the viewport even when it's fully rendered
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
