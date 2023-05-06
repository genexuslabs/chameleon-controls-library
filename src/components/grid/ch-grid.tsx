import "./grid-row/ch-grid-row";
import "./grid-rowset/ch-grid-rowset";
import "./grid-cell/ch-grid-cell";

import {
  CSSProperties,
  ChGridSelectionChangedEvent,
  ChGridRowClickedEvent,
  ChGridMarkingChangedEvent,
  ChGridCellSelectionChangedEvent
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
  Method
} from "@stencil/core";

import { ChGridManager } from "./ch-grid-manager";
import HTMLChGridCellElement, {
  ChGridCellSelectorClickedEvent,
  ChGridRowDragEvent
} from "./grid-cell/ch-grid-cell";
import HTMLChGridRowElement from "./grid-row/ch-grid-row";
import {
  ChGridColumnDragEvent,
  ChGridColumnSelectorClickedEvent
} from "./grid-column/ch-grid-column-types";
import { mouseEventModifierKey } from "../common/helpers";
import { ManagerSelectionState } from "./ch-grid-manager-selection";

/**
 * The `ch-grid` component represents a Grid/TreeGrid of data, with rows and cells.
 */
@Component({
  tag: "ch-grid",
  styleUrl: "ch-grid.scss",
  shadow: true
})
export class ChGrid {
  @Element() el: HTMLChGridElement;

  /**
   * Event emitted when the row selection is changed.
   */
  @Event() selectionChanged: EventEmitter<ChGridSelectionChangedEvent>;

  /**
   * Event emitted when the row marking is changed.
   */
  @Event() rowMarkingChanged: EventEmitter<ChGridMarkingChangedEvent>;

  @Event() cellSelectionChanged: EventEmitter<ChGridCellSelectionChangedEvent>;

  /**
   * Event emitted when a row is clicked.
   */
  @Event() rowClicked: EventEmitter<ChGridRowClickedEvent>;

  @State() rowFocused: HTMLChGridRowElement;
  @State() rowHighlighted: HTMLChGridRowElement;
  @State() rowsMarked: HTMLChGridRowElement[] = [];
  @State() rowsSelected: HTMLChGridRowElement[] = [];
  @State() cellSelected: HTMLChGridCellElement;
  @State() gridStyle: CSSProperties;

  /**
   * One of "none", "single" or "multiple", indicating how rows can be selected.
   * It can be set to "none" if no rows should be selectable,
   * "single" if only one row can be selected at a time, or
   * "multiple" if multiple rows can be selected at once.
   */
  @Prop() readonly rowSelectionMode: "none" | "single" | "multiple" = "single";

  /**
   * One of "false", "true" or "auto", indicating whether or not rows can be highlighted.
   * "auto", row highlighting will be enabled if the row selection mode is set to "single" or "multiple".
   */
  @Prop() readonly rowHighlightEnabled: boolean | "auto" = "auto";

  /**
   * A CSS class name applied to a row when it is selected.
   */
  @Prop() readonly rowSelectedClass: string;

  /**
   * A CSS class name applied to a row when it is hovered.
   */
  @Prop() readonly rowHighlightedClass: string;

  /**
   * A CSS class name applied to a row when it is focused.
   */
  @Prop() readonly rowFocusedClass: string;

  /**
   * A CSS class name applied to a row when it is marked.
   */
  @Prop() readonly rowMarkedClass: string;

