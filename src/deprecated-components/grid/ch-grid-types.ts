/**
 * @deprecated
 * Use `ch-tabular-grid` component instead.
 * Use `TabularGridSelectionChangedEvent` instead.
 */
export interface ChGridSelectionChangedEvent {
  rowsId: string[];
  addedRowsId: string[];
  removedRowsId: string[];
  unalteredRowsId: string[];
}

/**
 * @deprecated
 * Use `ch-tabular-grid` component instead.
 * Use `TabularGridMarkingChangedEvent` instead.
 */
export interface ChGridMarkingChangedEvent {
  rowsId: string[];
  addedRowsId: string[];
  removedRowsId: string[];
  unalteredRowsId: string[];
}

/**
 * @deprecated
 * Use `ch-tabular-grid` component instead.
 * Use `TabularGridCellSelectionChangedEvent` instead.
 */
export interface ChGridCellSelectionChangedEvent {
  columnId: string;
  rowId: string;
  cellId: string;
}

/**
 * @deprecated
 * Use `ch-tabular-grid` component instead.
 * Use `TabularGridRowClickedEvent` instead.
 */
export interface ChGridRowClickedEvent {
  rowId: string;
  cellId?: string;
  columnId?: string;
}

/**
 * @deprecated
 * Use `ch-tabular-grid` component instead.
 * Use `TabularGridRowPressedEvent` instead.
 */
export interface ChGridRowPressedEvent {
  rowId: string;
  cellId?: string;
  columnId?: string;
}

/**
 * @deprecated
 * Use `ch-tabular-grid` component instead.
 * Use `TabularGridRowContextMenuEvent` instead.
 */
export interface ChGridRowContextMenuEvent {
  rowId: string;
  cellId?: string;
  columnId?: string;
  selectedRowsId?: string[];
  clientX: number;
  clientY: number;
}

/**
 * @deprecated
 * Use `ch-tabular-grid` component instead.
 */
export type CSSProperties = {
  [key: string]: string;
};

/**
 * @deprecated
 * Use `ch-tabular-grid` component instead.
 * Use `ITabularGridCollapsible` instead.
 */
export interface IChGridCollapsible extends HTMLElement {
  collapsed: boolean;
}
