import { Component, Host, h } from "@stencil/core";

@Component({
  tag: "ch-grid-row",
  styleUrl: "ch-grid-row.scss",
  shadow: true,
})
export class ChGridRow {
  render() {
    return (
      <Host class="ch-grid-row">
        <slot></slot>
      </Host>
    );
  }
}
