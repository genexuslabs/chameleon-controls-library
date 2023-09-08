import {
  Component,
  h,
  Prop,
  Watch,
  Event,
  EventEmitter,
  Element,
  Listen
} from "@stencil/core";

/**
 * The 'ch-paginator-pages' component represents the pagination pages for the 'ch-paginator' component.
 */
@Component({
  tag: "ch-paginator-pages",
  styleUrl: "ch-paginator-pages.scss",
  shadow: true
})
export class ChPaginatorPages {
  private buttonActive: HTMLButtonElement;

  @Element() el: HTMLChPaginatorPagesElement;

  /**
   * The active page number.
   */
  @Prop({ mutable: true, reflect: true }) page = 1;

  @Watch("page")
  pageHandler() {
    this.pageChanged.emit({ page: this.page });
  }

  /**
   * The total number of pages.
   */
  @Prop({ reflect: true }) readonly totalPages = 1;

  /**
   * The maximum number of items to display in the pagination.
   */
  @Prop({ mutable: true, reflect: true }) maxSize = 9;

  @Watch("maxSize")
  maxSizeHandler() {
    this.validateMaxSize();
  }

  /**
   * Flag to render the first and last pages.
   */
  @Prop() readonly renderFirstLastPages: boolean = true;

  @Watch("renderFirstLastPages")
  renderFirstLastPagesHandler() {
    this.validateMaxSize();
  }

  /**
   * The text to display for the dots.
   */
  @Prop() readonly textDots: string = "...";

  /**
   * Event emitted when the page changes.
   */
  @Event() pageChanged: EventEmitter<ChPaginatorPagesPageChangedEvent>;

  componentDidUpdate() {
    if (document.activeElement === this.el) {
      this.buttonActive.focus();
    }
  }

  @Listen("keydown", { passive: true })
  keyDownHandler(eventInfo: KeyboardEvent) {
    switch (eventInfo.key) {
      case "ArrowLeft":
        this.page = Math.max(this.page - 1, 1);
        break;
      case "ArrowRight":
        this.page = Math.min(this.page + 1, this.totalPages);
        break;
    }
  }

  @Listen("focusin", { passive: true })
  focusHandler() {
    this.buttonActive.focus();
  }

  private clickHandler = (eventInfo: Event) => {
    const button = eventInfo.target as HTMLButtonElement;
    this.page = parseInt(button.value);
  };

  private getItems(): { items: (number | string)[]; activeIndex: number } {
    const padLeft = Math.ceil((this.maxSize - 1) / 2);
    const padRight = Math.floor((this.maxSize - 1) / 2);
    let fillLeft: number, fillStart: (number | string)[];
    let fillRight: number, fillEnd: (number | string)[];

    if (this.maxSize === 0 || this.maxSize >= this.totalPages) {
      fillStart = this.fillStart(false);
      fillLeft = this.page - 1;
      fillRight = this.totalPages - this.page;
      fillEnd = this.fillEnd(false);
    } else if (this.page <= padLeft && this.page < this.totalPages - padRight) {
      fillStart = this.fillStart(false);
      fillLeft = this.page - 1;
      fillEnd = this.fillEnd(true);
      fillRight = padRight - fillEnd.length + (padLeft - fillLeft);
    } else if (this.page > padLeft && this.page < this.totalPages - padRight) {
      fillStart = this.fillStart(true);
      fillLeft = padLeft - fillStart.length;
      fillEnd = this.fillEnd(true);
      fillRight = padRight - fillEnd.length;
    } else if (this.page > padLeft && this.page >= this.totalPages - padRight) {
      fillEnd = this.fillEnd(false);
      fillRight = this.totalPages - this.page;
      fillStart = this.fillStart(true);
      fillLeft = padLeft - fillStart.length + padRight - fillRight;
    }

    const items: (number | string)[] = fillStart
      .concat(this.getRangeItems(this.page - fillLeft, this.page - 1))
      .concat([this.page])
      .concat(this.getRangeItems(this.page + 1, this.page + fillRight))
      .concat(fillEnd);

    return {
      items,
      activeIndex: fillStart.length + fillLeft
    };
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

  private getRangeItems(start: number, end: number): number[] {
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

  render() {
    const { items, activeIndex } = this.getItems();

    return (
      <ol part="pages" class="pages">
        {items.map((item, i) => {
          if (typeof item === "number") {
            return (
              <li>
                <button
                  part={`page button ${i === activeIndex ? "active" : ""}`}
                  value={item}
                  onClick={this.clickHandler}
                  ref={el =>
                    (this.buttonActive =
                      i === activeIndex ? el : this.buttonActive)
                  }
                >
                  {item}
                </button>
              </li>
            );
          } else {
            return (
              <li>
                <button part="page button dots" disabled>
                  {item}
                </button>
              </li>
            );
          }
        })}
      </ol>
    );
  }
}

export interface ChPaginatorPagesPageChangedEvent {
  page: number;
}
