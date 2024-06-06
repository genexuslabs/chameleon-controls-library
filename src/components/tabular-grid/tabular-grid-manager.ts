import { ITabularGridCollapsible, CSSProperties } from "./tabular-grid-types";
import { TabularGridManagerColumnDrag } from "./tabular-grid-manager-column-drag";

import HTMLChTabularGridRowElement from "./row/tabular-grid-row";
import { TabularGridManagerColumns } from "./tabular-grid-manager-columns";
import HTMLChTabularGridCellElement from "./cell/tabular-grid-cell";
import { TabularGridManagerSelection } from "./tabular-grid-manager-selection";
import { TabularGridManagerRowDrag } from "./tabular-grid-manager-row-drag";
import { TabularGridManagerRowActions } from "./tabular-grid-manager-row-actions";
import { adoptGlobalStyleSheet } from "../../deprecated-components/style/ch-global-stylesheet";
import { TabularGridManagerColumnResize } from "./tabular-grid-manager-column-resize";

enum StyleRule {
  BASE_LAYER,
  COLUMNS_WIDTH
}

export class TabularGridManager {
  private styleSheet = new CSSStyleSheet();
  private gridLayoutElement: HTMLElement;
  private columnDragManager: TabularGridManagerColumnDrag;
  private columnResizeManager: TabularGridManagerColumnResize;
  private rowDragManager: TabularGridManagerRowDrag;

  readonly grid: HTMLChTabularGridElement;
  readonly selection: TabularGridManagerSelection;
  readonly columns: TabularGridManagerColumns;
  readonly rowActions: TabularGridManagerRowActions;

  constructor(grid: HTMLChTabularGridElement) {
    this.grid = grid;

    this.styleSheet.insertRule(`:host {}`, StyleRule.BASE_LAYER);
    this.styleSheet.insertRule(".main {}", StyleRule.COLUMNS_WIDTH);
    this.grid.shadowRoot.adoptedStyleSheets.push(this.styleSheet);
    adoptGlobalStyleSheet(this.grid.shadowRoot.adoptedStyleSheets);

    this.columns = new TabularGridManagerColumns(this);
    this.selection = new TabularGridManagerSelection(this);
    this.rowActions = new TabularGridManagerRowActions(this);
  }

  get gridLayout(): HTMLElement {
    return this.gridLayoutElement;
  }

  componentDidLoad(gridLayout: HTMLElement) {
    this.gridLayoutElement = gridLayout;
  }

  getColumns() {
    return this.columns.getColumns();
  }

  getColumnsWidth(): string[] {
    return getComputedStyle(this.gridLayout).gridTemplateColumns.split(" ");
  }

  getColumnsetHeight(): number {
    const gridColumnsHeight = getComputedStyle(
      this.gridLayout
    ).gridTemplateRows.split(" ");

    return parseInt(gridColumnsHeight[0]) || 0;
  }

  getFirstColumn(): HTMLChTabularGridColumnElement {
    return this.columns.getColumnsFirstLast().columnFirst;
  }

  getFirstRow(): HTMLChTabularGridRowElement {
    return this.grid.querySelector("ch-tabular-grid-row");
  }

  getScrollOffsetTop(): number {
    return this.gridLayout.offsetTop + this.getColumnsetHeight();
  }

  getScrollOffsetLeft(): number {
    return this.columns.getColumns(true).reduce((offsetRight, column) => {
      return column.freeze === "start" && !column.hidden
        ? offsetRight + column.offsetWidth
        : offsetRight;
    }, 0);
  }

  getScrollOffsetRight(): number {
    return this.columns.getColumns(true).reduce((offsetRight, column) => {
      return column.freeze === "end" && !column.hidden
        ? offsetRight + column.offsetWidth
        : offsetRight;
    }, 0);
  }

  getPreviousRow(
    current: HTMLChTabularGridRowElement
  ): HTMLChTabularGridRowElement {
    const rows = this.getRows();
    const i = rows.indexOf(current);

    return rows
      .slice(0, i)
      .reverse()
      .find(row => row.isVisible());
  }

  getNextRow(
    current: HTMLChTabularGridRowElement
  ): HTMLChTabularGridRowElement {
    const rows = this.getRows();
    const i = rows.indexOf(current);

    return rows.slice(i + 1).find(row => row.isVisible());
  }

  getLastRow(): HTMLChTabularGridRowElement {
    const rows = this.getRows();

    return rows.reverse().find(row => row.isVisible());
  }

