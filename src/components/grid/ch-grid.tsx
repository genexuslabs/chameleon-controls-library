import "./grid-row/ch-grid-row";
import "./grid-rowset/ch-grid-rowset";
import "./grid-cell/ch-grid-cell";

import {
  CSSProperties,
  ChGridSelectionChangedEvent,
  ChGridRowClickedEvent,
  ChGridMarkingChangedEvent,
  ChGridCellSelectionChangedEvent,
  ChGridRowPressedEvent,
  ChGridRowContextMenuEvent
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
  ChGridColumnResizeEvent,
  ChGridColumnSelectorClickedEvent
} from "./grid-column/ch-grid-column-types";
import {
  MouseEventButton,
  MouseEventButtons,
  focusComposedPath,
  mouseEventHasButtonPressed,
  mouseEventModifierKey
} from "../common/helpers";
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
  private manager: ChGridManager;
  private gridLayoutElement: HTMLElement;
  private settingsUI: HTMLChGridSettingsElement;

  @Element() el: HTMLChGridElement;

  @State() rowFocused: HTMLChGridRowElement;
  @Watch("rowFocused")
  rowFocusedHandler(row: HTMLChGridRowElement, previous: HTMLChGridRowElement) {
    if (row) {
      row.focused = true;
    }
    if (previous) {
      previous.focused = false;
    }
  }

  @State() cellFocused: HTMLChGridCellElement;
  @Watch("cellFocused")
  cellFocusedHandler(
    cell: HTMLChGridCellElement,
    previous: HTMLChGridCellElement
  ) {
    if (cell) {
      cell.focused = true;
    }
    if (previous) {
      previous.focused = false;
    }
  }

  @State() rowHighlighted: HTMLChGridRowElement;
  @Watch("rowHighlighted")
  rowHighlightedHandler(
    row: HTMLChGridRowElement,
    previous: HTMLChGridRowElement
  ) {
    // highlight
    if (row) {
      row.highlighted = true;
    }
    if (previous) {
      previous.highlighted = false;
    }

    // actions
    if (row) {
      this.manager.rowActions.showOnRowHover?.openRowHover(row);
    } else {
      this.manager.rowActions.showOnRowHover?.close();
    }
  }

  @State() rowsMarked: HTMLChGridRowElement[] = [];
  @Watch("rowsMarked")
  rowsMarkedHandler(
    rows: HTMLChGridRowElement[],
    previous: HTMLChGridRowElement[]
  ) {
    this.manager.selection.syncRowSelector(rows, previous, "mark");
    this.rowMarkingChanged.emit(this.getChangedEventDetail(rows, previous));
  }

  @State() rowsSelected: HTMLChGridRowElement[] = [];
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
    this.selectionChanged.emit(this.getChangedEventDetail(rows, previous));
  }

  @State() cellSelected: HTMLChGridCellElement;
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

  @State() gridStyle: CSSProperties;

  /**
   * One of "none", "single" or "multiple", indicating how rows can be selected.
   * It can be set to "none" if no rows should be selectable,
   * "single" if only one row can be selected at a time, or
   * "multiple" if multiple rows can be selected at once.
   */
  @Prop() readonly rowSelectionMode: "none" | "single" | "multiple" = "single";

  /**
   * Specifies the keyboard navigation mode for the component.
   * - "none": Disables keyboard navigation for the grid rows.
   * - "select": Allows keyboard navigation by changing the selection of grid rows.
   * - "focus": Allows keyboard navigation by focusing on grid rows, but does not change the selection.
   */
  @Prop() readonly keyboardNavigationMode: "none" | "select" | "focus" =
    "select";

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
   * A boolean indicating whether the user can drag column headers to reorder columns.
   */
  @Prop() readonly allowColumnReorder: boolean = true;

  /**
   * One of "single" or "splitter", indicating the behavior of column resizing.
   * "single", resize a single column at a time.
   * "splitter", when adjusts the width of one column, the neighboring columns
   *    are also resized proportionally, maintaining the overall width.
   */
  @Prop() readonly columnResizeMode: "single" | "splitter" = "single";

  /**
   * An object that contains localized strings for the grid.
   */
  @Prop() readonly localization: GridLocalization;

  /**
   * Event emitted when the row selection is changed.
   */
  @Event() selectionChanged: EventEmitter<ChGridSelectionChangedEvent>;

  /**
   * Event emitted when the row marking is changed.
   */
  @Event() rowMarkingChanged: EventEmitter<ChGridMarkingChangedEvent>;

  /**
   * Event emitted when the cell selection is changed.
   */
  @Event() cellSelectionChanged: EventEmitter<ChGridCellSelectionChangedEvent>;

  /**
   * Event emitted when a row is clicked.
   */
  @Event() rowClicked: EventEmitter<ChGridRowClickedEvent>;

  /**
   * Event emitted when a row is double clicked.
   */
  @Event() rowDoubleClicked: EventEmitter<ChGridRowClickedEvent>;

  /**
   * Event emitted when Enter is pressed on a row.
   */
  @Event() rowEnterPressed: EventEmitter<ChGridRowPressedEvent>;

  /**
   * Event emitted when attempts to open a context menu on a row.
   */
  @Event() rowContextMenu: EventEmitter<ChGridRowContextMenuEvent>;

  componentWillLoad() {
    this.manager = new ChGridManager(this.el);
    this.gridStyle = this.manager.getGridStyle();
  }

  componentDidLoad() {
    this.manager.componentDidLoad(this.gridLayoutElement);
  }

  // @ts-expect-error: TODO: Fix this error
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

  @Listen("focus", { passive: true })
  focusHandler() {
    if (this.keyboardNavigationMode !== "none") {
      this.rowFocused ||= this.rowsSelected[0] ?? this.manager.getFirstRow();
      this.cellFocused = this.rowFocused?.getCell(
        this.cellSelected?.column || this.manager.getFirstColumn()
      );

      if (this.keyboardNavigationMode === "select") {
        this.selectByKeyboardEvent(false, false, "focus");
      }
    }
  }

  @Listen("blur", { passive: true })
  blurHandler(eventInfo: Event) {
    if (!eventInfo.composedPath().includes(this.el)) {
      this.rowFocused = null;
      this.cellFocused = null;
    }
  }

  @Listen("cellFocused", { passive: true })
  cellFocusedEventHandler(eventInfo: CustomEvent) {
    const cell = eventInfo.target as HTMLChGridCellElement;
    if (this.rowSelectionMode !== "none" && !cell.selected) {
      this.setCellSelected(cell);
    }
  }

  @Listen("keydown", { target: "window" })
  windowKeyDownHandler(eventInfo: KeyboardEvent) {
    if (
      focusComposedPath()[0] === this.el &&
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
    if (
      focusComposedPath()[0] === this.el &&
      this.keyboardNavigationMode !== "none"
    ) {
      const range = eventInfo.shiftKey;
      const append = mouseEventModifierKey(eventInfo);

      switch (eventInfo.key) {
        case " ":
          this.spacePressedEvent(
            mouseEventModifierKey(eventInfo),
            eventInfo.shiftKey
          );
          break;
        case "+":
          this.setRowCollapsed(this.rowFocused, false);
          break;
        case "-":
          this.setRowCollapsed(this.rowFocused, true);
          break;
        case "Home":
          this.moveByKeyboardEvent(
            this.manager.selection.moveFirstRow,
            range,
            append
          );
          break;
        case "End":
          this.moveByKeyboardEvent(
            this.manager.selection.moveLastRow,
            range,
            append
          );
          break;
        case "PageUp":
          this.moveByKeyboardEvent(
            this.manager.selection.movePreviousPageRow,
            range,
            append
          );
          break;
        case "PageDown":
          this.moveByKeyboardEvent(
            this.manager.selection.moveNextPageRow,
            range,
            append
          );
          break;
        case "ArrowUp":
          this.moveByKeyboardEvent(
            this.manager.selection.movePreviousRow,
            range,
            append
          );
          break;
        case "ArrowDown":
          this.moveByKeyboardEvent(
            this.manager.selection.moveNextRow,
            range,
            append
          );
          break;
        case "ArrowLeft":
          this.moveByKeyboardEvent(
            this.manager.selection.movePreviousCell,
            range,
            append
          );
          break;
        case "ArrowRight":
          this.moveByKeyboardEvent(
            this.manager.selection.moveNextCell,
            range,
            append
          );
          break;
        case "Enter":
          this.enterPressedHandler();
          break;
      }
    }
  }

  @Listen("mousemove", { passive: true })
  mouseMoveHandler(eventInfo: MouseEvent) {
    if (
      (this.rowHighlightEnabled === "auto" &&
        this.rowSelectionMode !== "none") ||
      this.rowHighlightEnabled === true
    ) {
      this.rowHighlighted =
        this.manager.getRowEventTarget(eventInfo) ||
        (this.manager.isRowActionsEventTarget(eventInfo)
          ? this.rowHighlighted
          : null);
    }

    selectingBlock: {
      if (this.manager.selection.selecting) {
        if (focusComposedPath()[0] !== this.el) {
          this.stopSelecting();
          break selectingBlock;
        }

        const row = this.manager.getRowEventTarget(eventInfo);
        const cell = this.manager.getCellEventTarget(eventInfo);

        if (
          row &&
          (this.manager.selection.selectingRow !== row ||
            this.manager.selection.selectingCell !== cell)
        ) {
          const isKeyModifierPressed = mouseEventModifierKey(eventInfo);
          const isMouseButtonRightPressed = mouseEventHasButtonPressed(
            eventInfo,
            MouseEventButtons.RIGHT
          );

          this.selectByPointerEvent(
            row,
            cell,
            isKeyModifierPressed && !isMouseButtonRightPressed,
            !isMouseButtonRightPressed,
            isMouseButtonRightPressed
          );

          this.manager.selection.selectingRow = row;
          this.manager.selection.selectingCell = cell;
        }
      }
    }
  }

  @Listen("mouseleave", { passive: true })
  mouseLeaveHandler() {
    this.rowHighlighted &&= null;
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
        eventInfo.shiftKey,
        eventInfo.button === MouseEventButton.RIGHT
      );
    }
  }

  @Listen("mouseup", { passive: true })
  mouseUpHandler() {
    if (this.manager.selection.selecting) {
      this.stopSelecting();
    }
    this.emitRowClicked(this.rowFocused, this.cellFocused);
  }

  @Listen("dblclick", { passive: true })
  dblclickHandler(eventInfo: MouseEvent) {
    const row = this.manager.getRowEventTarget(eventInfo);
    const cell = this.manager.getCellEventTarget(eventInfo);

    if (row) {
      this.rowDoubleClicked.emit({
        rowId: row.rowId,
        cellId: cell?.cellId,
        columnId: cell?.column.columnId
      });
    }
  }

  @Listen("touchstart", { passive: true })
  touchstartHandler(eventInfo: TouchEvent) {
    this.manager.selection.touchStart(eventInfo);
  }

  @Listen("touchend", { passive: false })
  touchendHandler(eventInfo: TouchEvent) {
    if (eventInfo.cancelable) {
      eventInfo.preventDefault();
    }

    if (this.manager.selection.isTouchEndSelection(eventInfo)) {
      const columnSelector = this.manager.columns.getColumnSelector();
      const row = this.manager.getRowEventTarget(eventInfo);
      const cell = this.manager.getCellEventTarget(eventInfo);

      if (row) {
        this.selectByPointerEvent(
          row,
          cell,
          columnSelector?.richRowSelectorMode !== "select",
          false,
          false
        );

        this.emitRowClicked(row, cell);
      }
    }
  }

  @Listen("contextmenu")
  contextmenuHandler(eventInfo: MouseEvent) {
    let targetRow: HTMLChGridRowElement;

    if (eventInfo.target === this.el) {
      targetRow = this.rowFocused;
    } else {
      targetRow = this.manager.getRowEventTarget(eventInfo);
    }

    if (targetRow) {
      const cellFocused =
        this.cellSelected?.row === targetRow ? this.cellSelected : null;

      const rowContextMenuEventInfo = this.rowContextMenu.emit({
        rowId: targetRow.rowId,
        cellId: cellFocused?.cellId,
        columnId: cellFocused?.column.columnId,
        selectedRowsId: this.rowsSelected.map(row => row.rowId),
        clientX: eventInfo.clientX,
        clientY: eventInfo.clientY
      });

      this.manager.rowActions.showOnRowContext?.openRowContext(
        eventInfo.clientX,
        eventInfo.clientY
      );

      if (
        rowContextMenuEventInfo.defaultPrevented ||
        this.manager.rowActions.showOnRowContext
      ) {
        eventInfo.preventDefault();
      }
    }
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
        eventInfo.detail.range,
        false
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

  @Listen("cellRowActionClicked", { passive: true })
  cellRowActionClickedHandler(eventInfo: CustomEvent) {
    const cell = eventInfo.target as HTMLChGridCellElement;
    this.manager.rowActions.showOnRowActions?.openRowActions(cell);
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

  @Listen("columnResizeStarted")
  columnResizeStartedHandler(eventInfo: CustomEvent<ChGridColumnResizeEvent>) {
    this.manager.columnResizeStart(eventInfo.detail.columnId);
  }

  @Listen("columnResizing")
  columnResizingHandler(eventInfo: CustomEvent<ChGridColumnResizeEvent>) {
    this.manager.columnResizing(eventInfo.detail.deltaWidth);
  }

  @Listen("columnResizeFinished")
  columnResizeFinishedHandler() {
    this.manager.columnResizeEnd();
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
    this.settingsUI.show = true;
  }

  @Listen("settingsCloseClicked")
  settingsCloseClickedHandler() {
    this.settingsUI.show = false;
  }

  /**
   * Retrieves the rowId of the currently focused row.
   */
  @Method()
  async getFocusedRow(): Promise<string> {
    return this.rowFocused?.rowId;
  }

  /**
   * Retrieves the rowId of the currently hovered row.
   */
  @Method()
  async getHoveredRow(): Promise<string> {
    return this.rowHighlighted?.rowId;
  }

  /**
   * Retrieves the list of rowId of the selected rows.
   */
  @Method()
  async getSelectedRows(): Promise<string[]> {
    return this.rowsSelected.map(row => row.rowId);
  }

  /**
   * Retrieves the list of rowId of the marked rows.
   */
  @Method()
  async getMarkedRows(): Promise<string[]> {
    return this.rowsMarked.map(row => row.rowId);
  }

  /**
   * Retrieves information about the currently focused cell.
   */
  @Method()
  async getFocusedCell(): Promise<{
    cellId: string;
    rowId: string;
    columnId: string;
  }> {
    return {
      cellId: this.cellFocused ? this.cellFocused.cellId : null,
      rowId: this.cellFocused ? this.cellFocused.row.rowId : null,
      columnId: this.cellFocused ? this.cellFocused.column.columnId : null
    };
  }

  /**
   * Retrieves information about the currently selected cell.
   */
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

  /**
   * Selects or deselects a row.
   * @param rowId - The rowId of the row to select or deselect.
   * @param selected - A boolean indicating whether to select or deselect the row.
   */
  @Method()
  async selectRow(rowId: string, selected = true): Promise<void> {
    const row = this.manager.getRow(rowId);

    if (row) {
      const { rowFocused, rowsSelected, cellFocused, cellSelected } =
        this.manager.selection.selectSet(
          {
            rowFocused: this.rowFocused,
            rowsSelected: this.rowsSelected,
            cellFocused: this.cellFocused,
            cellSelected: this.cellSelected
          },
          row,
          null,
          selected
        );

      this.rowFocused = rowFocused;
      this.rowsSelected = rowsSelected;
      this.cellFocused = cellFocused;
      this.cellSelected = cellSelected;

      rowFocused?.ensureVisible();
    }
  }

  /**
   * Selects or deselects all rows.
   * @param selected - A boolean indicating whether to select or deselect all rows.
   */
  @Method()
  async selectAllRows(selected = true): Promise<void> {
    this.selectAll(selected);
  }

  /**
   * Select or deselect a cell.
   * The cell can be identified by the cellId parameter or
   * by using the rowId and columnId pair.
   * @param cellId - The cellId of the cell to select or deselect.
   * @param rowId - The rowId of the row containing the cell.
   * @param columnId - The columnId of the column containing the cell.
   * @param selected - A boolean indicating whether to select or deselect the cell.
   */
  @Method()
  async selectCell(
    cellId?: string,
    rowId?: string,
    columnId?: string,
    selected = true
  ): Promise<void> {
    const cell = this.manager.getCell(cellId, rowId, columnId);

    if (cell) {
      this.setCellSelected(cell, selected);
    }
  }

  /**
   * Mark or unmark a row.
   * @param rowId - The rowId of the row to select or deselect.
   * @param marked - A boolean indicating whether to mark or unmark the row.
   */
  @Method()
  async markRow(rowId: string, marked = true): Promise<void> {
    const columnSelector = this.manager.columns.getColumnSelector();
    const row = this.manager.getRow(rowId);

    if (row && columnSelector?.richRowSelectorMode === "mark") {
      this.rowsMarked = this.manager.selection.markRow(
        row,
        marked,
        false,
        this.rowsMarked
      );
    }
  }

  /**
   * Mark or unmark all rows.
   * @param marked - A boolean indicating whether to mark or unmark all rows.
   */
  @Method()
  async markAllRows(marked = true): Promise<void> {
    const columnSelector = this.manager.columns.getColumnSelector();

    if (columnSelector?.richRowSelectorMode === "mark") {
      this.rowsMarked = this.manager.selection.markAllRows(marked);
    }
  }

  /**
   * Expands a row, showing its children.
   * @param rowId - The rowId of the row to expand.
   */
  @Method()
  async expandRow(rowId: string): Promise<void> {
    this.setRowCollapsed(this.manager.getRow(rowId), false);
  }

  /**
   * Collapses a row, hiding its children.
   * @param rowId - The rowId of the row to collapse.
   */
  @Method()
  async collapseRow(rowId: string): Promise<void> {
    this.setRowCollapsed(this.manager.getRow(rowId), true);
  }

  /**
   * Ensures that the row is visible within the control, scrolling the contents of the control if necessary.
   * @param rowId - The rowId of the row to ensure visibility.
   */
  @Method()
  async rowEnsureVisible(rowId: string): Promise<void> {
    const row = this.manager.getRow(rowId);

    if (row) {
      this.manager.ensureRowVisible(row);
    }
  }

  /**
   * Ensures that the cell is visible within the control, scrolling the contents of the control if necessary.
   * @param cellId - The cellId of the cell to ensure visibility.
   */
  @Method()
  async cellEnsureVisible(cellId: string): Promise<void> {
    const cell = this.manager.getCell(cellId);

    if (cell) {
      this.manager.ensureCellVisible(cell);
    }
  }

  /**
   * Retrieves the rowId of the previous row relative to the currently selected cell.
   */
  @Method()
  async getPreviousRow(): Promise<string | void> {
    const currentRow = this.cellSelected?.row;

    if (currentRow) {
      return this.manager.getPreviousRow(currentRow)?.rowId || null;
    }
  }

  /**
   * Retrieves the rowId of the next row relative to the currently selected cell.
   */
  @Method()
  async getNextRow(): Promise<string | void> {
    const currentRow = this.cellSelected?.row;

    if (currentRow) {
      return this.manager.getNextRow(currentRow)?.rowId || null;
    }
  }

  /**
   * Retrieves information about the previous cell relative to the currently selected cell.
   */
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

  /**
   * Retrieves information about the next cell relative to the currently selected cell.
   */
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

  /**
   * Synchronizes the state of a row in the grid.
   */
  @Method()
  async syncRowState(el: HTMLElement) {
    const row = el as HTMLChGridRowElement;
    const columnSelector = this.manager.columns.getColumnSelector();

    if (this.rowSelectionMode !== "none") {
      this.syncRowStateSelected(row);
    }
    if (columnSelector?.richRowSelectorMode === "mark") {
      this.syncRowStateMarked(row);
    }

    if (columnSelector) {
      this.syncRowStateSelector(row, columnSelector);

      if (columnSelector.richRowSelectorMode === "select") {
        this.manager.selection.syncColumnSelector(
          this.rowsSelected.length,
          columnSelector
        );
      } else if (columnSelector.richRowSelectorMode === "mark") {
        this.manager.selection.syncColumnSelector(
          this.rowsMarked.length,
          columnSelector
        );
      }
    }
  }

  private syncRowStateSelected(row: HTMLChGridRowElement) {
    if (row.selected && this.rowSelectionMode === "single") {
      this.rowsSelected[0] = row;
    }
    if (
      row.selected &&
      this.rowSelectionMode === "multiple" &&
      !this.rowsSelected.includes(row)
    ) {
      this.rowsSelected.push(row);
    }

    if (!row.selected) {
      const index = this.rowsSelected.indexOf(row);

      if (index !== -1) {
        this.rowsSelected.splice(index, 1);
      }
    }
  }

  private syncRowStateMarked(row: HTMLChGridRowElement) {
    if (row.marked && !this.rowsMarked.includes(row)) {
      this.rowsMarked.push(row);
    }

    if (!row.marked) {
      const index = this.rowsMarked.indexOf(row);

      if (index !== -1) {
        this.rowsMarked.splice(index, 1);
      }
    }
  }

  private syncRowStateSelector(
    row: HTMLChGridRowElement,
    columnSelector: HTMLChGridColumnElement
  ) {
    const cell = row.getCell(columnSelector);
    const value =
      (columnSelector.richRowSelectorMode === "select" && row.selected) ||
      (columnSelector.richRowSelectorMode === "mark" && row.marked);

    cell.setSelectorChecked(value);
  }

  private getChangedEventDetail(
    rows: HTMLChGridRowElement[],
    previous: HTMLChGridRowElement[]
  ): ChGridSelectionChangedEvent | ChGridMarkingChangedEvent {
    return {
      rowsId: rows.map(row => row.rowId),
      addedRowsId: rows
        .filter(row => !previous.includes(row))
        .map(row => row.rowId),
      removedRowsId: previous
        .filter(row => !rows.includes(row))
        .map(row => row.rowId),
      unalteredRowsId: rows
        .filter(row => previous.includes(row))
        .map(row => row.rowId)
    };
  }

  private enterPressedHandler() {
    if (this.rowFocused) {
      this.rowEnterPressed.emit({
        rowId: this.rowFocused.rowId,
        cellId: this.cellFocused ? this.cellFocused.cellId : null,
        columnId: this.cellFocused ? this.cellFocused.column.columnId : null
      });
    }
  }

  private spacePressedEvent(ctrl: boolean, shift: boolean) {
    if (this.keyboardNavigationMode === "focus") {
      this.selectByKeyboardEvent(ctrl, shift, "last-selected");
    } else if (this.keyboardNavigationMode === "select") {
      this.markByKeyboardEvent();
    }

    this.emitRowClicked(this.rowFocused, this.cellFocused);
  }

  private markByKeyboardEvent() {
    const columnSelector = this.manager.columns.getColumnSelector();

    if (columnSelector?.richRowSelectorMode === "mark") {
      this.rowsMarked = this.manager.selection.markRows(
        this.rowFocused,
        this.rowsMarked,
        this.rowsSelected
      );
    }
  }

  private selectByKeyboardEvent(
    append: boolean,
    range: boolean,
    rangeStartOn: "focus" | "last-selected"
  ) {
    const { rowFocused, rowsSelected, cellFocused, cellSelected } =
      this.manager.selection.select(
        {
          rowFocused: this.rowFocused,
          rowsSelected: this.rowsSelected,
          cellFocused: this.cellFocused,
          cellSelected: this.cellSelected
        },
        this.rowFocused,
        this.cellFocused,
        true,
        append,
        range,
        rangeStartOn,
        false
      );

    this.rowFocused = rowFocused;
    this.rowsSelected = rowsSelected;
    this.cellFocused = cellFocused;
    this.cellSelected = cellSelected;

    (cellFocused || rowFocused)?.ensureVisible();
  }

  private selectByPointerEvent(
    row: HTMLChGridRowElement,
    cell: HTMLChGridCellElement,
    append: boolean,
    range: boolean,
    context: boolean
  ) {
    const { rowFocused, rowsSelected, cellFocused, cellSelected } =
      this.manager.selection.select(
        {
          rowFocused: this.rowFocused,
          rowsSelected: this.rowsSelected,
          cellFocused: this.cellFocused,
          cellSelected: this.cellSelected
        },
        row,
        cell,
        true,
        append,
        range,
        "last-selected",
        context
      );

    this.rowFocused = rowFocused;
    this.rowsSelected = rowsSelected;
    this.cellFocused = cellFocused;
    this.cellSelected = cellSelected;

    (cellFocused || rowFocused)?.ensureVisible();
  }

  private moveByKeyboardEvent(
    fn: (
      state: ManagerSelectionState,
      select: boolean,
      range: boolean,
      append: boolean
    ) => ManagerSelectionState,
    range: boolean,
    append: boolean
  ) {
    const { rowFocused, rowsSelected, cellFocused, cellSelected } = fn.call(
      this.manager.selection,
      {
        rowFocused: this.rowFocused,
        rowsSelected: this.rowsSelected,
        cellFocused: this.cellFocused,
        cellSelected: this.cellSelected
      },
      this.rowSelectionMode !== "none" &&
        this.keyboardNavigationMode === "select",
      this.rowSelectionMode === "multiple" ? range : false,
      this.rowSelectionMode === "multiple" ? range && append : false
    );

    this.rowFocused = rowFocused;
    this.rowsSelected = rowsSelected;
    this.cellFocused = cellFocused;
    this.cellSelected = cellSelected;

    (cellFocused || rowFocused)?.ensureVisible();
  }

  private selectAll(value = true) {
    const { rowFocused, rowsSelected, cellFocused, cellSelected } =
      this.manager.selection.selectAll(
        {
          rowFocused: this.rowFocused,
          rowsSelected: this.rowsSelected,
          cellFocused: this.cellFocused,
          cellSelected: this.cellSelected
        },
        value
      );

    this.rowFocused = rowFocused;
    this.rowsSelected = rowsSelected;
    this.cellFocused = cellFocused;
    this.cellSelected = cellSelected;

    (cellFocused || rowFocused)?.ensureVisible();
  }

  private setRowCollapsed(row: HTMLChGridRowElement, collapsed: boolean) {
    if (row && collapsed) {
      if (row && row.hasChildRows) {
        row.collapsed = true;
      }
    } else if (row && !collapsed) {
      row.collapsed = false;
    }
  }

  private setCellSelected(cell: HTMLChGridCellElement, selected = true) {
    const { rowFocused, rowsSelected, cellFocused, cellSelected } =
      this.manager.selection.selectSet(
        {
          rowFocused: this.rowFocused,
          rowsSelected: this.rowsSelected,
          cellFocused: this.cellFocused,
          cellSelected: this.cellSelected
        },
        cell.row,
        cell,
        selected
      );

    this.rowFocused = rowFocused;
    this.rowsSelected = rowsSelected;
    this.cellFocused = cellFocused;
    this.cellSelected = cellSelected;

    (cellFocused || rowFocused)?.ensureVisible();
  }

  private emitRowClicked(
    row: HTMLChGridRowElement,
    cell: HTMLChGridCellElement
  ) {
    this.rowClicked.emit({
      rowId: row.rowId,
      cellId: cell?.cellId,
      columnId: cell?.column.columnId
    });
  }

  private stopSelecting() {
    this.manager.selection.selecting = false;
    this.manager.selection.selectingRow = null;
    this.manager.selection.selectingCell = null;
  }

  private renderSettings() {
    return (
      <ch-grid-settings
        grid={this.el}
        ref={el => (this.settingsUI = el)}
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

  render() {
    return (
      <Host tabindex={this.keyboardNavigationMode !== "none" ? "0" : false}>
        <header part="header">
          <slot name="header"></slot>
        </header>
        <section
          class="main"
          style={this.gridStyle}
          part="main"
          ref={el => (this.gridLayoutElement = el)}
        >
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
}

export interface GridLocalization {
  settingsCaption: string;
  settingsCloseText: string;
  settingsCloseTooltip: string;
}
