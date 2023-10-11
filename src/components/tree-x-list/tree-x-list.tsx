import { Component, Element, Host, h } from "@stencil/core";

@Component({
  tag: "ch-tree-x-list",
  styleUrl: "tree-x-list.scss",
  shadow: true
})
export class ChTreeListX {
  @Element() el: HTMLChTreeXListElement;

  render() {
    return (
      <Host role="group">
        <slot />
      </Host>
    );
  }
}
