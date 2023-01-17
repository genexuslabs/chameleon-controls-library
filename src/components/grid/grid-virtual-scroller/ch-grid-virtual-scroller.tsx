import { Component, Prop, Element } from "@stencil/core";

@Component({
  tag: "ch-grid-virtual-scroller",
  styleUrl: "ch-grid-virtual-scroller.scss",
  shadow: false,
})
export class ChGridVirtualScrollerLegend {
    @Element() el: HTMLChGridVirtualScrollerElement;
    @Prop() items: any[];
    @Prop() renderItems: (item:any) => {};

    // @State() startIndex = 0;
    // @State() totalViewPortItems = 1;
    // @State() rowHeight: string;

    // private gridMainEl: HTMLElement;
    // private observer: ResizeObserver;

    // componentWillLoad() {
    //     this.gridMainEl = this.el.assignedSlot.parentElement;
    //     this.gridMainEl.addEventListener("scroll", this.updateStartIndex.bind(this), {passive: true});

    //     this.rowHeight = '21px';

    //     this.observer = new ResizeObserver(this.resizing.bind(this));
    //     this.observer.observe(this.gridMainEl);
    // }

    // componentDidLoad() {
    //     this.updateShadowRows();
    // }

    // @Watch("items")
    // itemsHandler() {
    //     this.updateStartIndex();
    //     this.updateShadowRows();
    // }

    // @Watch("totalViewPortItems")
    // totalViewPortItemsHandler() {
    //     this.updateStartIndex();
    // }

    // render() {

    //     this.renderItems(this.items.slice(this.startIndex, this.startIndex + this.totalViewPortItems).map((item, i) => {
    //         item.chGridRow = this.startIndex+2+i;
    //         return item;
    //     }));
    // }

    // private updateStartIndex() {
    //     let percentScroll = this.gridMainEl.scrollTop * 100 / (this.gridMainEl.scrollHeight-this.gridMainEl.clientHeight);
    //     if (isNaN(percentScroll)) {
    //         percentScroll = 0;
    //     }
    //     this.startIndex = Math.floor(percentScroll * (this.items.length - this.totalViewPortItems) / 100);
    // }

    // private updateShadowRows() {
    //     if (this.gridMainEl) {
    //         this.gridMainEl.style.gridAutoRows = this.rowHeight;
    //         this.el.style.setProperty('--ch-grid-vs-row-height', this.rowHeight);
    //         this.el.style.setProperty('--ch-grid-vs-row-start', "2");
    //         this.el.style.setProperty('--ch-grid-vs-row-end', `${this.items.length+2}`);
    //     }
    // }

    // private resizing() {

    //     if (this.gridMainEl.scrollHeight != this.gridHeight) {
    //         // const templateRows = getComputedStyle(this.gridMainEl).gridTemplateRows.split(" ");
            
    //         // this.rowHeight = templateRows[1] ?? '0px';
    //     }
    // }
}
