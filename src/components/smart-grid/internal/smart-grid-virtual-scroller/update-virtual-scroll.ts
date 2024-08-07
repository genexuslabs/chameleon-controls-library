import { SmartGridCellVirtualSize } from "./types";

const storeVirtualSize = (
  startIndex: number,
  increment: number,
  cellsToRemove: number,
  virtualSizes: Map<string, SmartGridCellVirtualSize>,
  renderedCells: HTMLChSmartGridCellElement[]
) => {
  let removedCells = 0;

  while (removedCells < cellsToRemove) {
    const cellToRemove = renderedCells[startIndex];
    const cellBoundingRect = cellToRemove.getBoundingClientRect();

    if (increment === -1) {
      console.log(
        "ADD END VIRTUAL SIZE ................................................",
        cellBoundingRect.height
      );
    }

    virtualSizes.set(cellToRemove.cellId, {
      width: cellBoundingRect.width,
      height: cellBoundingRect.height
    });

    cellToRemove.style.display = "none";

    startIndex += increment;
    removedCells++;
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

export const updateVirtualScroll = (
  mode: "virtual-scroll" | "lazy-render",
  startShift: number,
  endShift: number,
  virtualStartSizes: Map<string, SmartGridCellVirtualSize>,
  virtualEndSizes: Map<string, SmartGridCellVirtualSize>,
  renderedCells?: HTMLChSmartGridCellElement[]
) => {
  if (
    mode !== "virtual-scroll" ||
    !renderedCells ||
    (startShift >= 0 && endShift >= 0)
  ) {
    return;
  }

  if (startShift < 0) {
    const cellsToRemove = -startShift;
    storeVirtualSize(0, 1, cellsToRemove, virtualStartSizes, renderedCells);
  }

  if (endShift < 0) {
    const cellsToRemove = -endShift;

    storeVirtualSize(
      renderedCells.length - 1,
      -1,
      cellsToRemove,
      virtualEndSizes,
      renderedCells
    );
  }
};
