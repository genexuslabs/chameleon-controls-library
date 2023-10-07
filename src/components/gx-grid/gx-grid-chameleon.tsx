import {
  ChGridRowClickedEvent,
  ChGridSelectionChangedEvent
} from "../grid/ch-grid-types";
import { Component, Host, Listen, Prop, h, Watch } from "@stencil/core";
import {
  paginationGoToFirstPage,
  paginationGoToLastPage,
  paginationGoToNextPage,
  paginationGoToPreviousPage
} from "./gx-grid-chameleon-paginator";
import {
  ChPaginatorNavigateClickedEvent,
  ChPaginatorNavigateType
} from "../paginator/paginator-navigate/ch-paginator-navigate-types";
import { gridRefresh, gridSort } from "./gx-grid-chameleon-actions";
import {
  ChGridColumnFreezeChangedEvent,
  ChGridColumnHiddenChangedEvent,
  ChGridColumnOrderChangedEvent,
  ChGridColumnSizeChangedEvent,
  ChGridColumnSortChangedEvent
} from "../grid/grid-column/ch-grid-column-types";
import {
  GridChameleonManagerState,
  GridChameleonState
} from "./gx-grid-chameleon-state";
import { Gx, GxControl, GxGrid, GxGridColumn, GxGridRow } from "./genexus";
import { GridChameleonColumnFilterChanged } from "./gx-grid-column-filter/gx-grid-chameleon-column-filter";
import { ChPaginatorPageNavigationRequestedEvent } from "../paginator/ch-paginator";

declare let gx: Gx;

@Component({
  shadow: false,
  styleUrl: "gx-grid-chameleon.scss",
  tag: "gx-grid-chameleon"
})
export class GridChameleon {
  /**
   * The GxGrid instance representing the data to be displayed in the grid.
   */
  @Prop() readonly grid!: GxGrid;

  /**
   * The timestamp indicating the time when the grid was last updated.
   */
  @Prop({ mutable: true }) gridTimestamp: number;

  /**
   * The UI state of the Grid.
   */
  @Prop() readonly state: GridChameleonState;

  @Watch("state")
  controlStateHandler() {
    this.loadState();
  }

  componentWillLoad() {
    this.loadState();
  }

  componentWillRender() {
    this.defineColumnRender();
  }

  componentDidLoad() {
    this.setCurrentRow();
    this.notifyResizePopup();
  }

  @Listen("selectionChanged")
  selectionChangedHandler(eventInfo: CustomEvent<ChGridSelectionChangedEvent>) {
    const rowIndex = this.getRowIndexByGxId(eventInfo.detail.rowsId[0]);

    if (rowIndex >= 0) {
      this.grid.execC2VFunctions();
      this.grid.selectRow(rowIndex);
    }
  }

  @Listen("rowClicked")
  cellClickedHandler(eventInfo: CustomEvent<ChGridRowClickedEvent>) {
    const rowIndex = this.getRowIndexByGxId(eventInfo.detail.rowId);
    const cellIndex = parseInt(eventInfo.detail.cellId);

    if (rowIndex >= 0) {
      this.grid.executeEvent(cellIndex, rowIndex);
    }
  }

  @Listen("pageNavigationRequested")
  navigateClickedHandler(
    eventInfo: CustomEvent<ChPaginatorPageNavigationRequestedEvent>
  ) {
    switch (eventInfo.detail.type) {
      case "first":
        paginationGoToFirstPage(this.grid);
        break;
      case "previous":
        paginationGoToPreviousPage(this.grid);
        break;
      case "next":
        paginationGoToNextPage(this.grid);
        break;
      case "last":
        paginationGoToLastPage(this.grid);
        break;
      case "goto":
        paginationGoToPage(this.grid, eventInfo.detail.page);
        break;
    }
  }

  @Listen("refreshClicked")
  refreshClickedHandler() {
    gridRefresh(this.grid);
  }

  @Listen("columnHiddenChanged")
  columnHiddenChangedHandler(
    eventInfo: CustomEvent<ChGridColumnHiddenChangedEvent>
  ) {
    GridChameleonManagerState.setColumnHidden(
      eventInfo.detail.columnId,
      eventInfo.detail.hidden
    );
  }

