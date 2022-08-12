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
import { ChGridColumnSortChangedEvent } from "../grid-column/ch-grid-column-types";

declare var gx: any;

@Component({
  shadow: false,
  styleUrl: "gx-grid-chameleon.scss",
  tag: "gx-grid-chameleon",
})
export class GridChameleon {
  constructor() {}

  @Prop() readonly grid: GxGrid;
  @Prop({ mutable: true }) gridTimestamp: number;

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

  @Listen("columnSortChanged")
  columnSortChangedHandler(
    eventInfo: CustomEvent<ChGridColumnSortChangedEvent>
  ) {
    const column = this.grid.getColumnByHtmlName(eventInfo.detail.columnId);

    this.grid.setSort(
      column.index,
      eventInfo.detail.sortDirection == "desc" ? false : true
    );
    this.gridTimestamp = Date.now();
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
          {this.grid.header && this.renderTitle()}
          {this.renderActionbar("header", this.grid.ActionbarHeaderClass)}
          {this.renderActionbar("footer", this.grid.ActionbarFooterClass)}
          {this.renderColumns()}
          {this.renderRows()}
          {this.grid.PaginatorShow &&
            this.grid.pageSize > 0 &&
            this.renderPaginator()}
        </ch-grid>
      </Host>
    );
  }

  private renderTitle() {
    return <h1 slot="header">{this.grid.header}</h1>;
  }

  private renderActionbar(position: "header" | "footer", className: string) {
    const refresh = this.grid.ActionRefreshPosition == position,
          settings = this.grid.ActionSettingsPosition == position;

    if (refresh || settings) {
      return (
        <ch-grid-actionbar slot={position} class={className}>
          {refresh && this.renderActionRefresh()}
          {settings && this.renderActionSettings()}
        </ch-grid-actionbar>
      );
    }
  }

  private renderActionRefresh() {
    return (
      <ch-grid-action-refresh
        class={this.grid.ActionRefreshClass}
        title={
          this.grid.ActionRefreshTextPosition == "title"
            ? gx.getMessage("GX_BtnRefresh")
            : ""
        }
      >
        {this.grid.ActionRefreshTextPosition == "text"
          ? gx.getMessage("GX_BtnRefresh")
          : ""}
      </ch-grid-action-refresh>
    );
  }

  private renderActionSettings() {
    return (
      <ch-grid-action-settings
        class={this.grid.ActionSettingsClass}
        title={
          this.grid.ActionSettingsTextPosition == "title"
            ? gx.getMessage("GXM_Settings")
            : ""
        }
      >
        {this.grid.ActionSettingsTextPosition == "text"
          ? gx.getMessage("GXM_Settings")
          : ""}
      </ch-grid-action-settings>
    );
  }

  private renderColumns() {
    return (
      <ch-grid-columnset class={this.grid.ColumnsetClass}>
        {this.grid.columns.map((column) => {
          if (gx.lang.gxBoolean(column.visible)) {
            return (
              <ch-grid-column
                columnId={column.htmlName}
                columnIconUrl={column.Icon}
                columnName={column.title}
                columnNamePosition={column.NamePosition}
                size={this.getColumnSize(column)}
                displayObserverClass={column.gxColumnClass}
                class={`${this.grid.ColumnClass} ${column.HeaderClass}`}
                hidden={column.Hidden == -1}
                hideable={column.Hideable == -1}
                resizeable={column.Resizeable == -1}
                sortable={column.Sortable == -1}
                settingable={column.Filterable == -1}
              >
                <div slot="settings">
                  <fieldset>
                    <caption>Filter</caption>
                    <label>
                      <input type="text" />
                    </label>
                  </fieldset>
                </div>
              </ch-grid-column>
            );
          }
        })}
      </ch-grid-columnset>
    );
  }

  private renderRows() {
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

  private renderCells(row: GxGridRow) {
    return row.gxProps.map((cellControlProperties, i) => {
      const column = this.grid.columns[i];

      if (gx.lang.gxBoolean(column.visible)) {
        return (
          <ch-grid-cell
            class={this.grid.CellClass}
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

  private renderControl(control: GxControl, props: any): string {
    control.setProperties.apply(control, props);
    return control.getHtml();
  }

  private renderPaginator() {
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

  private renderPaginatorNavigate(
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

  private getColumnSize(column: GxGridColumn): string {
    let size;

    switch (column.Size) {
      case "auto":
        size = "auto";
        break;
      case "css":
        size = `var(--${column.SizeVariableName}, min-content)`;
        break;
      case "length":
        size = column.SizeLength;
        break;
      case "max":
        size = "max-content";
        break;
      case "min":
        size = "min-content";
        break;
      case "minmax":
        size = `minmax(${column.SizeMinLength || "min-content"}, ${column.SizeMaxLength || "auto"})`;
        break;
      default:
        size = "min-content";
        break;
    }

    return size || "min-content";
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
  setSort(columnIndex: number, asc?: boolean);
  selectRow(index: number): void;
  execC2VFunctions(): void;
  executeEvent(columnIndex: number, rowIndex: number): void;
  changeGridPage(direction: string, force?: boolean): any;
  isFirstPage(): boolean;
  isLastPage(): boolean;
  getColumnByHtmlName(htmlName: string): GxGridColumn;

  // UserControl
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

  readonly ActionbarHeaderClass: string;
  readonly ActionbarFooterClass: string;

  readonly ActionRefreshPosition: "none" | "header" | "footer";
  readonly ActionRefreshTextPosition: "title" | "text";
  readonly ActionRefreshClass: string;

  readonly ActionSettingsPosition: "none" | "header" | "footer";
  readonly ActionSettingsTextPosition: "title" | "text";
  readonly ActionSettingsClass: string;

  readonly SettingsCloseTextPosition: "title" | "text";

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
  readonly gxAttId: string;
  readonly gxAttName: string;
  readonly htmlName: string;
  readonly index: number;

  // UserControl
  readonly Icon: string;
  readonly NamePosition: "title" | "text";
  readonly HeaderClass: string;
  readonly Hidden: number;
  readonly Hideable: number;
  readonly Sortable: number;
  readonly Filterable: number;
  readonly Resizeable: number;
  readonly Size: "min" | "max" | "minmax" | "auto" | "length" | "css";
  readonly SizeLength: string;
  readonly SizeMinLength: string;
  readonly SizeMaxLength: string;
  readonly SizeVariableName: string;
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
