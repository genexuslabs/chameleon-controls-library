import { Component, Host, Prop, Watch, h } from "@stencil/core";
import {
  TabularGridCellModel,
  TabularGridColumnModel,
  TabularGridModel,
  TabularGridRowModel,
  TabularGridRowsetLegendModel,
  TabularGridRowsetModel
} from "./types";
import { ThemeModel } from "../theme/theme-types";

const ARIA_SORT_MAP = {
  undefined: "none",
  asc: "ascending",
  desc: "descending"
} as const;

@Component({
  tag: "ch-tabular-grid-render",
  styleUrl: "tabular-grid-render.scss",
  shadow: true
})
export class ChTabularGridRender {
  #modelVersion = 0;

  /**
   * Determines if the columns can be hidden by the user
   */
  @Prop() readonly columnHideable: boolean = true;

  /**
   *  Determines if the columns can be resized by the user.
   */
  @Prop() readonly columnResizable: boolean = true;

  /**
   * Determines if the columns can be sorted by the user.
   */
  @Prop() readonly columnSortable: boolean = true;

  /**
   * Specifies the content of the tabular grid control.
   */
  @Prop() readonly model: TabularGridModel;
  @Watch("model")
  modelChanged() {
    this.#modelVersion++;
  }

  /**
   * Determines if the columns can be hidden by the user
   */
  @Prop() readonly theme: string;

  #renderGrid = (
    columns: TabularGridColumnModel[],
    rowsets: TabularGridRowsetModel[]
  ) => (
    <ch-tabular-grid key={this.#modelVersion} class="tabular-grid">
      {this.#renderColumns(columns)}
      {this.#renderRowsets(rowsets)}
    </ch-tabular-grid>
  );

  #renderColumns = (columns: TabularGridColumnModel[]) => (
    <ch-tabular-grid-columnset class="tabular-grid-column-set">
      {columns.map(this.#renderColumn)}
    </ch-tabular-grid-columnset>
  );

  #renderColumn = (column: TabularGridColumnModel) => (
    <ch-tabular-grid-column
      role="columnheader"
      aria-label={column.accessibleName}
      aria-sort={ARIA_SORT_MAP[column.sortDirection]}
      class="tabular-grid-column"
      columnId={column.id}
      columnName={column.caption}
      columnNameHidden={column.captionHidden}
      columnTooltip={column.tooltip}
      order={column.order}
      size={column.size}
      resizable={column.resizable ?? this.columnResizable}
      sortable={column.sortable ?? this.columnSortable}
      sortDirection={column.sortDirection}
      hidden={column.hidden}
      hideable={column.hideable ?? this.columnHideable}
      freeze={column.freeze}
      settingable={false}
    ></ch-tabular-grid-column>
  );

  #renderRowsets = (rowsets: TabularGridRowsetModel[]) =>
    rowsets.map(rowset =>
      this.#renderRowset(rowset.rows, rowset.legend, rowset.rowsets)
    );

  #renderRowset = (
    rows: TabularGridRowModel[],
    legend?: TabularGridRowsetLegendModel,
    rowsets?: TabularGridRowsetModel[]
  ) => (
    <ch-tabular-grid-rowset role="rowgroup" class="tabular-grid-rowset">
      {legend && this.#renderRowsetLegend(legend)}
      {rows.map(this.#renderRow)}
      {rowsets && this.#renderRowsets(rowsets)}
    </ch-tabular-grid-rowset>
  );

  #renderRowsetLegend = (legend: TabularGridRowsetLegendModel) => (
    <ch-tabular-grid-rowset-legend
      aria-label={legend.accessibleName}
      class="tabular-grid-rowset-legend"
    >
      {legend.caption}
    </ch-tabular-grid-rowset-legend>
  );

  #renderRow = (row: TabularGridRowModel) => (
    <ch-tabular-grid-row role="row" class="tabular-grid-row">
      {row.cells.map(this.#renderCell)}
      {row.rows && this.#renderRowset(row.rows)}
    </ch-tabular-grid-row>
  );

  #renderCell = (cell: TabularGridCellModel, index: number) => (
    <ch-tabular-grid-cell
      role="gridcell"
      aria-colindex={++index}
      class="tabular-grid-cell"
    >
      {cell.text}
    </ch-tabular-grid-cell>
  );

  render() {
    return (
      <Host role="grid">
        {this.theme && <ch-theme model={{ name: this.theme }}></ch-theme>}
        {this.model && this.#renderGrid(this.model.columns, this.model.rowsets)}
      </Host>
    );
  }
}