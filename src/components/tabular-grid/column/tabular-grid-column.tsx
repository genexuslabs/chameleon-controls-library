import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  Watch,
  h,
  Listen
} from "@stencil/core";
import {
  TabularGridColumnDragEvent,
  TabularGridColumnFreezeChangedEvent,
  TabularGridColumnHiddenChangedEvent,
  TabularGridColumnOrderChangedEvent,
  TabularGridColumnSelectorClickedEvent,
  TabularGridColumnSizeChangedEvent,
  TabularGridColumnSortChangedEvent,
  TabularGridColumnFreeze,
  TabularGridColumnSortDirection
} from "./tabular-grid-column-types";

/**
 * The `ch-tabular-grid-column` component represents a grid column.
 */
@Component({
  tag: "ch-tabular-grid-column",
  styleUrl: "tabular-grid-column.scss",
  shadow: true
})
export class ChTabularGridColumn {
  private dragging = false;
  private dragMouseMoveFn = this.dragMouseMoveHandler.bind(this);
  private dragMouseMoveStartPositionX: number;

  @Element() el: HTMLChTabularGridColumnElement;

  /**
   * A unique identifier for the column.
   */
  @Prop() readonly columnId: string;

  /**
   * One of "plain", "rich", or "tree", indicating the type of cell displayed in the column.
   */
  @Prop() readonly columnType: "plain" | "rich" | "tree" = "plain";

  /**
   * @deprecated Use "columnImage" or "columnImageSet" instead.
   * A URL to an icon to display in the column header.
   */
  @Prop() readonly columnIconUrl: string;

  /**
   * A URL to an icon to display in the column header.
   */
  @Prop() readonly columnImage: string;

  /**
   * A URL to an icon to display in the column header.
   */
  @Prop() readonly columnImageSet: string;

  /**
   * The text to display in the column header and settings.
   */
  @Prop() readonly columnName: string;

  /**
   * Indicates whether the text in the column header is visible or not
   */
  @Prop() readonly columnNameHidden: boolean;

  /**
   * The text to display when the cursor is placed over the column header.
   */
  @Prop() readonly columnTooltip: string;

  /**
   * @deprecated Use "columnTooltip" and "columnNameHidden" instead.
   * One of "text" or "title", indicating whether the `columnName` should be displayed as the column text or as tooltip of the column image.
   */
  @Prop() readonly columnNamePosition: "text" | "title" = "text";

  /**
   * A boolean value indicating whether the column cells are draggable to reorder the grid rows (only applicable for columnType="rich").
   */
  @Prop() readonly richRowDrag: boolean;

  /**
   * A boolean indicating whether the column cells in the grid should have a checkbox selector (only applicable for columnType="rich").
   */
  @Prop() readonly richRowSelector: boolean;

  /**
   * One of "select" or "mark", indicating the mode of rich row selector.
   * "select" indicates that the row selector is bound to the row selection.
   * "mark" allows to mark a row independently of the selection.
   */
  @Prop() readonly richRowSelectorMode: "select" | "mark" = "select";

  /**
   * Indicate the state of the rich row selector.
   * "" indicates that all rows are unchecked.
   * "checked" indicates that all rows are checked.
   * "indeterminate" indicates that some rows are marked.
   */
  @Prop({ mutable: true }) richRowSelectorState:
    | ""
    | "checked"
    | "indeterminate" = "";

  /**
   * A boolean indicating whether the column cells in the grid should have a set of action buttons (only applicable for columnType="rich").
   */
  @Prop() readonly richRowActions: boolean;

  /**
   * A CSS class name to apply to the display observer element used to detect changes in the column visibility.
   */
  @Prop() readonly displayObserverClass: string;

  /**
   * One of "left" or "right", indicating whether the column should be "frozen" (i.e. remain visible when the user scrolls horizontally).
   */
  @Prop() readonly freeze?: TabularGridColumnFreeze;

  @Watch("freeze")
  freezeHandler() {
    this.columnFreezeChanged.emit({
      columnId: this.columnId,
      freeze: this.freeze
    });
  }

  /**
   * A boolean indicating whether the column should be hidden.
   * The user can display it from the grid settings.
   */
  @Prop({ reflect: true }) readonly hidden: boolean = false;

  @Watch("hidden")
  hiddenHandler() {
    this.columnHiddenChanged.emit({
      columnId: this.columnId,
      hidden: this.hidden
    });
  }

  /**
   * A boolean indicating whether the column should be hideable (i.e. whether the user should be able to show/hide the column).
   */
  @Prop() readonly hideable: boolean = true;

