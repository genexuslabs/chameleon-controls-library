import HTMLChTabularGridCellElement from "./cell/tabular-grid-cell";
import HTMLChTabularGridRowElement from "./row/tabular-grid-row";
import { TabularGridManager } from "./tabular-grid-manager";

export type ManagerSelectionState = {
  rowFocused: HTMLChTabularGridRowElement;
  rowsSelected: HTMLChTabularGridRowElement[];
  cellFocused: HTMLChTabularGridCellElement;
  cellSelected: HTMLChTabularGridCellElement;
};

export class TabularGridManagerSelection {
  private manager: TabularGridManager;
  private rangeStart: HTMLChTabularGridRowElement;
  private rangeValue: boolean;
  private lastSelected: HTMLChTabularGridRowElement;
  private lastRowMarked: HTMLChTabularGridRowElement;
  private selectionStateNone: ManagerSelectionState = {
    rowFocused: null,
    rowsSelected: [],
    cellFocused: null,
    cellSelected: null
  };
  private touch: {
    clientX: number;
    clientY: number;
  };

  selecting: boolean;
  selectingRow: HTMLChTabularGridRowElement;
  selectingCell: HTMLChTabularGridCellElement;

  constructor(manager: TabularGridManager) {
    this.manager = manager;
  }

  touchStart(touchEvent: TouchEvent) {
    this.touch = {
      clientX: touchEvent.touches[0].clientX,
      clientY: touchEvent.touches[0].clientY
    };
  }

  isTouchEndSelection(touchEvent: TouchEvent): boolean {
    return (
      Math.abs(this.touch.clientX - touchEvent.changedTouches[0].clientX) <
        10 &&
      Math.abs(this.touch.clientY - touchEvent.changedTouches[0].clientY) <
        10 &&
      touchEvent.cancelable
    );
  }

