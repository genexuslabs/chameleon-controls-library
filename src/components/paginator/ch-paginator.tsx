import {
  ChPaginatorActivePageChangedEvent,
  ChPaginatorButtonType,
  ChPaginatorNavigationButtonClieckedEvent,
} from "./types";
import {
  Component,
  Event,
  EventEmitter,
  Host,
  Prop,
  Watch,
  h,
} from "@stencil/core";

@Component({
  tag: "ch-paginator",
  styleUrl: "ch-paginator.scss",
  shadow: true,
})
export class ChPaginator {
  @Prop() renderButtonFirst = true;
  @Prop() renderButtonPrevious = true;
  @Prop() renderButtonNext = true;
  @Prop() renderButtonLast = true;

  @Prop({ mutable: true, reflect: true }) activePage = 1;
  @Prop() totalPages = 1;
  @Prop({ mutable: true, reflect: true }) maxSize = 9;
  @Prop() renderFirstLastPages = true;

  @Prop() textFirst = "First";
  @Prop() textPrevious = "Previous";
  @Prop() textNext = "Next";
  @Prop() textLast = "Last";
  @Prop() textDots = "...";

  @Event() activePageChanged: EventEmitter<ChPaginatorActivePageChangedEvent>;
  @Event() navigationButtonClicked: EventEmitter<ChPaginatorNavigationButtonClieckedEvent>; // prettier-ignore

  componentWillLoad() {
    this.validateMaxSize();
  }

  @Watch("maxSize")
  watchMaxSize() {
    this.validateMaxSize();
  }

  @Watch("renderFirstLastPages")
  watchRenderFirstLastPages() {
    this.validateMaxSize();
  }

  @Watch("activePage")
  watchActivePage() {
    this.activePageChanged.emit({ page: this.activePage });
  }

  private handleNavigationClick = (eventInfo: Event) => {
    eventInfo.stopPropagation();

    const button = eventInfo.target as HTMLButtonElement;
    const buttonType = button.name as ChPaginatorButtonType;

    // switch(buttonType) {
    //   case ChPaginatorButtonType.FIRST:
    //     this.activePage = 1;
    //     break;
    //   case ChPaginatorButtonType.PREVIOUS:
    //     this.activePage = Math.max(this.activePage - 1, 1);
    //     break;
    //   case ChPaginatorButtonType.NEXT:
    //     this.activePage = Math.min(this.activePage + 1, this.totalPages);
    //     break;
    //   case ChPaginatorButtonType.LAST:
    //     this.activePage = this.totalPages;
    //     break;
    // }

    this.navigationButtonClicked.emit({ buttonType });
  };

  private handlePagesClick = (eventInfo: Event) => {
    eventInfo.stopPropagation();

    const button = eventInfo.target as HTMLButtonElement;
    this.activePage = parseInt(button.value);
  };

  render() {
    return (
      <Host>
        {this.renderNavigation()}
        {/* {this.renderPages()} */}
      </Host>
    );
  }

  renderNavigation() {
    return (
      <div part="navigation" class="navigation">
        {this.renderButtonFirst &&
          this.renderNavigationButton(ChPaginatorButtonType.FIRST)}
        {this.renderButtonPrevious &&
          this.renderNavigationButton(ChPaginatorButtonType.PREVIOUS)}
        {this.renderButtonNext &&
          this.renderNavigationButton(ChPaginatorButtonType.NEXT)}
        {this.renderButtonLast &&
          this.renderNavigationButton(ChPaginatorButtonType.LAST)}
      </div>
    );
  }

  renderNavigationButton(buttonType: ChPaginatorButtonType) {
    let text: string;
    let disabled: boolean;

    switch (buttonType) {
      case ChPaginatorButtonType.FIRST:
        text = this.textFirst;
        // disabled = this.activePage == 1 ? true : false;
        break;
      case ChPaginatorButtonType.PREVIOUS:
        text = this.textPrevious;
        // disabled = this.activePage == 1 ? true : false;
        break;
      case ChPaginatorButtonType.NEXT:
        text = this.textNext;
        // disabled = this.activePage == this.totalPages ? true : false;
        break;
      case ChPaginatorButtonType.LAST:
        text = this.textLast;
        // disabled = this.activePage == this.totalPages ? true : false;
        break;
    }

    return (
      <button
        part={`navigation button ${buttonType} ${disabled ? "disabled" : ""}`}
        class={buttonType}
        name={buttonType}
        disabled={disabled}
        onClick={this.handleNavigationClick}
      >
        {text}
      </button>
    );
  }

  renderPages() {
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
                  onClick={this.handlePagesClick}
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