  @Listen("columnSizeChanging")
  @Listen("columnSizeChanged")
  columnSizeChangedHandler(
    eventInfo: CustomEvent<ChGridColumnSizeChangedEvent>
  ) {
    GridChameleonManagerState.setColumnSize(
      eventInfo.detail.columnId,
      eventInfo.detail.size
    );
  }

  @Listen("columnFreezeChanged")
  columnFreezeChangedHandler(
    eventInfo: CustomEvent<ChGridColumnFreezeChangedEvent>
  ) {
    GridChameleonManagerState.setColumnFreeze(
      eventInfo.detail.columnId,
      eventInfo.detail.freeze
    );
  }

  @Listen("columnSortChanged")
  columnSortChangedHandler(
    eventInfo: CustomEvent<ChGridColumnSortChangedEvent>
  ) {
    GridChameleonManagerState.setColumnSort(
      eventInfo.detail.columnId,
      eventInfo.detail.sortDirection
    );

    switch (this.grid.SortMode) {
      case "client":
        gridSort(
          this.grid,
          eventInfo.detail.columnId,
          eventInfo.detail.sortDirection
        );
        this.gridTimestamp = Date.now();
        break;
      case "server":
        gridRefresh(this.grid);
        break;
    }
  }

  @Listen("columnOrderChanged")
  columnOrderChangedHandler(
    eventInfo: CustomEvent<ChGridColumnOrderChangedEvent>
  ) {
    GridChameleonManagerState.setColumnOrder(
      eventInfo.detail.columnId,
      eventInfo.detail.order
    );
  }

  @Listen("columnSettingsChanged")
  columnFilterChangedHandler(
    eventInfo: CustomEvent<GridChameleonColumnFilterChanged>
  ) {
    const column = eventInfo.detail.column;

    column.filterEqual = eventInfo.detail.equal ?? "";
    column.filterLess = eventInfo.detail.less ?? "";
    column.filterGreater = eventInfo.detail.greater ?? "";

    GridChameleonManagerState.setColumnFilterEqual(
      column.htmlName,
      column.filterEqual
    );
    GridChameleonManagerState.setColumnFilterLess(
      column.htmlName,
      column.filterLess
    );
    GridChameleonManagerState.setColumnFilterGreater(
      column.htmlName,
      column.filterGreater
    );

    gridRefresh(this.grid);
  }

  private getColumnSize(column: GxGridColumn): string {
    let size: string;

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
        size = `minmax(${column.SizeMinLength || "min-content"}, ${
          column.SizeMaxLength || "auto"
        })`;
        break;
      default:
        size = "min-content";
        break;
    }

