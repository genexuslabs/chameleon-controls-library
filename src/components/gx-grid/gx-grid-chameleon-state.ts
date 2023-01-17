import { ColumnSortDirection } from "../grid/grid-column/ch-grid-column-types";
import { GxGrid } from "./genexus";

export class GridChameleonManagerState {
  private static grid: GxGrid;
  private static state: GridChameleonState;

  static load(grid: GxGrid, state: GridChameleonState) {
    this.grid = grid;
    this.state = state ?? {};
    this.state.Columns = this.state.Columns ?? [];

    this.apply();
  }

  static setColumnSort(
    columnId: string,
    sortDirection: ColumnSortDirection
  ): void {
    this.state.SortColumnName = columnId;
    this.state.SortDirection = sortDirection;
  }

  static setColumnHidden(columnId: string, hidden: boolean): void {
    this.getColumn(columnId).Hidden = hidden;
  }

  static setColumnSize(columnId: string, size: string): void {
    this.getColumn(columnId).Size = size;
  }

  static setColumnOrder(columnId: string, order: number): void {
    this.getColumn(columnId).Order = order;
  }

  static setColumnFilterEqual(columnId: string, value: string): void {
    this.getColumnFilter(columnId).Equal = value;
  }

  static setColumnFilterLess(columnId: string, value: string): void {
    this.getColumnFilter(columnId).Less = value;
  }

  static setColumnFilterGreater(columnId: string, value: string): void {
    this.getColumnFilter(columnId).Greater = value;
  }

  private static apply() {
    let sortColumn = this.grid.getColumnByHtmlName(
      (this.state.SortColumnName ?? "").toUpperCase()
    );

    if (sortColumn) {
      sortColumn.SortDirection = this.state.SortDirection;
    }

    this.state.Columns?.forEach((stateColumn) => {
      let column = this.grid.getColumnByHtmlName(
        stateColumn.Name.toUpperCase()
      );

      if (column) {
        column.Hidden = stateColumn.Hidden ? -1 : 0;
        column.filterEqual =
          (stateColumn.Filter ?? {}).Equal ?? column.filterEqual;
        column.filterLess =
          (stateColumn.Filter ?? {}).Less ?? column.filterLess;
        column.filterGreater =
          (stateColumn.Filter ?? {}).Greater ?? column.filterGreater;
      }
    });
  }

  private static getColumn(name: string): GridChameleonStateColumn {
    let column = this.state.Columns.find(
      (column) => column.Name.localeCompare(name) == 0
    );

    if (!column) {
      column = {
        Name: name,
      };
      this.state.Columns.push(column);
    }

    return column;
  }

  private static getColumnFilter(name: string): GridChameleonStateColumnFilter {
    let column = this.getColumn(name);

    if (!column.Filter) {
      column.Filter = {};
    }

    return column.Filter;
  }
}

export interface GridChameleonState {
  SortColumnName?: string;
  SortDirection?: "asc" | "desc";
  Columns?: GridChameleonStateColumn[];
}

export interface GridChameleonStateColumn {
  Name: string;
  Hidden?: boolean;
  Size?: string;
  Order?: number;
  Filter?: GridChameleonStateColumnFilter;
}

export interface GridChameleonStateColumnFilter {
  Equal?: string;
  Less?: string;
  Greater?: string;
}
