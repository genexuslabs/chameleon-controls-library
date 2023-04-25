import { IChGridCollapsible } from "../ch-grid-types";

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
    if (value === true) {
      this.setAttribute("highlighted", "");
      if (this.grid.rowHighlightedClass) {
        this.classList.add(this.grid.rowHighlightedClass);
      }
    } else {
      this.removeAttribute("highlighted");
      if (this.grid.rowHighlightedClass) {
        this.classList.remove(this.grid.rowHighlightedClass);
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
    if (value === true) {
      this.setAttribute("selected", "");
      if (this.grid.rowSelectedClass) {
        this.classList.add(this.grid.rowSelectedClass);
      }
    } else {
      this.removeAttribute("selected");
      if (this.grid.rowSelectedClass) {
        this.classList.remove(this.grid.rowSelectedClass);
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
    if (value) {
      this.setAttribute("collapsed", "");
    } else {
      this.removeAttribute("collapsed");
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
