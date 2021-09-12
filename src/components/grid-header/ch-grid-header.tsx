import { Component, Host, h } from "@stencil/core";

@Component({
  tag: "ch-grid-header",
  styleUrl: "ch-grid-header.scss",
  shadow: true,
})
export class ChGridHeader {
  render() {
    return (
      <Host>
        <header>
          <slot></slot>
        </header>
      </Host>
    );
  }
}
