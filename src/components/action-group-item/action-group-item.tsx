import { Component, h } from "@stencil/core";
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
  render() {
    return <slot />;
  }
}
