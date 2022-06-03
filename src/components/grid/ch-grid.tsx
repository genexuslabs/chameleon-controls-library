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

  gridManager: ChGridManager;

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

  render() {
    return (
      <Host>
        <header part="header">
          <slot name="header"></slot>
        </header>
        <section class="main" style={this.gridStyle} part="main">
          <slot></slot>
        </section>
        <aside part="action-bar">
          <slot name="row-hover"></slot>
        </aside>
        <footer part="footer">
          <slot name="footer"></slot>
        </footer>
      </Host>
    );
  }
}
