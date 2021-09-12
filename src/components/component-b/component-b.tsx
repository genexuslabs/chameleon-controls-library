import { Component, Host, h } from "@stencil/core";

@Component({
  tag: "component-b",
  styleUrl: "component-b.scss",
  shadow: false,
})
export class ComponentB {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
