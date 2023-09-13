import HTMLChGridCellElement from "./grid-cell/ch-grid-cell";
import HTMLChGridRowElement from "./grid-row/ch-grid-row";
import { ChGridManager } from "./ch-grid-manager";

export type ManagerSelectionState = {
  rowFocused: HTMLChGridRowElement;
  rowsSelected: HTMLChGridRowElement[];
  cellSelected: HTMLChGridCellElement;
};

export class ChGridManagerSelection {
  private manager: ChGridManager;
  private rangeStart: HTMLChGridRowElement;
  private rangeValue: boolean;
  private lastRowMarked: HTMLChGridRowElement;
  private selectionStateNone: ManagerSelectionState = {
    rowFocused: null,
    rowsSelected: [],
    cellSelected: null
  };

  selecting: boolean;
  selectingRow: HTMLChGridRowElement;
  selectingCell: HTMLChGridCellElement;

  constructor(manager: ChGridManager) {
    this.manager = manager;
  }

  select(
    state: ManagerSelectionState,
    row: HTMLChGridRowElement,
    cell: HTMLChGridCellElement,
    append: boolean,
    range: boolean,
    context: boolean
  ): ManagerSelectionState {
    if (this.manager.grid.rowSelectionMode === "none") {
      return this.selectionStateNone;
    } else if (this.manager.grid.rowSelectionMode !== "multiple") {
      append = false;
      range = false;
    }

    let rowFocused = state.rowFocused;
    let rowsSelected = state.rowsSelected;
    let cellSelected = state.cellSelected;

    rowFocused = row;
    if (range) {
      const rangeRows = this.manager.getRowsRange(this.rangeStart ?? row, row);

      if (this.rangeValue) {
        if (append) {
          rowsSelected = Array.from(new Set(rowsSelected.concat(rangeRows)));
        } else {
          rowsSelected =
            rowsSelected.length === rangeRows.length ? rowsSelected : rangeRows;
        }
        cellSelected =
          cell ||
          row.getCell(cellSelected?.column || this.manager.getFirstColumn());
      } else {
        rowsSelected = rowsSelected.filter(
          rowSelected => !rangeRows.includes(rowSelected)
        );
        cellSelected = null;
      }
    } else if (append) {
      this.rangeStart = row;
      this.rangeValue = !row.selected;

      if (rowsSelected.includes(row)) {
        rowsSelected = rowsSelected.filter(rowSelected => rowSelected !== row);
        cellSelected = null;
      } else {
        rowsSelected = [...rowsSelected, row];
        cellSelected =
          cell ||
          row.getCell(cellSelected?.column || this.manager.getFirstColumn());
      }
    } else {
      this.rangeStart = row;
      this.rangeValue = true;

      if (
        !(rowsSelected.length === 1 && rowsSelected[0] === row) &&
        !(context && rowsSelected.includes(row))
      ) {
        rowsSelected = [row];
      }
      cellSelected =
        cell ||
        row.getCell(cellSelected?.column || this.manager.getFirstColumn());
    }

    return { rowFocused, rowsSelected, cellSelected };
  }

  selectAll(state: ManagerSelectionState, value = true): ManagerSelectionState {
    if (this.manager.grid.rowSelectionMode === "none") {
      return this.selectionStateNone;
    }

    const rows = this.manager.getRows();
    let rowFocused = state.rowFocused;
    let rowsSelected = state.rowsSelected;
    let cellSelected = state.cellSelected;

    if (value) {
      rowFocused = rowFocused ?? this.manager.getFirstRow();
      rowsSelected = rows;
      cellSelected = rowFocused.getCell(
        state.cellSelected?.column || this.manager.getFirstColumn()
      );
    } else {
      rowFocused = rowFocused ?? this.manager.getFirstRow();
      rowsSelected = [];
      cellSelected = null;
    }

    return { rowFocused, rowsSelected, cellSelected };
  }

  selectSet(
    state: ManagerSelectionState,
    row: HTMLChGridRowElement,
    cell: HTMLChGridCellElement,
    value = true
  ): ManagerSelectionState {
    let append = true;

    if (this.manager.grid.rowSelectionMode === "none") {
      return this.selectionStateNone;
    } else if (this.manager.grid.rowSelectionMode !== "multiple") {
      append = false;
    }

    let rowFocused = state.rowFocused;
    let rowsSelected = state.rowsSelected;
    let cellSelected = state.cellSelected;

    rowFocused = row;
    if (value) {
      if (append) {
        rowsSelected = rowsSelected.includes(row)
          ? rowsSelected
          : [...rowsSelected, row];
      } else {
        rowsSelected = rowsSelected.includes(row) ? rowsSelected : [row];
      }
      cellSelected = cell;
    } else {
      rowsSelected = !rowsSelected.includes(row)
        ? rowsSelected
        : rowsSelected.filter(rowSelected => rowSelected !== row);
      cellSelected = null;
    }

    return { rowFocused, rowsSelected, cellSelected };
  }

