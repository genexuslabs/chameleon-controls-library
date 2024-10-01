import {
  TabularGridColumnFreeze,
  TabularGridColumnSortDirection
} from "../tabular-grid/column/tabular-grid-column-types";

export type TabularGridModel = {
  columns: TabularGridColumnModel[];
  rowsets: TabularGridRowsetModel[];
};

export type TabularGridColumnModel = {
  id: string;
  caption: string;

  accessibleName?: string;
  captionHidden?: boolean;
  freeze?: TabularGridColumnFreeze;
  hidden?: boolean;

  /**
   * Determines if the column can be hidden by the user.
   *
   * By default, this property takes to value of the ch-tabular-grid-render.
   */
  hideable?: boolean;

  order?: number;

  /**
   * Determines if the column can be resized by the user.
   *
   * By default, this property takes to value of the ch-tabular-grid-render.
   */
  resizable?: boolean;

  size?: string;

  /**
   * Determines if the column can be sorted by the user.
   *
   * By default, this property takes to value of the ch-tabular-grid-render.
   */
  sortable?: boolean;

  sortDirection?: TabularGridColumnSortDirection;
  tooltip?: string;
};

export type TabularGridRowsetModel = {
  legend?: TabularGridRowsetLegendModel;
  rows: TabularGridRowModel[];
  rowsets?: TabularGridRowsetModel[];
};

export type TabularGridRowsetLegendModel = {
  caption: string;
  accessibleName?: string;
};

export type TabularGridRowModel = {
  cells: TabularGridCellModel[];
  rows?: TabularGridRowModel[];
};

export type TabularGridCellModel = {
  text: string;
};
