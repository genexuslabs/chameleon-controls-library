import { Component, Element, Prop } from "@stencil/core";

@Component({
  styleUrl: "smart-grid-cell.scss",
  tag: "ch-smart-grid-cell"
})
export class ChSmartGridCell {
  @Element() el: HTMLChSmartGridCellElement;

  /**
   * This attribute lets you specify the index of the cell. Useful when inverse
   * loading is enabled on the smart grid.
   */
  @Prop() readonly index: number | undefined;

  connectedCallback() {
    this.el.setAttribute("role", "gridcell");

    // Not null when inverse loading is enabled
    if (this.index === undefined) {
      return;
    }
    const cellIndex = this.index;

    // Set index when Item Layout Mode = Single
    this.el.style.setProperty("--ch-smart-cell-index", `-${cellIndex + 1}`);
  }
}
