import { Component, Host, h } from "@stencil/core";

@Component({
  tag: "component-a",
  styleUrl: "component-a.scss",
  shadow: true,
})
export class ComponentA {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
