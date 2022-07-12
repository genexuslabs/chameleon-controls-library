import {
  Component,
  Element,
  Event,
  EventEmitter,
  Listen,
  Prop,
} from "@stencil/core";

import { ChGridColumn } from "../grid-column/ch-grid-column";

@Component({
  tag: "ch-grid-column-resize",
  styleUrl: "ch-grid-column-resize.scss",
  shadow: false,
})
export class ChGridColumnResize {
  @Element() el: HTMLChGridColumnResizeElement;
  @Event() columnResizeStarted: EventEmitter;
  @Event() columnResizeFinished: EventEmitter;
  @Prop() column: ChGridColumn;

  private startPageX: number;
  private startColumnWidth: number;
  private mousemoveFn = this.mousemoveHandler.bind(this);

  componentDidLoad() {
    this.el.addEventListener("mousedown", this.mousedownHandler.bind(this));
  }

  mousedownHandler(eventInfo: MouseEvent) {
    eventInfo.stopPropagation();
    eventInfo.preventDefault();

    this.startPageX = eventInfo.pageX;
    this.startColumnWidth = this.column.el.getBoundingClientRect().width;

    document.addEventListener("mousemove", this.mousemoveFn, { passive: true });
    document.addEventListener("mouseup", this.mouseupHandler.bind(this), {
      once: true,
    });

    this.columnResizeStarted.emit();
  }

  mousemoveHandler(eventInfo: MouseEvent) {
    const columnSize =
      this.startColumnWidth - (this.startPageX - eventInfo.pageX);

    if (columnSize >= 0) {
      this.column.size = `minmax(min-content, ${columnSize}px)`;
    }
  }

  mouseupHandler() {
    document.removeEventListener("mousemove", this.mousemoveFn);
    this.columnResizeFinished.emit();
  }

  @Listen("click")
  clickHandler(eventInfo: MouseEvent) {
    eventInfo.stopPropagation();
  }

  @Listen("dblclick")
  dblclickHandler(eventInfo: MouseEvent) {
    eventInfo.stopPropagation();

    if (eventInfo.ctrlKey) {
      this.column.size = "auto";
    } else {
      this.column.size = "max-content";
    }
  }
}