  getPreviousColumn(
    column: HTMLChTabularGridColumnElement
  ): HTMLChTabularGridColumnElement {
    return this.columns.getColumns().reduce((previous, current) => {
      return current.order < column.order &&
        !current.hidden &&
        (!previous || current.order > previous.order)
        ? current
        : previous;
    }, null);
  }

  getNextColumn(
    column: HTMLChTabularGridColumnElement
  ): HTMLChTabularGridColumnElement {
    return this.columns.getColumns().reduce((previous, current) => {
      return current.order > column.order &&
        !current.hidden &&
        (!previous || current.order < previous.order)
        ? current
        : previous;
    }, null);
  }

  getPreviousCell(
    current: HTMLChTabularGridCellElement
  ): HTMLChTabularGridCellElement | void {
    const previousColumn = this.getPreviousColumn(current.column);

    if (previousColumn) {
      return current.row.querySelector(
        `:scope > ch-tabular-grid-cell:nth-of-type(${previousColumn.physicalOrder})`
      ) as HTMLChTabularGridCellElement;
    }
  }

  getNextCell(
    current: HTMLChTabularGridCellElement
  ): HTMLChTabularGridCellElement | void {
    const nextColumn = this.getNextColumn(current.column);

    if (nextColumn) {
      return current.row.querySelector(
        `:scope > ch-tabular-grid-cell:nth-of-type(${nextColumn.physicalOrder})`
      ) as HTMLChTabularGridCellElement;
    }
  }

  getGridRowIndex(row: HTMLChTabularGridRowElement): number {
    return Array.prototype.indexOf.call(
      this.grid.querySelectorAll(
        "ch-tabular-grid-row, ch-tabular-grid-rowset-legend"
      ),
      row
    );
  }

  getRowsetRowIndex(row: HTMLChTabularGridRowElement): number {
    return Array.prototype.indexOf.call(row.parentElement.children, row);
  }

  getRowHeight(row: HTMLChTabularGridRowElement): number {
    const gridRowsHeight = getComputedStyle(
      this.gridLayout
    ).gridTemplateRows.split(" ");
    const rowIndex = this.getGridRowIndex(row) + 1;

    return parseInt(gridRowsHeight[rowIndex]) || 0;
  }

  getRowsPerPage(): number {
    const gridHeight = this.gridLayout.clientHeight;
    const columnsHeight = this.getColumnsetHeight();
    const rowHeight = this.getRowHeight(this.getFirstRow());

    return Math.floor((gridHeight - columnsHeight) / rowHeight);
  }

  getRow(rowId: string): HTMLChTabularGridRowElement {
    return this.grid.querySelector(`ch-tabular-grid-row[rowid="${rowId}"]`);
  }

  getRows(state: "all" | "visible" = "all"): HTMLChTabularGridRowElement[] {
    const rows = Array.from(
      this.grid.querySelectorAll(`ch-tabular-grid-row`)
    ) as HTMLChTabularGridRowElement[];

    if (state === "visible") {
      return rows.filter(row => row.isVisible());
    }
    return rows;
  }

  getRowsRange(
    start: HTMLChTabularGridRowElement,
    end: HTMLChTabularGridRowElement
  ): HTMLChTabularGridRowElement[] {
    const rows = this.getRows();
    const indexStart = rows.indexOf(start);
    const indexEnd = rows.indexOf(end);

    return rows
      .slice(Math.min(indexStart, indexEnd), Math.max(indexStart, indexEnd) + 1)
      .filter(row => row.isVisible());
  }

  getRowEventTarget(eventInfo: Event): HTMLChTabularGridRowElement {
    return eventInfo
      .composedPath()
      .find(
        (target: HTMLElement) => target.tagName === "CH-TABULAR-GRID-ROW"
      ) as HTMLChTabularGridRowElement;
  }

  isRowActionsEventTarget(eventInfo: Event): boolean {
    return (
      eventInfo
        .composedPath()
        .find(
          (target: HTMLElement) =>
            target.tagName === "CH-TABULAR-GRID-ROW-ACTIONS"
        ) != null
    );
  }

  getCell(
    cellId?: string,
    rowId?: string,
    columnId?: string
  ): HTMLChTabularGridCellElement | void {
    if (cellId) {
      return this.grid.querySelector(
        `ch-tabular-grid-cell[cellid="${cellId}"]`
      ) as HTMLChTabularGridCellElement;
    }
    if (rowId && columnId) {
      const row = this.getRow(rowId);
      const column = this.columns.getColumn(columnId);

      if (row && column) {
        return row.getCell(column);
      }
    }
  }

