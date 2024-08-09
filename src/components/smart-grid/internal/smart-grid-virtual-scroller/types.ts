export type SmartGridCellVirtualSize = {
  width: number;
  height: number;
  offsetTop: number;
  offsetLeft: number;
};

export type SmartGridCellsToLoad =
  | {
      startShift: number;
      endShift: number;
      renderedCells: HTMLChSmartGridCellElement[];
      type: "shift";
    }
  | {
      startIndex: number;
      endIndex: number;
      renderedCells: HTMLChSmartGridCellElement[];
      newRenderedCellStartIndex: number;
      newRenderedCellEndIndex: number;
      type: "index";
    }
  | {
      type: "break";
    };
