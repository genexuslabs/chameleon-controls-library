import { Component, Host, h } from "@stencil/core";

@Component({
  tag: "ch-grid-row",
  styleUrl: "ch-grid-row.scss",
  shadow: false,
})
export class ChGridRow {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
