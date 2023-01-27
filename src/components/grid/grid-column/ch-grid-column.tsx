import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  Watch,
  h,
  Listen,
} from "@stencil/core";
import {
  ChGridColumnDragEvent,
  ChGridColumnHiddenChangedEvent,
  ChGridColumnOrderChangedEvent,
  ChGridColumnSelectorClickedEvent,
  ChGridColumnSizeChangedEvent,
  ChGridColumnSortChangedEvent,
  ColumnSortDirection,
} from "./ch-grid-column-types";

@Component({
  tag: "ch-grid-column",
  styleUrl: "ch-grid-column.scss",
  shadow: true,
})
export class ChGridColumn {
  @Element() el: HTMLChGridColumnElement;
  @Event() columnHiddenChanged: EventEmitter<ChGridColumnHiddenChangedEvent>;
  @Event() columnSizeChanging: EventEmitter<ChGridColumnSizeChangedEvent>;
  @Event() columnSizeChanged: EventEmitter<ChGridColumnSizeChangedEvent>;
  @Event() columnOrderChanged: EventEmitter<ChGridColumnOrderChangedEvent>;
  @Event() columnSortChanged: EventEmitter<ChGridColumnSortChangedEvent>;
  @Event() columnDragStarted: EventEmitter<ChGridColumnDragEvent>;
  @Event() columnDragging: EventEmitter<ChGridColumnDragEvent>;
  @Event() columnDragEnded: EventEmitter<ChGridColumnDragEvent>;
  @Event() columnSelectorClicked: EventEmitter<ChGridColumnSelectorClickedEvent>;
  @Prop() columnId: string;
  @Prop() columnType: "plain" | "rich" | "tree" = "plain";
  @Prop() columnIconUrl: string;
  @Prop() columnName: string;
  @Prop() columnNamePosition: "title" | "text" = "text";
  @Prop() richRowDrag: boolean;
  @Prop() richRowSelector: boolean;
  @Prop() richRowActions: boolean;
  @Prop() displayObserverClass: string;
  @Prop() freeze?: "start" | "end";
  @Prop({ reflect: true }) hidden = false;
  @Prop() hideable = true;
  @Prop({ reflect: true }) order: number;
  @Prop() physicalOrder: number;
  @Prop() size: string;
  @Prop() resizable: boolean = true;
  @Prop({ reflect: true }) resizing: boolean;
  @Prop() sortable: boolean = true;
  @Prop() settingable: boolean = true;
  @Prop({ mutable: true, reflect: true }) sortDirection?: ColumnSortDirection;
  @Prop({ reflect: true }) showSettings = false;

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
      size: this.size,
    });
  }

  @Watch("hidden")
  hiddenHandler() {
    this.columnHiddenChanged.emit({
      columnId: this.columnId,
      hidden: this.hidden,
    });
  }

  @Watch("order")
  orderHandler() {
    this.columnOrderChanged.emit({
      columnId: this.columnId,
      order: this.order,
    });
  }

  @Watch("sortDirection")
  sortDirectionHandler() {
    if (this.sortDirection) {
      this.columnSortChanged.emit({
        columnId: this.columnId,
        sortDirection: this.sortDirection,
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
      size: this.size,
    });
  }

  private mousedownHandler(eventInfo: MouseEvent) {
    eventInfo.preventDefault();
    eventInfo.stopPropagation();

    this.dragMouseDownHandler(eventInfo);

    document.addEventListener("mousemove", this.dragMouseMoveFn, {
      passive: true,
    });
    document.addEventListener("mouseup", this.dragMouseUpHandler.bind(this), {
      once: true,
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
        direction: eventInfo.movementX > 0 ? "right" : "left",
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
          <input type="checkbox" part="selector" onClick={this.selectorClickHandler.bind(this)} />
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
