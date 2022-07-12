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
  @Event() columnVisibleChanged: EventEmitter;
  @Event() columnSortChanged: EventEmitter<ChGridColumnSortChangedEvent>;
  @Event() columnDragStarted: EventEmitter<ChGridColumnDragEvent>;
  @Event() columnDragging: EventEmitter<ChGridColumnDragEvent>;
  @Event() columnDragEnded: EventEmitter<ChGridColumnDragEvent>;
  @Prop() columnId: string;
  @Prop() columnName: string;
  @Prop() displayObserverClass: string;
  @Prop({ reflect: true }) hidden = false;
  @Prop() hideable = true;
  @Prop({ reflect: true }) order: number;
  @Prop() physicalOrder: number;
  @Prop() size: string;
  @Prop() resizeable: boolean = true;
  @Prop({ reflect: true }) resizing: boolean;
  @Prop() sortable: boolean = true;
  @Prop({ mutable: true, reflect: true }) sortDirection?: ColumnSortDirection;

  private dragging = false;
  private dragMouseMoveFn = this.dragMouseMoveHandler.bind(this);
  private dragMouseMoveStartPositionX: number;

  componentDidLoad() {
    this.el.addEventListener("mousedown", this.mousedownHandler.bind(this));
  }

  @Watch("size")
  sizeHandler() {
    this.columnVisibleChanged.emit(this.el);
  }

  @Watch("hidden")
  hiddenHandler() {
    this.columnVisibleChanged.emit(this.el);
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

  render() {
    return (
      <Host>
        <ul class="bar" part="bar">
          <li class="name" part="bar-name">
            {this.columnName}
          </li>
          {this.sortable && this.renderSort()}
          <li class="menu" part="bar-menu">
            <button class="button" part="bar-menu-button"></button>
          </li>
          {this.resizeable && this.renderResize()}
        </ul>
      </Host>
    );
  }

  renderSort() {
    return (
      <li class="sort" part="bar-sort">
        <div class="sort-asc" part="bar-sort-ascending"></div>
        <div class="sort-desc" part="bar-sort-descending"></div>
      </li>
    );
  }

  renderResize() {
    return (
      <li class="resize" part="bar-resize">
        <ch-grid-column-resize
          column={this}
          class="resize-split"
          part="bar-resize-split"
        ></ch-grid-column-resize>
      </li>
    );
  }
}
