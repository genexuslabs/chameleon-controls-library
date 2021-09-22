import { Component, Host, h } from "@stencil/core";

@Component({
  tag: "ch-comp-c",
  styleUrl: "ch-comp-c.css",
  shadow: true,
})
export class ChCompC {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
