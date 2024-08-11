import { inBetween } from "../../../../common/utils";
import { SmartGridCellVirtualSize } from "./types";
import { cellIsRendered } from "./utils";

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
      // console.log(
      //   "ADD END VIRTUAL SIZE ................................................",
      //   cellBoundingRect.height
      // );
    }

    if (cellIsRendered(cellToRemove) && cellToRemove.style.display !== "none") {
      const { offsetTop } = cellToRemove;

      if (offsetTop !== 0 || cellBoundingRect.height !== 0) {
        virtualSizes.set(cellToRemove.cellId, {
          // width: cellBoundingRect.width,
          height: cellBoundingRect.height,
          offsetTop: offsetTop
          // offsetLeft: offsetLeft
        });
      }
    }

    // console.log("cellToRemove " + cellToRemove.cellId, cellToRemove.offsetTop);

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
    mode === "lazy-render" ||
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

export const updateVirtualScroll2 = (
  mode: "virtual-scroll" | "lazy-render",
  newRenderedCellStartIndex: number,
  newRenderedCellEndIndex: number,
  virtualSizes: Map<string, SmartGridCellVirtualSize>,
  renderedCells: HTMLChSmartGridCellElement[]
): HTMLChSmartGridCellElement[] => {
  if (mode === "lazy-render") {
    return [];
  }

  const removedCells: HTMLChSmartGridCellElement[] = [];

  console.log(
    "////RENDERED CELLS...",
    "newRenderedCellStartIndex: " + newRenderedCellStartIndex,
    "newRenderedCellEndIndex: " + newRenderedCellEndIndex,
    renderedCells.map((cell, index) => `indice::: ${index} id:::${cell.cellId}`)
  );

  // Remove cells
  renderedCells.forEach((cellToRemove, cellIndex) => {
    if (
      (newRenderedCellStartIndex === -1 ||
        !inBetween(
          newRenderedCellStartIndex,
          cellIndex,
          newRenderedCellEndIndex
        )) &&
      cellIsRendered(cellToRemove) &&
      cellToRemove.style.display !== "none"
    ) {
      console.log("/////REMOVING... ", cellToRemove.cellId);
      const { offsetTop, offsetLeft } = cellToRemove;
      const cellBoundingRect = cellToRemove.getBoundingClientRect();

      removedCells.push(cellToRemove);

      // TODO: This is a WA to not add cells with display: none
      if (
        cellBoundingRect.height !== 0 ||
        cellBoundingRect.width !== 0 ||
        offsetTop !== 0 ||
        offsetLeft !== 0
      ) {
        virtualSizes.set(cellToRemove.cellId, {
          // width: cellBoundingRect.width,
          height: cellBoundingRect.height,
          offsetTop: offsetTop
          // offsetLeft: offsetLeft
        });
      }
    }
  });

  return removedCells;
};
