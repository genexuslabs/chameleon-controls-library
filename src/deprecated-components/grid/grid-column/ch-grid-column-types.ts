/**
 * @deprecated
 * Use `ch-tabular-grid` component instead.
 * Use `TabularGridColumnSortDirection` instead.
 */
export type ChGridColumnSortDirection = "asc" | "desc";

/**
 * @deprecated
 * Use `ch-tabular-grid` component instead.
 * Use `TabularGridColumnFreeze` instead.
 */
export type ChGridColumnFreeze = "start" | "end";

/**
 * @deprecated
 * Use `ch-tabular-grid` component instead.
 * Use `TabularGridColumnResizeEvent` instead.
 */
export interface ChGridColumnResizeEvent {
  columnId: string;
  deltaWidth?: number;
}

/**
 * @deprecated
 * Use `ch-tabular-grid` component instead.
 * Use `TabularGridColumnDragEvent` instead.
 */
export interface ChGridColumnDragEvent {
  columnId: string;
  positionX?: number;
  direction?: "left" | "right";
}

/**
 * @deprecated
 * Use `ch-tabular-grid` component instead.
 * Use `TabularGridColumnSortDirection` instead.
 */
export interface ChGridColumnSortChangedEvent {
  columnId: string;
  sortDirection: ChGridColumnSortDirection;
}

/**
 * @deprecated
 * Use `ch-tabular-grid` component instead.
 * Use `TabularGridColumnHiddenChangedEvent` instead.
 */
export interface ChGridColumnHiddenChangedEvent {
  columnId: string;
  hidden: boolean;
}

/**
 * @deprecated
 * Use `ch-tabular-grid` component instead.
 * Use `TabularGridColumnSizeChangedEvent` instead.
 */
export interface ChGridColumnSizeChangedEvent {
  columnId: string;
  size: string;
}

/**
 * @deprecated
 * Use `ch-tabular-grid` component instead.
 * Use `TabularGridColumnOrderChangedEvent` instead.
 */
export interface ChGridColumnOrderChangedEvent {
  columnId: string;
  order: number;
}

/**
 * @deprecated
 * Use `ch-tabular-grid` component instead.
 * Use `TabularGridColumnSelectorClickedEvent` instead.
 */
export interface ChGridColumnSelectorClickedEvent {
  checked: boolean;
}

/**
 * @deprecated
 * Use `ch-tabular-grid` component instead.
 * Use `TabularGridColumnFreezeChangedEvent` instead.
 */
export interface ChGridColumnFreezeChangedEvent {
  columnId: string;
  freeze: ChGridColumnFreeze;
}
