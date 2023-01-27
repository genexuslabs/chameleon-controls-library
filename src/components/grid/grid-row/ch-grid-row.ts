import { IChGridCollapsible } from "../ch-grid-types";

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

  getBoundingClientRect(): DOMRect {
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

  get grid(): HTMLChGridElement {
    return this.parentGrid ?? this.loadParentGrid();
  }

  get rowId(): string {
    return this.getAttribute("rowid") ?? "";
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

  get highlighted(): boolean {
    return this.hasAttribute("highlighted");
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

  get selected(): boolean {
    return this.hasAttribute("selected");
  }

  get hasChildRows(): boolean {
    return this.querySelector("ch-grid-rowset") ? true : false;
  }

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

  public ensureVisible() {
    this.dispatchEvent(
      new CustomEvent("rowEnsureVisible", { bubbles: true, composed: true })
    );
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
