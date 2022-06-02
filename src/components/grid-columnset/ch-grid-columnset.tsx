import { Component, Element, Host, h } from "@stencil/core";

@Component({
  tag: "ch-grid-columnset",
  styleUrl: "ch-grid-columnset.scss",
  shadow: false,
})
export class ChGridColumnset {
  @Element() el: HTMLChGridColumnsetElement;

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
