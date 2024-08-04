import { Component, Element } from "@stencil/core";

@Component({
  styleUrl: "smart-grid-cell.scss",
  tag: "ch-smart-grid-cell"
})
export class ChSmartGridCell {
  @Element() el: HTMLChSmartGridCellElement;

  connectedCallback() {
    this.el.setAttribute("role", "gridcell");
  }
}
