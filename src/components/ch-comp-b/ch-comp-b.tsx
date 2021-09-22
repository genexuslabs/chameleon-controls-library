import { Component, Host, h } from "@stencil/core";

@Component({
  tag: "ch-comp-b",
  styleUrl: "ch-comp-b.css",
  shadow: true,
})
export class ChCompB {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