  selectFirstRow(
    state: ManagerSelectionState,
    append: boolean
  ): ManagerSelectionState {
    if (this.manager.grid.rowSelectionMode === "none") {
      return this.selectionStateNone;
    } else if (this.manager.grid.rowSelectionMode !== "multiple") {
      append = false;
    }

    const firstRow = this.manager.getFirstRow();
    let rowFocused = state.rowFocused;
    let rowsSelected = state.rowsSelected;
    let cellSelected = state.cellSelected;

    if (firstRow) {
      if (append) {
        const rangeRows = this.manager.getRowsRange(
          rowFocused ?? firstRow,
          firstRow
        );
        rowsSelected = Array.from(new Set(rowsSelected.concat(rangeRows)));
      } else {
        rowsSelected = [firstRow];
      }
      rowFocused = firstRow;
      cellSelected = firstRow.getCell(
        state.cellSelected?.column || this.manager.getFirstColumn()
      );
    }

    return { rowFocused, rowsSelected, cellSelected };
  }

  selectPreviousRow(
    state: ManagerSelectionState,
    append: boolean
  ): ManagerSelectionState {
    if (this.manager.grid.rowSelectionMode === "none") {
      return this.selectionStateNone;
    } else if (this.manager.grid.rowSelectionMode !== "multiple") {
      append = false;
    }

    const previousRow = this.manager.getPreviousRow(state.rowFocused);
    let rowFocused = state.rowFocused;
    let rowsSelected = state.rowsSelected;
    let cellSelected = state.cellSelected;

    if (previousRow) {
      if (append) {
        const sortedRowsSelected = this.sortRowsSelected(rowsSelected);
        const isContiguousSelection =
          this.isContiguousSelection(sortedRowsSelected);

        if (isContiguousSelection && rowFocused === sortedRowsSelected[0]) {
          rowsSelected = [...rowsSelected, previousRow];
        } else if (
          isContiguousSelection &&
          rowFocused === sortedRowsSelected[sortedRowsSelected.length - 1]
        ) {
          rowsSelected = rowsSelected.slice(0, -1);
        } else {
          rowsSelected = [rowFocused, previousRow];
        }
      } else {
        rowsSelected = [previousRow];
      }
      rowFocused = previousRow;
      cellSelected = previousRow.getCell(
        cellSelected?.column || this.manager.getFirstColumn()
      );
    }

    return { rowFocused, rowsSelected, cellSelected };
  }

  selectNextRow(
    state: ManagerSelectionState,
    append: boolean
  ): ManagerSelectionState {
    if (this.manager.grid.rowSelectionMode === "none") {
      return this.selectionStateNone;
    } else if (this.manager.grid.rowSelectionMode !== "multiple") {
      append = false;
    }

    const nextRow = this.manager.getNextRow(state.rowFocused);
    let rowFocused = state.rowFocused;
    let rowsSelected = state.rowsSelected;
    let cellSelected = state.cellSelected;

    if (nextRow) {
      if (append) {
        const sortedRowsSelected = this.sortRowsSelected(rowsSelected);
        const isContiguousSelection =
          this.isContiguousSelection(sortedRowsSelected);

        if (
          isContiguousSelection &&
          rowFocused === sortedRowsSelected[sortedRowsSelected.length - 1]
        ) {
          rowsSelected = [...rowsSelected, nextRow];
        } else if (
          isContiguousSelection &&
          rowFocused === sortedRowsSelected[0]
        ) {
          rowsSelected = rowsSelected.slice(1);
        } else {
          rowsSelected = [rowFocused, nextRow];
        }
      } else {
        rowsSelected = [nextRow];
      }
      rowFocused = nextRow;
      cellSelected = nextRow.getCell(
        cellSelected?.column || this.manager.getFirstColumn()
      );
    }

    return { rowFocused, rowsSelected, cellSelected };
  }

