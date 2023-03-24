import { Component, Element, Prop } from "@stencil/core";

@Component({
  tag: "ch-grid-column-display",
  styleUrl: "ch-grid-column-display.scss",
  shadow: false
})
export class ChGridColumnDisplay {
  @Element() el: HTMLChGridColumnDisplayElement;
  @Prop() readonly column!: HTMLChGridColumnElement;

  private observer = new IntersectionObserver(() => {
    this.column.hidden = getComputedStyle(this.el).display === "none";
  });

  componentWillLoad() {
    this.observer.observe(this.el);
  }
}
