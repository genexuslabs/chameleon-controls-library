import { Component, Element, Prop } from "@stencil/core";

/**
 * The `ch-grid-column-display` component is responsible for determining the
 * visibility of a grid column and updating its hidden property based on
 * whether the monitored class is visible or not.
 */
@Component({
  tag: "ch-grid-column-display",
  styleUrl: "ch-grid-column-display.scss",
  shadow: false
})
export class ChGridColumnDisplay {
  @Element() el: HTMLChGridColumnDisplayElement;

  /**
   * The column element that is being monitored.
   */
  @Prop() readonly column!: HTMLChGridColumnElement;

  private observer = new IntersectionObserver(() => {
    this.column.hidden = getComputedStyle(this.el).display === "none";
  });

  componentWillLoad() {
    this.observer.observe(this.el);
  }
}
