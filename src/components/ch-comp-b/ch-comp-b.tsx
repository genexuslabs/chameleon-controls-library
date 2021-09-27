import { Component, Element, Host, h } from "@stencil/core";
import { ChCompA } from "../ch-comp-a/ch-comp-a";

@Component({
  tag: "ch-comp-b",
  styleUrl: "ch-comp-b.css",
  shadow: true,
})
export class ChCompB {
  @Element() el: HTMLChCompBElement;
  componentA: ChCompA;

  componentWillLoad() {
    this.componentA = this.el.assignedSlot["data-componentA"];
  }

  render() {
    return (
      <Host>
        <slot data-componentA={this.componentA}></slot>
      </Host>
    );
  }
}