  getCellEventTarget(eventInfo: Event): HTMLChTabularGridCellElement {
    return eventInfo
      .composedPath()
      .find(
        (target: HTMLElement) => target.tagName === "CH-TABULAR-GRID-CELL"
      ) as HTMLChTabularGridCellElement;
  }

  columnDragStart(columnId: string) {
    this.columnDragManager = new TabularGridManagerColumnDrag(
      columnId,
      this.columns.getColumns(),
      this.isRTLDirection()
    );
  }

  columnDragging(position: number): boolean {
    return this.columnDragManager.dragging(position);
  }

  columnDragEnd() {
    this.columnDragManager.dragEnd();
    this.columnDragManager = null;
  }

  columnResizeStart(columnId: string) {
    this.columnResizeManager = new TabularGridManagerColumnResize(
      this,
      columnId,
      this.isRTLDirection()
    );
  }

  columnResizing(deltaWidth: number) {
    this.columnResizeManager.resizing(deltaWidth);
  }

  columnResizeEnd() {
    this.columnResizeManager.resizeEnd();
    this.columnResizeManager = null;
  }

  rowDragStart(row: HTMLChTabularGridRowElement) {
    this.rowDragManager = new TabularGridManagerRowDrag(this);
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

  setBaseLayer(value: number) {
    this.styleSheet.deleteRule(StyleRule.BASE_LAYER);
    this.styleSheet.insertRule(
      `:host { --ch-tabular-grid-base-layer: ${value}; }`,
      StyleRule.BASE_LAYER
    );
  }

  setColumnWidthVariables(columnsWidth: number[]) {
    this.styleSheet.deleteRule(StyleRule.COLUMNS_WIDTH);
    this.styleSheet.insertRule(
      `.main { ${columnsWidth
        .map(
          (columnWidth, columnIndex) =>
            `--ch-tabular-grid-column-${
              columnIndex + 1
            }-width:${columnWidth}px;`
        )
        .join("\n")} }`,
      StyleRule.COLUMNS_WIDTH
    );
  }

  ensureRowVisible(row: HTMLChTabularGridRowElement) {
    let node: ITabularGridCollapsible = row.parentElement.closest(
      "ch-tabular-grid-row, ch-tabular-grid-rowset"
    );
    const { columnFirst } = this.columns.getColumnsFirstLast();

    while (node) {
      node.collapsed = false;
      node = node.parentElement.closest(
        "ch-tabular-grid-row, ch-tabular-grid-rowset"
      );
    }

    if (row.children[columnFirst.physicalOrder]) {
      this.ensureVisible(
        row.children[columnFirst.physicalOrder] as HTMLChTabularGridCellElement
      );
    }
  }

  ensureCellVisible(cell: HTMLChTabularGridCellElement) {
    let node: ITabularGridCollapsible = cell.closest(
      "ch-tabular-grid-row, ch-tabular-grid-rowset"
    );

    while (!cell.isVisible() && node) {
      node.collapsed = false;
      node = node.parentElement.closest(
        "ch-tabular-grid-row, ch-tabular-grid-rowset"
      );
    }

    if (!cell.isVisible()) {
      cell.column.hidden = false;
    }

    this.ensureVisible(cell);
  }

  private ensureVisible(cell: HTMLChTabularGridCellElement) {
    const isColumnFreeze = ["start", "end"].includes(cell.column.freeze);
    const scroll = this.gridLayout;
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
      "grid-template-columns": this.columns
        .getColumns()
        .map(
          column => `var(--ch-tabular-grid-column-${column.physicalOrder}-size)`
        )
        .join(" ")
    };
  }

