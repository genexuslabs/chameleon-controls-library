import { Component, Host, h } from "@stencil/core";

@Component({
  tag: "ch-grid-columnset",
  styleUrl: "ch-grid-columnset.scss",
  shadow: true,
})
export class ChGridColumnset {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
