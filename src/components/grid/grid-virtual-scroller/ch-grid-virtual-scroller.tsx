import {
  Component,
  Prop,
  Element,
  Event,
  EventEmitter,
  Watch,
  State
} from "@stencil/core";

/**
 * The `ch-grid-virtual-scroller` component that displays a subset of items.
 * It optimizes the rendering of large data sets by only rendering the items that are currently visible on the screen
 * based on the viewport size and scroll position.
 */
@Component({
  tag: "ch-grid-virtual-scroller",
  styleUrl: "ch-grid-virtual-scroller.scss",
  shadow: false
})
export class ChGridVirtualScroller {
  private gridEl: HTMLElement;
  private gridLayoutEl: HTMLElement;
  private resizeObserver: ResizeObserver;

  @Element() el: HTMLChGridVirtualScrollerElement;

  /**
   * Flag indicating whether the grid has a scrollbar.
   */
  @State() hasGridScroll = false;

  @Watch("hasGridScroll")
  hasGridScrollHandler() {
    this.unobserveScroll();
    this.observeScroll();

    this.definePercentScroll();
  }

  /**
   * Flag indicating whether the browser window has a scrollbar.
   */
  @State() hasWindowScroll = false;

  @Watch("hasWindowScroll")
  hasWindowScrollHandler() {
    this.gridLayoutEl.style.overflowX = this.hasWindowScroll
      ? "visible"
      : "auto";

    this.unobserveScroll();
    this.observeScroll();

    this.definePercentScroll();
  }

  /**
   * Height of the browser window in pixels.
   */
  @State() browserHeight = document.documentElement.clientHeight;
  @Watch("browserHeight")
  browserHeightHandler() {
    this.defineMaxViewPortItems();
    this.defineVirtualHeight();
  }

  /**
   * Height of the header in pixels.
   */
  @State() headerHeight: number;

  @Watch("headerHeight")
  headerHeightHandler() {
    this.el.style.top = `${this.headerHeight}px`;
  }

  @State() rowsHeight = 0;
  @Watch("rowsHeight")
  rowsHeightHandler() {
    this.defineHeaderHeight();
    this.defineRowHeight();
  }

  /**
   * Height of each row in pixels.
   */
  @State() rowHeight = 0;
  @Watch("rowHeight")
  rowHeightHandler() {
    this.defineMaxViewPortItems();
    this.defineVirtualHeight();
  }

  @State() virtualHeight = 0;
  @Watch("virtualHeight")
  virtualHeightHandler() {
    this.unobserveScroll();
    this.unobserveResize();

    this.gridLayoutEl.style.setProperty(
      "--ch-grid-virtual-scroller-height",
      `${this.virtualHeight}px`
    );

    if (Math.ceil(this.percentScroll) !== 100) {
      if (this.hasGridScroll) {
        this.gridLayoutEl.scrollTop =
          this.percentScroll /
          (100 /
            (this.gridLayoutEl.scrollHeight - this.gridLayoutEl.clientHeight));
      } else if (this.hasWindowScroll) {
        window.scrollY =
          this.percentScroll /
          (100 / (this.gridEl.clientHeight - this.browserHeight));
      }
    }

    this.observeScroll();
    this.observeResize();
  }

  /**
   * The maximum number of items that can fit on the screen at any given time.
   */
  @State() maxViewPortItems = 7;
  @Watch("maxViewPortItems")
  maxViewPortItemsHandler() {
    this.defineViewPortItems();
  }

  @State() percentScroll: number = 0;
  @Watch("percentScroll")
  percentScrollHandler() {
    this.defineStartIndex();
  }

  @State() startIndex: number = null;
  @Watch("startIndex")
  startIndexHandler() {
    this.defineViewPortItems();
  }

  @State() isScrolling: boolean = false;
  @Watch("isScrolling")
  isScrollingHandler() {
    if (!this.isScrolling) {
      this.defineMaxViewPortItems();
      this.defineVirtualHeight();
    }
  }

  /**
   * The list of items to be rendered in the grid.
   */
  @Prop() readonly items: any[];
  @Watch("items")
  itemsHandler() {
    if (!this.startIndex === null) {
      this.defineStartIndex();
    } else {
      this.defineViewPortItems();
      this.defineVirtualHeight();
    }
  }

  /**
   * The number of elements in the items list.
   * Use if the list changes, without recreating the array.
   */
  @Prop() readonly itemsCount: number;
  @Watch("itemsCount")
  itemsCountHandler() {
    if (!this.startIndex === null) {
      this.defineStartIndex();
    } else {
      this.defineViewPortItems();
      this.defineVirtualHeight();
    }
  }

  /**
   * The list of items to display within the current viewport.
   */
  @Prop({ mutable: true }) viewPortItems: any[];
  @Watch("viewPortItems")
  viewPortItemsHandler() {
    this.viewPortItemsChanged.emit();
  }

