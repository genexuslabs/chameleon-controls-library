import "./grid-row/ch-grid-row";
import "./grid-rowset/ch-grid-rowset";
import "./grid-cell/ch-grid-cell";

import {
  CSSProperties,
  ChGridSelectionChangedEvent,
  ChGridRowClickedEvent,
} from "./ch-grid-types";
import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Listen,
  Prop,
  State,
  Watch,
  h,
  Method,
} from "@stencil/core";

import { ChGridManager } from "./ch-grid-manager";
import HTMLChGridCellElement, {
  ChGridCellSelectorClickedEvent, ChGridRowDragEvent,
} from "./grid-cell/ch-grid-cell";
import HTMLChGridRowElement from "./grid-row/ch-grid-row";
import { ChGridColumnDragEvent, ChGridColumnSelectorClickedEvent } from "./grid-column/ch-grid-column-types";

@Component({
  tag: "ch-grid",
  styleUrl: "ch-grid.scss",
  shadow: true,
})
export class ChGrid {
  @Element() el: HTMLChGridElement;

  @Event() selectionChanged: EventEmitter<ChGridSelectionChangedEvent>;
  @Event() rowClicked: EventEmitter<ChGridRowClickedEvent>;

  @State() rowHighlighted: HTMLChGridRowElement;
  @State() rowsSelected: HTMLChGridRowElement[] = [];
  @State() cellSelected: HTMLChGridCellElement;
  @State() gridStyle: CSSProperties;

  @Prop() rowSelectionMode: "none" | "single" | "multiple" = "single";
  @Prop() rowSelectedClass: string;
  @Prop() rowHighlightedClass: string;

  @Prop() localization: GridLocalization;

  manager: ChGridManager;
  gridMainEl: HTMLElement;
  gridRowActionsEl: HTMLElement;
  gridRowActionsEnabled: boolean;
  gridSettingsUI: HTMLChGridSettingsElement;

  componentWillLoad() {
    this.manager = new ChGridManager(this);
    this.gridStyle = this.manager.getGridStyle();
    this.rowsSelected = this.manager.getRowsSelected();
  }

  componentDidLoad() {
    this.manager.gridDidLoad();
    this.gridRowActionsEnabled = this.manager.isRowActionsEnabled();
  }

  componentShouldUpdate(_newValue, _oldValue, name: string) {
    if (name === "rowHighlighted" || name === "rowSelected") {
      return false;
    }
  }

  @Watch("rowHighlighted")
  rowHighlightedHandler(row: HTMLChGridRowElement) {
    if (this.gridRowActionsEnabled) {
      this.manager.setRowActionsPosition(row);
    }
  }

  @Watch("rowsSelected")
  rowsSelectedHandler(
    rows: HTMLChGridRowElement[],
    previous: HTMLChGridRowElement[]
  ) {
    this.manager.selection.refreshCellSelector(rows, previous);

    this.selectionChanged.emit({ rowsId: rows.map((row) => row.rowId) });
  }

  @Listen("mousemove", { passive: true })
  mouseMoveHandler(eventInfo: MouseEvent) {
    if (this.rowSelectionMode != "none") {
      this.rowHighlighted = this.manager.selection.setRowHighlighted(
        eventInfo,
        this.rowHighlighted
      );
    }
  }

  @Listen("mouseleave", { passive: true })
  mouseLeaveHandler() {
    if (this.rowHighlighted) {
      this.rowHighlighted.highlighted = false;
      this.rowHighlighted = null;
    }
  }

  @Listen("click", { passive: true })
  @Listen("contextmenu", { passive: true })
  clickHandler(eventInfo: MouseEvent) {
    const rowClicked = this.manager.getRowEventTarget(eventInfo);
    const cellClicked = this.manager.getCellEventTarget(eventInfo);

    if (rowClicked) {
      this.rowClicked.emit({
        rowId: rowClicked.rowId,
        cellId: cellClicked?.cellId
      });
    }

    if (this.rowSelectionMode != "none") {
      this.cellSelected = this.manager.selection.setCellSelected(
        cellClicked,
        this.cellSelected
      );
      this.rowsSelected = this.manager.selection.setRowSelected(
        rowClicked,
        eventInfo.ctrlKey ? "append" : "",
        eventInfo.shiftKey,
        this.rowSelectionMode === "multiple",
        this.rowsSelected
      );
    }
  }

  @Listen("columnSelectorClicked", { passive: true })
  columnSelectorClickedHandler(
    eventInfo: CustomEvent<ChGridColumnSelectorClickedEvent>
  ) {
    this.rowsSelected = this.manager.selection.setRowsSelected(eventInfo.detail.checked, this.rowsSelected);
  }

