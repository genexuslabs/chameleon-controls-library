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
    return getComputedStyle(this.grid.gridMainEl).gridTemplateColumns.split(" ");
  }

  getGridRowIndex(row: HTMLChGridRowElement): number {
    return Array.prototype.indexOf.call(this.grid.el.querySelectorAll(`${HTMLChGridRowElement.TAG_NAME}, ${ChGridRowsetLegend.TAG_NAME}`), row);
  }

  getRowsetRowIndex(row: HTMLChGridRowElement): number {
    return Array.prototype.indexOf.call(row.parentElement.children, row);
  }

  getRowHeight(row: HTMLChGridRowElement): string {
    const gridRowsHeight = getComputedStyle(this.grid.gridMainEl).gridTemplateRows.split(" ");
    const rowIndex = this.getGridRowIndex(row) + 1;

    return gridRowsHeight[rowIndex];
  }

  getRowsRange(
    start: HTMLChGridRowElement,
    end: HTMLChGridRowElement
  ): HTMLChGridRowElement[] {
    const nextElementSibling =
      this.getRowsetRowIndex(start) <= this.getRowsetRowIndex(end)
        ? "nextElementSibling"
        : "previousElementSibling";
    let rows: HTMLChGridRowElement[] = [];
    let row: HTMLChGridRowElement;

    row = start[nextElementSibling] as HTMLChGridRowElement;
    rows.push(start);
    while (row && row != end) {
      rows.push(row);
      row = row[nextElementSibling] as HTMLChGridRowElement;
    }
    rows.push(end);

    return rows;
  }

  getRowEventTarget(eventInfo: Event): HTMLChGridRowElement {
    return eventInfo
      .composedPath()
      .find(
        (target: HTMLElement) => target.tagName === "CH-GRID-ROW"
      ) as HTMLChGridRowElement;
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
      ...this.getColumnsStyle(),
    };
  }

  getRowsSelected(): HTMLChGridRowElement[] {
    let rows: HTMLChGridRowElement[] = [];

    this.grid.el
      .querySelectorAll("ch-grid-row[selected]")
      .forEach((el: HTMLChGridRowElement) => rows.push(el));

    return rows;
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

    while (node) {
      node.collapsed = false;
      node = node.parentElement.closest(
        `${HTMLChGridRowElement.TAG_NAME}, ${HTMLChGridRowsetElement.TAG_NAME}`
      );
    }

    this.columnsManager
      .getColumns()
      .find((column) => !column.hidden)
      ?.scrollIntoView();
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
    }

    cell.scrollIntoView();
  }

  private getGridTemplateColumns(): CSSProperties {
    return {
      "grid-template-columns": this.columnsManager
        .getColumns()
        .map((column) => `var(--ch-grid-column-${column.physicalOrder}-size)`)
        .join(" "),
    };
  }

  private getRowBoxSimulationStyle(): CSSProperties {
    const { columnFirst, columnLast } = this.columnDragManager
      ? this.columnDragManager.getColumnsFirstLast()
      : this.columnsManager.getColumnsFirstLast();

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
        "var(--ch-grid-fallback, inherit)",
    };
  }

  private getRowTop(row: HTMLChGridRowElement): number {
    const cell = row.firstElementChild as HTMLElement;

    return cell.offsetTop;
  }

  private getDragTransitionStyle(): CSSProperties {
    return {
      "--column-drag-transition-duration": this.columnDragManager
        ? ".2s"
        : "0s",
    };
  }

  private getColumnsStyle(): CSSProperties {
    return this.columnsManager.getColumns().reduce((style, column) => {
      return {
        ...style,
        ...this.getColumnStyle(column),
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
      ...this.getColumnIndentStyle(column),
    };
  }

  private getColumnSizeStyle(column: HTMLChGridColumnElement): CSSProperties {
    return {
      [`--ch-grid-column-${column.order}-size`]: column.hidden
        ? "0px"
        : column.size,
    };
  }

  private getColumnOrderStyle(column: HTMLChGridColumnElement): CSSProperties {
    return {
      [`--ch-grid-column-${column.physicalOrder}-position`]:
        column.order.toString(),
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
    let calcItems = ["0px"];

    for (let i = 1; i < column.order; i++) {
      calcItems.push(`var(--ch-grid-column-${i}-width)`);
    }

    return {
      [`--ch-grid-column-${column.physicalOrder}-left-freeze`]: `calc(${calcItems.join(
        " + "
      )})`,
      [`--ch-grid-column-${column.physicalOrder}-z-index`]: "1000",
    };
  }

  private getColumnFreezeEndStyle(
    column: HTMLChGridColumnElement
  ): CSSProperties {
    let calcItems = ["0px"];
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
      [`--ch-grid-column-${column.physicalOrder}-z-index`]: "1000",
    };
  }

  private getColumnDisplayStyle(
    column: HTMLChGridColumnElement
  ): CSSProperties {
    return column.hidden
      ? {
          [`--ch-grid-column-${column.physicalOrder}-display`]: "none",
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
        column.order == 1 ? "''" : "none",
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
