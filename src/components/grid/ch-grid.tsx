import "../grid-row/ch-grid-row";
import "../grid-cell/ch-grid-cell";

import {
  CSSProperties,
  ChGridCellClickedEvent,
  ChGridSelectionChangedEvent,
} from "./types";
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
} from "@stencil/core";
import {
  setCellSelected,
  setRowHighlighted,
  setRowsSelected,
} from "./ch-grid-events";

import { ChGridManager } from "./ch-grid-manager";
import HTMLChGridCellElement from "../grid-cell/ch-grid-cell";
import HTMLChGridRowElement from "../grid-row/ch-grid-row";

@Component({
  tag: "ch-grid",
  styleUrl: "ch-grid.scss",
  shadow: true,
})
export class ChGrid {
  @Element() el: HTMLChGridElement;

  @Event() selectionChanged: EventEmitter<ChGridSelectionChangedEvent>;
  @Event() cellClicked: EventEmitter<ChGridCellClickedEvent>;

  rowHighlighted: HTMLChGridRowElement;
  @State() rowsSelected: HTMLChGridRowElement[] = [];
  @State() cellSelected: HTMLChGridCellElement;
  @State() gridStyle: CSSProperties;

  @Prop() rowSelectionMode: "none" | "single" | "multiple" = "single";
  @Prop() onRowSelectedClass: string;
  @Prop() onRowHighlightedClass: string;

  @Prop() localization: GridLocalization;

  gridManager: ChGridManager;
  private settingsUI: HTMLChGridSettingsElement;

  componentWillLoad() {
    this.gridManager = new ChGridManager(this);
    this.gridStyle = this.gridManager.getGridStyle();
  }

  componentShouldUpdate(_newValue, _oldValue, name: string) {
    if (name === "rowSelected") {
      return false;
    }
  }

  @Watch("rowsSelected")
  rowSelectedHandler(rows: HTMLChGridRowElement[]) {
    this.selectionChanged.emit({ rowsId: rows.map((row) => row.rowId) });
  }

  @Watch("cellSelected")
  cellSelectedHandler(cell: HTMLChGridCellElement) {
    this.cellClicked.emit({
      rowId: cell.rowId,
      cellId: cell.cellId,
    });
  }

  @Listen("mousemove", { passive: true })
  mouseMoveHandler(eventInfo: MouseEvent) {
    if (this.rowSelectionMode != "none") {
      this.rowHighlighted = setRowHighlighted(eventInfo, this.rowHighlighted);
    }
  }

  @Listen("click", { passive: true })
  clickHandler(eventInfo: MouseEvent) {
    if (this.rowSelectionMode != "none") {
      this.cellSelected = setCellSelected(eventInfo, this.cellSelected);
      this.rowsSelected = setRowsSelected(
        eventInfo,
        this.rowsSelected,
        this.rowSelectionMode === "multiple"
      );
    }
  }

  @Listen("columnVisibleChanged")
  columnVisibleChangedHandler() {
    if (this.gridManager) {
      this.gridStyle = this.gridManager.getGridStyle();
    }
  }

  @Listen("columnDragStart")
  columnDragStartHandler(eventInfo: CustomEvent) {
    this.gridManager.columnDragStart(eventInfo);
  }

  @Listen("columnDragging")
  columnDraggingHandler(eventInfo: CustomEvent) {
    this.gridManager.columnDragging(eventInfo);
    this.gridStyle = this.gridManager.getGridStyle();
  }

  @Listen("columnDragEnd")
  columnDragEndHandler() {
    this.gridManager.columnDragEnd();
    this.gridStyle = this.gridManager.getGridStyle();
  }

  @Listen("settingsShowClicked")
  settingsShowClickedHandler() {
    this.settingsUI.show = true;
  }

  @Listen("settingsCloseClicked")
  settingsCloseClickedHandler() {
    this.settingsUI.show = false;
  }

  render() {
    return (
      <Host>
        <header part="header">
          <slot name="header"></slot>
        </header>
        <section class="main" style={this.gridStyle} part="main">
          <slot></slot>
        </section>
        <aside>
          {this.renderSettings()}
          <slot name="column-display"></slot>
          <slot name="row-actions"></slot>
        </aside>
        <footer part="footer">
          <slot name="footer"></slot>
        </footer>
      </Host>
    );
  }

  renderSettings() {
    return (
      <ch-grid-settings
        ref={(el) => (this.settingsUI = el)}
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
            gridManager={this.gridManager}
            exportparts="
              column:settings-columns-item,
              column-label:settings-columns-label,
              column-visible:settings-columns-visible
            "
          ></ch-grid-settings-columns>
        </slot>
      </ch-grid-settings>
    );
  }
}

export interface GridLocalization {
  settingsCaption: string;
  settingsCloseText: string;
  settingsCloseTooltip: string;
}