    return size || "min-content";
  }

  private defineColumnRender(): void {
    const properties = this.grid.properties;

    this.grid.columns.forEach((column, i) => {
      column.render =
        (properties.length === 0 && column.visible) ||
        properties.some(row => row[i].visible);
    });
  }

  private getRowIndexByGxId(rowId: string): number {
    return this.grid.rows.findIndex(row => row.gxId === rowId);
  }

  private notifyResizePopup() {
    if (gx.popup.ispopup()) {
      gx.fx.obs.notify("gx.onafterevent");
    }
  }

  private setCurrentRow() {
    const firstRow = this.grid.rows[0];

    if (firstRow && !gx.fn.currentGridRowImpl(this.grid.gxId)) {
      gx.fn.setCurrentGridRow(this.grid.gxId, firstRow.gxId);
    }
  }

  private loadState() {
    GridChameleonManagerState.load(this.grid, this.state);
  }

  private renderTitle() {
    return <h1 slot="header">{this.grid.header}</h1>;
  }

  private renderActionbar(position: "header" | "footer", className: string) {
    const refresh = this.grid.ActionRefreshPosition === position,
      settings = this.grid.ActionSettingsPosition === position;

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
          this.grid.ActionRefreshTextPosition === "title"
            ? gx.getMessage("GX_BtnRefresh")
            : ""
        }
      >
        {this.grid.ActionRefreshTextPosition === "text"
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
          this.grid.ActionSettingsTextPosition === "title"
            ? gx.getMessage("GXM_Settings")
            : ""
        }
      >
        {this.grid.ActionSettingsTextPosition === "text"
          ? gx.getMessage("GXM_Settings")
          : ""}
      </ch-grid-action-settings>
    );
  }

  private renderColumns() {
    return (
      <ch-grid-columnset class={this.grid.ColumnsetClass}>
        {this.grid.columns.map(column => {
          if (gx.lang.gxBoolean(column.render)) {
            return (
              <ch-grid-column
                key={column.htmlName}
                columnId={column.htmlName}
                columnIconUrl={column.Icon}
                columnName={column.title}
                columnNamePosition={column.NamePosition}
                size={this.getColumnSize(column)}
                order={column.order ? column.order : null}
                displayObserverClass={column.gxColumnClass}
                class={`${this.grid.ColumnClass} ${column.HeaderClass} ${
                  column.isFiltering ? "grid-column-filtering" : ""
                }`}
                hidden={column.Hidden === -1}
                hideable={column.Hideable === -1}
                resizable={column.Resizeable === -1}
                sortable={column.Sortable === -1}
                settingable={column.Filterable === -1}
                sortDirection={column.SortDirection}
              >
                {column.Filterable === -1 && this.renderColumnFilter(column)}
              </ch-grid-column>
            );
          }
        })}
      </ch-grid-columnset>
    );
  }

  private renderColumnFilter(column: GxGridColumn) {
    return (
      <gx-grid-chameleon-column-filter
        key={column.htmlName}
        class={this.grid.ColumnFilterClass}
        column={column}
        equal={column.filterEqual}
        less={column.filterLess}
        greater={column.filterGreater}
        buttonResetText={this.grid.FilterButtonResetText}
        buttonApplyText={this.grid.FilterButtonApplyText}
        slot="settings"
      ></gx-grid-chameleon-column-filter>
    );
  }

  private renderRows() {
    return this.grid.rows.map((row, i) => {
      const rowEvenClasses = `${this.grid.RowClass} ${this.grid.RowEvenClass}`;
      const rowOddClasses = `${this.grid.RowClass} ${this.grid.RowOddClass}`;

      return (
        <ch-grid-row
          key={row.gxId}
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

      if (gx.lang.gxBoolean(column.render)) {
        return (
          <ch-grid-cell
            key={cellControlProperties[0]}
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
    // eslint-disable-next-line prefer-spread
    control.setProperties.apply(control, props);
    return control.getHtml();
  }

  private renderPaginator() {
    return (
      <ch-paginator class={this.grid.pagingBarClass} slot="footer">
        {this.renderPaginatorNavigate(
          "first",
          this.grid.isFirstPage(),
          this.grid.pagingButtonFirstClass,
          gx.getMessage("GXM_first")
        )}
        {this.renderPaginatorNavigate(
          "previous",
          this.grid.isFirstPage(),
          this.grid.pagingButtonPreviousClass,
          gx.getMessage("GXM_previous")
        )}
        {this.renderPaginatorNavigate(
          "next",
          this.grid.isLastPage(),
          this.grid.pagingButtonNextClass,
          gx.getMessage("GXM_next")
        )}
        {this.renderPaginatorNavigate(
          "last",
          this.grid.isLastPage(),
          this.grid.pagingButtonLastClass,
          gx.getMessage("GXM_last")
        )}
      </ch-paginator>
    );
  }

  private renderPaginatorNavigate(
    type: ChPaginatorNavigateType,
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
        title={textPosition === "title" ? text : ""}
      >
        {textPosition === "text" ? text : ""}
      </ch-paginator-navigate>
    );
  }

  render() {
    return (
      <Host>
        <ch-grid
          class={this.grid.Class}
          rowSelectionMode={this.grid.gxAllowSelection ? "single" : "none"}
          rowSelectedClass={this.grid.RowSelectedClass.trim()}
          rowHighlightedClass={this.grid.RowHighlightedClass.trim()}
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
}
