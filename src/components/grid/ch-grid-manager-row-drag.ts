import HTMLChGridRowElement from "../grid-row/ch-grid-row";
import { ChGrid } from "./ch-grid";

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
    const rowHover = target.closest(HTMLChGridRowElement.TAG_NAME) as HTMLChGridRowElement;

    if (rowHover && rowHover.parentElement == this.row.parentElement && rowHover.grid == this.grid.el) {
      const rowHoverIndex = this.grid.manager.getGridRowIndex(rowHover);
      const rowHoverGridPosition = rowHoverIndex + 2; // +1 RowHeaderColumn, +1 array start at 1
      const offsetPosition = this.rowIndex < rowHoverIndex ? -1 : 1;

      if (this.rowShadow.style.gridRowStart != `${rowHoverGridPosition}`) {
        this.rowShadow.style.gridRowStart = `${rowHoverGridPosition}`;
      } else {
        this.rowShadow.style.gridRowStart = `${rowHoverGridPosition + offsetPosition}`;
      }

      this.updateRowPosition();
    }
  }

  private dragMouseUpHandler() {
    document.removeEventListener("mousemove", this.dragMouseMoveFn);

    const dropPosition = parseInt(this.rowShadow.style.gridRowStart);
    const rowDrop = this.grid.el.querySelectorAll("ch-grid-row").item(dropPosition-2);

    if (dropPosition < this.rowIndex+2) {
      rowDrop.before(this.row);
    } 
    if (dropPosition > this.rowIndex+2) {
      rowDrop.after(this.row);
    }

    this.row.removeAttribute("dragging");
    this.rowShadow.remove();

    this.row = null;
    this.rowShadow = null;
  }

  private defineListeners() {
    document.addEventListener("mousemove", this.dragMouseMoveFn, {
        passive: true,
    });
    document.addEventListener("mouseup", this.dragMouseUpHandler.bind(this), {
        once: true,
    });
  }

  private createRowShadow() {
    this.rowShadow = document.createElement("div");
    this.rowShadow.style.gridColumn = "1 / -1";
    this.rowShadow.style.opacity = "0";
    this.rowShadow.style.height = this.grid.manager.getRowHeight(this.row);
  }

  private floatRow() {
    this.row.before(this.rowShadow);
    this.row.setAttribute("dragging", "");
  }

  private updateRowPosition() {
    const rect = this.rowShadow.getBoundingClientRect();

    this.row.style.top = `${rect.top}px`;
    this.row.style.left = `${rect.left}px`;
  }
}