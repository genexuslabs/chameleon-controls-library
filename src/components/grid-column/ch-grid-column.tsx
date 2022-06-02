import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
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
  @Prop() resizeable: boolean;
  @Prop({ reflect: true }) order: number;
  @Prop() size: string;

  displayObserver: HTMLDivElement;
  observer = new IntersectionObserver(() => {
    this.el.hidden = getComputedStyle(this.el).display === "none";
    this.columnVisibleChanged.emit(this.el);
  });

  componentDidLoad() {
    this.observer.observe(this.displayObserver);
  }

  render() {
    return (
      <Host draggable="true">
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
        </ul>
        <div class="resize" part="resize"></div>
        <div
          class="display-observer"
          ref={(el) => (this.displayObserver = el)}
        ></div>
      </Host>
    );
  }
}
