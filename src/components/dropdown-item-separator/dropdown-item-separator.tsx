import { Component, Host, h } from "@stencil/core";
import { Component as ChComponent } from "../../common/interfaces";

@Component({
  shadow: true,
  styleUrl: "dropdown-item-separator.scss",
  tag: "ch-dropdown-item-separator"
})
export class ChDropDownItemSeparator implements ChComponent {
  render() {
    return <Host role="separator"></Host>;
  }
}
