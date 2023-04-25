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
  ChGridColumnDragEvent,
  ChGridColumnFreezeChangedEvent,
  ChGridColumnHiddenChangedEvent,
  ChGridColumnOrderChangedEvent,
  ChGridColumnSelectorClickedEvent,
  ChGridColumnSizeChangedEvent,
  ChGridColumnSortChangedEvent,
  ChGridColumnFreeze,
  ChGridColumnSortDirection
} from "./ch-grid-column-types";

/**
 * The `ch-grid-column` component represents a grid column.
 */
@Component({
  tag: "ch-grid-column",
  styleUrl: "ch-grid-column.scss",
  shadow: true
})
export class ChGridColumn {
  @Element() el: HTMLChGridColumnElement;

  /**
   * A unique identifier for the column.
   */
  @Prop() readonly columnId: string;

  /**
   * One of "plain", "rich", or "tree", indicating the type of cell displayed in the column.
   */
  @Prop() readonly columnType: "plain" | "rich" | "tree" = "plain";

  /**
   * A URL to an icon to display in the column header.
   */
  @Prop() readonly columnIconUrl: string;

  /**
   * The text to display in the column header.
   */
  @Prop() readonly columnName: string;

  /**
   * One of "text" or "title", indicating whether the `columnName` should be displayed as the column text or as tooltip of the column icon.
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
  @Prop() readonly freeze?: ChGridColumnFreeze;

  /**
   * A boolean indicating whether the column should be hidden.
   * The user can display it from the grid settings.
   */
  @Prop({ reflect: true }) readonly hidden: boolean = false;

  /**
   * A boolean indicating whether the column should be hideable (i.e. whether the user should be able to show/hide the column).
   */
  @Prop() readonly hideable: boolean = true;

  /**
   * A number indicating the order in which the column should appear.
   */
  @Prop({ reflect: true }) readonly order: number;

  /**
   * A number indicating the physical order of the column (i.e. its position in the DOM).
   */
  @Prop() readonly physicalOrder: number;

  /**
   * A string indicating the width of the column.
   * Any value supported by the "grid-template-columns" CSS property is valid.
   */
  @Prop() readonly size: string;

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
  sortDirection?: ChGridColumnSortDirection;

  /**
   * A boolean indicating whether the settings panel for the column should be visible.
   */
  @Prop({ reflect: true, mutable: true }) showSettings = false;

  /**
   * Event emitted when the `hidden` property is changed.
   */
  @Event() columnHiddenChanged: EventEmitter<ChGridColumnHiddenChangedEvent>;

  /**
   * Event emitted when the `size` property is currently being changed (i.e. when the user is dragging to resize the column).
   */
  @Event() columnSizeChanging: EventEmitter<ChGridColumnSizeChangedEvent>;

  /**
   * Event emitted when the `size` property has been changed (i.e. when the user finishes dragging to resize the column).
   */
  @Event() columnSizeChanged: EventEmitter<ChGridColumnSizeChangedEvent>;

  /**
   * Event emitted when the `order` property is changed.
   */
  @Event() columnOrderChanged: EventEmitter<ChGridColumnOrderChangedEvent>;

  /**
   * Event emitted when the `sortDirection` property is changed.
   */
  @Event() columnSortChanged: EventEmitter<ChGridColumnSortChangedEvent>;

  /**
   * Event emitted when the `freeze` property is changed.
   */
  @Event() columnFreezeChanged: EventEmitter<ChGridColumnFreezeChangedEvent>;

  /**
   * Event emitted when the user is dragging the column header to move it.
   */
  @Event() columnDragStarted: EventEmitter<ChGridColumnDragEvent>;

  /**
   * Event emitted when the user is dragging the column header to move it.
   */
  @Event() columnDragging: EventEmitter<ChGridColumnDragEvent>;

  /**
   * Event emitted when the user stops dragging the column header to move it.
   */
  @Event() columnDragEnded: EventEmitter<ChGridColumnDragEvent>;

  /**
   * Event emitted when the user clicks the row selector checkbox (only applicable for `richRowSelector="true"`.
   */
  @Event()
  columnSelectorClicked: EventEmitter<ChGridColumnSelectorClickedEvent>;

  private dragging = false;
  private dragMouseMoveFn = this.dragMouseMoveHandler.bind(this);
  private dragMouseMoveStartPositionX: number;

  componentDidLoad() {
    this.el.addEventListener("mousedown", this.mousedownHandler.bind(this));
  }

  @Watch("size")
  sizeHandler() {
    this.columnSizeChanging.emit({
      columnId: this.columnId,
      size: this.size
    });
  }

  @Watch("hidden")
  hiddenHandler() {
    this.columnHiddenChanged.emit({
      columnId: this.columnId,
      hidden: this.hidden
    });
  }

  @Watch("order")
  orderHandler() {
    this.columnOrderChanged.emit({
      columnId: this.columnId,
      order: this.order
    });
  }

  @Watch("freeze")
  freezeHandler() {
    this.columnFreezeChanged.emit({
      columnId: this.columnId,
      freeze: this.freeze
    });
  }

  @Watch("sortDirection")
  sortDirectionHandler() {
    if (this.sortDirection) {
      this.columnSortChanged.emit({
        columnId: this.columnId,
        sortDirection: this.sortDirection
      });
    }
  }

  @Listen("click", { passive: true })
  clickHandler() {
    if (!this.dragging) {
      if (this.sortable) {
        this.sortDirection = this.sortDirection == "asc" ? "desc" : "asc";
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

  private mousedownHandler(eventInfo: MouseEvent) {
    eventInfo.preventDefault();
    eventInfo.stopPropagation();

    this.dragMouseDownHandler(eventInfo);

    document.addEventListener("mousemove", this.dragMouseMoveFn, {
      passive: true
    });
    document.addEventListener("mouseup", this.dragMouseUpHandler.bind(this), {
      once: true
    });
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

    this.columnSelectorClicked.emit({
      checked: target.checked
    });

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
        <ch-grid-column-settings
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
        </ch-grid-column-settings>
      </Host>
    );
  }

  private renderSelector() {
    return (
      <li
        class="selector"
        part="bar-selector"
        hidden={!(this.columnType == "rich" && this.richRowSelector)}
      >
        <label part="selector-label">
          <input
            type="checkbox"
            part="selector"
            onClick={this.selectorClickHandler}
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
        title={this.columnNamePosition == "title" ? this.columnName : null}
      >
        {this.columnIconUrl ? (
          <img
            class="name-icon"
            part="bar-name-icon"
            src={this.columnIconUrl}
          />
        ) : (
          <div class="name-icon" part="bar-name-icon"></div>
        )}
        <span
          class="name-text"
          part="bar-name-text"
          hidden={this.columnNamePosition != "text"}
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
        <ch-grid-column-resize
          column={this.el}
          class="resize-split"
          part="bar-resize-split"
        ></ch-grid-column-resize>
      </li>
    );
  }
}
