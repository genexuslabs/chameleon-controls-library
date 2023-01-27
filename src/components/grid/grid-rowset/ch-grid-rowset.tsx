import HTMLChGridRowElement from "../grid-row/ch-grid-row";
import { ChGridRowsetLegend } from "./grid-rowset-legend/ch-grid-rowset-legend";
import { IChGridCollapsible } from "../ch-grid-types";

export default class HTMLChGridRowsetElement
  extends HTMLElement
  implements IChGridCollapsible
{
  private computedLevel = 0;
  private grid: HTMLChGridElement;
  
  public static readonly TAG_NAME = "CH-GRID-ROWSET";

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

  getBoundingClientRect(): DOMRect {
    let rect: DOMRect;

    const paddingTop = parseInt(this.style.getPropertyValue("padding-top"));
    const paddingbottom = parseInt(this.style.getPropertyValue("padding-bottom"));

    if (!this.firstElementChild) {
      const mainRect = this.grid.shadowRoot.querySelector(".main").getBoundingClientRect();
      rect = new DOMRect(mainRect.x, mainRect.y, mainRect.width, 0);
    } else if (this.firstElementChild == this.lastElementChild) {
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
        lastRowRect.y - firstRowRect.y + lastRowRect.height + paddingTop + paddingbottom
      );
    }

    return rect;
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

  get level(): number {
    if (!this.computedLevel) {
      this.computeLevel();
    }

    return this.computedLevel;
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
    return this.firstElementChild?.tagName == ChGridRowsetLegend.TAG_NAME;
  }

  private isNestedRow(): boolean {
    return this.parentElement.tagName == HTMLChGridRowElement.TAG_NAME;
  }

  private getParentRowset(): HTMLChGridRowsetElement {
    const node = this.parentElement.closest("ch-grid-rowset, ch-grid");

    if (node.tagName == HTMLChGridRowsetElement.TAG_NAME) {
      return node as HTMLChGridRowsetElement;
    }
  }
}

if (!customElements.get("ch-grid-rowset")) {
  customElements.define("ch-grid-rowset", HTMLChGridRowsetElement);
}