  select(
    state: ManagerSelectionState,
    row: HTMLChTabularGridRowElement,
    cell: HTMLChTabularGridCellElement,
    select: boolean,
    append: boolean,
    range: boolean,
    rangeStartOn: "focus" | "last-selected",
    context: boolean
  ): ManagerSelectionState {
    const grid = this.manager.grid;

    if (
      grid.keyboardNavigationMode === "none" &&
      grid.rowSelectionMode === "none"
    ) {
      return this.selectionStateNone;
    }
    if (grid.rowSelectionMode === "none") {
      select = false;
    }
    if (grid.rowSelectionMode !== "multiple") {
      append = false;
      range = false;
    }
    if (!row) {
      return state;
    }

    let { rowFocused, rowsSelected, cellFocused, cellSelected } = state;

    rowFocused = row;
    cellFocused = cell;
    if (range) {
      if (!this.rangeStart) {
        if (rangeStartOn === "focus") {
          this.rangeStart = state.rowFocused;
          this.rangeValue = append ? !state.rowFocused.selected : true;
        } else if (rangeStartOn === "last-selected") {
          this.rangeStart = this.lastSelected ?? state.rowFocused;
          this.rangeValue = append ? this.lastSelected.selected : true;
        }
      }

      const rangeRows = this.manager.getRowsRange(this.rangeStart ?? row, row);

      if (this.rangeValue) {
        if (append) {
          rowsSelected = Array.from(new Set(rowsSelected.concat(rangeRows)));
        } else {
          rowsSelected = this.preserveInstanceIfSame(
            rangeRows,
            state.rowsSelected
          );
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
      this.rangeStart = null;
      this.lastSelected = row;

      if (rowsSelected.includes(row)) {
        rowsSelected = rowsSelected.filter(rowSelected => rowSelected !== row);
        cellSelected = state.cellSelected?.row === row ? null : cellSelected;
      } else {
        rowsSelected = [...rowsSelected, row];
        cellSelected =
          cell ||
          row.getCell(cellSelected?.column || this.manager.getFirstColumn());
      }
    } else if (select) {
      this.rangeStart = null;
      this.lastSelected = row;

      if (!(context && state.rowsSelected.includes(row))) {
        rowsSelected = this.preserveInstanceIfSame([row], state.rowsSelected);
      }
      cellSelected =
        cell ||
        row.getCell(cellSelected?.column || this.manager.getFirstColumn());
    } else {
      this.rangeStart = null;
    }

    return { rowFocused, rowsSelected, cellFocused, cellSelected };
  }

  selectAll(state: ManagerSelectionState, value = true): ManagerSelectionState {
    if (this.manager.grid.rowSelectionMode === "none") {
      return this.selectionStateNone;
    }

    const rows = this.manager.getRows();
    let rowFocused = state.rowFocused;
    let rowsSelected = state.rowsSelected;
    let cellFocused = state.cellFocused;
    let cellSelected = state.cellSelected;

    rowFocused ??= this.manager.getFirstRow();
    cellFocused ??= rowFocused?.getCell(
      state.cellFocused?.column || this.manager.getFirstColumn()
    );

    if (value) {
      rowsSelected = rows;
      cellSelected = cellFocused;
    } else {
      rowsSelected = [];
      cellSelected = null;
    }

    return { rowFocused, rowsSelected, cellFocused, cellSelected };
  }

  selectSet(
    state: ManagerSelectionState,
    row: HTMLChTabularGridRowElement,
    cell: HTMLChTabularGridCellElement,
    value = true
  ): ManagerSelectionState {
    let append = true;

    if (this.manager.grid.rowSelectionMode === "none") {
      return this.selectionStateNone;
    }
    if (this.manager.grid.rowSelectionMode !== "multiple") {
      append = false;
    }

    let rowFocused = state.rowFocused;
    let rowsSelected = state.rowsSelected;
    let cellFocused = state.cellFocused;
    let cellSelected = state.cellSelected;

    rowFocused = row;
    cellFocused = cell;
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

    return { rowFocused, rowsSelected, cellFocused, cellSelected };
  }

  moveFirstRow(
    state: ManagerSelectionState,
    select: boolean,
    range: boolean,
    append: boolean
  ): ManagerSelectionState {
    const firstRow = this.manager.getFirstRow();

    if (firstRow) {
      return this.select(
        state,
        firstRow,
        firstRow.getCell(state.cellFocused.column),
        select,
        append,
        range,
        "focus",
        false
      );
    }
    return state;
  }

  movePreviousRow(
    state: ManagerSelectionState,
    select: boolean,
    range: boolean,
    append: boolean
  ): ManagerSelectionState {
    const previousRow = this.manager.getPreviousRow(state.rowFocused);

    if (previousRow) {
      return this.select(
        state,
        previousRow,
        previousRow.getCell(state.cellFocused.column),
        select,
        append,
        range,
        "focus",
        false
      );
    }
    return state;
  }

  moveNextRow(
    state: ManagerSelectionState,
    select: boolean,
    range: boolean,
    append: boolean
  ): ManagerSelectionState {
    const nextRow = this.manager.getNextRow(state.rowFocused);

    if (nextRow) {
      return this.select(
        state,
        nextRow,
        nextRow.getCell(state.cellFocused.column),
        select,
        append,
        range,
        "focus",
        false
      );
    }
    return state;
  }

  moveLastRow(
    state: ManagerSelectionState,
    select: boolean,
    range: boolean,
    append: boolean
  ): ManagerSelectionState {
    const lastRow = this.manager.getLastRow();

    if (lastRow) {
      return this.select(
        state,
        lastRow,
        lastRow.getCell(state.cellFocused.column),
        select,
        append,
        range,
        "focus",
        false
      );
    }
    return state;
  }

  movePreviousPageRow(
    state: ManagerSelectionState,
    select: boolean,
    range: boolean,
    append: boolean
  ): ManagerSelectionState {
    const rows = this.manager.getRows();
    const rowsPerPage = this.manager.getRowsPerPage();
    const previousPageRow =
      rows[Math.max(rows.indexOf(state.rowFocused) - rowsPerPage, 0)];

    if (previousPageRow) {
      return this.select(
        state,
        previousPageRow,
        previousPageRow.getCell(state.cellFocused.column),
        select,
        append,
        range,
        "focus",
        false
      );
    }
    return state;
  }

  moveNextPageRow(
    state: ManagerSelectionState,
    select: boolean,
    range: boolean,
    append: boolean
  ): ManagerSelectionState {
    const rows = this.manager.getRows();
    const rowsPerPage = this.manager.getRowsPerPage();
    const nextPageRow =
      rows[
        Math.min(rows.indexOf(state.rowFocused) + rowsPerPage, rows.length - 1)
      ];

    if (nextPageRow) {
      return this.select(
        state,
        nextPageRow,
        nextPageRow.getCell(state.cellFocused.column),
        select,
        append,
        range,
        "focus",
        false
      );
    }
    return state;
  }

  movePreviousCell(
    state: ManagerSelectionState,
    select: boolean,
    range: boolean
  ): ManagerSelectionState {
    const previousCell = this.manager.getPreviousCell(state.cellFocused);

    if (previousCell) {
      return this.select(
        state,
        state.rowFocused,
        previousCell,
        select,
        false,
        range,
        "focus",
        false
      );
    }
    return state;
  }

  moveNextCell(
    state: ManagerSelectionState,
    select: boolean,
    range: boolean
  ): ManagerSelectionState {
    const nextCell = this.manager.getNextCell(state.cellFocused);

    if (nextCell) {
      return this.select(
        state,
        state.rowFocused,
        nextCell,
        select,
        false,
        range,
        "focus",
        false
      );
    }
    return state;
  }

  markRow(
    row: HTMLChTabularGridRowElement,
    checked: boolean,
    range: boolean,
    currentRowsMarked: HTMLChTabularGridRowElement[]
  ): HTMLChTabularGridRowElement[] {
    if (row) {
      if (range) {
        const value = !row.marked;
        const rows = this.manager.getRowsRange(this.lastRowMarked ?? row, row);

        this.lastRowMarked = row;

        if (value) {
          return currentRowsMarked.concat(
            rows.filter(row => !currentRowsMarked.includes(row))
          );
        }
        return currentRowsMarked.filter(row => !rows.includes(row));
      }
      this.lastRowMarked = row;

      if (checked && !currentRowsMarked.includes(row)) {
        return currentRowsMarked.concat([row]);
      }
      if (!checked && currentRowsMarked.includes(row)) {
        return currentRowsMarked.filter(r => r !== row);
      }
    }

    return currentRowsMarked;
  }

  markRows(
    rowFocused: HTMLChTabularGridRowElement,
    rowsMarked: HTMLChTabularGridRowElement[],
    rowsSelected: HTMLChTabularGridRowElement[]
  ): HTMLChTabularGridRowElement[] {
    const rows = rowsSelected.includes(rowFocused)
      ? rowsSelected
      : [rowFocused];

    if (rows.some(row => !row.marked)) {
      return Array.from(new Set(rowsMarked.concat(rows)));
    }
    return rowsMarked.filter(row => !rows.includes(row));
  }

  markAllRows(value = true): HTMLChTabularGridRowElement[] {
    if (value) {
      return this.manager.getRows();
    }
    return [];
  }

  syncRowSelector(
    rows: HTMLChTabularGridRowElement[],
    previous: HTMLChTabularGridRowElement[] = [],
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
          ] as HTMLChTabularGridCellElement;
          cell.setSelectorChecked(false);
        });

      rows?.forEach(row => {
        row.marked = columnSelector.richRowSelectorMode === "mark";
        const cell = row.children[
          indexColumnSelector
        ] as HTMLChTabularGridCellElement;
        cell.setSelectorChecked(true);
      });

      this.syncColumnSelector(rows.length, columnSelector);
    }
  }

  syncColumnSelector(
    length: number,
    columnSelector?: HTMLChTabularGridColumnElement
  ) {
    columnSelector ??= this.manager.columns.getColumnSelector();

    if (length === 0) {
      columnSelector.richRowSelectorState = "";
    } else if (length === this.manager.getRows().length) {
      columnSelector.richRowSelectorState = "checked";
    } else {
      columnSelector.richRowSelectorState = "indeterminate";
    }
  }

  private preserveInstanceIfSame(
    newSelection: HTMLChTabularGridRowElement[],
    oldSelection: HTMLChTabularGridRowElement[]
  ): HTMLChTabularGridRowElement[] {
    return newSelection.length === oldSelection.length &&
      newSelection.every(item => oldSelection.includes(item))
      ? oldSelection
      : newSelection;
  }
}
