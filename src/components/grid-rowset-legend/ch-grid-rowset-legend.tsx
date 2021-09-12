import { Component, Host, h } from "@stencil/core";

@Component({
  tag: "ch-grid-rowset-legend",
  styleUrl: "ch-grid-rowset-legend.scss",
  shadow: true,
})
export class ChGridRowsetLegend {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
