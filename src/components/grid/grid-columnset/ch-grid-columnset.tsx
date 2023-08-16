import { Component, Element, Listen } from "@stencil/core";
import { ChGridColumnSortChangedEvent } from "../grid-column/ch-grid-column-types";

/**
 * The `ch-grid-columnset` component represents a group of columns.
 */
@Component({
  tag: "ch-grid-columnset",
  styleUrl: "ch-grid-columnset.scss",
  shadow: false
})
export class ChGridColumnset {
  @Element() el: HTMLChGridColumnsetElement;

  @Listen("columnSortChanged")
  columnSortChangedHandler(
    eventInfo: CustomEvent<ChGridColumnSortChangedEvent>
  ) {
    const columns: HTMLChGridColumnElement[] = Array.from(
      this.el.querySelectorAll("ch-grid-column")
    );

    columns.forEach(column => {
      if (column.columnId !== eventInfo.detail.columnId) {
        column.sortDirection = null;
      }
    });
  }
}
