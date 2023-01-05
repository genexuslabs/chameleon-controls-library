import { IChGridCollapsible } from "../ch-grid-types";

export default class HTMLChGridRowElement
  extends HTMLElement
  implements IChGridCollapsible
{
  static TAG_NAME = "CH-GRID-ROW";
  private parentGrid: HTMLChGridElement;

  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener("cellCaretClicked", this.cellCaretClickedHandler);
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
      if (this.grid.onRowHighlightedClass) {
        this.classList.add(this.grid.onRowHighlightedClass);
      }
    } else {
      this.removeAttribute("highlighted");
      if (this.grid.onRowHighlightedClass) {
        this.classList.remove(this.grid.onRowHighlightedClass);
      }
    }
  }

  get highlighted(): boolean {
    return this.hasAttribute("highlighted");
  }

  set selected(value: boolean) {
    if (value === true) {
      this.setAttribute("selected", "");
      if (this.grid.onRowSelectedClass) {
        this.classList.add(this.grid.onRowSelectedClass);
      }
    } else {
      this.removeAttribute("selected");
      if (this.grid.onRowSelectedClass) {
        this.classList.remove(this.grid.onRowSelectedClass);
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

  public ensureVisible() {}

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
