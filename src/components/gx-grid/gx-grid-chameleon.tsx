import {
  ChGridCellClickedEvent,
  ChGridSelectionChangedEvent,
} from "../grid/types";
import { Component, Host, Listen, Prop, h } from "@stencil/core";
import {
  paginationGoToFirstPage,
  paginationGoToLastPage,
  paginationGoToNextPage,
  paginationGoToPreviousPage,
} from "./gx-grid-chameleon-paginator";
import {
  ChPaginatorNavigationClickedEvent,
  ChPaginatorNavigationType,
} from "../paginator-navigate/ch-paginator-navigate-types";
import { gridRefresh } from "./gx-grid-chameleon-actions";

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

  @Listen("navigationClicked")
  navigationClickedHandler(
    eventInfo: CustomEvent<ChPaginatorNavigationClickedEvent>
  ) {
    switch (eventInfo.detail.navigationType) {
      case ChPaginatorNavigationType.FIRST:
        paginationGoToFirstPage(this.grid);
        break;
      case ChPaginatorNavigationType.PREVIOUS:
        paginationGoToPreviousPage(this.grid);
        break;
      case ChPaginatorNavigationType.NEXT:
        paginationGoToNextPage(this.grid);
        break;
      case ChPaginatorNavigationType.LAST:
        paginationGoToLastPage(this.grid);
        break;
    }
  }

  @Listen("refreshClicked")
  refreshClickedHandler() {
    gridRefresh(this.grid);
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
          {this.grid.ActionbarShow && this.renderActionbar()}
          {this.renderColumns()}
          {this.renderRows()}
          {this.grid.PaginatorShow &&
            this.grid.pageSize > 0 &&
            this.renderPaginator()}
        </ch-grid>
      </Host>
    );
  }

  renderHeader() {
    return <h1 slot="header">{this.grid.header}</h1>;
  }

  renderActionbar() {
    return (
      <ch-grid-actionbar slot="header">
        <ch-grid-action-refresh
          class={this.grid.ButtonRefreshClass}
          title={
            this.grid.ButtonRefreshTextPosition == "title"
              ? gx.getMessage("GX_BtnRefresh")
              : ""
          }
        >
          {this.grid.ButtonRefreshTextPosition == "text"
            ? gx.getMessage("GX_BtnRefresh")
            : ""}
        </ch-grid-action-refresh>
        <ch-grid-action-settings
          class={this.grid.ButtonSettingsClass}
          title={
            this.grid.ButtonSettingsTextPosition == "title"
              ? gx.getMessage("GXM_Settings")
              : ""
          }
        >
          {this.grid.ButtonSettingsTextPosition == "text"
            ? gx.getMessage("GXM_Settings")
            : ""}
        </ch-grid-action-settings>
      </ch-grid-actionbar>
    );
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
    return (
      <ch-paginator class={this.grid.pagingBarClass} slot="footer">
        {this.renderPaginatorNavigate(
          ChPaginatorNavigationType.FIRST,
          this.grid.isFirstPage(),
          this.grid.pagingButtonFirstClass,
          gx.getMessage("GXM_first")
        )}
        {this.renderPaginatorNavigate(
          ChPaginatorNavigationType.PREVIOUS,
          this.grid.isFirstPage(),
          this.grid.pagingButtonPreviousClass,
          gx.getMessage("GXM_previous")
        )}
        {this.renderPaginatorNavigate(
          ChPaginatorNavigationType.NEXT,
          this.grid.isLastPage(),
          this.grid.pagingButtonNextClass,
          gx.getMessage("GXM_next")
        )}
        {this.renderPaginatorNavigate(
          ChPaginatorNavigationType.LAST,
          this.grid.isLastPage(),
          this.grid.pagingButtonLastClass,
          gx.getMessage("GXM_last")
        )}
      </ch-paginator>
    );
  }

  renderPaginatorNavigate(
    type: ChPaginatorNavigationType,
    disabled: boolean,
    className: string,
    text: string
  ) {
    const textPosition = this.grid.PaginatorNavigationButtonTextPosition;

    return (
      <ch-paginator-navigate
        type={type}
        disabled={disabled}
        class={className}
        title={textPosition == "title" ? text : ""}
      >
        {textPosition == "text" ? text : ""}
      </ch-paginator-navigate>
    );
  }
}

export interface GxGrid {
  readonly ControlName: string;
  readonly columns: GxGridColumn[];
  readonly rows: GxGridRow[];
  readonly usePaging: boolean;
  readonly pageSize: number;
  readonly properties: any;
  readonly ParentObject: GxObject;
  readonly header: string;
  readonly Class: string;
  readonly gxAllowSelection: boolean;
  readonly gxAllowHovering: boolean;
  readonly pagingBarClass: string;
  readonly pagingButtonFirstClass: string;
  readonly pagingButtonLastClass: string;
  readonly pagingButtonNextClass: string;
  readonly pagingButtonPreviousClass: string;

  getRowByGxId(gxId: string): GxGridRow;
  selectRow(index: number): void;
  execC2VFunctions(): void;
  executeEvent(columnIndex: number, rowIndex: number): void;
  changeGridPage(direction: string, force?: boolean): any;
  isFirstPage(): boolean;
  isLastPage(): boolean;

  // UC
  readonly ColumnsetClass: string;
  readonly ColumnClass: string;
  readonly RowClass: string;
  readonly RowEvenClass: string;
  readonly RowOddClass: string;
  readonly RowSelectedClass: string;
  readonly RowHighlightedClass: string;
  readonly CellClass: string;
  readonly PaginatorShow: boolean;
  readonly PaginatorNavigationButtonTextPosition: "title" | "text";
  readonly ActionbarShow: boolean;
  readonly ButtonRefreshTextPosition: "title" | "text";
  readonly ButtonRefreshClass: string;
  readonly ButtonSettingsTextPosition: "title" | "text";
  readonly ButtonSettingsClass: string;

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

export interface GxObject {
  refreshGrid(gridName: string): void;
}
