import { CSSProperties } from "./types";
import { ChGrid } from "./ch-grid";

export class ChGridManager {
  grid: ChGrid;
  columns: HTMLChGridColumnElement[];

  columnsBoundingClientRect: DOMRect[];
  columnDragStartOrder: number;
  columnDragTranslateX: number[];

  constructor(grid: ChGrid) {
    this.grid = grid;
    this.columnDragTranslateX = [];

    this.defineColumns();
    this.defineColumnsVariables();
  }

  defineColumns() {
    this.columns = Array.from(this.grid.el.querySelectorAll("ch-grid-column"));

    this.columns.forEach((column) => {
      this.defineColumnId(column);
      this.defineColumnOrder(column);
      this.defineColumnSize(column);
      this.defineColumnDisplayObserver(column);
    });
  }

  defineColumnId(column: HTMLChGridColumnElement) {
    if (!column.columnId) {
      column.columnId = `grid-column-${this.columns.indexOf(column) + 1}`;
    }
  }

  defineColumnDisplayObserver(column: HTMLChGridColumnElement) {
    if (column.displayObserverClass) {
      let columnDisplay = document.createElement(
        "ch-grid-column-display"
      ) as HTMLChGridColumnDisplayElement;
      columnDisplay.setAttribute("slot", "column-display");
      columnDisplay.setAttribute("class", column.displayObserverClass);
      columnDisplay.column = column;

      this.grid.el.appendChild(columnDisplay);
    }
  }

  defineColumnSize(column: HTMLChGridColumnElement) {
    if (!column.size) {
      column.size = "auto";
    }
  }

  defineColumnOrder(column: HTMLChGridColumnElement) {
    if (!column.order) {
      column.order = this.columns.indexOf(column) + 1;
    }
  }

  defineColumnsVariables() {
    const style = document.head.querySelector("#ChGrid.ColumnsVariables");

    if (
      !style ||
      parseInt(style.getAttribute("data-columns")) < this.columns.length
    ) {
      let selectors = "";
      for (let i = 1; i <= this.columns.length; i++) {
        selectors += `ch-grid-column:nth-child(${i}), ch-grid-cell:nth-child(${i}) {
                    display: var(--ch-grid-column-${i}-display);
                    grid-column: var(--ch-grid-column-${i}-position, ${i});
                    margin-inline-start: var(--ch-grid-column-${i}-margin-start);
                    border-inline-start: var(--ch-grid-column-${i}-border-start);
                    padding-inline-start: var(--ch-grid-column-${i}-padding-start);
                    margin-inline-end: var(--ch-grid-column-${i}-margin-end);
                    border-inline-end: var(--ch-grid-column-${i}-border-end);
                    padding-inline-end: var(--ch-grid-column-${i}-padding-end);
                    transform: var(--ch-grid-column-${i}-transform);
                }`;
      }

      if (style) {
        style.setAttribute("data-columns", this.columns.length.toString());
        style.innerHTML = selectors;
      } else {
        document.head.insertAdjacentHTML(
          "beforeend",
          `<style id="ChGrid.ColumnsVariables" data-columns="${this.columns.length}">${selectors}</style>`
        );
      }
    }
  }

  columnDragStart(eventInfo: CustomEvent) {
    this.columnDragStartOrder = eventInfo.detail.column.order - 1;
    this.columnsBoundingClientRect = this.columns.map((column) =>
      column.getBoundingClientRect()
    );
    this.columnDragTranslateX = new Array(this.columns.length);
    this.columnDragTranslateX.fill(0);
  }

  columnDragEnd() {
    this.columnDragTranslateX = [];
  }

  columnDragging(eventInfo: CustomEvent) {
    const columnDraggingOrder = this.columnsBoundingClientRect.findIndex(
      (rect) => {
        if (
          eventInfo.detail.position > rect.left &&
          eventInfo.detail.position < rect.right
        ) {
          return true;
        }
      }
    );

    this.columnDragTranslateX[this.columnDragStartOrder] = 0;
    for (let i = this.columnDragStartOrder + 1; i <= columnDraggingOrder; i++) {
      this.columnDragTranslateX[this.columnDragStartOrder] +=
        this.columnsBoundingClientRect[i].width;
      this.columnDragTranslateX[i] =
        -1 *
        this.columnsBoundingClientRect[this.columnDragStartOrder].width *
        (i - this.columnDragStartOrder);
    }

    for (let i = 0; i <= this.columns.length; i++) {
      if (i != this.columnDragStartOrder) {
        this.columnDragTranslateX[i] =
          i > this.columnDragStartOrder && i <= columnDraggingOrder
            ? this.columnsBoundingClientRect[this.columnDragStartOrder].width *
              -1
            : 0;
      }
    }
  }

  getGridStyle(): CSSProperties {
    let style: CSSProperties = {};
    let columnFirst = 0;
    let columnEnd = 0;

    style["display"] = "grid";
    style["grid-template-columns"] = this.getGridTemplateColumns();

    this.columns.forEach((column, i) => {
      style[`--ch-grid-column-${i + 1}-position`] = column.order.toString();

      if (column.hidden) {
        style[`--ch-grid-column-${i + 1}-display`] = "none";
      } else {
        if (columnFirst == 0) {
          columnFirst = i + 1;
        }
        if (columnEnd < i + 1) {
          columnEnd = i + 1;
        }
      }
    });
    style[`--ch-grid-column-${columnFirst}-margin-start`] =
      "var(--ch-grid-fallback, inherit)";
    style[`--ch-grid-column-${columnFirst}-border-start`] =
      "var(--ch-grid-fallback, inherit)";
    style[`--ch-grid-column-${columnFirst}-padding-start`] =
      "var(--ch-grid-fallback, inherit)";
    style[`--ch-grid-column-${columnEnd}-margin-end`] =
      "var(--ch-grid-fallback, inherit)";
    style[`--ch-grid-column-${columnEnd}-border-end`] =
      "var(--ch-grid-fallback, inherit)";
    style[`--ch-grid-column-${columnEnd}-padding-end`] =
      "var(--ch-grid-fallback, inherit)";

    this.columnDragTranslateX.forEach((x, i) => {
      style[`--ch-grid-column-${i + 1}-transform`] = `translateX(${x}px)`;
    });

    return style;
  }

  getGridTemplateColumns(): string {
    return this.columns
      .map((column) => (column.hidden ? "0px" : column.size))
      .join(" ");
  }
}