  selectLastRow(
    state: ManagerSelectionState,
    append: boolean
  ): ManagerSelectionState {
    if (this.manager.grid.rowSelectionMode === "none") {
      return this.selectionStateNone;
    } else if (this.manager.grid.rowSelectionMode !== "multiple") {
      append = false;
    }

    const firstRow = this.manager.getLastRow();
    let rowFocused = state.rowFocused;
    let rowsSelected = state.rowsSelected;
    let cellSelected = state.cellSelected;

    if (firstRow) {
      if (append) {
        const rangeRows = this.manager.getRowsRange(
          rowFocused ?? firstRow,
          firstRow
        );
        rowsSelected = Array.from(new Set(rowsSelected.concat(rangeRows)));
      } else {
        rowsSelected = [firstRow];
      }
      rowFocused = firstRow;
      cellSelected = firstRow.getCell(
        state.cellSelected?.column || this.manager.getFirstColumn()
      );
    }

    return { rowFocused, rowsSelected, cellSelected };
  }

  selectPreviousPageRow(
    state: ManagerSelectionState,
    append: boolean
  ): ManagerSelectionState {
    if (this.manager.grid.rowSelectionMode === "none") {
      return this.selectionStateNone;
    } else if (this.manager.grid.rowSelectionMode !== "multiple") {
      append = false;
    }

    const rows = this.manager.getRows();
    const rowsPerPage = this.manager.getRowsPerPage();
    let rowFocused = state.rowFocused;
    let rowsSelected = state.rowsSelected;
    let cellSelected = state.cellSelected;

    const previousPageRow =
      rows[Math.max(rows.indexOf(rowFocused) - rowsPerPage, 0)];
    if (previousPageRow) {
      if (append) {
        const rangeRows = this.manager.getRowsRange(
          rowFocused ?? previousPageRow,
          previousPageRow
        );
        rowsSelected = Array.from(new Set(rowsSelected.concat(rangeRows)));
      } else {
        rowsSelected =
          rowsSelected.length === 1 && rowsSelected[0] === previousPageRow
            ? rowsSelected
            : [previousPageRow];
      }
      rowFocused = previousPageRow;
      cellSelected = previousPageRow.getCell(
        state.cellSelected?.column || this.manager.getFirstColumn()
      );
    }

    return { rowFocused, rowsSelected, cellSelected };
  }

  selectNextPageRow(
    state: ManagerSelectionState,
    append: boolean
  ): ManagerSelectionState {
    if (this.manager.grid.rowSelectionMode === "none") {
      return this.selectionStateNone;
    } else if (this.manager.grid.rowSelectionMode !== "multiple") {
      append = false;
    }

    const rows = this.manager.getRows();
    const rowsPerPage = this.manager.getRowsPerPage();
    let rowFocused = state.rowFocused;
    let rowsSelected = state.rowsSelected;
    let cellSelected = state.cellSelected;

    const nextPageRow =
      rows[Math.min(rows.indexOf(rowFocused) + rowsPerPage, rows.length - 1)];
    if (nextPageRow) {
      if (append) {
        const rangeRows = this.manager.getRowsRange(
          rowFocused ?? nextPageRow,
          nextPageRow
        );
        rowsSelected = Array.from(new Set(rowsSelected.concat(rangeRows)));
      } else {
        rowsSelected =
          rowsSelected.length === 1 && rowsSelected[0] === nextPageRow
            ? rowsSelected
            : [nextPageRow];
      }
      rowFocused = nextPageRow;
      cellSelected = nextPageRow.getCell(
        state.cellSelected?.column || this.manager.getFirstColumn()
      );
    }

    return { rowFocused, rowsSelected, cellSelected };
  }

  selectPreviousCell(state: ManagerSelectionState): ManagerSelectionState {
    if (this.manager.grid.rowSelectionMode === "none") {
      return this.selectionStateNone;
    }

    const rowFocused = state.rowFocused;
    let rowsSelected = state.rowsSelected;
    let cellSelected = state.cellSelected;

    if (cellSelected) {
      const nextCell = this.manager.getPreviousCell(cellSelected);
      if (nextCell) {
        cellSelected = nextCell;
      }
    } else {
      if (!rowsSelected.includes(rowFocused)) {
        rowsSelected = [...rowsSelected, rowFocused];
      }
      if (!cellSelected) {
        cellSelected = rowFocused.getCell(this.manager.getFirstColumn());
      }
    }

    return { rowFocused, rowsSelected, cellSelected };
  }

