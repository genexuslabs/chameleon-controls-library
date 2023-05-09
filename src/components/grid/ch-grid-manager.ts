import { IChGridCollapsible, CSSProperties } from "./ch-grid-types";
import { ChGrid } from "./ch-grid";
import { ChGridManagerColumnDrag } from "./ch-grid-manager-column-drag";

import HTMLChGridRowElement from "./grid-row/ch-grid-row";
import HTMLChGridRowsetElement from "./grid-rowset/ch-grid-rowset";
import { ChGridManagerColumns } from "./ch-grid-manager-columns";
import HTMLChGridCellElement from "./grid-cell/ch-grid-cell";
import { ChGridManagerSelection } from "./ch-grid-manager-selection";
import { ChGridManagerRowDrag } from "./ch-grid-manager-row-drag";
import { ChGridRowsetLegend } from "./grid-rowset/grid-rowset-legend/ch-grid-rowset-legend";

export class ChGridManager {
  grid: ChGrid;
  private columnsManager: ChGridManagerColumns;
  private columnDragManager: ChGridManagerColumnDrag;
  private rowDragManager: ChGridManagerRowDrag;
  private selectionManager: ChGridManagerSelection;

  constructor(grid: ChGrid) {
    this.grid = grid;
    this.columnsManager = new ChGridManagerColumns(this.grid);
    this.selectionManager = new ChGridManagerSelection(this.grid);
  }

  get selection(): ChGridManagerSelection {
    return this.selectionManager;
  }

  get columns(): ChGridManagerColumns {
    return this.columnsManager;
  }

  gridDidLoad() {
    if (this.isRowActionsEnabled()) {
      this.observeMainScroll();
    }
  }

  getColumns() {
    return this.columnsManager.getColumns();
  }

  getColumnsWidth(): string[] {
    return getComputedStyle(this.grid.gridMainEl).gridTemplateColumns.split(
      " "
    );
  }

  getColumnsetHeight(): number {
    const gridColumnsHeight = getComputedStyle(
      this.grid.gridMainEl
    ).gridTemplateRows.split(" ");

    return parseInt(gridColumnsHeight[0]) || 0;
  }

  getFirstColumn(): HTMLChGridColumnElement {
    return this.columnsManager.getColumnsFirstLast().columnFirst;
  }

  getFirstRow(): HTMLChGridRowElement {
    return this.grid.el.querySelector(
      `${HTMLChGridRowElement.TAG_NAME.toLowerCase()}`
    );
  }

  getScrollOffsetTop(): number {
    return this.grid.gridMainEl.offsetTop + this.getColumnsetHeight();
  }

  getScrollOffsetLeft(): number {
    return this.grid.manager.columns
      .getColumns(true)
      .reduce((offsetRight, column) => {
        return column.freeze == "start" && !column.hidden
          ? offsetRight + column.offsetWidth
          : offsetRight;
      }, 0);
  }

  getScrollOffsetRight(): number {
    return this.grid.manager.columns
      .getColumns(true)
      .reduce((offsetRight, column) => {
        return column.freeze == "end" && !column.hidden
          ? offsetRight + column.offsetWidth
          : offsetRight;
      }, 0);
  }

  getPreviousRow(current: HTMLChGridRowElement): HTMLChGridRowElement {
    const rows = this.getRows();
    const i = rows.indexOf(current);

    return rows
      .slice(0, i)
      .reverse()
      .find(row => row.isVisible());
  }

  getNextRow(current: HTMLChGridRowElement): HTMLChGridRowElement {
    const rows = this.getRows();
    const i = rows.indexOf(current);

    return rows.slice(i + 1).find(row => row.isVisible());
  }

  getLastRow(): HTMLChGridRowElement {
    const rows = this.getRows();

    return rows.reverse().find(row => row.isVisible());
  }

  getPreviousCell(current: HTMLChGridCellElement): HTMLChGridCellElement {
    const columnOrder = current.column.order;
    const previousColumn = this.grid.manager.columns
      .getColumns()
      .reduce((previous, column) => {
        return column.order < columnOrder &&
          !column.hidden &&
          (!previous || column.order > previous.order)
          ? column
          : previous;
      }, null);

    if (previousColumn) {
      return current.row.querySelector(
        `:scope > ch-grid-cell:nth-of-type(${previousColumn.physicalOrder})`
      );
    }
  }

