import { Component, Element } from "@stencil/core";

/**
 * The `ch-grid-actionbar` component represents a container for a grid actions.
 */
@Component({
  tag: "ch-grid-actionbar",
  styleUrl: "ch-grid-actionbar.scss",
  shadow: false
})
export class ChGridActionbar {
  @Element() el: HTMLChGridActionbarElement;
}
