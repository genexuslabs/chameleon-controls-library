export interface TabularGridSelectionChangedEvent {
  rowsId: string[];
  addedRowsId: string[];
  removedRowsId: string[];
  unalteredRowsId: string[];
}

export interface TabularGridMarkingChangedEvent {
  rowsId: string[];
  addedRowsId: string[];
  removedRowsId: string[];
  unalteredRowsId: string[];
}

export interface TabularGridCellSelectionChangedEvent {
  columnId: string;
  rowId: string;
  cellId: string;
}

export interface TabularGridRowClickedEvent {
  rowId: string;
  cellId?: string;
  columnId?: string;
}

export interface TabularGridRowPressedEvent {
  rowId: string;
  cellId?: string;
  columnId?: string;
}

export interface TabularGridRowContextMenuEvent {
  rowId: string;
  cellId?: string;
  columnId?: string;
  selectedRowsId?: string[];
  clientX: number;
  clientY: number;
}

export type CSSProperties = {
  [key: string]: string;
};

export interface ITabularGridCollapsible extends HTMLElement {
  collapsed: boolean;
}
