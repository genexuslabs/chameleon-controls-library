import {
  TabularGridColumnFreeze,
  TabularGridColumnSortDirection
} from "../tabular-grid/column/tabular-grid-column-types";

export type TabularGridModel = {
  columns: TabularGridColumnsModel;
  rowsets: TabularGridRowsetsModel;
};

export type TabularGridColumnsModel = TabularGridColumnItemModel[];

export type TabularGridColumnItemModel = {
  id: string;
  caption: string;

  parts?: string;
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

export type TabularGridRowsetsModel =
  | TabularGridRowsetItemSimpleModel
  | [TabularGridRowsetItemSimpleModel, ...TabularGridRowsetsGroupModel]
  | TabularGridRowsetsGroupModel;

export type TabularGridRowsetItemSimpleModel = {
  rows: TabularGridRowsModel;
  rowsets?: TabularGridRowsetsGroupModel;
};

export type TabularGridRowsetsGroupModel = TabularGridRowsetItemGroupModel[];

export type TabularGridRowsetItemGroupModel =
  TabularGridRowsetItemSimpleModel & {
    id: string;
    caption: string;
    accessibleName?: string;
    parts?: string;
  };

export type TabularGridRowsModel = TabularGridRowItemModel[];

export type TabularGridRowItemModel = {
  id: string;
  cells: TabularGridCellsModel;
  rows?: TabularGridRowsModel;
  parts?: string;
};

export type TabularGridCellsModel = TabularGridCellItemModel[];

export type TabularGridCellItemModel = {
  text: string;
  id?: string;
  parts?: string;
};
