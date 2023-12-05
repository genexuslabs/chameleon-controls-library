import { Component, Host, Prop, h } from "@stencil/core";

@Component({
  shadow: true,
  styleUrl: "flexible-layout-item.scss",
  tag: "ch-flexible-layout-item"
})
export class ChFlexibleLayoutItem {
  /**
   * `true` to add the slot attribute in the item.
   */
  @Prop() readonly addSlot: boolean = true;

  /**
   * Specifies the id of the flexible layout item.
   */
  @Prop() readonly itemId: string;

  render() {
    return (
      <Host slot={this.addSlot ? this.itemId : null}>
        <slot />
      </Host>
    );
  }
}
