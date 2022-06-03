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
  @Prop() columnId: string;
  @Prop() hideable: boolean;
  @Prop({ reflect: true }) order: number;
  @Prop() size: string;
  @Prop() resizeable: boolean = true;
  @Prop({ reflect: true }) resizing: boolean;

  displayObserver: HTMLDivElement;
  observer = new IntersectionObserver(() => {
    this.el.hidden = getComputedStyle(this.el).display === "none";
    this.columnVisibleChanged.emit(this.el);
  });

  componentDidLoad() {
    this.observer.observe(this.displayObserver);
  }

  @Watch("size")
  sizeHandler() {
    this.columnVisibleChanged.emit(this.el);
  }

  render() {
    return (
      <Host>
        <ul class="bar" part="bar">
          <li class="name" part="bar-name">
            <slot></slot>
          </li>
          <li class="sort" part="bar-sort">
            <slot name="sort"></slot>
          </li>
          <li class="menu" part="bar-menu">
            <button class="button" part="bar-menu-button"></button>
          </li>
          {this.resizeable && this.renderResize()}
        </ul>
        <div
          class="display-observer"
          ref={(el) => (this.displayObserver = el)}
        ></div>
      </Host>
    );
  }

  renderResize() {
    return (
      <li class="resize" part="bar-resize">
        <ch-grid-column-resize
          column={this}
          part="resize"
        ></ch-grid-column-resize>
      </li>
    );
  }
}
