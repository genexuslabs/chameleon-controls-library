import { Component, Host, Prop, Watch, h } from "@stencil/core";
import {
  TabularGridCellItemModel,
  TabularGridColumnItemModel,
  TabularGridColumnsModel,
  TabularGridModel,
  TabularGridRowItemModel,
  TabularGridRowsetItemGroupModel,
  TabularGridRowsetItemSimpleModel,
  TabularGridRowsetsGroupModel,
  TabularGridRowsetsModel,
  TabularGridRowsModel
} from "./types";

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
   * TODO: Remove this property
   */
  @Prop() readonly theme: string;

  #isRowsetItemSimpleModel = (
    rowset: any
  ): rowset is TabularGridRowsetItemSimpleModel => {
    return rowset && !("id" in rowset);
  };

  #isRowsetItemGroupModel = (
    rowset: any
  ): rowset is TabularGridRowsetItemGroupModel => {
    return rowset && "id" in rowset;
  };

  #renderGrid = (
    columns: TabularGridColumnsModel,
    rowsets: TabularGridRowsetsModel
  ) => (
    <ch-tabular-grid key={this.#modelVersion} class="tabular-grid">
      {this.#renderColumns(columns)}
      {this.#renderRowsets(rowsets)}
    </ch-tabular-grid>
  );

  #renderColumns = (columns: TabularGridColumnsModel) => (
    <ch-tabular-grid-columnset class="tabular-grid-column-set">
      {columns.map(this.#renderColumn)}
    </ch-tabular-grid-columnset>
  );

  #renderColumn = (column: TabularGridColumnItemModel) => (
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

  #renderRowsets = (rowsets: TabularGridRowsetsModel) => {
    const normalizedModel = Array.isArray(rowsets) ? rowsets : [rowsets];

    return normalizedModel.map(rowset => {
      if (this.#isRowsetItemSimpleModel(rowset)) {
        return this.#renderRowsetSimple(rowset.rows, rowset.rowsets);
      } else if (this.#isRowsetItemGroupModel(rowset)) {
        return this.#renderRowsetGroup(rowset);
      }
    });
  };

  #renderRowsetSimple = (
    rows: TabularGridRowsModel,
    rowsets?: TabularGridRowsetsGroupModel
  ) => (
    <ch-tabular-grid-rowset role="rowgroup" class="tabular-grid-rowset">
      {rows.map(this.#renderRow)}
      {rowsets && rowsets.map(this.#renderRowsetGroup)}
    </ch-tabular-grid-rowset>
  );

  #renderRowsetGroup = (rowset: TabularGridRowsetItemGroupModel) => (
    <ch-tabular-grid-rowset
      rowsetId={rowset.id}
      role="rowgroup"
      class="tabular-grid-rowset"
    >
      <ch-tabular-grid-rowset-legend
        aria-label={rowset.accessibleName}
        class="tabular-grid-rowset-legend"
      >
        {rowset.caption}
      </ch-tabular-grid-rowset-legend>

      {rowset.rows.map(this.#renderRow)}
      {rowset.rowsets && rowset.rowsets.map(this.#renderRowsetGroup)}
    </ch-tabular-grid-rowset>
  );

  #renderRow = (row: TabularGridRowItemModel) => (
    <ch-tabular-grid-row rowid={row.id} role="row" class="tabular-grid-row">
      {row.cells.map(this.#renderCell)}
      {row.rows && this.#renderRowsetSimple(row.rows)}
    </ch-tabular-grid-row>
  );

  #renderCell = (cell: TabularGridCellItemModel, index: number) => {
    return (
      <ch-tabular-grid-cell
        cellid={cell.id}
        role="gridcell"
        aria-colindex={++index}
        class="tabular-grid-cell"
      >
        {cell.text}
      </ch-tabular-grid-cell>
    );
  };

  render() {
    return (
      <Host role="grid">
        {this.theme && <ch-theme model={{ name: this.theme }}></ch-theme>}
        {this.model && this.#renderGrid(this.model.columns, this.model.rowsets)}
      </Host>
    );
  }
}