  selectNextCell(state: ManagerSelectionState): ManagerSelectionState {
    if (this.manager.grid.rowSelectionMode === "none") {
      return this.selectionStateNone;
    }

    const rowFocused = state.rowFocused;
    let rowsSelected = state.rowsSelected;
    let cellSelected = state.cellSelected;

    if (cellSelected) {
      const nextCell = this.manager.getNextCell(cellSelected);
      if (nextCell) {
        cellSelected = nextCell;
      }
    } else {
      if (!rowsSelected.includes(rowFocused)) {
        rowsSelected = [...rowsSelected, rowFocused];
      }
      if (!cellSelected) {
        cellSelected = rowFocused.getCell(this.manager.getFirstColumn());
      }
    }

    return { rowFocused, rowsSelected, cellSelected };
  }

  markRow(
    row: HTMLChGridRowElement,
    checked: boolean,
    range: boolean,
    currentRowsMarked: HTMLChGridRowElement[]
  ): HTMLChGridRowElement[] {
    if (row) {
      if (range) {
        const value = !row.marked;
        const rows = this.manager.getRowsRange(this.lastRowMarked ?? row, row);

        this.lastRowMarked = row;

        if (value) {
          return currentRowsMarked.concat(
            rows.filter(row => !currentRowsMarked.includes(row))
          );
        } else {
          return currentRowsMarked.filter(row => !rows.includes(row));
        }
      } else {
        this.lastRowMarked = row;

        if (checked && !currentRowsMarked.includes(row)) {
          return currentRowsMarked.concat([row]);
        } else if (!checked && currentRowsMarked.includes(row)) {
          return currentRowsMarked.filter(r => r !== row);
        }
      }
    }

    return currentRowsMarked;
  }

  markAllRows(value = true): HTMLChGridRowElement[] {
    if (value) {
      return this.manager.getRows();
    } else {
      return [];
    }
  }

  syncRowSelector(
    rows: HTMLChGridRowElement[],
    previous: HTMLChGridRowElement[] = [],
    selectorMode: "select" | "mark"
  ) {
    const columnSelector = this.manager.columns.getColumnSelector();

    if (columnSelector?.richRowSelectorMode === selectorMode) {
      const indexColumnSelector = columnSelector.physicalOrder - 1;

      previous
        ?.filter(x => !rows.includes(x))
        .forEach(row => {
          row.marked = false;
          const cell = row.children[
            indexColumnSelector
          ] as HTMLChGridCellElement;
          cell.setSelectorChecked(false);
        });

      rows?.forEach(row => {
        row.marked = columnSelector.richRowSelectorMode === "mark";
        const cell = row.children[indexColumnSelector] as HTMLChGridCellElement;
        cell.setSelectorChecked(true);
      });

      if (rows.length === 0) {
        columnSelector.richRowSelectorState = "";
      } else if (rows.length === this.manager.getRows().length) {
        columnSelector.richRowSelectorState = "checked";
      } else {
        columnSelector.richRowSelectorState = "indeterminate";
      }
    }
  }

  private sortRowsSelected(
    rowsSelected: HTMLChGridRowElement[]
  ): HTMLChGridRowElement[] {
    const rows = Array.from(
      this.manager.grid.querySelectorAll("ch-grid-row")
    ) as HTMLChGridRowElement[];

    return rowsSelected.sort((rowA, rowB) => {
      const rowAIndex = rows.indexOf(rowA);
      const rowBIndex = rows.indexOf(rowB);
      if (rowAIndex < rowBIndex) {
        return -1;
      }
      if (rowAIndex > rowBIndex) {
        return 1;
      }
      return 0;
    });
  }

  private isContiguousSelection(
    sortedRowsSelected: HTMLChGridRowElement[]
  ): boolean {
    const rows = (
      Array.from(
        this.manager.grid.querySelectorAll("ch-grid-row")
      ) as HTMLChGridRowElement[]
    ).filter(row => row.isVisible());

    if (sortedRowsSelected.length === 0) {
      return false;
    } else if (sortedRowsSelected.length === 1) {
      return true;
    } else {
      const startIndex = rows.indexOf(sortedRowsSelected[0]);
      const endIndex = rows.indexOf(
        sortedRowsSelected[sortedRowsSelected.length - 1]
      );
      return endIndex - startIndex + 1 === sortedRowsSelected.length;
    }
  }

  getToggledMarkRow(
    rows: HTMLChGridRowElement[],
    previous: HTMLChGridRowElement[]
  ): HTMLChGridRowElement | null {
    let toggledMarkRow = null;
    if (rows?.length !== previous?.length) {
      toggledMarkRow = rows.filter(row => !previous.includes(row));
      if (toggledMarkRow.length === 0) {
        /* row was unmarked*/
        toggledMarkRow = previous.filter(row => !rows.includes(row));
      }
      if (toggledMarkRow.length === 1) {
        return toggledMarkRow[0];
      }
    }
    return null;
  }
}