  /**
   *Event emitted when the list of visible items in the grid changes.
   */
  @Event() viewPortItemsChanged: EventEmitter;

  componentWillLoad() {
    this.gridLayoutEl = this.el.assignedSlot.parentElement;
    this.gridEl = this.el.closest("ch-grid");
    this.resizeObserver = new ResizeObserver(this.resizeHandler);

    this.observeScroll();
    this.observeResize();
  }

  private observeScroll() {
    let viewport: HTMLElement | Document;

    if (this.hasGridScroll) {
      viewport = this.gridLayoutEl;
    } else if (this.hasWindowScroll) {
      viewport = document;
    }

    viewport?.addEventListener("scroll", this.scrollHandler, {
      passive: true
    });
    viewport?.addEventListener("scrollend", this.scrollEndHandler, {
      passive: true
    });
  }

  private observeResize() {
    this.resizeObserver.observe(this.el);
    this.resizeObserver.observe(this.gridEl);
    this.resizeObserver.observe(document.documentElement);
    this.resizeObserver.observe(document.body);
  }

  private unobserveScroll() {
    document.removeEventListener("scroll", this.scrollHandler);
    this.gridLayoutEl.removeEventListener("scroll", this.scrollHandler);
  }

  private unobserveResize() {
    this.resizeObserver.unobserve(this.el);
    this.resizeObserver.unobserve(this.gridEl);
    this.resizeObserver.unobserve(document.documentElement);
    this.resizeObserver.unobserve(document.body);
  }

  private scrollHandler = () => {
    this.isScrolling = true;
    this.definePercentScroll();
  };

  private scrollEndHandler = () => {
    this.isScrolling = false;
  };

  private resizeHandler = (entries: ResizeObserverEntry[]) => {
    entries.forEach(entry => {
      switch (entry.target) {
        case this.el:
          this.rowsHeight = entry.contentRect.height;
          break;
        case document.documentElement:
        case document.body:
          this.browserHeight = document.documentElement.clientHeight;
          break;
      }
    });

    this.defineHasScroll();
  };

  private defineHasScroll() {
    this.hasGridScroll =
      this.gridLayoutEl.scrollHeight !== this.gridLayoutEl.clientHeight;
    this.hasWindowScroll =
      !this.hasGridScroll && this.gridEl.clientHeight > this.browserHeight;
  }

  private defineHeaderHeight() {
    this.headerHeight = parseFloat(
      getComputedStyle(this.gridLayoutEl).gridTemplateRows
    );
  }

  private defineRowHeight() {
    if (this.viewPortItems.length === 0) {
      this.rowHeight = 0;
    } else if (this.viewPortItems.length > 0 && this.percentScroll === 0) {
      this.rowHeight = this.rowsHeight / this.viewPortItems.length;
    } else {
      this.rowHeight = Math.min(
        this.rowHeight,
        this.rowsHeight / this.viewPortItems.length
      );
    }
  }

  private defineMaxViewPortItems() {
    if (this.rowHeight === 0) {
      this.maxViewPortItems = 7;
    } else {
      this.maxViewPortItems = Math.ceil(this.browserHeight / this.rowHeight);
    }
  }

  private defineVirtualHeight() {
    if (!this.isScrolling) {
      this.virtualHeight = this.items.length * this.rowHeight;
    }
  }

  private defineViewPortItems() {
    this.viewPortItems = this.items.slice(
      this.startIndex,
      this.startIndex + this.maxViewPortItems
    );
    // this.viewPortItems = this.items.slice(
    //   Math.min(this.startIndex, this.items.length - this.maxViewPortItems),
    //   this.startIndex + this.maxViewPortItems
    // );
  }

  private defineStartIndex() {
    const index =
      (this.percentScroll *
        Math.max(this.items.length - this.maxViewPortItems, 0)) /
      100;
    // const index = (this.percentScroll * (this.items.length - 1)) / 100;

    this.startIndex =
      this.percentScroll <= 50 ? Math.floor(index) : Math.ceil(index);
  }

  private definePercentScroll() {
    let hiddenHeight = 0;
    let scrollPosition = 0;

    if (this.hasGridScroll) {
      hiddenHeight =
        this.gridLayoutEl.scrollHeight - this.gridLayoutEl.clientHeight;
      scrollPosition = this.gridLayoutEl.scrollTop;
    } else if (this.hasWindowScroll) {
      const gridRect = this.gridEl.getBoundingClientRect();

      hiddenHeight = this.gridEl.clientHeight - this.browserHeight;
      scrollPosition = Math.min(
        gridRect.top >= 0 ? 0 : gridRect.top * -1,
        hiddenHeight
      );
    }

    this.percentScroll =
      hiddenHeight > 0 ? (scrollPosition * 100) / hiddenHeight : 0;
  }
}
