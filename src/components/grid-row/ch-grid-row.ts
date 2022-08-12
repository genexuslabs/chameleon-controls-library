export default class HTMLChGridRowElement extends HTMLElement {
  grid: HTMLChGridElement;

  constructor() {
    super();
    this.grid = this.closest('ch-grid');
  }

  get rowId() {
    return this.getAttribute("rowid");
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
}
customElements.define("ch-grid-row", HTMLChGridRowElement);
