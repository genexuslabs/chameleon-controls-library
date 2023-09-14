export interface ChGridSelectionChangedEvent {
  rowsId: string[];
}

export interface ChGridMarkingChangedEvent {
  rowsId: string[];
}

export interface ChGridCellSelectionChangedEvent {
  columnId: string;
  rowId: string;
  cellId: string;
}

export interface ChGridRowClickedEvent {
  rowId: string;
  cellId?: string;
  columnId?: string;
}

export interface ChGridRowPressedEvent {
  rowId: string;
  cellId?: string;
  columnId?: string;
}

export type CSSProperties = {
  [key: string]: string;
};

export interface IChGridCollapsible extends HTMLElement {
  collapsed: boolean;
}
