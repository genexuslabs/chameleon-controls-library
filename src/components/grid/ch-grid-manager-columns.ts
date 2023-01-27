import HTMLChGridCellElement, {
  ChGridCellType,
} from "./grid-cell/ch-grid-cell";
import { ChGrid } from "./ch-grid";

export class ChGridManagerColumns {
  private grid: ChGrid;
  private columnsetObserver = new MutationObserver(this.reloadColumns.bind(this));
  private columnResizeObserver = new ResizeObserver(this.resizeColumnHandler.bind(this));
  private columns: HTMLChGridColumnElement[];
  private columnsDisplay: HTMLChGridColumnDisplayElement[] = [];

  constructor(grid: ChGrid) {
    this.grid = grid;
    this.columns = Array.from(this.grid.el.querySelectorAll("ch-grid-column"));

    this.observeColumnset();

    this.defineColumns(this.columns);
    this.defineColumnsVariables();
  }

  public getColumns() {
    return this.columns;
  }

  public getColumnsFirstLast(): {
    columnFirst: HTMLChGridColumnElement;
    columnLast: HTMLChGridColumnElement;
  } {
    let columnFirst: HTMLChGridColumnElement;
    let columnLast: HTMLChGridColumnElement;

    this.columns.forEach((column) => {
      if (
        !column.hidden &&
        (!columnFirst || column.order < columnFirst.order)
      ) {
        columnFirst = column;
      }
      if (!column.hidden && (!columnLast || column.order > columnLast.order)) {
        columnLast = column;
      }
    });

    return {
      columnFirst,
      columnLast,
    };
  }

  public getColumnSelector(): HTMLChGridColumnElement {
    return this.columns.find((column) => column.columnType == "rich" && column.richRowSelector);
  }

  private defineColumns(columns: HTMLChGridColumnElement[]) {

    columns.forEach((column) => {
      this.defineColumnId(column);
      this.defineColumnIndex(column);
      this.defineColumnOrder(column);
      this.defineColumnSize(column);
      this.defineColumnDisplayObserver(column);
      this.defineColumnResizeObserver(column);
      this.defineColumnType(column);
    });
  }

  private defineColumnId(column: HTMLChGridColumnElement) {
    if (!column.columnId) {
      column.columnId = this.getColumnUniqueId();
    }
  }

  private defineColumnIndex(column: HTMLChGridColumnElement) {
    column.physicalOrder = this.columns.indexOf(column) + 1;
  }

  private defineColumnOrder(column: HTMLChGridColumnElement) {
    if (!column.order) {
      column.order = column.physicalOrder;
    }
  }

  private defineColumnSize(column: HTMLChGridColumnElement) {
    if (!column.size) {
      column.size = "auto";
    }
  }

  private defineColumnDisplayObserver(column: HTMLChGridColumnElement) {

    if (column.displayObserverClass && !column.hidden) {
      const i = this.columnsDisplay.push(document.createElement(
        "ch-grid-column-display"
      )) - 1;

      this.columnsDisplay[i].setAttribute("slot", "column-display");
      this.columnsDisplay[i].setAttribute("class", column.displayObserverClass);
      this.columnsDisplay[i].column = column;

      this.grid.el.appendChild(this.columnsDisplay[i]);
    }
  }

  private defineColumnResizeObserver(column: HTMLChGridColumnElement) {
    this.columnResizeObserver.observe(column, { box: "border-box" });
  }

  private defineColumnType(column: HTMLChGridColumnElement) {
    switch (column.columnType) {
      case "tree":
        this.grid.el
          .querySelectorAll(`ch-grid-cell:nth-child(${column.physicalOrder})`)
          .forEach((cell: HTMLChGridCellElement) => {
            cell.type = ChGridCellType.TreeNode;
          });
        break;
      case "rich":
        this.grid.el
          .querySelectorAll(`ch-grid-cell:nth-child(${column.physicalOrder})`)
          .forEach((cell: HTMLChGridCellElement) => {
            cell.rowDrag = column.richRowDrag;
            cell.rowSelector = column.richRowSelector;
            cell.rowActions = column.richRowActions;
            cell.type = ChGridCellType.Rich;
          });
        break;
    }
  }