  /**
   * A number indicating the order in which the column should appear.
   */
  @Prop({ reflect: true }) readonly order: number;

  @Watch("order")
  orderHandler() {
    this.columnOrderChanged.emit({
      columnId: this.columnId,
      order: this.order
    });
  }

  /**
   * A number indicating the physical order of the column (i.e. its position in the DOM).
   */
  @Prop() readonly physicalOrder: number;

  /**
   * A string indicating the width of the column.
   * Any value supported by the "grid-template-columns" CSS property is valid.
   */
  @Prop({ reflect: true }) readonly size: string;

  @Watch("size")
  sizeHandler() {
    this.columnSizeChanging.emit({
      columnId: this.columnId,
      size: this.size
    });
  }

  /**
   * A boolean indicating whether the column should be resizable (i.e. whether the user should be able to drag its width).
   */
  @Prop() readonly resizable: boolean = true;

  /**
   * A boolean indicating whether the column is currently being resized.
   */
  @Prop({ reflect: true, mutable: true }) resizing: boolean;

  /**
   * A boolean indicating whether the column should be sortable (i.e. whether the user should be able to click the column header to sort the data).
   */
  @Prop() readonly sortable: boolean = true;

  /**
   * A boolean indicating whether the user should be able to open a settings panel for the column.
   */
  @Prop() readonly settingable: boolean = true;

  /**
   * One of "asc" or "desc", indicating the current sort direction.
   */
  @Prop({ mutable: true, reflect: true })
  sortDirection?: TabularGridColumnSortDirection;

  @Watch("sortDirection")
  sortDirectionHandler() {
    if (this.sortDirection) {
      this.columnSortChanged.emit({
        columnId: this.columnId,
        sortDirection: this.sortDirection
      });
    }
  }

  /**
   * A boolean indicating whether the settings panel for the column should be visible.
   */
  @Prop({ reflect: true, mutable: true }) showSettings = false;

  /**
   * Event emitted when the `hidden` property is changed.
   */
  @Event()
  columnHiddenChanged: EventEmitter<TabularGridColumnHiddenChangedEvent>;

  /**
   * Event emitted when the `size` property is currently being changed (i.e. when the user is dragging to resize the column).
   */
  @Event() columnSizeChanging: EventEmitter<TabularGridColumnSizeChangedEvent>;

  /**
   * Event emitted when the `size` property has been changed (i.e. when the user finishes dragging to resize the column).
   */
  @Event() columnSizeChanged: EventEmitter<TabularGridColumnSizeChangedEvent>;

  /**
   * Event emitted when the `order` property is changed.
   */
  @Event() columnOrderChanged: EventEmitter<TabularGridColumnOrderChangedEvent>;

  /**
   * Event emitted when the `sortDirection` property is changed.
   */
  @Event() columnSortChanged: EventEmitter<TabularGridColumnSortChangedEvent>;

  /**
   * Event emitted when the `freeze` property is changed.
   */
  @Event()
  columnFreezeChanged: EventEmitter<TabularGridColumnFreezeChangedEvent>;

  /**
   * Event emitted when the user is dragging the column header to move it.
   */
  @Event() columnDragStarted: EventEmitter<TabularGridColumnDragEvent>;

  /**
   * Event emitted when the user is dragging the column header to move it.
   */
  @Event() columnDragging: EventEmitter<TabularGridColumnDragEvent>;

  /**
   * Event emitted when the user stops dragging the column header to move it.
   */
  @Event() columnDragEnded: EventEmitter<TabularGridColumnDragEvent>;

  /**
   * Event emitted when the user clicks the row selector checkbox (only applicable for `richRowSelector="true"`.
   */
  @Event()
  columnSelectorClicked: EventEmitter<TabularGridColumnSelectorClickedEvent>;

  componentDidLoad() {
    this.el.addEventListener("mousedown", this.mousedownHandler.bind(this));
  }

  @Listen("click", { passive: true })
  clickHandler() {
    if (!this.dragging) {
      if (this.sortable) {
        this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
      }
    } else {
      this.dragging = false;
    }
  }

  @Listen("columnResizeStarted")
  columnResizeStartedHandler() {
    this.resizing = true;
  }

  @Listen("columnResizeFinished")
  columnResizeFinishedHandler() {
    this.resizing = false;

    this.columnSizeChanged.emit({
      columnId: this.columnId,
      size: this.size
    });
  }

  private allowColumnReorder(): boolean {
    return this.el.closest("ch-tabular-grid").allowColumnReorder;
  }

