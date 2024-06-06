import { Component, Element, Listen } from "@stencil/core";
import { TabularGridColumnSortChangedEvent } from "../column/tabular-grid-column-types";

/**
 * The `ch-tabular-grid-columnset` component represents a group of columns.
 */
@Component({
  tag: "ch-tabular-grid-columnset",
  styleUrl: "tabular-grid-columnset.scss",
  shadow: false
})
export class ChTabularGridColumnset {
  @Element() el: HTMLChTabularGridColumnsetElement;

  @Listen("columnSortChanged")
  columnSortChangedHandler(
    eventInfo: CustomEvent<TabularGridColumnSortChangedEvent>
  ) {
    const columns: HTMLChTabularGridColumnElement[] = Array.from(
      this.el.querySelectorAll("ch-tabular-grid-column")
    );

    columns.forEach(column => {
      if (column.columnId !== eventInfo.detail.columnId) {
        column.sortDirection = null;
      }
    });
  }
}
