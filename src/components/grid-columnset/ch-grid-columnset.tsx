import { Component, Host, h, Element } from "@stencil/core";
import { ChGrid } from "../grid/ch-grid";

@Component({
  tag: "ch-grid-columnset",
  styleUrl: "ch-grid-columnset.scss",
  shadow: true,
})
export class ChGridColumnset {
  @Element() el: HTMLChGridColumnsetElement;
  chGrid: ChGrid;

  componentWillLoad() {
    this.chGrid = this.el.assignedSlot["data-chGrid"];
  }

  render() {
    return (
      <Host>
        <slot data-chGrid={this.chGrid}></slot>
      </Host>
    );
  }
}
