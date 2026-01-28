export type TabularGridModel = {
  columns: TabularGridColumnsModel;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                          Common
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * In a grid or table that provides sort functionality, this type specifies the
 * possible options to set on the header cell element for the sorted column or
 * row.
 */
export type TabularGridSortDirection =
  | "ascending"
  | "descending"
  | "other"
  | "none";

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                          Columns
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export type TabularGridColumnsModel =
  | TabularGridColumnsSingleLevelModel
  | TabularGridColumnsMultiLevelModel;

export type TabularGridColumnsSingleLevelModel = TabularGridColumnItemModel[];

export type TabularGridColumnsMultiLevelModel = TabularGridColumnItemModel[][];

export type TabularGridColumnItemModel = {
  id: string;

  accessibleName?: string;

  caption?: string;

  checkbox?: boolean;

  colSpan?: number;

  colStart?: number;

  /**
   * Useful for sorting the columns and for implementing the Pivot Table (avg, sum, etc).
   */
  dataType?: "string" | "number" | "boolean" | "datetime";

  // freeze?: TabularGridColumnFreeze;

  hidden?: boolean;

  /**
   * Determines if the column can be hidden by the user.
   *
   * By default, this property takes to value of the ch-tabular-grid-render.
   */
  hideable?: boolean;

  // order?: number;

  parts?: string;

  /**
   * Determines if the column can be resized by the user.
   *
   * By default, this property takes to value of the `ch-tabular-grid-render`.
   */
  resizable?: boolean;

  rowSpan?: number;

  // popup ???
  // expandable ???
  // expanded ???

  size?: string;

  /**
   * Determines if the column can be sorted by the user.
   *
   * By default, this property takes to value of the `ch-tabular-grid-render`.
   */
  sortable?: boolean;

  sortDirection?: TabularGridSortDirection;

  // tooltip?: string;
};