  getNextCell(current: HTMLChGridCellElement): HTMLChGridCellElement {
    const columnOrder = current.column.order;
    const nextColumn = this.grid.manager.columns
      .getColumns()
      .reduce((previous, column) => {
        return column.order > columnOrder &&
          !column.hidden &&
          (!previous || column.order < previous.order)
          ? column
          : previous;
      }, null);

    if (nextColumn) {
      return current.row.querySelector(
        `:scope > ch-grid-cell:nth-of-type(${nextColumn.physicalOrder})`
      );
    }
  }

  getGridRowIndex(row: HTMLChGridRowElement): number {
    return Array.prototype.indexOf.call(
      this.grid.el.querySelectorAll(
        `${HTMLChGridRowElement.TAG_NAME}, ${ChGridRowsetLegend.TAG_NAME}`
      ),
      row
    );
  }

  getRowsetRowIndex(row: HTMLChGridRowElement): number {
    return Array.prototype.indexOf.call(row.parentElement.children, row);
  }

  getRowHeight(row: HTMLChGridRowElement): number {
    const gridRowsHeight = getComputedStyle(
      this.grid.gridMainEl
    ).gridTemplateRows.split(" ");
    const rowIndex = this.getGridRowIndex(row) + 1;

    return parseInt(gridRowsHeight[rowIndex]) || 0;
  }

  getRowsPerPage(): number {
    const gridHeight = this.grid.gridMainEl.clientHeight;
    const columnsHeight = this.getColumnsetHeight();
    const rowHeight = this.getRowHeight(this.getFirstRow());

    return Math.floor((gridHeight - columnsHeight) / rowHeight);
  }

  getRow(rowId: string): HTMLChGridRowElement {
    return this.grid.el.querySelector(`ch-grid-row[rowid="${rowId}"]`);
  }

  getRows(state: "all" | "visible" = "all"): HTMLChGridRowElement[] {
    const rows = Array.from(
      this.grid.el.querySelectorAll(`ch-grid-row`)
    ) as HTMLChGridRowElement[];

    if (state === "visible") {
      return rows.filter(row => row.isVisible());
    } else {
      return rows;
    }
  }

  getRowsSelected(): HTMLChGridRowElement[] {
    return Array.from(
      this.grid.el.querySelectorAll(`ch-grid-row[selected]`)
    ) as HTMLChGridRowElement[];
  }

  getRowsRange(
    start: HTMLChGridRowElement,
    end: HTMLChGridRowElement
  ): HTMLChGridRowElement[] {
    const rows = this.getRows();
    const indexStart = rows.indexOf(start);
    const indexEnd = rows.indexOf(end);

    return rows
      .slice(Math.min(indexStart, indexEnd), Math.max(indexStart, indexEnd) + 1)
      .filter(row => row.isVisible());
  }

  getRowEventTarget(eventInfo: Event): HTMLChGridRowElement {
    return eventInfo
      .composedPath()
      .find(
        (target: HTMLElement) => target.tagName === "CH-GRID-ROW"
      ) as HTMLChGridRowElement;
  }

  isRowActionsEventTarget(eventInfo: Event): boolean {
    return (
      eventInfo
        .composedPath()
        .find((target: HTMLElement) =>
          target.classList?.contains("row-actions")
        ) != null
    );
  }

  getCell(
    cellId?: string,
    rowId?: string,
    columnId?: string
  ): HTMLChGridCellElement {
    if (cellId) {
      return this.grid.el.querySelector(`ch-grid-cell[cellid="${cellId}"]`);
    } else if (rowId && columnId) {
      const row = this.getRow(rowId);
      const column = this.columns.getColumn(columnId);

      return row.getCell(column);
    }
  }

  getCellEventTarget(eventInfo: Event): HTMLChGridCellElement {
    return eventInfo
      .composedPath()
      .find(
        (target: HTMLElement) => target.tagName === "CH-GRID-CELL"
      ) as HTMLChGridCellElement;
  }

  columnDragStart(columnId: string) {
    this.columnDragManager = new ChGridManagerColumnDrag(
      columnId,
      this.columnsManager.getColumns()
    );
  }

  columnDragging(position: number): boolean {
    return this.columnDragManager.dragging(position);
  }

  columnDragEnd() {
    this.columnDragManager.dragEnd();
    this.columnDragManager = null;
  }

  rowDragStart(row: HTMLChGridRowElement) {
    this.rowDragManager = new ChGridManagerRowDrag(this.grid);
    this.rowDragManager.dragStart(row);
  }

  getGridStyle(): CSSProperties {
    return {
      display: "grid",
      ...this.getGridTemplateColumns(),
      ...this.getRowBoxSimulationStyle(),
      ...this.getDragTransitionStyle(),
      ...this.getColumnsStyle()
    };
  }

