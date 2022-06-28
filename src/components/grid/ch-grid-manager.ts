import { CSSProperties } from "./types";
import { ChGrid } from "./ch-grid";
import { ChGridManagerColumnDrag } from "./ch-grid-manager-column-drag";

export class ChGridManager {
  grid: ChGrid;
  columns: HTMLChGridColumnElement[];
  columnDragManager: ChGridManagerColumnDrag;

  constructor(grid: ChGrid) {
    this.grid = grid;

    this.defineColumns();
    this.defineColumnsVariables();
  }

  private defineColumns() {
    this.columns = Array.from(this.grid.el.querySelectorAll("ch-grid-column"));

    this.columns.forEach((column) => {
      this.defineColumnId(column);
      this.defineColumnIndex(column);
      this.defineColumnOrder(column);
      this.defineColumnSize(column);
      this.defineColumnDisplayObserver(column);
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

  private defineColumnsVariables() {
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

  columnDragStart(columnId: string) {
    this.columnDragManager = new ChGridManagerColumnDrag(
      columnId,
      this.columns
    );
  }

  columnDragging(position: number): boolean {
    return this.columnDragManager.dragging(position);
  }

  columnDragEnd() {
    this.columnDragManager.dragEnd();
    this.columnDragManager = null;
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

  private getGridTemplateColumns(): CSSProperties {
    return {
      "grid-template-columns": this.columns
        .map((column) => `var(--ch-grid-column-${column.physicalOrder}-size)`)
        .join(" "),
    };
  }

  private getRowBoxSimulationStyle(): CSSProperties {
    const { columnFirst, columnLast } = this.columnDragManager
      ? this.columnDragManager.getColumnsFirstLast()
      : this.getColumnsFirstLast();

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

  private getColumnsFirstLast(): {
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

  private getDragTransitionStyle(): CSSProperties {
    return {
      "--column-drag-transition-duration": this.columnDragManager
        ? ".2s"
        : "0s",
    };
  }

  private getColumnsStyle(): CSSProperties {
    return this.columns.reduce((style, column) => {
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
      ...this.getColumnDraggingStyle(column),
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
}
