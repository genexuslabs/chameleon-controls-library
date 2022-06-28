import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  Watch,
  h,
} from "@stencil/core";
import { ChGridColumnDragEvent } from "./ch-grid-column-types";

@Component({
  tag: "ch-grid-column",
  styleUrl: "ch-grid-column.scss",
  shadow: true,
})
export class ChGridColumn {
  @Element() el: HTMLChGridColumnElement;
  @Event() columnVisibleChanged: EventEmitter;
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

  private dragMouseMoveFn = this.dragMouseMoveHandler.bind(this);
  private dragMouseMovePositionX: number;

  componentDidLoad() {
    this.el.addEventListener("mousedown", (eventInfo) => {
      eventInfo.preventDefault();
      eventInfo.stopPropagation();

      this.dragMouseDownHandler();

      document.addEventListener("mousemove", this.dragMouseMoveFn, {
        passive: true,
      });
      document.addEventListener(
        "mouseup",
        () => {
          document.removeEventListener("mousemove", this.dragMouseMoveFn);
          this.dragMouseUpHandler();
        },
        { once: true }
      );
    });
  }

  @Watch("size")
  sizeHandler() {
    this.columnVisibleChanged.emit(this.el);
  }

  @Watch("hidden")
  hiddenHandler() {
    this.columnVisibleChanged.emit(this.el);
  }

  dragMouseDownHandler() {
    this.columnDragStarted.emit({ columnId: this.columnId });
  }

  dragMouseMoveHandler(eventInfo: MouseEvent) {
    const direction =
      eventInfo.pageX > this.dragMouseMovePositionX ? "right" : "left";
    this.dragMouseMovePositionX = eventInfo.pageX;

    this.columnDragging.emit({
      columnId: this.columnId,
      positionX: this.dragMouseMovePositionX,
      direction,
    });
  }

  dragMouseUpHandler() {
    this.columnDragEnded.emit({ columnId: this.columnId });
  }

  render() {
    return (
      <Host>
        <ul class="bar" part="bar">
          <li class="name" part="bar-name">
            {this.columnName}
          </li>
          <li class="sort" part="bar-sort">
            <slot name="sort"></slot>
          </li>
          <li class="menu" part="bar-menu">
            <button class="button" part="bar-menu-button"></button>
          </li>
          {this.resizeable && this.renderResize()}
        </ul>
      </Host>
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