  /**
   * An object that contains localized strings for the grid.
   */
  @Prop() readonly localization: GridLocalization;

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
    if (
      name === "rowFocused" ||
      name === "rowHighlighted" ||
      name === "rowSelected" ||
      name === "rowsMarked" ||
      name === "cellSelected"
    ) {
      return false;
    }
  }

  @Watch("rowHighlighted")
  rowHighlightedHandler(
    row: HTMLChGridRowElement,
    previous: HTMLChGridRowElement
  ) {
    if (row) {
      row.highlighted = true;
    }
    if (previous) {
      previous.highlighted = false;
    }

    if (this.gridRowActionsEnabled) {
      this.manager.setRowActionsPosition(row);
    }
  }

  @Watch("rowFocused")
  rowFocusedHandler(row: HTMLChGridRowElement, previous: HTMLChGridRowElement) {
    if (row) {
      row.focused = true;
      row.ensureVisible();
    }
    if (previous) {
      previous.focused = false;
    }
  }

  @Watch("rowsSelected")
  rowsSelectedHandler(
    rows: HTMLChGridRowElement[],
    previous: HTMLChGridRowElement[]
  ) {
    if (previous) {
      previous
        .filter(row => !rows.includes(row))
        .forEach(row => (row.selected = false));
    }
    if (rows) {
      rows.forEach(row => (row.selected = true));
    }

    this.manager.selection.syncRowSelector(rows, previous, "select");
    this.selectionChanged.emit({ rowsId: rows.map(row => row.rowId) });
  }

  @Watch("rowsMarked")
  rowsMarkedHandler(
    rows: HTMLChGridRowElement[],
    previous: HTMLChGridRowElement[]
  ) {
    this.manager.selection.syncRowSelector(rows, previous, "mark");
    this.rowMarkingChanged.emit({ rowsId: rows.map(row => row.rowId) });
  }

  @Watch("cellSelected")
  cellSelectedHandler(
    cell: HTMLChGridCellElement,
    previous: HTMLChGridCellElement
  ) {
    if (cell) {
      cell.selected = true;
    }
    if (previous) {
      previous.selected = false;
    }

    this.cellSelectionChanged.emit({
      cellId: this.cellSelected ? this.cellSelected.cellId : null,
      rowId: this.cellSelected ? this.cellSelected.row.rowId : null,
      columnId: this.cellSelected ? this.cellSelected.column.columnId : null
    });
  }

  @Listen("focus", { passive: true })
  focusHandler() {
    if (this.rowSelectionMode !== "none") {
      this.rowFocused = this.rowsSelected[0] || this.manager.getFirstRow();
    }
  }

  @Listen("blur", { passive: true })
  blurHandler() {
    this.rowFocused = null;
  }

  @Listen("keydown", { target: "window" })
  windowKeyDownHandler(eventInfo: KeyboardEvent) {
    if (
      document.activeElement === this.el &&
      [
        " ",
        "+",
        "-",
        "Home",
        "End",
        "PageUp",
        "PageDown",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight"
      ].includes(eventInfo.key)
    ) {
      eventInfo.preventDefault();
    }
  }

  @Listen("keydown", { passive: true })
  keyDownHandler(eventInfo: KeyboardEvent) {
    if (document.activeElement === this.el) {
      switch (eventInfo.key) {
        case " ":
          this.toggleRowsMarked();
          break;
        case "+":
          break;
        case "-":
          break;
        case "Home":
          this.selectByKeyboardEvent(
            this.manager.selection.selectFirstRow.bind(this.manager.selection),
            eventInfo.shiftKey
          );
          break;
        case "End":
          this.selectByKeyboardEvent(
            this.manager.selection.selectLastRow.bind(this.manager.selection),
            eventInfo.shiftKey
          );
          break;
        case "PageUp":
          this.selectByKeyboardEvent(
            this.manager.selection.selectPreviousPageRow.bind(
              this.manager.selection
            ),
            eventInfo.shiftKey
          );
          break;
        case "PageDown":
          this.selectByKeyboardEvent(
            this.manager.selection.selectNextPageRow.bind(
              this.manager.selection
            ),
            eventInfo.shiftKey
          );
          break;
        case "ArrowUp":
          this.selectByKeyboardEvent(
            this.manager.selection.selectPreviousRow.bind(
              this.manager.selection
            ),
            eventInfo.shiftKey
          );
          break;
        case "ArrowDown":
          this.selectByKeyboardEvent(
            this.manager.selection.selectNextRow.bind(this.manager.selection),
            eventInfo.shiftKey
          );
          break;
        case "ArrowLeft":
          this.selectByKeyboardEvent(
            this.manager.selection.selectPreviousCell.bind(
              this.manager.selection
            ),
            eventInfo.shiftKey
          );
          break;
        case "ArrowRight":
          this.selectByKeyboardEvent(
            this.manager.selection.selectNextCell.bind(this.manager.selection),
            eventInfo.shiftKey
          );
          break;
      }
    }
  }

  @Listen("mousemove", { passive: true })
  mouseMoveHandler(eventInfo: MouseEvent) {
    if (
      (this.rowHighlightEnabled === "auto" &&
        this.rowSelectionMode !== "none") ||
      this.rowHighlightEnabled == true
    ) {
      this.rowHighlighted =
        this.manager.getRowEventTarget(eventInfo) ||
        (this.manager.isRowActionsEventTarget(eventInfo)
          ? this.rowHighlighted
          : null);
    }

    if (this.manager.selection.selecting) {
      const row = this.manager.getRowEventTarget(eventInfo);
      const cell = this.manager.getCellEventTarget(eventInfo);

      if (
        row &&
        (this.manager.selection.selectingRow !== row ||
          this.manager.selection.selectingCell !== cell)
      ) {
        this.selectByPointerEvent(
          row,
          cell,
          mouseEventModifierKey(eventInfo),
          true
        );

        this.manager.selection.selectingRow = row;
        this.manager.selection.selectingCell = cell;
      }
    }
  }

  @Listen("mouseleave", { passive: true })
  mouseLeaveHandler() {
    if (this.rowHighlighted) {
      this.rowHighlighted = null;
    }
  }

  @Listen("mousedown", { passive: true })
  clickHandler(eventInfo: MouseEvent) {
    const row = this.manager.getRowEventTarget(eventInfo);
    const cell = this.manager.getCellEventTarget(eventInfo);

    if (row) {
      this.manager.selection.selecting = true;
      this.selectByPointerEvent(
        row,
        cell,
        mouseEventModifierKey(eventInfo),
        eventInfo.shiftKey
      );
    }
  }

  @Listen("mouseup", { passive: true })
  mouseUpHandler() {
    this.manager.selection.selecting = false;
    this.manager.selection.selectingRow = null;
    this.manager.selection.selectingCell = null;
  }

  @Listen("columnSelectorClicked", { passive: true })
  columnSelectorClickedHandler(
    eventInfo: CustomEvent<ChGridColumnSelectorClickedEvent>
  ) {
    const columnSelector = this.manager.columns.getColumnSelector();

    if (columnSelector?.richRowSelectorMode === "select") {
      this.selectAll(eventInfo.detail.checked);
    } else if (columnSelector?.richRowSelectorMode === "mark") {
      this.rowsMarked = this.manager.selection.markAllRows(
        eventInfo.detail.checked
      );
    }
  }

  @Listen("cellSelectorClicked", { passive: true })
  cellSelectorClickedHandler(
    eventInfo: CustomEvent<ChGridCellSelectorClickedEvent>
  ) {
    const columnSelector = this.manager.columns.getColumnSelector();

    if (columnSelector?.richRowSelectorMode === "select") {
      this.selectByPointerEvent(
        this.manager.getRowEventTarget(eventInfo),
        this.manager.getCellEventTarget(eventInfo),
        true,
        eventInfo.detail.range
      );
    } else if (columnSelector?.richRowSelectorMode === "mark") {
      this.rowsMarked = this.manager.selection.markRow(
        this.manager.getRowEventTarget(eventInfo),
        eventInfo.detail.checked,
        eventInfo.detail.range,
        this.rowsMarked
      );
    }
  }

  @Listen("columnHiddenChanged")
  @Listen("columnOrderChanged")
  @Listen("columnFreezeChanged")
  @Listen("columnSizeChanging")
  columnStyleChangedHandler() {
    if (this.manager) {
      this.gridStyle = this.manager.getGridStyle();
    }
  }

  @Listen("columnFreezeChanged")
  columnFreezeChangedHandler() {
    this.manager.columns.adjustFreezeOrder();
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
  async getFocusedRow(): Promise<string> {
    return this.rowFocused?.rowId;
  }

  @Method()
  async getHoveredRow(): Promise<string> {
    return this.rowHighlighted?.rowId;
  }

  @Method()
  async getSelectedRows(): Promise<string[]> {
    return this.rowsSelected.map(row => row.rowId);
  }

  @Method()
  async getMarkedRows(): Promise<string[]> {
    return this.rowsMarked.map(row => row.rowId);
  }

  @Method()
  async getSelectedCell(): Promise<{
    cellId: string;
    rowId: string;
    columnId: string;
  }> {
    return {
      cellId: this.cellSelected ? this.cellSelected.cellId : null,
      rowId: this.cellSelected ? this.cellSelected.row.rowId : null,
      columnId: this.cellSelected ? this.cellSelected.column.columnId : null
    };
  }

  @Method()
  async selectRow(rowId: string, selected = true): Promise<void> {
    const row = this.manager.getRow(rowId);

    if (row && row.selected != selected) {
      const { rowFocused, rowsSelected, cellSelected } =
        this.manager.selection.select(
          {
            rowFocused: this.rowFocused,
            rowsSelected: this.rowsSelected,
            cellSelected: this.cellSelected
          },
          row,
          null,
          true,
          false
        );

      this.rowFocused = rowFocused;
      this.rowsSelected = rowsSelected;
      this.cellSelected = cellSelected;

      rowFocused?.ensureVisible();
    }
  }

  @Method()
  async selectAllRows(selected = true): Promise<void> {
    this.selectAll(selected);
  }

  @Method()
  async selectCell(
    cellId?: string,
    rowId?: string,
    columnId?: string,
    selected = true
  ): Promise<void> {
    const cell = this.manager.getCell(cellId, rowId, columnId);

    if (cell) {
      const row = cell.row;
      const append = row.selected != selected;

      this.selectByPointerEvent(row, cell, append, false);
    }
  }

  /**
   * Ensures that the row is visible within the control, scrolling the contents of the control if necessary.
   */
  @Method()
  async rowEnsureVisible(rowId: string): Promise<void> {
    const row = this.el.querySelector(
      `${HTMLChGridRowElement.TAG_NAME.toLowerCase()}[rowid="${rowId}"]`
    ) as HTMLChGridRowElement;

    if (row) {
      this.manager.ensureRowVisible(row);
    }
  }

  /**
   * Ensures that the cell is visible within the control, scrolling the contents of the control if necessary.
   */
  @Method()
  async cellEnsureVisible(cellId: string): Promise<void> {
    const cell = this.el.querySelector(
      `${HTMLChGridCellElement.TAG_NAME.toLowerCase()}[cellid="${cellId}"]`
    ) as HTMLChGridCellElement;

    if (cell) {
      this.manager.ensureCellVisible(cell);
    }
  }

  @Method()
  async getPreviousRow(): Promise<string> {
    const currentRow = this.cellSelected?.row;

    if (currentRow) {
      return this.manager.getPreviousRow(currentRow)?.rowId || null;
    }
  }

  @Method()
  async getNextRow(): Promise<string> {
    const currentRow = this.cellSelected?.row;

    if (currentRow) {
      return this.manager.getNextRow(currentRow)?.rowId || null;
    }
  }

  @Method()
  async getPreviousCell(): Promise<{
    cellId: string;
    rowId: string;
    columnId: string;
  }> {
    const previousCell = this.manager.getPreviousCell(this.cellSelected);

    return {
      cellId: previousCell ? previousCell.cellId : null,
      rowId: previousCell ? previousCell.row.rowId : null,
      columnId: previousCell ? previousCell.column.columnId : null
    };
  }

  @Method()
  async getNextCell(): Promise<{
    cellId: string;
    rowId: string;
    columnId: string;
  }> {
    const nextCell = this.manager.getNextCell(this.cellSelected);

    return {
      cellId: nextCell ? nextCell.cellId : null,
      rowId: nextCell ? nextCell.row.rowId : null,
      columnId: nextCell ? nextCell.column.columnId : null
    };
  }

  private toggleRowsMarked() {
    const columnSelector = this.manager.columns.getColumnSelector();

    if (columnSelector?.richRowSelectorMode === "mark") {
      const value = !this.rowFocused.marked;

      if (value) {
        this.rowsMarked = Array.from(
          new Set(this.rowsMarked.concat(this.rowsSelected))
        );
      } else {
        this.rowsMarked = this.rowsMarked.filter(
          row => !this.rowsSelected.includes(row)
        );
      }
    }
  }

  private selectByPointerEvent(
    row: HTMLChGridRowElement,
    cell: HTMLChGridCellElement,
    append: boolean,
    range: boolean
  ) {
    const { rowFocused, rowsSelected, cellSelected } =
      this.manager.selection.select(
        {
          rowFocused: this.rowFocused,
          rowsSelected: this.rowsSelected,
          cellSelected: this.cellSelected
        },
        row,
        cell,
        append,
        range
      );

    this.rowFocused = rowFocused;
    this.rowsSelected = rowsSelected;
    this.cellSelected = cellSelected;

    rowFocused?.ensureVisible();
  }

  private selectByKeyboardEvent(
    fn: (
      state: ManagerSelectionState,
      append: boolean
    ) => ManagerSelectionState,
    append: boolean
  ) {
    const { rowFocused, rowsSelected, cellSelected } = fn(
      {
        rowFocused: this.rowFocused,
        rowsSelected: this.rowsSelected,
        cellSelected: this.cellSelected
      },
      append
    );

    this.rowFocused = rowFocused;
    this.rowsSelected = rowsSelected;
    this.cellSelected = cellSelected;

    rowFocused?.ensureVisible();
  }

  private selectAll(value = true) {
    const { rowFocused, rowsSelected, cellSelected } =
      this.manager.selection.selectAll(
        {
          rowFocused: this.rowFocused,
          rowsSelected: this.rowsSelected,
          cellSelected: this.cellSelected
        },
        value
      );

    this.rowFocused = rowFocused;
    this.rowsSelected = rowsSelected;
    this.cellSelected = cellSelected;

    rowFocused?.ensureVisible();
  }

  render() {
    return (
      <Host tabindex="0">
        <header part="header">
          <slot name="header"></slot>
        </header>
        <section
          class="main"
          style={this.gridStyle}
          part="main"
          ref={el => (this.gridMainEl = el)}
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
        grid={this.el}
        ref={el => (this.gridSettingsUI = el)}
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
        ref={el => (this.gridRowActionsEl = el)}
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
