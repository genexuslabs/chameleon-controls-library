export default class HTMLChGridRowElement extends HTMLElement {
  constructor() {
    super();
  }

  get rowId() {
    return this.getAttribute("rowid");
  }

  set highlighted(value: boolean) {
    const grid = this.getParentGrid();

    if (value === true) {
      this.setAttribute("highlighted", "");
      if (grid.onRowHighlightedClass) {
        this.classList.add(grid.onRowHighlightedClass);
      }
    } else {
      this.removeAttribute("highlighted");
      if (grid.onRowHighlightedClass) {
        this.classList.remove(grid.onRowHighlightedClass);
      }
    }
  }

  get highlighted(): boolean {
    return this.hasAttribute("highlighted");
  }

  set selected(value: boolean) {
    const grid = this.getParentGrid();

    if (value === true) {
      this.setAttribute("selected", "");
      if (grid.onRowSelectedClass) {
        this.classList.add(grid.onRowSelectedClass);
      }
    } else {
      this.removeAttribute("selected");
      if (grid.onRowSelectedClass) {
        this.classList.remove(grid.onRowSelectedClass);
      }
    }
  }

  get selected(): boolean {
    return this.hasAttribute("selected");
  }

  getParentGrid(): HTMLChGridElement {
    return this.assignedSlot.getRootNode({ composed: false })[
      "host"
    ] as HTMLChGridElement;
  }
}
customElements.define("ch-grid-row", HTMLChGridRowElement);
