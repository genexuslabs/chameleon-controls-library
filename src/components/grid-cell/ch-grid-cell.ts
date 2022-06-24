import HTMLChGridRowElement from "../grid-row/ch-grid-row";

export default class HTMLChGridCellElement extends HTMLElement {
  constructor() {
    super();
  }

  get rowId() {
    const row = this.parentElement as HTMLChGridRowElement;
    return row.rowId;
  }

  get cellId() {
    return this.getAttribute("cellid");
  }

  set selected(value: boolean) {
    if (value === true) {
      this.setAttribute("selected", "");
    } else {
      this.removeAttribute("selected");
    }
  }

  get selected(): boolean {
    return this.hasAttribute("selected");
  }
}
customElements.define("ch-grid-cell", HTMLChGridCellElement);
