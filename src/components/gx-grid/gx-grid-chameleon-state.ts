import {
  ChGridColumnFreeze,
  ChGridColumnSortDirection
} from "../grid/grid-column/ch-grid-column-types";
import { GxGrid } from "./genexus";

export class GridChameleonManagerState {
  private static grid: GxGrid;
  private static state: GridChameleonState;

  static load(grid: GxGrid, state: GridChameleonState) {
    this.grid = grid;
    this.state = state ?? {};
    this.state.Columns = this.state.Columns ?? [];

    this.loadLocal();
    this.apply();
  }

  static setColumnSort(
    columnId: string,
    sortDirection: ChGridColumnSortDirection
  ): void {
    this.state.SortColumnName = columnId;
    this.state.SortDirection = sortDirection;
  }

  static setColumnHidden(columnId: string, hidden: boolean): void {
    this.getColumn(columnId).Hidden = hidden;
    this.saveLocal();
  }

  static setColumnSize(columnId: string, size: string): void {
    this.getColumn(columnId).Size = size;
    this.saveLocal();
  }

  static setColumnFreeze(columnId: string, freeze: ChGridColumnFreeze): void {
    this.getColumn(columnId).Freeze = freeze;
    this.saveLocal();
  }

  static setColumnOrder(columnId: string, order: number): void {
    this.getColumn(columnId).Order = order;
    this.saveLocal();
  }

  static setColumnFilterEqual(columnId: string, value: string): void {
    this.getColumnFilter(columnId).Equal = value;
    this.updateIsFiltering(columnId);
  }

  static setColumnFilterLess(columnId: string, value: string): void {
    this.getColumnFilter(columnId).Less = value;
    this.updateIsFiltering(columnId);
  }

  static setColumnFilterGreater(columnId: string, value: string): void {
    this.getColumnFilter(columnId).Greater = value;
    this.updateIsFiltering(columnId);
  }

  private static apply() {
    const sortColumn = this.grid.getColumnByHtmlName(
      (this.state.SortColumnName ?? "").toUpperCase()
    );

    if (sortColumn) {
      sortColumn.SortDirection = this.state.SortDirection;
    }

    this.state.Columns?.forEach(stateColumn => {
      const column = this.grid.getColumnByHtmlName(
        stateColumn.Name.toUpperCase()
      );

      if (column) {
        if (typeof stateColumn.Hidden === "boolean") {
          column.Hidden = stateColumn.Hidden ? -1 : 0;
        }

        if (stateColumn.Size) {
          column.Size = "length";
          column.SizeLength = stateColumn.Size;
        }

        if (stateColumn.Order) {
          column.order = stateColumn.Order;
        }

        column.filterEqual =
          (stateColumn.Filter ?? {}).Equal ?? column.filterEqual;
        column.filterLess =
          (stateColumn.Filter ?? {}).Less ?? column.filterLess;
        column.filterGreater =
          (stateColumn.Filter ?? {}).Greater ?? column.filterGreater;

        this.updateIsFiltering(column.htmlName);
      }
    });
  }

  private static loadLocal() {
    this.grid.columns.forEach(column => {
      const columnSettings = localStorage
        .getItem(`${this.grid.ControlName}-${column.htmlName}`)
        ?.split("|");

      if (columnSettings) {
        if (columnSettings[0] !== "") {
          this.getColumn(column.htmlName).Hidden = columnSettings[0] === "true";
        }
        if (columnSettings[1] !== "") {
          this.getColumn(column.htmlName).Size = columnSettings[1];
        }
        if (columnSettings[2] !== "") {
          this.getColumn(column.htmlName).Order = parseInt(columnSettings[2]);
        }
        if (columnSettings[3] !== "") {
          this.getColumn(column.htmlName).Freeze = columnSettings[3];
        }
      }
    });
  }

  private static saveLocal() {
    this.state.Columns.forEach(column => {
      localStorage.setItem(
        `${this.grid.ControlName}-${column.Name}`,
        [column.Hidden, column.Size, column.Order, column.Freeze].join("|")
      );
    });
  }

  private static getColumn(name: string): GridChameleonStateColumn {
    let column = this.state.Columns.find(
      column => column.Name.localeCompare(name) === 0
    );

    if (!column) {
      column = {
        Name: name
      };
      this.state.Columns.push(column);
    }

    return column;
  }

  private static getColumnFilter(name: string): GridChameleonStateColumnFilter {
    const column = this.getColumn(name);

    if (!column.Filter) {
      column.Filter = {};
    }

    return column.Filter;
  }

  private static updateIsFiltering(columnId: string) {
    const column = this.grid.getColumnByHtmlName(columnId);

    column.isFiltering = !!(
      column.filterEqual ||
      column.filterGreater ||
      column.filterGreater
    );
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
  Freeze?: string;
  Order?: number;
  Filter?: GridChameleonStateColumnFilter;
}

export interface GridChameleonStateColumnFilter {
  Equal?: string;
  Less?: string;
  Greater?: string;
}
