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

@Component({
  tag: "ch-grid-column",
  styleUrl: "ch-grid-column.scss",
  shadow: true,
})
export class ChGridColumn {
  @Element() el: HTMLChGridColumnElement;
  @Event() columnVisibleChanged: EventEmitter;
  @Event() columnDragStart: EventEmitter;
  @Event() columnDragging: EventEmitter;
  @Event() columnDragEnd: EventEmitter;
  @Prop() columnId: string;
  @Prop() columnName: string;
  @Prop() displayObserverClass: string;
  @Prop({ reflect: true }) hidden = false;
  @Prop() hideable = true;
  @Prop({ reflect: true }) order: number;
  @Prop() size: string;
  @Prop() resizeable: boolean = true;
  @Prop({ reflect: true }) resizing: boolean;

  private dragMouseMoveFn = this.dragMouseMoveHandler.bind(this);
  private dragMouseMovePosition: number;

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
    this.columnDragStart.emit({ column: this.el });
  }

  dragMouseMoveHandler(eventInfo: MouseEvent) {
    const direction =
      eventInfo.pageX > this.dragMouseMovePosition ? "right" : "left";
    this.dragMouseMovePosition = eventInfo.pageX;

    this.columnDragging.emit({
      column: this.el,
      position: eventInfo.pageX,
      direction,
    });
  }

  dragMouseUpHandler() {
    this.columnDragEnd.emit({ column: this.el });
  }

  render() {
    return (
      <Host draggable="true">
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
