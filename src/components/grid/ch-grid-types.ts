export interface ChGridSelectionChangedEvent {
  rowsId: string[];
}

export interface ChGridRowClickedEvent {
  rowId: string;
  cellId?: string;
}

export type CSSProperties = {
  [key: string]: string;
};

export interface IChGridCollapsible extends HTMLElement {
  collapsed: boolean;
}
