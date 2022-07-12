export type ColumnSortDirection = 'asc' | 'desc';

export interface ChGridColumnDragEvent {
  columnId: string;
  positionX?: number;
  direction?: "left" | "right";
}

export interface ChGridColumnSortChangedEvent {
  columnId: string;
  sortDirection: ColumnSortDirection;
}