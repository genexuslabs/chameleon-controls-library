import HTMLChGridRowElement from "./grid-row/ch-grid-row";
import { ChGrid } from "./ch-grid";
import HTMLChGridCellElement from "./grid-cell/ch-grid-cell";

export class ChGridManagerRowDrag {
  private grid: ChGrid;
  private row: HTMLChGridRowElement;
  private rowIndex: number;
  private rowShadow: HTMLDivElement;
  private dragMouseMoveFn = this.dragMouseMoveHandler.bind(this);

  constructor(grid: ChGrid) {
    this.grid = grid;
  }

  public dragStart(row: HTMLChGridRowElement) {
    this.row = row;
    this.rowIndex = this.grid.manager.getGridRowIndex(row);

    this.defineListeners();
    this.createRowShadow();
    this.floatRow();
    this.updateRowPosition();
  }

  private dragMouseMoveHandler(eventInfo: MouseEvent) {
    const target = eventInfo.target as HTMLElement;
    const rowHover = target.closest(
      HTMLChGridRowElement.TAG_NAME
    ) as HTMLChGridRowElement;

    if (
      rowHover &&
      rowHover.parentElement === this.row.parentElement &&
      rowHover.grid === this.grid.el
    ) {
      const rowHoverIndex = this.grid.manager.getGridRowIndex(rowHover);
      const rowHoverGridPosition = rowHoverIndex + 2; // +1 RowHeaderColumn, +1 array start at 1
      const offsetPosition = this.rowIndex < rowHoverIndex ? -1 : 1;

      if (
        this.rowShadow.style.getPropertyValue("--row-shadow-row-start") !==
        `${rowHoverGridPosition}`
      ) {
        this.rowShadow.style.setProperty(
          "--row-shadow-row-start",
          `${rowHoverGridPosition}`
        );
      } else {
        this.rowShadow.style.setProperty(
          "--row-shadow-row-start",
          `${rowHoverGridPosition + offsetPosition}`
        );
      }

      this.updateRowPosition();
    }
  }

  private dragMouseUpHandler() {
    document.removeEventListener("mousemove", this.dragMouseMoveFn);

    const dropPosition = parseInt(
      this.rowShadow.style.getPropertyValue("--row-shadow-row-start")
    );
    const rowDrop = this.grid.el
      .querySelectorAll("ch-grid-row")
      .item(dropPosition - 2);

    if (dropPosition < this.rowIndex + 2) {
      rowDrop.before(this.row);
    }
    if (dropPosition > this.rowIndex + 2) {
      rowDrop.after(this.row);
    }

    this.unfloatRow();
    this.rowShadow.remove();

    this.row = null;
    this.rowShadow = null;
  }

  private defineListeners() {
    document.addEventListener("mousemove", this.dragMouseMoveFn, {
      passive: true
    });
    document.addEventListener("mouseup", this.dragMouseUpHandler.bind(this), {
      once: true
    });
  }

  private createRowShadow() {
    const rowHeight = this.grid.manager.getRowHeight(this.row);

    this.rowShadow = document.createElement("div");
    this.rowShadow.style.display = "contents";

    this.grid.manager.getColumnsWidth().forEach(width => {
      const column = document.createElement("div");

      column.style.opacity = "0";
      column.style.minWidth = width;
      column.style.height = `${rowHeight}px`;
      column.style.gridRowStart = "var(--row-shadow-row-start)";

      this.rowShadow.append(column);
    });
  }

  private floatRow() {
    const columnsWidth = this.grid.manager.getColumnsWidth();
    const rowWidth = this.grid.gridMainEl.clientWidth;

    this.row.before(this.rowShadow);
    this.row.setAttribute("dragging", "");
    this.row.style.width = `${rowWidth}px`;

    this.row
      .querySelectorAll(":scope > ch-grid-cell")
      .forEach((cell: HTMLChGridCellElement, i) => {
        const columnPosition = parseInt(
          this.grid.gridMainEl.style.getPropertyValue(
            `--ch-grid-column-${i + 1}-position`
          )
        );

        if (!cell.hidden) {
          cell.style.width = columnsWidth[columnPosition - 1];
          cell.style.order = `${columnPosition}`;
        }
      });
  }

  private unfloatRow() {
    this.row.removeAttribute("dragging");
    this.row.style.width = "";

    this.row
      .querySelectorAll(":scope > ch-grid-cell")
      .forEach((cell: HTMLChGridCellElement) => {
        cell.style.width = "";
        cell.style.order = "";
      });
  }

  private updateRowPosition() {
    const rect = this.rowShadow.children[0].getBoundingClientRect();

    this.row.style.top = `${rect.top}px`;
    this.row.style.left = `${rect.left}px`;
  }
}
