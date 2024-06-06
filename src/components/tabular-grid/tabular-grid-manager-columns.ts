import HTMLChTabularGridCellElement, {
  TabularGridCellType
} from "./cell/tabular-grid-cell";
import { TabularGridManager } from "./tabular-grid-manager";

export class TabularGridManagerColumns {
  private manager: TabularGridManager;
  private columnsetObserver = new MutationObserver(
    this.reloadColumns.bind(this)
  );
  private columnResizeObserver = new ResizeObserver(
    this.resizeColumnHandler.bind(this)
  );
  private columns: HTMLChTabularGridColumnElement[];
  private columnsDisplay: HTMLChTabularGridColumnDisplayElement[] = [];
  private columnsWidth: number[] = [];

  constructor(manager: TabularGridManager) {
    this.manager = manager;
    this.columns = Array.from(
      this.manager.grid.querySelectorAll("ch-tabular-grid-column")
    );

    this.observeColumnset();

    this.defineColumns(this.columns);
    this.defineColumnsVariables();

    this.adjustFreezeOrder();
    this.adjustBaseLayer();
  }

  public getColumn(columnId: string): HTMLChTabularGridColumnElement {
    return this.columns.find(column => column.columnId === columnId);
  }

  public getColumns(sorted = false): HTMLChTabularGridColumnElement[] {
    if (sorted) {
      return this.columns.sort(this.fnSortByOrder);
    }
    return this.columns;
  }