  isRowActionsEnabled(): boolean {
    const slot = this.grid.gridRowActionsEl
      .firstElementChild as HTMLSlotElement;
    return slot.assignedElements().length > 0;
  }

  setRowActionsPosition(row: HTMLChGridRowElement) {
    if (row) {
      this.grid.gridRowActionsEl.setAttribute("show", "");
      this.grid.gridRowActionsEl.style.setProperty(
        "--ch-grid-row-highlighted-top",
        `${this.getRowTop(row)}px`
      );
    } else {
      this.grid.gridRowActionsEl.removeAttribute("show");
      this.grid.gridRowActionsEl.style.removeProperty(
        "--ch-grid-row-highlighted-top"
      );
    }
  }

  ensureRowVisible(row: HTMLChGridRowElement) {
    let node: IChGridCollapsible = row.parentElement.closest(
      `${HTMLChGridRowElement.TAG_NAME}, ${HTMLChGridRowsetElement.TAG_NAME}`
    );
    const { columnFirst } = this.columnsManager.getColumnsFirstLast();

    while (node) {
      node.collapsed = false;
      node = node.parentElement.closest(
        `${HTMLChGridRowElement.TAG_NAME}, ${HTMLChGridRowsetElement.TAG_NAME}`
      );
    }

    if (row.children[columnFirst.physicalOrder]) {
      this.ensureVisible(
        row.children[columnFirst.physicalOrder] as HTMLChGridCellElement
      );
    }
  }

  ensureCellVisible(cell: HTMLChGridCellElement) {
    let node: IChGridCollapsible = cell.closest(
      `${HTMLChGridRowElement.TAG_NAME}, ${HTMLChGridRowsetElement.TAG_NAME}`
    );

    while (!cell.isVisible() && node) {
      node.collapsed = false;
      node = node.parentElement.closest(
        `${HTMLChGridRowElement.TAG_NAME}, ${HTMLChGridRowsetElement.TAG_NAME}`
      );
    }

    if (!cell.isVisible()) {
      cell.column.hidden = false;
    }

    this.ensureVisible(cell);
  }

  private ensureVisible(cell: HTMLChGridCellElement) {
    const isColumnFreeze = ["start", "end"].includes(cell.column.freeze);
    const scroll = this.grid.gridMainEl;
    const scrollOffsetTop = this.getScrollOffsetTop();
    const scrollOffsetLeft = this.getScrollOffsetLeft();
    const scrollOffsetRight = this.getScrollOffsetRight();

    if (scroll.scrollTop + scrollOffsetTop > cell.offsetTop) {
      scroll.scrollBy({
        top: (scroll.scrollTop - cell.offsetTop + scrollOffsetTop) * -1
      });
    } else if (
      scroll.scrollTop + scroll.offsetHeight <
      cell.offsetTop + cell.offsetHeight
    ) {
      scroll.scrollBy({
        top:
          cell.offsetTop +
          cell.offsetHeight -
          (scroll.scrollTop + scroll.offsetHeight)
      });
    } else if (
      scroll.scrollLeft + scrollOffsetLeft > cell.offsetLeft &&
      !isColumnFreeze
    ) {
      scroll.scrollBy({
        left: (scroll.scrollLeft - cell.offsetLeft + scrollOffsetLeft) * -1
      });
    } else if (
      scroll.scrollLeft + scroll.clientWidth - scrollOffsetRight <
        cell.offsetLeft + cell.offsetWidth &&
      !isColumnFreeze
    ) {
      scroll.scrollBy({
        left:
          cell.offsetLeft +
          cell.offsetWidth -
          (scroll.scrollLeft + scroll.clientWidth - scrollOffsetRight)
      });
    }
  }

  private getGridTemplateColumns(): CSSProperties {
    return {
      "grid-template-columns": this.columnsManager
        .getColumns()
        .map(column => `var(--ch-grid-column-${column.physicalOrder}-size)`)
        .join(" ")
    };
  }

