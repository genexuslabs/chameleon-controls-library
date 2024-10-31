import { Component, Element, h, Host, Listen, Prop } from "@stencil/core";
import { TabularGridColumnSortChangedEvent } from "../column/tabular-grid-column-types";
import { TABULAR_GRID_PARTS_DICTIONARY } from "../../../common/reserved-names";
import { tokenMap } from "../../../common/utils";

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

  /**
   * A boolean or string that controls the parts applied to the column.
   * - When `true`, it automatically applies the part names "column" and the column's unique ID.
   * - When a string is provided, it appends that string to the default part names "column" and the column's ID.
   */
  @Prop() readonly parts: boolean | string;

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

  render() {
    return (
      <Host
        part={
          this.parts
            ? tokenMap({
                [TABULAR_GRID_PARTS_DICTIONARY.COLUMNSET]: true,
                [this.parts.toString()]: typeof this.parts === "string"
              })
            : null
        }
      ></Host>
    );
  }
}
