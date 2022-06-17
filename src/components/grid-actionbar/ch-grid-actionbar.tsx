import { Component, Element } from "@stencil/core";

@Component({
  tag: "ch-grid-actionbar",
  styleUrl: "ch-grid-actionbar.scss",
  shadow: false,
})
export class ChGridActionbar {
  @Element() el: HTMLChGridActionbarElement;
}
