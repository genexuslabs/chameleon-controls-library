import { Component, h, Prop, Watch, Event, EventEmitter } from "@stencil/core";

@Component({
  tag: "ch-paginator-pages",
  styleUrl: "ch-paginator-pages.scss",
  shadow: true,
})
export class ChPaginatorPages {
  @Prop({ mutable: true, reflect: true }) activePage = 1;
  @Prop() totalPages = 1;
  @Prop({ mutable: true, reflect: true }) maxSize = 9;
  @Prop() renderFirstLastPages: true;
  @Prop() textDots = "...";
  @Event() pageClicked: EventEmitter;

  @Watch("maxSize")
  watchMaxSize() {
    this.validateMaxSize();
  }

  @Watch("renderFirstLastPages")
  watchRenderFirstLastPages() {
    this.validateMaxSize();
  }

  private handleClick = (eventInfo: Event) => {
    eventInfo.stopPropagation();

    const button = eventInfo.target as HTMLButtonElement;
    this.activePage = parseInt(button.value);
  };

  render() {
    const padLeft = Math.ceil((this.maxSize - 1) / 2);
    const padRight = Math.floor((this.maxSize - 1) / 2);
    let fillLeft: number, fillStart: (number | string)[];
    let fillRight: number, fillEnd: (number | string)[];
    let items: (number | string)[] = [];
    let activeIndex: number;

    if (this.maxSize == 0 || this.maxSize >= this.totalPages) {
      fillStart = this.fillStart(false);
      fillLeft = this.activePage - 1;
      fillRight = this.totalPages - this.activePage;
      fillEnd = this.fillEnd(false);
    } else if (
      this.activePage <= padLeft &&
      this.activePage < this.totalPages - padRight
    ) {
      fillStart = this.fillStart(false);
      fillLeft = this.activePage - 1;
      fillEnd = this.fillEnd(true);
      fillRight = padRight - fillEnd.length + (padLeft - fillLeft);
    } else if (
      this.activePage > padLeft &&
      this.activePage < this.totalPages - padRight
    ) {
      fillStart = this.fillStart(true);
      fillLeft = padLeft - fillStart.length;
      fillEnd = this.fillEnd(true);
      fillRight = padRight - fillEnd.length;
    } else if (
      this.activePage > padLeft &&
      this.activePage >= this.totalPages - padRight
    ) {
      fillEnd = this.fillEnd(false);
      fillRight = this.totalPages - this.activePage;
      fillStart = this.fillStart(true);
      fillLeft = padLeft - fillStart.length + padRight - fillRight;
    }
    activeIndex = fillStart.length + fillLeft;

    items = fillStart
      .concat(this.range(this.activePage - fillLeft, this.activePage - 1))
      .concat([this.activePage])
      .concat(this.range(this.activePage + 1, this.activePage + fillRight))
      .concat(fillEnd);

    return (
      <ol part="pages" class="pages">
        {items.map((item, i) => {
          if (typeof item === "number") {
            return (
              <li>
                <button
                  part={`pages button ${i == activeIndex ? "active" : ""}`}
                  value={item}
                  onClick={this.handleClick}
                >
                  {item}
                </button>
              </li>
            );
          } else {
            return (
              <li>
                <button part="pages button dots" disabled>
                  {item}
                </button>
              </li>
            );
          }
        })}
      </ol>
    );
  }

  private fillStart(render: boolean) {
    if (render) {
      return this.renderFirstLastPages ? [1, this.textDots] : [this.textDots];
    } else {
      return [];
    }
  }

  private fillEnd(render: boolean) {
    if (render) {
      return this.renderFirstLastPages
        ? [this.textDots, this.totalPages]
        : [this.textDots];
    } else {
      return [];
    }
  }

  private range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  private validateMaxSize() {
    if (this.maxSize > 0) {
      if (!this.renderFirstLastPages && this.maxSize < 3) {
        this.maxSize = 3;
      } else if (this.renderFirstLastPages && this.maxSize < 5) {
        this.maxSize = 5;
      }
    }
  }
}
