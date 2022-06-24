import { Component, h, Host, Element } from "@stencil/core";

@Component({
  tag: "ch-grid-menu",
  styleUrl: "ch-grid-menu.scss",
  shadow: false,
})
export class ChGridMenu {
  @Element() el: HTMLChGridMenuElement;

  render() {
    return <Host></Host>;
  }
}
