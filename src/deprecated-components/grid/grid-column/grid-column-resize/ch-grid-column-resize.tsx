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
import { ChGridColumnResizeEvent } from "../ch-grid-column-types";
import { mouseEventModifierKey } from "../../../../components/common/helpers";

/**
 * The `ch-grid-column-resize` component responsible for resizing a column in a grid.
 * @deprecated Use `ch-tabular-grid` component instead. Use `ch-tabular-grid-column-resize` instead.
 */
@Component({
  tag: "ch-grid-column-resize",
  styleUrl: "ch-grid-column-resize.scss",
  shadow: true
})
export class ChGridColumnResize {
  private startPageX: number;
  private mousemoveFn = this.mousemoveHandler.bind(this);

  @Element() el: HTMLChGridColumnResizeElement;

  /**
   * Whether the component is currently resizing the column.
   */
  @State() resizing = false;

  /**
   * The column element that is being resized.
   */
  @Prop() readonly column!: HTMLChGridColumnElement;

  /**
   * Event emitted when the user starts resizing the column.
   */
  @Event() columnResizeStarted: EventEmitter<ChGridColumnResizeEvent>;

  /**
   * Event emitted when the user is resizing the column.
   */
  @Event() columnResizing: EventEmitter<ChGridColumnResizeEvent>;

  /**
   * Event emitted when the user finishes resizing the column.
   */
  @Event() columnResizeFinished: EventEmitter<ChGridColumnResizeEvent>;

  componentDidLoad() {
    this.el.addEventListener("mousedown", this.mousedownHandler.bind(this));
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

  private mousedownHandler(eventInfo: MouseEvent) {
    eventInfo.stopPropagation();
    eventInfo.preventDefault();

    this.startPageX = eventInfo.pageX;

    document.addEventListener("mousemove", this.mousemoveFn, { passive: true });
    document.addEventListener("mouseup", this.mouseupHandler.bind(this), {
      once: true
    });

    this.columnResizeStarted.emit({ columnId: this.column.columnId });
  }

  private mousemoveHandler(eventInfo: MouseEvent) {
    this.columnResizing.emit({
      columnId: this.column.columnId,
      deltaWidth: this.startPageX - eventInfo.pageX
    });
  }

  private mouseupHandler() {
    document.removeEventListener("mousemove", this.mousemoveFn);
    this.columnResizeFinished.emit({ columnId: this.column.columnId });
  }

  render() {
    return <div class="resize-mask" hidden={!this.resizing}></div>;
  }
}
