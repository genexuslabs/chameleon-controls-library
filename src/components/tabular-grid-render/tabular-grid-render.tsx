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

const THEME: ThemeModel = {
  name: "grid",
  url: "https://unpkg.com/@genexus/mercury@0.8.9/dist/bundles/css/components/tabular-grid.css"
};

@Component({
  tag: "ch-tabular-grid-render",
  styleUrl: "tabular-grid-render.scss",
  shadow: true
})
export class ChTabularGridRender {
  #modelVersion = 0;

  /**
   * Specifies the content of the tabular grid control.
   */
  @Prop() readonly model: TabularGridModel;
  @Watch("model")
  modelChanged() {
    this.#modelVersion++;
  }

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
      class="tabular-grid-column"
      columnName={column.caption}
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
    <ch-tabular-grid-rowset class="tabular-grid-rowset">
      {legend && this.#renderRowsetLegend(legend)}
      {rows.map(this.#renderRow)}
      {rowsets && this.#renderRowsets(rowsets)}
    </ch-tabular-grid-rowset>
  );

  #renderRowsetLegend = (legend: TabularGridRowsetLegendModel) => (
    <ch-tabular-grid-rowset-legend class="tabular-grid-rowset-legend">
      {legend.caption}
    </ch-tabular-grid-rowset-legend>
  );

  #renderRow = (row: TabularGridRowModel) => (
    <ch-tabular-grid-row class="tabular-grid-row">
      {row.cells.map(this.#renderCell)}
      {row.rows && this.#renderRowset(row.rows)}
    </ch-tabular-grid-row>
  );

  #renderCell = (cell: TabularGridCellModel) => (
    <ch-tabular-grid-cell class="tabular-grid-cell">
      {cell.text}
    </ch-tabular-grid-cell>
  );

  render() {
    return (
      <Host>
        <ch-theme model={THEME}></ch-theme>
        {this.model && this.#renderGrid(this.model.columns, this.model.rowsets)}
      </Host>
    );
  }
}
