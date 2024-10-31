import { ITabularGridCollapsible } from "../tabular-grid-types";

/**
 * The `ch-tabular-grid-rowset` component represents a group of rows.
 */
export default class HTMLChTabularGridRowsetElement
  extends HTMLElement
  implements ITabularGridCollapsible
{
  private computedLevel = 0;
  private grid: HTMLChTabularGridElement;

  rowsetId: string;

  static get observedAttributes() {
    return ["rowsetid"];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener(
      "rowsetLegendClicked",
      this.rowsetLegendClickedHandler
    );
    this.defineLevel();
  }

  attributeChangedCallback(name: string, _oldValue: string, value: string) {
    if (name === "rowsetid") {
      this.rowsetId = value;
    }
  }

  /**
   * A boolean value indicates whether the grid rowset is collapsed.
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
   * Gets the zero-based depth of the rowset in the tree.
   */
  get level(): number {
    if (!this.computedLevel) {
      this.computeLevel();
    }

    return this.computedLevel;
  }

  /**
   * returns a `DOMRect` object representing the size of the grid rowset element.
   */
  public getBoundingClientRect(): DOMRect {
    let rect: DOMRect;

    const paddingTop = parseInt(this.style.getPropertyValue("padding-top"));
    const paddingbottom = parseInt(
      this.style.getPropertyValue("padding-bottom")
    );

    if (!this.firstElementChild) {
      const mainRect = this.grid.shadowRoot
        .querySelector(".main")
        .getBoundingClientRect();
      rect = new DOMRect(mainRect.x, mainRect.y, mainRect.width, 0);
    } else if (this.firstElementChild === this.lastElementChild) {
      const firstRowRect = this.firstElementChild.getBoundingClientRect();

      rect = new DOMRect(
        firstRowRect.x,
        firstRowRect.y - paddingTop,
        firstRowRect.x + firstRowRect.width,
        firstRowRect.y + firstRowRect.height + paddingTop + paddingbottom
      );
    } else {
      const firstRowRect = this.firstElementChild.getBoundingClientRect();
      const lastRowRect = this.lastElementChild.getBoundingClientRect();

      rect = new DOMRect(
        firstRowRect.x,
        firstRowRect.y - paddingTop,
        lastRowRect.x - firstRowRect.x + lastRowRect.width,
        lastRowRect.y -
          firstRowRect.y +
          lastRowRect.height +
          paddingTop +
          paddingbottom
      );
    }

    return rect;
  }

  private rowsetLegendClickedHandler(eventInfo: CustomEvent) {
    eventInfo.stopPropagation();

    this.collapsed = !this.collapsed;
  }

  private defineLevel() {
    this.style.setProperty("--level", this.level.toString());
  }

  private computeLevel() {
    this.computedLevel = this.getParentRowset()?.level ?? 0;

    if (this.hasLegend() || this.isNestedRow()) {
      this.computedLevel++;
    }
  }

  private hasLegend(): boolean {
    return this.firstElementChild?.tagName === "CH-TABULAR-GRID-ROWSET-LEGEND";
  }

  private isNestedRow(): boolean {
    return this.parentElement.tagName === "CH-TABULAR-GRID-ROW";
  }

  private getParentRowset(): HTMLChTabularGridRowsetElement | undefined {
    const node = this.parentElement.closest(
      "ch-tabular-grid-rowset, ch-tabular-grid"
    );

    if (node.tagName === "CH-TABULAR-GRID-ROWSET") {
      return node as HTMLChTabularGridRowsetElement;
    }

    return undefined;
  }
}

if (!customElements.get("ch-tabular-grid-rowset")) {
  customElements.define(
    "ch-tabular-grid-rowset",
    HTMLChTabularGridRowsetElement
  );
}
