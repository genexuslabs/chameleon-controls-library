import { Component, Prop, Element, Event, EventEmitter, Watch, State } from "@stencil/core";

@Component({
  tag: "ch-grid-virtual-scroller",
  styleUrl: "ch-grid-virtual-scroller.scss",
  shadow: false,
})
export class ChGridVirtualScrollerLegend {
    @Element() el: HTMLChGridVirtualScrollerElement;
    @Prop() items: any[];
    @Prop({mutable: true}) viewPortItems: any[];
    @State() rowHeight = 0;
    @State() browserHeight = document.documentElement.clientHeight;
    @State() hasGridScroll = false;
    @State() hasWindowScroll = false;
    @State() maxViewPortItems = 1;
    @Event() viewPortItemsChanged: EventEmitter;

    private gridMainEl: HTMLElement;
    private resizeObserver = new ResizeObserver(this.resizeHandler.bind(this));
    private timer: NodeJS.Timeout;

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

    @Watch("items")
    itemsHandler() {
      if (this.gridMainEl) {
        this.updateViewPortItems();
      }
    }

    @Watch("rowHeight")
    rowHeightHandler() {
      if (this.gridMainEl) {
        this.updateViewPortItems();
      }
    }

    @Watch("maxViewPortItems")
    maxViewPortItemsHandler() {
      if (this.gridMainEl) {
        this.updateViewPortItems();
      }
    }

    @Watch("hasGridScroll")
    hasScrollHandler() {
      if (this.hasGridScroll) {
        this.gridMainEl.addEventListener("scroll", this.updateViewPortItems.bind(this), {passive: true});
      } else {
        this.gridMainEl.removeEventListener("scroll", this.updateViewPortItems.bind(this));
      }
      this.updateViewPortItems();
    }

    @Watch("hasWindowScroll")
    hasWindowScrollHandler() {
      if (this.hasWindowScroll) {
        document.addEventListener("scroll", this.updateViewPortItems.bind(this), {passive: true});
      } else {
        document.removeEventListener("scroll", this.updateViewPortItems.bind(this));
      }
      this.updateViewPortItems();
    }

    private resizeHandler() {
      const rowHeights = getComputedStyle(this.gridMainEl).gridTemplateRows.split(" ");

      this.browserHeight = document.documentElement.clientHeight;
      this.rowHeight = rowHeights.length >= 4 ? parseInt(rowHeights[2]) : 0; // row[0]:column header, row[1]:top shadow row, row[2]:first row, row[3]:second row OR bottom shadow row
      
      if (this.rowHeight > 0) {
        this.hasGridScroll = this.gridMainEl.scrollHeight != this.gridMainEl.clientHeight;
        this.hasWindowScroll = !this.hasGridScroll && this.gridMainEl.clientHeight > this.browserHeight;
        this.maxViewPortItems = Math.ceil(this.browserHeight / this.rowHeight);
      }
    }

    private updateViewPortItems(eventInfo?: Event) {
      let percentScroll = this.getPercentScroll();
      let startIndex: number;

      if (percentScroll <= 50) {
        startIndex = Math.floor(percentScroll * Math.max(this.items.length - this.maxViewPortItems, 0) / 100);
      } else {
        startIndex = Math.ceil(percentScroll * Math.max(this.items.length - this.maxViewPortItems, 0) / 100);
      }

      this.el.style.paddingTop = `${startIndex * this.rowHeight}px`;
      this.el.style.paddingBottom = `${(this.items.length - (startIndex + Math.min(this.items.length, this.maxViewPortItems))) * this.rowHeight}px`;

      this.viewPortItems = this.items.slice(startIndex, startIndex + this.maxViewPortItems);
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
        hiddenHeight = this.gridMainEl.scrollHeight - this.gridMainEl.clientHeight;
        scrollPosition = this.gridMainEl.scrollTop;

      } else if (this.hasWindowScroll) {
        const gridMainRect = this.gridMainEl.getBoundingClientRect();
        hiddenHeight = this.gridMainEl.clientHeight - this.browserHeight;
        scrollPosition = Math.min((gridMainRect.top >= 0 ? 0 : gridMainRect.top * -1), hiddenHeight);
      }

      return (hiddenHeight > 0) ? scrollPosition * 100 / hiddenHeight : 0;
    }
}
