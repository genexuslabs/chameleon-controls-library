import HTMLChGridCellElement, {
  ChGridCellType,
} from "../grid-cell/ch-grid-cell";
import { ChGrid } from "./ch-grid";

export class ChGridManagerColumns {
  private grid: ChGrid;
  private columns: HTMLChGridColumnElement[];
  private columnResizeObserver: ResizeObserver;

  constructor(grid: ChGrid) {
    this.grid = grid;

    this.defineColumns();
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
    return this.columns.find((column) => column.columnType == "select");
  }

  private defineColumns() {
    this.columns = Array.from(this.grid.el.querySelectorAll("ch-grid-column"));
    this.columnResizeObserver = new ResizeObserver(
      this.resizeColumnHandler.bind(this)
    );

    this.columns.forEach((column) => {
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
      column.columnId = `grid-column-${this.columns.indexOf(column) + 1}`;
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
      let columnDisplay = document.createElement(
        "ch-grid-column-display"
      ) as HTMLChGridColumnDisplayElement;
      columnDisplay.setAttribute("slot", "column-display");
      columnDisplay.setAttribute("class", column.displayObserverClass);
      columnDisplay.column = column;

      this.grid.el.appendChild(columnDisplay);
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
            cell.type = ChGridCellType.Node;
          });
        break;
      case "select":
        this.grid.el
          .querySelectorAll(`ch-grid-cell:nth-child(${column.physicalOrder})`)
          .forEach((cell: HTMLChGridCellElement) => {
            cell.type = ChGridCellType.Selector;
          });
        break;
      case "drag":
        this.grid.el
          .querySelectorAll(`ch-grid-cell:nth-child(${column.physicalOrder})`)
          .forEach((cell: HTMLChGridCellElement) => {
            cell.type = ChGridCellType.Drag;
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

  private resizeColumnHandler(entries: ResizeObserverEntry[]) {
    for (const entry of entries) {
      const column = entry.target as HTMLChGridColumnElement;
      this.grid.gridMainEl.style.setProperty(
        `--ch-grid-column-${column.physicalOrder}-width`,
        `${entry.contentRect.width}px`
      );
    }
  }
}
