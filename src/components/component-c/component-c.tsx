import { Component, Host, h } from "@stencil/core";

@Component({
  tag: "component-c",
  styleUrl: "component-c.scss",
  shadow: true,
})
export class ComponentC {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
