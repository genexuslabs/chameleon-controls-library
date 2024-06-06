import { Component, Element, Prop } from "@stencil/core";

/**
 * The `ch-tabular-grid-column-display` component is responsible for determining the
 * visibility of a grid column and updating its hidden property based on
 * whether the monitored class is visible or not.
 */
@Component({
  tag: "ch-tabular-grid-column-display",
  styleUrl: "tabular-grid-column-display.scss",
  shadow: false
})
export class ChTabularGridColumnDisplay {
  private observer = new IntersectionObserver(() => {
    this.column.hidden = getComputedStyle(this.el).display === "none";
  });

  @Element() el: HTMLChTabularGridColumnDisplayElement;

  /**
   * The column element that is being monitored.
   */
  @Prop() readonly column!: HTMLChTabularGridColumnElement;

  componentWillLoad() {
    this.observer.observe(this.el);
  }
}
