import { Component, Element, h, Prop } from "@stencil/core";
import { Component as ChComponent } from "../../common/interfaces";

/**
 * @slot - The slot where the ch-dropdown-item is placed.
 */
@Component({
  tag: "ch-action-group-item",
  styleUrl: "action-group-item.scss",
  shadow: false
})
export class ChActionGroupItem implements ChComponent {
  @Element() el: HTMLChActionGroupItemElement;

  /**
   * `true` to ignore the floating property value.
   */
  @Prop() readonly avoidFloating: boolean = false;

  /**
   * `true` if the control is floating. Useful to implement the
   * `"ResponsiveCollapse"` value for the `itemsOverflowBehavior` property of
   * the ch-action-group control.
   */
  @Prop({ reflect: true, mutable: true }) floating = false;

  componentWillLoad() {
    if (this.avoidFloating) {
      return;
    }

    const parentAction = this.el.closest("ch-action-group");

    // Hide items at the start to improve CLS
    if (parentAction) {
      this.floating =
        parentAction.itemsOverflowBehavior === "ResponsiveCollapse";
    }
  }

  render() {
    return <slot />;
  }
}