  private defineColumnsVariables() {
    const style = document.head.querySelector("#ch-grid-columns-variables");

    if (
      !style ||
      parseInt(style.getAttribute("data-columns")) < this.columns.length
    ) {
      let selectors = "";
      for (let i = 1; i <= this.columns.length; i++) {
        selectors += `ch-grid-column:nth-child(${i}), ch-grid-cell:nth-child(${i}) {
                        display: var(--ch-grid-column-${i}-display, flex);
                        grid-column: var(--ch-grid-column-${i}-position, ${i});
                        margin-inline-start: var(--ch-grid-column-${i}-margin-start);
                        border-inline-start: var(--ch-grid-column-${i}-border-start);
                        padding-inline-start: var(--ch-grid-column-${i}-padding-start);
                        margin-inline-end: var(--ch-grid-column-${i}-margin-end);
                        border-inline-end: var(--ch-grid-column-${i}-border-end);
                        padding-inline-end: var(--ch-grid-column-${i}-padding-end);
                        transform: var(--ch-grid-column-${i}-transform);
                        left: var(--ch-grid-column-${i}-left-freeze);
                        right: var(--ch-grid-column-${i}-right-freeze);
                        z-index: calc(var(--ch-grid-column-${i}-z-index, 0) + var(--ch-grid-column-head-z-index, 0));
                    }
                    ch-grid-cell:nth-child(${i})::before {
                        content: var(--ch-grid-column-${i}-content);
                    }
                `;
      }

      if (style) {
        style.setAttribute("data-columns", this.columns.length.toString());
        style.innerHTML = selectors;
      } else {
        document.head.insertAdjacentHTML(
          "beforeend",
          `<style id="ch-grid-columns-variables" data-columns="${this.columns.length}">@layer ch-grid {${selectors}}</style>`
        );
      }
    }
  }

  private undefineColumns(columns: HTMLChGridColumnElement[]) {

    columns.forEach(column => {

      this.columnResizeObserver.unobserve(column);
      this.columnsDisplay.filter(columnDisplay => columnDisplay.column == column).forEach(item => {
        item.remove();
      })
    });
  }

  private observeColumnset() {
    this.columnsetObserver.observe(this.grid.el.querySelector("ch-grid-columnset"), {childList: true});
  }

  private reloadColumns() {
    const columns = Array.from(this.grid.el.querySelectorAll("ch-grid-column"));
    const columnsAdded = columns.filter(column => !this.columns.includes(column));
    const columnsRemoved = this.columns.filter(column => !columns.includes(column));

    if (columnsAdded.length || columnsRemoved.length) {
      this.columns = columns;

      this.undefineColumns(columnsRemoved);
      this.defineColumns(columnsAdded);
      this.defineColumnsVariables();

      this.adjustOrders();
    }
  }

  private resizeColumnHandler(entries: ResizeObserverEntry[]) {
    for (const entry of entries) {
      const column = entry.target as HTMLChGridColumnElement;
      this.grid.gridMainEl.style.setProperty(
        `--ch-grid-column-${column.physicalOrder}-width`,
        `${entry.contentRect.width}px`
      );
    }
  }

  private getColumnUniqueId(): string {
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);

    return `ch-grid-column-auto-${uniqueId}`;
  }

  private adjustOrders() {

    // adjust physicalOrder
    this.columns.forEach((column, i) => column.physicalOrder = i+1);
    
    // adjust order, preserving physicalOrder array
    [...this.columns].sort((columnA, columnB) => {
      if (columnA.order < columnB.order) {
        return -1;
      }
      if (columnA.order > columnB.order) {
        return 1;
      }
      return 0;
    }).forEach((column, i) => {
      column.order = i+1;
    });
  }
}
