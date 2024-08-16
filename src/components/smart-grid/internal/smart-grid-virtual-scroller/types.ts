import { SmartGridModel } from "../../types";

export type VirtualScrollVirtualItems = {
  virtualItems: SmartGridModel;
  startIndex: number;
  endIndex: number;
  totalItems: number;
};

export type SmartGridCellVirtualSize = {
  width: number;
  height: number;
  offsetTop: number;
  offsetLeft: number;
};

export type SmartGridVirtualPosition =
  | {
      startShift: number;
      endShift: number;
      renderedCells: HTMLChSmartGridCellElement[];
      type: "shift";
    }
  | SmartGridVirtualPositionIndex
  | {
      type: "waiting-for-cells-to-render";
    };

export type SmartGridVirtualPositionIndex = {
  startIndex: number;
  endIndex: number;
  renderedCells: HTMLChSmartGridCellElement[];
  type: "index";
};
