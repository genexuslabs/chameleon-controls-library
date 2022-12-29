export type ColumnSortDirection = "asc" | "desc";

export interface ChGridColumnDragEvent {
  columnId: string;
  positionX?: number;
  direction?: "left" | "right";
}

export interface ChGridColumnSortChangedEvent {
  columnId: string;
  sortDirection: ColumnSortDirection;
}

export interface ChGridColumnHiddenChangedEvent {
  columnId: string;
  hidden: boolean;
}

export interface ChGridColumnSizeChangedEvent {
  columnId: string;
  size: string;
}

export interface ChGridColumnOrderChangedEvent {
  columnId: string;
  order: number;
}

export interface ChGridColumnSelectorClickedEvent {
  checked: boolean;
}