  @Listen("cellSelectorClicked", { passive: true })
  cellSelectorClickedHandler(
    eventInfo: CustomEvent<ChGridCellSelectorClickedEvent>
  ) {
    const rowClicked = this.manager.getRowEventTarget(eventInfo);
    const cellClicked = this.manager.getCellEventTarget(eventInfo);

    if (this.rowSelectionMode != "none") {
      this.cellSelected = this.manager.selection.setCellSelected(
        cellClicked,
        this.cellSelected
      );
      this.rowsSelected = this.manager.selection.setRowSelected(
        rowClicked,
        eventInfo.detail.checked ? "append" : "unselect",
        eventInfo.detail.range,
        this.rowSelectionMode === "multiple",
        this.rowsSelected
      );
    }
  }

  @Listen("columnHiddenChanged")
  @Listen("columnOrderChanged")
  @Listen("columnSizeChanging")
  columnStyleChangedHandler() {
    if (this.manager) {
      this.gridStyle = this.manager.getGridStyle();
    }
  }

  @Listen("columnDragStarted")
  columnDragStartHandler(eventInfo: CustomEvent<ChGridColumnDragEvent>) {
    this.manager.columnDragStart(eventInfo.detail.columnId);
  }

  @Listen("columnDragging")
  columnDraggingHandler(eventInfo: CustomEvent<ChGridColumnDragEvent>) {
    if (this.manager.columnDragging(eventInfo.detail.positionX)) {
      this.gridStyle = this.manager.getGridStyle();
    }
  }

  @Listen("columnDragEnded")
  columnDragEndHandler() {
    this.manager.columnDragEnd();
    this.gridStyle = this.manager.getGridStyle();
  }

  @Listen("rowDragStarted")
  rowDragStartHandler(eventInfo: CustomEvent<ChGridRowDragEvent>) {
    this.manager.rowDragStart(eventInfo.detail.row);
  }

  @Listen("rowEnsureVisible")
  rowEnsureVisibleHandler(eventInfo: CustomEvent) {
    this.manager.ensureRowVisible(eventInfo.target as HTMLChGridRowElement);
  }

  @Listen("cellEnsureVisible")
  cellEnsureVisibleHandler(eventInfo: CustomEvent) {
    this.manager.ensureCellVisible(eventInfo.target as HTMLChGridCellElement);
  }

  @Listen("settingsShowClicked")
  settingsShowClickedHandler() {
    this.gridSettingsUI.show = true;
  }

  @Listen("settingsCloseClicked")
  settingsCloseClickedHandler() {
    this.gridSettingsUI.show = false;
  }

  @Method()
  async rowEnsureVisible(rowId: string) {
    const row = this.el.querySelector(`${HTMLChGridRowElement.TAG_NAME.toLowerCase()}[rowid="${rowId}"]`) as HTMLChGridRowElement;

    if (row) {
      this.manager.ensureRowVisible(row);
    }
  }

  @Method()
  async cellEnsureVisible(cellId: string) {
    const cell = this.el.querySelector(`${HTMLChGridCellElement.TAG_NAME.toLowerCase()}[cellid="${cellId}"]`) as HTMLChGridCellElement;

    if (cell) {
      this.manager.ensureCellVisible(cell);
    }
  }

  render() {
    return (
      <Host>
        <header part="header">
          <slot name="header"></slot>
        </header>
        <section
          class="main"
          style={this.gridStyle}
          part="main"
          ref={(el) => (this.gridMainEl = el)}
        >
          <slot></slot>
        </section>
        <aside>
          {this.renderSettings()}
          <slot name="column-display"></slot>
          {this.renderRowActions()}
        </aside>
        <footer part="footer">
          <slot name="footer"></slot>
        </footer>
      </Host>
    );
  }

  private renderSettings() {
    return (
      <ch-grid-settings
        ref={(el) => (this.gridSettingsUI = el)}
        exportparts="
          mask:settings-mask,
          window:settings-window,
          header:settings-header,
          caption:settings-caption,
          close:settings-close,
          main:settings-main,
          footer:settings-footer
        "
      >
        <slot name="settings">
          <ch-grid-settings-columns
            part="settings-columns"
            columns={[...this.manager.getColumns()]}
            exportparts="
              column:settings-columns-item,
              column-label:settings-columns-label,
              column-visible:settings-columns-visible,
              column-visible-checked:settings-columns-visible-checked
            "
          ></ch-grid-settings-columns>
        </slot>
      </ch-grid-settings>
    );
  }

  private renderRowActions() {
    return (
      <section
        class="row-actions"
        part="row-actions"
        ref={(el) => (this.gridRowActionsEl = el)}
      >
        <slot name="row-actions"></slot>
      </section>
    );
  }
}

export interface GridLocalization {
  settingsCaption: string;
  settingsCloseText: string;
  settingsCloseTooltip: string;
}
