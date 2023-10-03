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
export class ChGridVirtualScrollerLegend {
  private gridMainEl: HTMLElement;
  private resizeObserver = new ResizeObserver(this.resizeHandler.bind(this));
  private timer: NodeJS.Timeout;

  @Element() el: HTMLChGridVirtualScrollerElement;

  /**
   * Height of each row in pixels.
   */
  @State() rowHeight = 0;

  @Watch("rowHeight")
  rowHeightHandler() {
    if (this.gridMainEl) {
      this.updateViewPortItems();
    }
  }

  /**
   * Height of the browser window in pixels.
   */
  @State() browserHeight = document.documentElement.clientHeight;

  /**
   * Flag indicating whether the grid has a scrollbar.
   */
  @State() hasGridScroll = false;

  @Watch("hasGridScroll")
  hasScrollHandler() {
    if (this.hasGridScroll) {
      this.gridMainEl.addEventListener(
        "scroll",
        this.updateViewPortItems.bind(this),
        { passive: true }
      );
    } else {
      this.gridMainEl.removeEventListener(
        "scroll",
        this.updateViewPortItems.bind(this)
      );
    }
    this.updateViewPortItems();
  }

  /**
   * Flag indicating whether the browser window has a scrollbar.
   */
  @State() hasWindowScroll = false;

  @Watch("hasWindowScroll")
  hasWindowScrollHandler() {
    if (this.hasWindowScroll) {
      document.addEventListener("scroll", this.updateViewPortItems.bind(this), {
        passive: true
      });
    } else {
      document.removeEventListener(
        "scroll",
        this.updateViewPortItems.bind(this)
      );
    }
    this.updateViewPortItems();
  }

  /**
   * The maximum number of items that can fit on the screen at any given time.
   */
  @State() maxViewPortItems = 1;

  @Watch("maxViewPortItems")
  maxViewPortItemsHandler() {
    if (this.gridMainEl) {
      this.updateViewPortItems();
    }
  }

  /**
   * The list of items to be rendered in the grid.
   */
  @Prop() readonly items: any[];

  @Watch("items")
  itemsHandler() {
    if (this.gridMainEl) {
      this.updateViewPortItems();
    }
  }

  /**
   * The number of elements in the items list.
   * Use if the list changes, without recreating the array.
   */
  @Prop() readonly itemsCount: number;

  @Watch("itemsCount")
  itemsCountHandler() {
    if (this.gridMainEl) {
      this.updateViewPortItems();
    }
  }
  /**
   * The list of items to display within the current viewport.
   */
  @Prop({ mutable: true }) viewPortItems: any[];

  /**
   *Event emitted when the list of visible items in the grid changes.
   */
  @Event() viewPortItemsChanged: EventEmitter;

  componentWillLoad() {
    this.gridMainEl = this.el.assignedSlot.parentElement;
    this.resizeObserver.observe(this.gridMainEl);
    this.resizeObserver.observe(document.documentElement);
  }

  componentDidLoad() {
    this.updateViewPortItems();
  }

  disconnectedCallback() {
    this.resizeObserver.disconnect();
  }

  private resizeHandler() {
    const rowHeights = getComputedStyle(this.gridMainEl).gridTemplateRows.split(
      " "
    );

    this.browserHeight = document.documentElement.clientHeight;
    this.rowHeight = rowHeights.length >= 4 ? parseInt(rowHeights[2]) : 0; // row[0]:column header, row[1]:top shadow row, row[2]:first row, row[3]:second row OR bottom shadow row

    if (this.rowHeight > 0) {
      this.hasGridScroll =
        this.gridMainEl.scrollHeight !== this.gridMainEl.clientHeight;
      this.hasWindowScroll =
        !this.hasGridScroll &&
        this.gridMainEl.clientHeight > this.browserHeight;
      this.maxViewPortItems = Math.ceil(this.browserHeight / this.rowHeight);
    }
  }

  private updateViewPortItems(eventInfo?: Event) {
    const percentScroll = this.getPercentScroll();
    let startIndex: number;

    if (percentScroll <= 50) {
      startIndex = Math.floor(
        (percentScroll *
          Math.max(this.items.length - this.maxViewPortItems, 0)) /
          100
      );
    } else {
      startIndex = Math.ceil(
        (percentScroll *
          Math.max(this.items.length - this.maxViewPortItems, 0)) /
          100
      );
    }

    this.el.style.paddingTop = `${startIndex * this.rowHeight}px`;
    this.el.style.paddingBottom = `${
      (this.items.length -
        (startIndex + Math.min(this.items.length, this.maxViewPortItems))) *
      this.rowHeight
    }px`;

    this.viewPortItems = this.items.slice(
      startIndex,
      startIndex + this.maxViewPortItems
    );
    this.viewPortItemsChanged.emit();

    if (eventInfo) {
      // Angular discards events during rendering, if it lags it can discard the last one and not display correctly
      clearTimeout(this.timer);
      this.timer = setTimeout(this.updateViewPortItems.bind(this), 100);
    }
  }

  private getPercentScroll(): number {
    let hiddenHeight = 0;
    let scrollPosition = 0;

    if (this.hasGridScroll) {
      hiddenHeight =
        this.gridMainEl.scrollHeight - this.gridMainEl.clientHeight;
      scrollPosition = this.gridMainEl.scrollTop;
    } else if (this.hasWindowScroll) {
      const gridMainRect = this.gridMainEl.getBoundingClientRect();
      hiddenHeight = this.gridMainEl.clientHeight - this.browserHeight;
      scrollPosition = Math.min(
        gridMainRect.top >= 0 ? 0 : gridMainRect.top * -1,
        hiddenHeight
      );
    }

    return hiddenHeight > 0 ? (scrollPosition * 100) / hiddenHeight : 0;
  }
}
