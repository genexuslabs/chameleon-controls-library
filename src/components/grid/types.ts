export interface ChGridSelectionChangedEvent {
  rowsId: string[];
}

export interface ChGridCellClickedEvent {
  rowId: string;
  cellId: string;
}

export type CSSProperties = {
  [key: string]: string;
};

export interface IChGridCollapsible extends HTMLElement {
  collapsed: boolean;
}
