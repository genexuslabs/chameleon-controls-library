import { Component, Element, Host, Prop, h } from "@stencil/core";

@Component({
  tag: "ch-tree-x-list",
  styleUrl: "tree-x-list.scss",
  shadow: true
})
export class ChTreeListX {
  @Element() el: HTMLChTreeXListElement;

  /**
   * Level in the tree at which the control is placed.
   */
  @Prop() readonly level: number = 0;

  render() {
    return (
      <Host role={this.level === 0 ? "tree" : "group"}>
        <slot />
      </Host>
    );
  }
}
