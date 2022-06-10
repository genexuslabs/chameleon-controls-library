import { CSSProperties } from "./types";
import { ChGrid } from "./ch-grid";

export class ChGridManager {
  grid: ChGrid;
  columns: HTMLChGridColumnElement[];

  constructor(grid: ChGrid) {
    this.grid = grid;
    this.columns = Array.from(this.grid.el.querySelectorAll("ch-grid-column"));

    this.defineColumnsSize();
    this.defineColumnsOrder();
    this.defineColumnsVariables();
  }

  defineColumnsSize() {
    this.columns.forEach((column) => {
      column.size = "auto";
    });
  }

  defineColumnsOrder() {
    this.columns.forEach((column, i) => {
      column.order = i + 1;
    });
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
                    grid-column: var(--ch-grid-column-${i}-position, ${i});
                    margin-inline-start: var(--ch-grid-column-${i}-margin-start,);
                    border-inline-start: var(--ch-grid-column-${i}-border-start);
                    padding-inline-start: var(--ch-grid-column-${i}-padding-start);
                    margin-inline-end: var(--ch-grid-column-${i}-margin-end);
                    border-inline-end: var(--ch-grid-column-${i}-border-end);
                    padding-inline-end: var(--ch-grid-column-${i}-padding-end);
                    opacity: var(--ch-grid-column-${i}-opacity);
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

  columnDragging(eventInfo: CustomEvent): boolean {
    let reorder = false;

    let columnHover = this.columns.find((column) => {
      const rect = column.getBoundingClientRect();

      if (
        eventInfo.detail.left > rect.left &&
        eventInfo.detail.left < rect.right
      ) {
        return true;
      } else {
        return false;
      }
    });

    if (columnHover && columnHover != eventInfo.detail.column) {
      const dragOrder = eventInfo.detail.column.order;

      eventInfo.detail.column.order = columnHover.order;
      columnHover.order = dragOrder;

      reorder = true;
    }

    // this.columns.map(column => {
    //   return {
    //     column,
    //     left: eventInfo.detail.column === column ? eventInfo.detail.left : column.getBoundingClientRect().left
    //   }
    // }).sort((columnA, columnB) => {

    //   if (columnA.left < columnB.left) {
    //     return -1;
    //   }
    //   if (columnA.left > columnB.left) {
    //     return 1;
    //   }
    //   return 0;
    // }).forEach((column, i) => {
    //   if (column.column.order != i+1) {
    //     column.column.order = i+1;
    //     reorder = true;
    //   }
    // });

    return reorder;
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
        style[`--ch-grid-column-${i + 1}-opacity`] = "0";
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

    return style;
  }

  getGridTemplateColumns(): string {
    return this.columns
      .map((column) => (column.hidden ? "0px" : column.size))
      .join(" ");
  }
}