  private getRowBoxSimulationStyle(): CSSProperties {
    const { columnFirst, columnLast } = this.columnDragManager
      ? this.columnDragManager.getColumnsFirstLast()
      : this.columns.getColumnsFirstLast();

    if (!columnFirst || !columnLast) {
      return null;
    }

    return {
      [`--ch-tabular-grid-column-${columnFirst.physicalOrder}-margin-start`]:
        "var(--ch-tabular-grid-fallback, inherit)",
      [`--ch-tabular-grid-column-${columnFirst.physicalOrder}-border-start`]:
        "var(--ch-tabular-grid-fallback, inherit)",
      [`--ch-tabular-grid-column-${columnFirst.physicalOrder}-padding-start`]:
        "var(--ch-tabular-grid-fallback, inherit)",
      [`--ch-tabular-grid-column-${columnLast.physicalOrder}-margin-end`]:
        "var(--ch-tabular-grid-fallback, inherit)",
      [`--ch-tabular-grid-column-${columnLast.physicalOrder}-border-end`]:
        "var(--ch-tabular-grid-fallback, inherit)",
      [`--ch-tabular-grid-column-${columnLast.physicalOrder}-padding-end`]:
        "var(--ch-tabular-grid-fallback, inherit)"
    };
  }

  private getDragTransitionStyle(): CSSProperties {
    return {
      "--column-drag-transition-duration": this.columnDragManager ? ".2s" : "0s"
    };
  }

  private getColumnsStyle(): CSSProperties {
    return this.columns.getColumns().reduce((style, column) => {
      return {
        ...style,
        ...this.getColumnStyle(column)
      };
    }, {} as CSSProperties);
  }

  private getColumnStyle(
    column: HTMLChTabularGridColumnElement
  ): CSSProperties {
    return {
      ...this.getColumnSizeStyle(column),
      ...this.getColumnOrderStyle(column),
      ...this.getColumnDisplayStyle(column),
      ...this.getColumnFreezeStyle(column),
      ...this.getColumnDraggingStyle(column),
      ...this.getColumnIndentStyle(column)
    };
  }

  private getColumnSizeStyle(
    column: HTMLChTabularGridColumnElement
  ): CSSProperties {
    return {
      [`--ch-tabular-grid-column-${column.order}-size`]: column.hidden
        ? "0px"
        : column.size
    };
  }

  private getColumnOrderStyle(
    column: HTMLChTabularGridColumnElement
  ): CSSProperties {
    return {
      [`--ch-tabular-grid-column-${column.physicalOrder}-position`]:
        column.order.toString()
    };
  }

  private getColumnFreezeStyle(
    column: HTMLChTabularGridColumnElement
  ): CSSProperties {
    switch (column.freeze) {
      case "start":
        return this.getColumnFreezeStartStyle(column);
      case "end":
        return this.getColumnFreezeEndStyle(column);
    }
  }

  private getColumnFreezeStartStyle(
    column: HTMLChTabularGridColumnElement
  ): CSSProperties {
    const calcItems = ["0px"];

    for (let i = 1; i < column.order; i++) {
      calcItems.push(`var(--ch-tabular-grid-column-${i}-width)`);
    }

    return {
      [`--ch-tabular-grid-column-${column.physicalOrder}-left-freeze`]: `calc(${calcItems.join(
        " + "
      )})`,
      [`--ch-tabular-grid-column-${column.physicalOrder}-z-index-freeze`]:
        "var(--ch-tabular-grid-column-freeze-layer)"
    };
  }

  private getColumnFreezeEndStyle(
    column: HTMLChTabularGridColumnElement
  ): CSSProperties {
    const calcItems = ["0px"];
    for (let i = this.columns.getColumns().length; i > column.order; i--) {
      calcItems.push(`var(--ch-tabular-grid-column-${i}-width)`);
    }

    return {
      [`--ch-tabular-grid-column-${column.physicalOrder}-right-freeze`]: `calc(${calcItems.join(
        " + "
      )})`,
      [`--ch-tabular-grid-column-${column.physicalOrder}-z-index-freeze`]:
        "var(--ch-tabular-grid-column-freeze-layer)"
    };
  }

  private getColumnDisplayStyle(
    column: HTMLChTabularGridColumnElement
  ): CSSProperties {
    return column.hidden
      ? {
          [`--ch-tabular-grid-column-${column.physicalOrder}-display`]: "none"
        }
      : null;
  }

  private getColumnDraggingStyle(
    column: HTMLChTabularGridColumnElement
  ): CSSProperties {
    return this.columnDragManager
      ? this.columnDragManager.getColumnStyle(column)
      : null;
  }

  private getColumnIndentStyle(
    column: HTMLChTabularGridColumnElement
  ): CSSProperties {
    return {
      [`--ch-tabular-grid-column-${column.physicalOrder}-content`]:
        column.order === 1 ? "''" : "none"
    };
  }

  private isRTLDirection(): boolean {
    return getComputedStyle(this.grid).direction === "rtl";
  }
}
