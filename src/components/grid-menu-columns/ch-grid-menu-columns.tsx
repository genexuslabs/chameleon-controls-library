import { Component, h, Host, Element } from "@stencil/core";

@Component({
  tag: "ch-grid-menu-columns",
  styleUrl: "ch-grid-menu-columns.scss",
  shadow: false,
})
export class ChGridMenuColumns {
  @Element() el: HTMLChGridMenuColumnsElement;

  render() {
    return <Host></Host>;
  }
}