  private mousedownHandler(eventInfo: MouseEvent) {
    eventInfo.preventDefault();
    eventInfo.stopPropagation();

    if (this.allowColumnReorder()) {
      this.dragMouseDownHandler(eventInfo);

      document.addEventListener("mousemove", this.dragMouseMoveFn, {
        passive: true
      });
      document.addEventListener("mouseup", this.dragMouseUpHandler.bind(this), {
        once: true
      });
    }
  }

  private dragMouseDownHandler(eventInfo: MouseEvent) {
    this.dragMouseMoveStartPositionX = eventInfo.pageX;
    this.columnDragStarted.emit({ columnId: this.columnId });
  }

  private dragMouseMoveHandler(eventInfo: MouseEvent) {
    if (
      this.dragging ||
      Math.abs(this.dragMouseMoveStartPositionX - eventInfo.pageX) > 5
    ) {
      this.dragging = true;

      this.columnDragging.emit({
        columnId: this.columnId,
        positionX: eventInfo.pageX,
        direction: eventInfo.movementX > 0 ? "right" : "left"
      });
    }
  }

  private dragMouseUpHandler() {
    document.removeEventListener("mousemove", this.dragMouseMoveFn);
    this.columnDragEnded.emit({ columnId: this.columnId });
  }

  private settingsMouseDownHandler(eventInfo: MouseEvent) {
    eventInfo.stopPropagation();
  }

  private settingsClickHandler = (eventInfo: MouseEvent) => {
    eventInfo.stopPropagation();
    this.showSettings = true;
  };

  private selectorClickHandler = (eventInfo: MouseEvent) => {
    const target = eventInfo.target as HTMLInputElement;

    this.richRowSelectorState = target.checked ? "checked" : "";
    this.columnSelectorClicked.emit({
      checked: target.checked
    });

    eventInfo.stopPropagation();
  };

  private selectorTouchEndHandler = (eventInfo: TouchEvent) => {
    eventInfo.stopPropagation();
  };

  render() {
    return (
      <Host>
        <ul class="bar" part="bar">
          {this.renderSelector()}
          {this.renderName()}
          {this.renderSort()}
          {this.renderSettings()}
          {this.renderResize()}
        </ul>
        <ch-tabular-grid-column-settings
          column={this.el}
          onMouseDown={this.settingsMouseDownHandler}
          show={this.showSettings}
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
          <slot name="settings"></slot>
        </ch-tabular-grid-column-settings>
      </Host>
    );
  }

  private renderSelector() {
    return (
      <li
        class="selector"
        part="bar-selector"
        hidden={!(this.columnType === "rich" && this.richRowSelector)}
      >
        <label part="selector-label">
          <input
            type="checkbox"
            part={["selector", this.richRowSelectorState]
              .filter(part => part !== "")
              .join(" ")}
            onClick={this.selectorClickHandler}
            onTouchEnd={this.selectorTouchEndHandler}
            checked={this.richRowSelectorState === "checked"}
            indeterminate={this.richRowSelectorState === "indeterminate"}
          />
        </label>
      </li>
    );
  }

  private renderName() {
    return (
      <li
        class="name"
        part="bar-name"
        title={
          this.columnTooltip ||
          (this.columnNamePosition === "title" ? this.columnName : null)
        }
      >
        {this.columnIconUrl || this.columnImage || this.columnImageSet ? (
          <img
            class="name-icon"
            part="bar-name-icon"
            src={this.columnImage || this.columnIconUrl}
            srcSet={this.columnImageSet}
          />
        ) : (
          <div class="name-icon" part="bar-name-icon"></div>
        )}
        <span
          class="name-text"
          part="bar-name-text"
          hidden={this.columnNameHidden || this.columnNamePosition !== "text"}
        >
          {this.columnName}
        </span>
      </li>
    );
  }

  private renderSort() {
    return (
      <li class="sort" part="bar-sort" hidden={!this.sortable}>
        <div class="sort-asc" part="bar-sort-ascending"></div>
        <div class="sort-desc" part="bar-sort-descending"></div>
      </li>
    );
  }

  private renderSettings() {
    return (
      <li class="settings" part="bar-settings" hidden={!this.settingable}>
        <button
          class="button"
          part="bar-settings-button"
          onClick={this.settingsClickHandler}
        ></button>
      </li>
    );
  }

  private renderResize() {
    return (
      <li class="resize" part="bar-resize" hidden={!this.resizable}>
        <ch-tabular-grid-column-resize
          column={this.el}
          class="resize-split"
          part="bar-resize-split"
        ></ch-tabular-grid-column-resize>
      </li>
    );
  }
}
