import {
  Component,
  Element,
  Event,
  EventEmitter,
  Listen,
  Prop,
  State,
  h
} from "@stencil/core";
import { mouseEventModifierKey } from "../../../common/helpers";

/**
 * The `ch-grid-column-resize` component responsible for resizing a column in a grid.
 */
@Component({
  tag: "ch-grid-column-resize",
  styleUrl: "ch-grid-column-resize.scss",
  shadow: true
})
export class ChGridColumnResize {
  @Element() el: HTMLChGridColumnResizeElement;

  /**
   * The column element that is being resized.
   */
  @Prop() readonly column!: HTMLChGridColumnElement;

  /**
   * Whether the component is currently resizing the column.
   */
  @State() resizing = false;

  /**
   * Event emitted when the user starts resizing the column.
   */
  @Event() columnResizeStarted: EventEmitter;

  /**
   * Event emitted when the user finishes resizing the column.
   */
  @Event() columnResizeFinished: EventEmitter;

  private startPageX: number;
  private startColumnWidth: number;
  private mousemoveFn = this.mousemoveHandler.bind(this);

  componentDidLoad() {
    this.el.addEventListener("mousedown", this.mousedownHandler.bind(this));
  }

  private mousedownHandler(eventInfo: MouseEvent) {
    eventInfo.stopPropagation();
    eventInfo.preventDefault();

    this.startPageX = eventInfo.pageX;
    this.startColumnWidth = this.column.getBoundingClientRect().width;

    document.addEventListener("mousemove", this.mousemoveFn, { passive: true });
    document.addEventListener("mouseup", this.mouseupHandler.bind(this), {
      once: true
    });

    this.columnResizeStarted.emit();
  }

  private mousemoveHandler(eventInfo: MouseEvent) {
    const columnSize =
      this.startColumnWidth - (this.startPageX - eventInfo.pageX);

    if (columnSize >= 0) {
      this.column.size = `minmax(min-content, ${columnSize}px)`;
    }
  }

  private mouseupHandler() {
    document.removeEventListener("mousemove", this.mousemoveFn);
    this.columnResizeFinished.emit();
  }

  @Listen("click", { passive: true })
  clickHandler(eventInfo: MouseEvent) {
    eventInfo.stopPropagation();
  }

  @Listen("dblclick")
  dblclickHandler(eventInfo: MouseEvent) {
    eventInfo.stopPropagation();

    if (mouseEventModifierKey(eventInfo)) {
      this.column.size = "auto";
    } else {
      this.column.size = "max-content";
    }
  }

  @Listen("columnResizeStarted")
  columnResizeStartedHandler() {
    this.resizing = true;
  }

  @Listen("columnResizeFinished")
  columnResizeFinishedHandler() {
    this.resizing = false;
  }

  render() {
    return <div class="resize-mask" hidden={!this.resizing}></div>;
  }
}
