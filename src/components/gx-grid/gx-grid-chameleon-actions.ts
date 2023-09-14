import { ChGridColumnSortDirection } from "../grid/grid-column/ch-grid-column-types";
import { GxGrid } from "./genexus";

export function gridRefresh(grid: GxGrid) {
  grid.ParentObject.refreshGrid(grid.ControlName);
}

export function gridSort(
  grid: GxGrid,
  columnId: string,
  sortDirection: ChGridColumnSortDirection
) {
  const column = grid.getColumnByHtmlName(columnId);

  grid.setSort(column.index, sortDirection !== "desc");
}
