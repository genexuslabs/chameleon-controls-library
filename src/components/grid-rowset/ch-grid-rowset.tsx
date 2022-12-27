import HTMLChGridRowElement from "../grid-row/ch-grid-row";
import { ChGridRowsetLegend } from "../grid-rowset-legend/ch-grid-rowset-legend";
import { IChGridCollapsible } from "../grid/types";

export default class HTMLChGridRowsetElement
  extends HTMLElement
  implements IChGridCollapsible
{
  static TAG_NAME = "CH-GRID-ROWSET";
  private computedLevel = 0;

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
    return this.firstElementChild.tagName == ChGridRowsetLegend.TAG_NAME;
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
