import { Component, Host, h } from "@stencil/core";

@Component({
  tag: "ch-grid-cell",
  styleUrl: "ch-grid-cell.scss",
  shadow: true,
})
export class ChGridCell {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