  private getRowBoxSimulationStyle(): CSSProperties {
    const { columnFirst, columnLast } = this.columnDragManager
      ? this.columnDragManager.getColumnsFirstLast()
      : this.columnsManager.getColumnsFirstLast();

    if (!columnFirst || !columnLast) {
      return null;
    }

    return {
      [`--ch-grid-column-${columnFirst.physicalOrder}-margin-start`]:
        "var(--ch-grid-fallback, inherit)",
      [`--ch-grid-column-${columnFirst.physicalOrder}-border-start`]:
        "var(--ch-grid-fallback, inherit)",
      [`--ch-grid-column-${columnFirst.physicalOrder}-padding-start`]:
        "var(--ch-grid-fallback, inherit)",
      [`--ch-grid-column-${columnLast.physicalOrder}-margin-end`]:
        "var(--ch-grid-fallback, inherit)",
      [`--ch-grid-column-${columnLast.physicalOrder}-border-end`]:
        "var(--ch-grid-fallback, inherit)",
      [`--ch-grid-column-${columnLast.physicalOrder}-padding-end`]:
        "var(--ch-grid-fallback, inherit)"
    };
  }

  private getRowTop(row: HTMLChGridRowElement): number {
    const cell = row.firstElementChild as HTMLElement;

    return cell.offsetTop;
  }

  private getDragTransitionStyle(): CSSProperties {
    return {
      "--column-drag-transition-duration": this.columnDragManager ? ".2s" : "0s"
    };
  }

  private getColumnsStyle(): CSSProperties {
    return this.columnsManager.getColumns().reduce((style, column) => {
      return {
        ...style,
        ...this.getColumnStyle(column)
      };
    }, {} as CSSProperties);
  }

  private getColumnStyle(column: HTMLChGridColumnElement): CSSProperties {
    return {
      ...this.getColumnSizeStyle(column),
      ...this.getColumnOrderStyle(column),
      ...this.getColumnDisplayStyle(column),
      ...this.getColumnFreezeStyle(column),
      ...this.getColumnDraggingStyle(column),
      ...this.getColumnIndentStyle(column)
    };
  }

  private getColumnSizeStyle(column: HTMLChGridColumnElement): CSSProperties {
    return {
      [`--ch-grid-column-${column.order}-size`]: column.hidden
        ? "0px"
        : column.size
    };
  }

  private getColumnOrderStyle(column: HTMLChGridColumnElement): CSSProperties {
    return {
      [`--ch-grid-column-${column.physicalOrder}-position`]:
        column.order.toString()
    };
  }

  private getColumnFreezeStyle(column: HTMLChGridColumnElement): CSSProperties {
    switch (column.freeze) {
      case "start":
        return this.getColumnFreezeStartStyle(column);
      case "end":
        return this.getColumnFreezeEndStyle(column);
    }
  }

  private getColumnFreezeStartStyle(
    column: HTMLChGridColumnElement
  ): CSSProperties {
    const calcItems = ["0px"];

    for (let i = 1; i < column.order; i++) {
      calcItems.push(`var(--ch-grid-column-${i}-width)`);
    }

    return {
      [`--ch-grid-column-${column.physicalOrder}-left-freeze`]: `calc(${calcItems.join(
        " + "
      )})`,
      [`--ch-grid-column-${column.physicalOrder}-z-index-freeze`]:
        "var(--ch-grid-column-freeze-layer)"
    };
  }

  private getColumnFreezeEndStyle(
    column: HTMLChGridColumnElement
  ): CSSProperties {
    const calcItems = ["0px"];
    for (
      let i = this.columnsManager.getColumns().length;
      i > column.order;
      i--
    ) {
      calcItems.push(`var(--ch-grid-column-${i}-width)`);
    }

    return {
      [`--ch-grid-column-${column.physicalOrder}-right-freeze`]: `calc(${calcItems.join(
        " + "
      )})`,
      [`--ch-grid-column-${column.physicalOrder}-z-index-freeze`]:
        "var(--ch-grid-column-freeze-layer)"
    };
  }

  private getColumnDisplayStyle(
    column: HTMLChGridColumnElement
  ): CSSProperties {
    return column.hidden
      ? {
          [`--ch-grid-column-${column.physicalOrder}-display`]: "none"
        }
      : null;
  }

  private getColumnDraggingStyle(
    column: HTMLChGridColumnElement
  ): CSSProperties {
    return this.columnDragManager
      ? this.columnDragManager.getColumnStyle(column)
      : null;
  }

  private getColumnIndentStyle(column: HTMLChGridColumnElement): CSSProperties {
    return {
      [`--ch-grid-column-${column.physicalOrder}-content`]:
        column.order == 1 ? "''" : "none"
    };
  }

  private observeMainScroll() {
    this.grid.gridMainEl.addEventListener(
      "scroll",
      () =>
        this.grid.gridRowActionsEl.style.setProperty(
          "--ch-grid-scroll-v",
          `${this.grid.gridMainEl.scrollTop}px`
        ),
      { passive: true }
    );
  }
}