  public getColumnsFirstLast(): {
    columnFirst: HTMLChTabularGridColumnElement;
    columnLast: HTMLChTabularGridColumnElement;
  } {
    let columnFirst: HTMLChTabularGridColumnElement;
    let columnLast: HTMLChTabularGridColumnElement;

    this.columns.forEach(column => {
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
      columnLast
    };
  }

  public getColumnSelector(): HTMLChTabularGridColumnElement {
    return this.columns.find(
      column => column.columnType === "rich" && column.richRowSelector
    );
  }

  public adjustFreezeOrder() {
    const freezeStart = this.columns
      .filter(column => column.freeze === "start")
      .sort(this.fnSortByOrder);
    const noFreeze = this.columns
      .filter(column => column.freeze !== "start" && column.freeze !== "end")
      .sort(this.fnSortByOrder);
    const freezeEnd = this.columns
      .filter(column => column.freeze === "end")
      .sort(this.fnSortByOrder);
    let order = 1;

    freezeStart.forEach(column => (column.order = order++));
    noFreeze.forEach(column => (column.order = order++));
    freezeEnd.forEach(column => (column.order = order++));
  }

  private defineColumns(columns: HTMLChTabularGridColumnElement[]) {
    columns.forEach(column => {
      this.defineColumnId(column);
      this.defineColumnIndex(column);
      this.defineColumnOrder(column);
      this.defineColumnSize(column);
      this.defineColumnDisplayObserver(column);
      this.defineColumnResizeObserver(column);
      this.defineColumnType(column);
    });
  }

  private defineColumnId(column: HTMLChTabularGridColumnElement) {
    column.columnId ||= this.getColumnUniqueId();
  }

  private defineColumnIndex(column: HTMLChTabularGridColumnElement) {
    column.physicalOrder = this.columns.indexOf(column) + 1;
  }

  private defineColumnOrder(column: HTMLChTabularGridColumnElement) {
    column.order ||= column.physicalOrder;
  }

  private defineColumnSize(column: HTMLChTabularGridColumnElement) {
    column.size ||= "auto";
  }

  private defineColumnDisplayObserver(column: HTMLChTabularGridColumnElement) {
    if (column.displayObserverClass && !column.hidden) {
      const i =
        this.columnsDisplay.push(
          document.createElement("ch-tabular-grid-column-display")
        ) - 1;

      this.columnsDisplay[i].setAttribute("slot", "column-display");
      this.columnsDisplay[i].setAttribute("class", column.displayObserverClass);
      this.columnsDisplay[i].column = column;

      this.manager.grid.appendChild(this.columnsDisplay[i]);
    }
  }

  private defineColumnResizeObserver(column: HTMLChTabularGridColumnElement) {
    this.columnResizeObserver.observe(column, { box: "border-box" });
  }

  private defineColumnType(column: HTMLChTabularGridColumnElement) {
    switch (column.columnType) {
      case "tree":
        this.manager.grid
          .querySelectorAll(
            `ch-tabular-grid-cell:nth-child(${column.physicalOrder})`
          )
          .forEach((cell: HTMLChTabularGridCellElement) => {
            cell.type = TabularGridCellType.TreeNode;
          });
        break;
      case "rich":
        this.manager.grid
          .querySelectorAll(
            `ch-tabular-grid-cell:nth-child(${column.physicalOrder})`
          )
          .forEach((cell: HTMLChTabularGridCellElement) => {
            cell.rowDrag = column.richRowDrag;
            cell.rowSelector = column.richRowSelector;
            cell.rowActions = column.richRowActions;
            cell.type = TabularGridCellType.Rich;
          });
        break;
    }
  }

  private defineColumnsVariables() {
    const root: Document | ShadowRoot = this.manager.grid.getRootNode() as
      | Document
      | ShadowRoot;
    const style = root.querySelector("#ch-tabular-grid-columns-variables");

    if (
      !style ||
      parseInt(style.getAttribute("data-columns")) < this.columns.length
    ) {
      let selectors = "";
      for (let i = 1; i <= this.columns.length; i++) {
        selectors += `ch-tabular-grid-column:nth-child(${i}), ch-tabular-grid-cell:nth-child(${i}) {
                        display: var(--ch-tabular-grid-column-${i}-display, flex);
                        grid-column: var(--ch-tabular-grid-column-${i}-position, ${i});
                        margin-inline-start: var(--ch-tabular-grid-column-${i}-margin-start);
                        border-inline-start: var(--ch-tabular-grid-column-${i}-border-start);
                        padding-inline-start: var(--ch-tabular-grid-column-${i}-padding-start);
                        margin-inline-end: var(--ch-tabular-grid-column-${i}-margin-end);
                        border-inline-end: var(--ch-tabular-grid-column-${i}-border-end);
                        padding-inline-end: var(--ch-tabular-grid-column-${i}-padding-end);
                        left: var(--ch-tabular-grid-column-${i}-left-freeze);
                        right: var(--ch-tabular-grid-column-${i}-right-freeze);
                    }
                    ch-tabular-grid-column:nth-child(${i}) {
                      transform: var(--ch-tabular-grid-column-${i}-transform);
                      z-index: calc(var(--ch-tabular-grid-column-${i}-z-index-freeze, 0) + var(--ch-tabular-grid-column-z-index-head, 0)  + var(--ch-tabular-grid-column-z-index-active, 0));
                    }
                    ch-tabular-grid-cell:nth-child(${i}) {
                      transform: var(--ch-tabular-grid-virtual-scroller-position,) var(--ch-tabular-grid-column-${i}-transform,);
                      z-index: calc(var(--ch-tabular-grid-column-${i}-z-index-freeze, 0) + var(--ch-tabular-grid-cell-z-index-active, 0));
                    }
                    ch-tabular-grid-cell:nth-child(${i})::before {
                      content: var(--ch-tabular-grid-column-${i}-content);
                    }
                `;
      }

      const styleInnerHTML = `@layer ch-tabular-grid {
        ${selectors}
      }`;

      if (style) {
        style.setAttribute("data-columns", this.columns.length.toString());
        style.innerHTML = styleInnerHTML;
      } else if (root instanceof Document) {
        root.head.insertAdjacentHTML(
          "beforeend",
          `<style id="ch-tabular-grid-columns-variables" data-columns="${this.columns.length}">${styleInnerHTML}</style>`
        );
      } else if (root instanceof ShadowRoot) {
        const s = document.createElement("style");
        s.id = "ch-tabular-grid-columns-variables";
        s.dataset.columns = this.columns.length.toString();
        s.innerText = styleInnerHTML;
        root.appendChild(s);
      }
    }
  }

  private undefineColumns(columns: HTMLChTabularGridColumnElement[]) {
    columns.forEach(column => {
      this.columnResizeObserver.unobserve(column);
      this.columnsDisplay
        .filter(columnDisplay => columnDisplay.column === column)
        .forEach(item => {
          item.remove();
        });
    });
  }

  private observeColumnset() {
    this.columnsetObserver.observe(
      this.manager.grid.querySelector("ch-tabular-grid-columnset"),
      { childList: true }
    );
  }

  private reloadColumns() {
    const columns = Array.from(
      this.manager.grid.querySelectorAll("ch-tabular-grid-column")
    );
    const columnsAdded = columns.filter(
      column => !this.columns.includes(column)
    );
    const columnsRemoved = this.columns.filter(
      column => !columns.includes(column)
    );

    if (columnsAdded.length || columnsRemoved.length) {
      this.columns = columns;

      this.undefineColumns(columnsRemoved);
      this.defineColumns(columnsAdded);
      this.defineColumnsVariables();

      this.adjustOrders();
      this.adjustBaseLayer();
    }
  }

  private resizeColumnHandler(entries: ResizeObserverEntry[]) {
    for (const entry of entries) {
      const column = entry.target as HTMLChTabularGridColumnElement;
      this.columnsWidth[column.physicalOrder - 1] = entry.contentRect.width;
    }

    this.manager.setColumnWidthVariables(this.columnsWidth);
  }

  private getColumnUniqueId(): string {
    const uniqueId =
      Date.now().toString(36) + Math.random().toString(36).substring(2);

    return `ch-tabular-grid-column-auto-${uniqueId}`;
  }

  private adjustOrders() {
    // adjust physicalOrder
    this.columns.forEach((column, i) => (column.physicalOrder = i + 1));

    // adjust order, preserving physicalOrder array
    [...this.columns].sort(this.fnSortByOrder).forEach((column, i) => {
      column.order = i + 1;
    });
  }

  private adjustBaseLayer() {
    this.manager.setBaseLayer(this.columns.length);
  }

  private fnSortByOrder(
    columnA: HTMLChTabularGridColumnElement,
    columnB: HTMLChTabularGridColumnElement
  ): number {
    if (columnA.order < columnB.order) {
      return -1;
    }
    if (columnA.order > columnB.order) {
      return 1;
    }
    return 0;
  }
}
