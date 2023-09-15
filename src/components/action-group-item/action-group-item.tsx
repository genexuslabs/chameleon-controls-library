import { Component, h, Prop } from "@stencil/core";
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
  /**
   * `true` if the control is floating. Useful to implement the
   * `"ResponsiveCollapse"` value for the `itemsOverflowBehavior` property of
   * the ch-action-group control.
   */
  @Prop({ reflect: true }) readonly floating: boolean = false;

  render() {
    return <slot />;
  }
}
