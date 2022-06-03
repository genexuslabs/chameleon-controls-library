import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Listen,
  Prop,
  h,
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

  startPageX: number;
  startColumnWidth: number;
  mousemoveFn = this.mousemoveHandler.bind(this);

  componentDidLoad() {
    this.el.addEventListener("mousedown", (eventInfo) => {
      eventInfo.preventDefault();

      this.startPageX = eventInfo.pageX;
      this.startColumnWidth = this.column.el.getBoundingClientRect().width;

      document.addEventListener("mousemove", this.mousemoveFn, {
        passive: true,
      });
      document.addEventListener(
        "mouseup",
        () => {
          document.removeEventListener("mousemove", this.mousemoveFn);
          this.columnResizeFinished.emit();
        },
        { once: true }
      );

      this.columnResizeStarted.emit();
    });
  }

  mousemoveHandler(eventInfo: MouseEvent) {
    const columnSize =
      this.startColumnWidth - (this.startPageX - eventInfo.pageX);

    if (columnSize >= 0) {
      this.column.size = `minmax(min-content, ${columnSize}px)`;
    }
  }

  @Listen("dblclick")
  dblclickHandler(eventInfo: MouseEvent) {
    if (eventInfo.ctrlKey) {
      this.column.size = "auto";
    } else {
      this.column.size = "max-content";
    }
  }

  render() {
    return <Host></Host>;
  }
}
