import { Component, Element } from "@stencil/core";

/**
 * The `ch-grid-actionbar` component represents a container for a grid actions.
 * @deprecated Use `ch-tabular-grid` component instead. Use `ch-tabular-grid-actionbar` instead.
 */
@Component({
  tag: "ch-grid-actionbar",
  styleUrl: "ch-grid-actionbar.scss",
  shadow: false
})
export class ChGridActionbar {
  @Element() el: HTMLChGridActionbarElement;
}
