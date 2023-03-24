import { Component, Element, Host, Listen, h } from "@stencil/core";
import { ChGridColumnSortChangedEvent } from "../grid-column/ch-grid-column-types";

@Component({
  tag: "ch-grid-columnset",
  styleUrl: "ch-grid-columnset.scss",
  shadow: false
})
export class ChGridColumnset {
  @Element() el: HTMLChGridColumnsetElement;
  private columns: HTMLChGridColumnElement[];

  componentDidLoad() {
    this.columns = Array.from(this.el.querySelectorAll("ch-grid-column"));
  }

  @Listen("columnResizeStarted")
  columnResizeStartedHandler() {
    this.columns.forEach(column => (column.resizing = true));
  }

  @Listen("columnResizeFinished")
  columnResizeFinishedHandler() {
    this.columns.forEach(column => (column.resizing = false));
  }

  @Listen("columnSortChanged")
  columnSortChangedHandler(
    eventInfo: CustomEvent<ChGridColumnSortChangedEvent>
  ) {
    this.columns.forEach(column => {
      if (column.columnId != eventInfo.detail.columnId) {
        column.sortDirection = null;
      }
    });
  }

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
