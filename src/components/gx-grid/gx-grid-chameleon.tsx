import {
  ChGridCellClickedEvent,
  ChGridSelectionChangedEvent,
} from "../grid/types";
import {
  ChPaginatorButtonType,
  ChPaginatorNavigationButtonClieckedEvent,
} from "../paginator/types";
import { Component, Host, Listen, Prop, h } from "@stencil/core";
import {
  paginationGoToFirstPage,
  paginationGoToLastPage,
  paginationGoToNextPage,
  paginationGoToPreviousPage,
} from "./gx-grid-chameleon-paginator";

declare var gx: any;

@Component({
  shadow: false,
  styleUrl: "gx-grid-chameleon.scss",
  tag: "gx-grid-chameleon",
})
export class GridChameleon {
  constructor() {}

  @Prop() readonly grid: GxGrid;
  @Prop() gridTimestamp: number;

  @Listen("selectionChanged")
  selectionChangedHandler(eventInfo: CustomEvent<ChGridSelectionChangedEvent>) {
    const row = this.grid.getRowByGxId(eventInfo.detail.rowsId[0]);

    if (row) {
      this.grid.execC2VFunctions();
      this.grid.selectRow(row.id);
    }
  }

  @Listen("cellClicked")
  cellClickedHandler(eventInfo: CustomEvent<ChGridCellClickedEvent>) {
    const row = this.grid.getRowByGxId(eventInfo.detail.rowId);
    const cellIndex = parseInt(eventInfo.detail.cellId);

    if (row) {
      this.grid.executeEvent(cellIndex, row.id);
    }
  }

  @Listen("navigationButtonClicked")
  navigationButtonClickedHandler(
    eventInfo: CustomEvent<ChPaginatorNavigationButtonClieckedEvent>
  ) {
    switch (eventInfo.detail.buttonType) {
      case ChPaginatorButtonType.FIRST:
        paginationGoToFirstPage(this.grid);
        break;
      case ChPaginatorButtonType.PREVIOUS:
        paginationGoToPreviousPage(this.grid);
        break;
      case ChPaginatorButtonType.NEXT:
        paginationGoToNextPage(this.grid);
        break;
      case ChPaginatorButtonType.LAST:
        paginationGoToLastPage(this.grid);
        break;
    }
  }

  render() {
    console.log(this.grid);

    return (
      <Host>
        <ch-grid
          class={this.grid.Class}
          rowSelectionMode={this.grid.gxAllowSelection ? "single" : "none"}
          onRowSelectedClass={this.grid.RowSelectedClass.trim()}
          onRowHighlightedClass={this.grid.RowHighlightedClass.trim()}
        >
          {this.grid.header && this.renderHeader()}
          {this.renderColumns()}
          {this.renderRows()}
          {this.grid.pageSize > 0 && this.renderPaginator()}
        </ch-grid>
      </Host>
    );
  }

  renderHeader() {
    return <h1 slot="header">{this.grid.header}</h1>;
  }

  renderColumns() {
    return (
      <ch-grid-columnset class={this.grid.ColumnsetClass}>
        {this.grid.columns.map((column) => {
          if (gx.lang.gxBoolean(column.visible)) {
            return (
              <ch-grid-column
                class={`${this.grid.ColumnClass} ${column.gxColumnClass}`}
              >
                <span>{column.title}</span>
              </ch-grid-column>
            );
          }
        })}
      </ch-grid-columnset>
    );
  }

  renderRows() {
    return this.grid.rows.map((row, i) => {
      const rowEvenClasses = `${this.grid.RowClass} ${this.grid.RowEvenClass}`;
      const rowOddClasses = `${this.grid.RowClass} ${this.grid.RowOddClass}`;

      return (
        <ch-grid-row
          rowid={row.gxId}
          class={i % 2 === 0 ? rowEvenClasses : rowOddClasses}
        >
          {this.renderCells(row)}
        </ch-grid-row>
      );
    });
  }

  renderCells(row: GxGridRow) {
    return row.gxProps.map((cellControlProperties, i) => {
      const column = this.grid.columns[i];

      if (gx.lang.gxBoolean(column.visible)) {
        return (
          <ch-grid-cell
            class={`${this.grid.CellClass} ${column.gxColumnClass}`}
            cellid={i}
            innerHTML={this.renderControl(
              column.gxControl,
              cellControlProperties
            )}
          ></ch-grid-cell>
        );
      }
    });
  }

  renderControl(control: GxControl, props: any): string {
    control.setProperties.apply(control, props);
    return control.getHtml();
  }

  renderPaginator() {
    return <ch-paginator slot="footer"></ch-paginator>;
  }
}

export interface GxGrid {
  readonly columns: GxGridColumn[];
  readonly rows: GxGridRow[];
  readonly usePaging: boolean;
  readonly pageSize: number;
  readonly properties: any;
  readonly ParentObject: any;
  readonly header: string;
  readonly Class: string;
  readonly gxAllowSelection: boolean;
  readonly gxAllowHovering: boolean;
  getRowByGxId(gxId: string): GxGridRow;
  selectRow(index: number): void;
  execC2VFunctions(): void;
  executeEvent(columnIndex: number, rowIndex: number): void;
  changeGridPage(direction: string, force?: boolean): any;

  // UC
  readonly ColumnsetClass: string;
  readonly ColumnClass: string;
  readonly RowClass: string;
  readonly RowEvenClass: string;
  readonly RowOddClass: string;
  readonly RowSelectedClass: string;
  readonly RowHighlightedClass: string;
  readonly CellClass: string;

  OnPaginationFirst(): void;
  OnPaginationPrevious(): void;
  OnPaginationNext(): void;
  OnPaginationLast(): void;
}

export interface GxGridColumn {
  readonly title: string;
  readonly visible: boolean;
  readonly gxColumnClass: string;
  readonly gxControl: GxControl;
}

export interface GxGridRow {
  readonly id: number;
  readonly gxId: string;
  readonly values: string[];
  readonly gxProps: any[];
}

export interface GxControl {
  setProperties(): void;
  getHtml(): string;
}
