import { SmartGridCellVirtualSize } from "./types";

const storeVirtualSize = (
  startIndex: number,
  increment: number,
  cellsToRemove: number,
  removedCells: HTMLChSmartGridCellElement[],
  virtualSizes: Map<string, SmartGridCellVirtualSize>,
  renderedCells: HTMLChSmartGridCellElement[]
) => {
  let removedCellsCount = 0;

  while (removedCellsCount < cellsToRemove) {
    const cellToRemove = renderedCells[startIndex];
    removedCells.push(cellToRemove);
    const cellBoundingRect = cellToRemove.getBoundingClientRect();

    if (increment === -1) {
      console.log(
        "ADD END VIRTUAL SIZE ................................................",
        cellBoundingRect.height
      );
    }

    const { offsetTop, offsetLeft } = cellToRemove;

    virtualSizes.set(cellToRemove.cellId, {
      width: cellBoundingRect.width,
      height: cellBoundingRect.height,
      offsetTop: offsetTop,
      offsetLeft: offsetLeft
    });

    console.log("cellToRemove " + cellToRemove.cellId, cellToRemove.offsetTop);

    // cellToRemove.style.display = "none";

    startIndex += increment;
    removedCellsCount++;
  }

  // for (let index = startIndex; index < cellsToRemove; index += increment) {

  //   // requestAnimationFrame(() => {
  //   // });

  //   // console.log(
  //   //   "REMOVING CELL..........",
  //   //   cellToRemove.cellId,
  //   //   cellBoundingRect.height
  //   // );
  // }
};

/**
 * Update the virtual heights and returns the removed cells.
 */
export const updateVirtualScroll = (
  mode: "virtual-scroll" | "lazy-render",
  startShift: number,
  endShift: number,
  virtualSizes: Map<string, SmartGridCellVirtualSize>,
  renderedCells?: HTMLChSmartGridCellElement[]
): HTMLChSmartGridCellElement[] => {
  if (
    mode !== "virtual-scroll" ||
    !renderedCells ||
    (startShift >= 0 && endShift >= 0)
  ) {
    return [];
  }

  const removedCells: HTMLChSmartGridCellElement[] = [];

  if (startShift < 0) {
    const cellsToRemove = -startShift;
    storeVirtualSize(
      0,
      1,
      cellsToRemove,
      removedCells,
      virtualSizes,
      renderedCells
    );
  }

  if (endShift < 0) {
    const cellsToRemove = -endShift;

    storeVirtualSize(
      renderedCells.length - 1,
      -1,
      cellsToRemove,
      removedCells,
      virtualSizes,
      renderedCells
    );
  }

  return removedCells;
};
