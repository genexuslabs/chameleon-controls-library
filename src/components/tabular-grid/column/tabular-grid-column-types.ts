export type TabularGridColumnSortDirection = "asc" | "desc";
export type TabularGridColumnFreeze = "start" | "end";

export interface TabularGridColumnResizeEvent {
  columnId: string;
  deltaWidth?: number;
}

export interface TabularGridColumnDragEvent {
  columnId: string;
  positionX?: number;
  direction?: "left" | "right";
}

export interface TabularGridColumnSortChangedEvent {
  columnId: string;
  sortDirection: TabularGridColumnSortDirection;
}

export interface TabularGridColumnHiddenChangedEvent {
  columnId: string;
  hidden: boolean;
}

export interface TabularGridColumnSizeChangedEvent {
  columnId: string;
  size: string;
}

export interface TabularGridColumnOrderChangedEvent {
  columnId: string;
  order: number;
}

export interface TabularGridColumnSelectorClickedEvent {
  checked: boolean;
}

export interface TabularGridColumnFreezeChangedEvent {
  columnId: string;
  freeze: TabularGridColumnFreeze;
}
