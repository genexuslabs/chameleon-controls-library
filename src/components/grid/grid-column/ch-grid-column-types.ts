export type ChGridColumnSortDirection = "asc" | "desc";
export type ChGridColumnFreeze = "start" | "end";

export interface ChGridColumnDragEvent {
  columnId: string;
  positionX?: number;
  direction?: "left" | "right";
}

export interface ChGridColumnSortChangedEvent {
  columnId: string;
  sortDirection: ChGridColumnSortDirection;
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

export interface ChGridColumnFreezeChangedEvent {
  columnId: string;
  freeze: ChGridColumnFreeze;
}
