import { Component, Host, h } from "@stencil/core";

@Component({
  tag: "ch-grid-rowset",
  styleUrl: "ch-grid-rowset.scss",
  shadow: true,
})
export class ChGridRowset {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
