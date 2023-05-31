import { IChGridCollapsible } from "../ch-grid-types";
import HTMLChGridCellElement from "../grid-cell/ch-grid-cell";

/**
 * The `ch-grid-row` component represents a grid row.
 */
export default class HTMLChGridRowElement
  extends HTMLElement
  implements IChGridCollapsible
{
  private parentGrid: HTMLChGridElement;
  public static readonly TAG_NAME = "CH-GRID-ROW";

  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener("cellCaretClicked", this.cellCaretClickedHandler);
  }

  /**
   * Returns the parent ch-grid element of the grid row.
   */
  get grid(): HTMLChGridElement {
    return this.parentGrid ?? this.loadParentGrid();
  }

  /**
   * A unique identifier for the row.
   */
  get rowId(): string {
    return this.getAttribute("rowid") ?? "";
  }

  /**
   * A boolean value indicating whether the row is highlighted.
   */
  get highlighted(): boolean {
    return this.hasAttribute("highlighted");
  }

  set highlighted(value: boolean) {
    const highlightedClasses = this.grid.rowHighlightedClass?.split(" ");

    if (value === true) {
      this.setAttribute("highlighted", "");
      if (this.grid.rowHighlightedClass) {
        this.classList.add(...highlightedClasses);
      }
    } else {
      this.removeAttribute("highlighted");
      if (this.grid.rowHighlightedClass) {
        this.classList.remove(...highlightedClasses);
      }
    }
  }

  /**
   * A boolean value indicating whether the row is selected.
   */
  get selected(): boolean {
    return this.hasAttribute("selected");
  }

  set selected(value: boolean) {
    const selectedClasses = this.grid.rowSelectedClass?.split(" ");

    if (value === true) {
      this.setAttribute("selected", "");
      if (this.grid.rowSelectedClass) {
        this.classList.add(...selectedClasses);
      }
    } else {
      this.removeAttribute("selected");
      if (this.grid.rowSelectedClass) {
        this.classList.remove(...selectedClasses);
      }
    }
  }

  /**
   * A boolean value indicating whether the row is marked.
   */
  get marked(): boolean {
    return this.hasAttribute("marked");
  }

  set marked(value: boolean) {
    const markedClasses = this.grid.rowMarkedClass?.split(" ");

    if (value === true) {
      this.setAttribute("marked", "");
      if (this.grid.rowMarkedClass) {
        this.classList.add(...markedClasses);
      }
    } else {
      this.removeAttribute("marked");
      if (this.grid.rowMarkedClass) {
        this.classList.remove(...markedClasses);
      }
    }
  }

  /**
   * A boolean value indicating whether the row is focused.
   */
  get focused(): boolean {
    return this.hasAttribute("focused");
  }

  set focused(value: boolean) {
    const focusedClasses = this.grid.rowFocusedClass?.split(" ");

    if (value === true) {
      this.setAttribute("focused", "");
      if (this.grid.rowFocusedClass) {
        this.classList.add(...focusedClasses);
      }
    } else {
      this.removeAttribute("focused");
      if (this.grid.rowFocusedClass) {
        this.classList.remove(...focusedClasses);
      }
    }
  }

  /**
   * A boolean value indicating whether the grid row has child rows.
   */
  get hasChildRows(): boolean {
    return this.querySelector("ch-grid-rowset") ? true : false;
  }

  /**
   * A boolean value indicates whether the grid row is collapsed.
   */
  get collapsed(): boolean {
    return this.hasAttribute("collapsed");
  }

  set collapsed(value: boolean) {
    const dispatchEvent = this.collapsed != value;

    if (value) {
      this.setAttribute("collapsed", "");
    } else {
      this.removeAttribute("collapsed");
    }

    if (dispatchEvent) {
      this.dispatchEvent(
        new CustomEvent("rowCollapsedChanged", {
          bubbles: true,
          composed: true,
          detail: { rowId: this.rowId, collapsed: value }
        })
      );
    }
  }

  /**
   * A boolean value indicates whether the grid row is a leaf node.
   */
  get leaf(): boolean {
    return this.hasAttribute("leaf");
  }

  set leaf(value: boolean) {
    if (value === true) {
      this.setAttribute("leaf", "");
    } else {
      this.removeAttribute("leaf");
    }
  }

  public getCell(column: HTMLChGridColumnElement): HTMLChGridCellElement {
    return this.querySelector(
      `:scope > ch-grid-cell:nth-of-type(${column.physicalOrder})`
    );
  }

  /**
   * A boolean value indicates whether the grid row is visible.
   */
  public isVisible(): boolean {
    return Array.from(this.querySelectorAll(":scope > ch-grid-cell")).some(
      (cell: HTMLChGridCellElement) => cell.isVisible()
    );
  }

  /**
   * Ensures that the row is visible within the control, scrolling the contents of the control if necessary.
   */
  public ensureVisible() {
    this.dispatchEvent(
      new CustomEvent("rowEnsureVisible", { bubbles: true, composed: true })
    );
  }

  /**
   * returns a `DOMRect` object representing the size of the grid row element.
   */
  public getBoundingClientRect(): DOMRect {
    let rect: DOMRect;

    if (!this.firstElementChild) {
      rect = new DOMRect();
    } else if (this.firstElementChild == this.lastElementChild) {
      rect = this.firstElementChild.getBoundingClientRect();
    } else {
      const firstCellRect = this.firstElementChild.getBoundingClientRect();
      const lastCellRect = this.lastElementChild.getBoundingClientRect();

      rect = new DOMRect(
        firstCellRect.x,
        firstCellRect.y,
        lastCellRect.x - firstCellRect.x + lastCellRect.width,
        lastCellRect.y - firstCellRect.y + lastCellRect.height
      );
    }

    return rect;
  }

  private cellCaretClickedHandler(eventInfo: PointerEvent) {
    const targetRow = eventInfo.currentTarget as HTMLChGridRowElement;

    if (targetRow.hasChildRows) {
      this.collapsed = !this.collapsed;
    }
    eventInfo.stopPropagation();
  }

  private loadParentGrid(): HTMLChGridElement {
    this.parentGrid = this.closest("ch-grid");
    return this.parentGrid;
  }
}

if (!customElements.get("ch-grid-row")) {
  customElements.define("ch-grid-row", HTMLChGridRowElement);
}
