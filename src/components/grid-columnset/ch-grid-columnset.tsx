import { Component, Element, Host, Listen, h } from "@stencil/core";

@Component({
  tag: "ch-grid-columnset",
  styleUrl: "ch-grid-columnset.scss",
  shadow: false,
})
export class ChGridColumnset {
  @Element() el: HTMLChGridColumnsetElement;
  columns: HTMLChGridColumnElement[];

  componentDidLoad() {
    this.columns = Array.from(this.el.querySelectorAll("ch-grid-column"));
  }

  @Listen("columnResizeStarted")
  columnResizeStartedHandler() {
    this.columns.forEach((column) => (column.resizing = true));
  }

  @Listen("columnResizeFinished")
  columnResizeFinishedHandler() {
    this.columns.forEach((column) => (column.resizing = false));
  }

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
