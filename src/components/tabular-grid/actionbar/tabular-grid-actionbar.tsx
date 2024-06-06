import { Component, Element } from "@stencil/core";

/**
 * The `ch-tabular-grid-actionbar` component represents a container for a grid actions.
 */
@Component({
  tag: "ch-tabular-grid-actionbar",
  styleUrl: "tabular-grid-actionbar.scss",
  shadow: false
})
export class ChTabularGridActionbar {
  @Element() el: HTMLChTabularGridActionbarElement;
}
