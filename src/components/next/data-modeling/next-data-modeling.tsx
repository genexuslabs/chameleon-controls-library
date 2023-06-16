import { Component, Host, h } from "@stencil/core";
import { Component as ChComponent } from "../../../common/interfaces";

/**
 * @slot - The first level items (entities) of the data model
 */
@Component({
  shadow: true,
  styleUrl: "next-data-modeling.scss",
  tag: "ch-next-data-modeling"
})
export class NextDataModeling implements ChComponent {
  render() {
    return (
      <Host role="list">
        <slot />
      </Host>
    );
  }
}
