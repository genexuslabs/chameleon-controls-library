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

@Component({
  tag: "ch-grid-column",
  styleUrl: "ch-grid-column.scss",
  shadow: true
})
export class ChGridColumn {
  @Element() el: HTMLChGridColumnElement;
  @Event() columnHiddenChanged: EventEmitter<ChGridColumnHiddenChangedEvent>;
  @Event() columnSizeChanging: EventEmitter<ChGridColumnSizeChangedEvent>;
  @Event() columnSizeChanged: EventEmitter<ChGridColumnSizeChangedEvent>;
  @Event() columnOrderChanged: EventEmitter<ChGridColumnOrderChangedEvent>;
  @Event() columnSortChanged: EventEmitter<ChGridColumnSortChangedEvent>;
  @Event() columnFreezeChanged: EventEmitter<ChGridColumnFreezeChangedEvent>;
  @Event() columnDragStarted: EventEmitter<ChGridColumnDragEvent>;
  @Event() columnDragging: EventEmitter<ChGridColumnDragEvent>;
  @Event() columnDragEnded: EventEmitter<ChGridColumnDragEvent>;
  @Event()
  columnSelectorClicked: EventEmitter<ChGridColumnSelectorClickedEvent>;
  @Prop() readonly columnId: string;
  @Prop() readonly columnType: "plain" | "rich" | "tree" = "plain";
  @Prop() readonly columnIconUrl: string;
  @Prop() readonly columnName: string;
  @Prop() readonly columnNamePosition: "title" | "text" = "text";
  @Prop() readonly richRowDrag: boolean;
  @Prop() readonly richRowSelector: boolean;
  @Prop() readonly richRowActions: boolean;
  @Prop() readonly displayObserverClass: string;
  @Prop() readonly freeze?: ChGridColumnFreeze;
  @Prop({ reflect: true }) readonly hidden = false;
  @Prop() readonly hideable = true;
  @Prop({ reflect: true }) readonly order: number;
  @Prop() readonly physicalOrder: number;
  @Prop() readonly size: string;
  @Prop() readonly resizable = true;
  @Prop({ reflect: true }) readonly resizing: boolean;
  @Prop() readonly sortable = true;
  @Prop() readonly settingable = true;
  @Prop({ mutable: true, reflect: true })
  sortDirection?: ChGridColumnSortDirection;
  @Prop({ reflect: true }) readonly showSettings = false;

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

  @Listen("columnResizeFinished")
  columnResizeFinishedHandler() {
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

  private settingsClickHandler(eventInfo: MouseEvent) {
    eventInfo.stopPropagation();
    this.showSettings = true;
  }

  private selectorClickHandler(eventInfo: MouseEvent) {
    const target = eventInfo.target as HTMLInputElement;

    this.columnSelectorClicked.emit({
      checked: target.checked
    });

    eventInfo.stopPropagation();
  }

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
          column={this}
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
            onClick={this.selectorClickHandler.bind(this)}
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
          onClick={this.settingsClickHandler.bind(this)}
        ></button>
      </li>
    );
  }

  private renderResize() {
    return (
      <li class="resize" part="bar-resize" hidden={!this.resizable}>
        <ch-grid-column-resize
          column={this}
          class="resize-split"
          part="bar-resize-split"
        ></ch-grid-column-resize>
      </li>
    );
  }
}
