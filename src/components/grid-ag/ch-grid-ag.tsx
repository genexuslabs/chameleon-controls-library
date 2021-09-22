import { Component, Host, h } from "@stencil/core";

@Component({
  tag: "ch-grid-ag",
  styleUrl: "ch-grid-ag.scss",
  shadow: true,
})
export class ChGridAg {
  //Ag stands for "Action group"

  render() {
    return (
      <Host hidden="hidden">
        <slot></slot>
      </Host>
    );
  }
}
