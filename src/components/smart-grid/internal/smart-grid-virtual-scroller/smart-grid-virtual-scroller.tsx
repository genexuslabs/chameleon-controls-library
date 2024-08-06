import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Prop,
  State,
  Watch
} from "@stencil/core";
import { cellsInViewportAreLoadedAndVisible, emptyItems } from "./utils";
import { SyncWithRAF } from "../../../../common/sync-with-frames";

@Component({
  shadow: true,
  styleUrl: "smart-grid-virtual-scroller.scss",
  tag: "ch-smart-grid-virtual-scroller"
})
export class ChSmartGridVirtualScroller implements ComponentInterface {
  #startIndex = 0;
  #endIndex = 0;

  #syncWithRAF = new SyncWithRAF();

  // /**
  //  * The list of items to display within the current viewport.
  //  */
  // // eslint-disable-next-line @stencil-community/own-props-must-be-private
  // #viewPortItems: any[];

  #resizeObserver: ResizeObserver | undefined;

  /**
   * This element represents the ch-smart-grid element.
   * ```tsx
   *   <ch-smart-grid>
   *     #shadow-root (open)
   *     |  <ch-infinite-scroll></ch-infinite-scroll>
   *     |  <slot name="grid-content"></slot>
   *     <ch-smart-grid-virtual-scroller slot="grid-content">
   *       <ch-smart-grid-cell>...</ch-smart-grid-cell>
   *       <ch-smart-grid-cell>...</ch-smart-grid-cell>
   *       ...
   *     </ch-smart-grid-virtual-scroller>
   *   </ch-smart-grid>
   * ```
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #smartGrid!: HTMLChSmartGridElement;

  @Element() el!: HTMLChSmartGridVirtualScrollerElement;

  /**
   * `true` if the virtual scroller is waiting for all the content to be
   * rendered.
   */
  @State() waitingForContent = true;

  /**
   * The number of elements to be rendered above and below the current
   * container's viewport.
   */
  @Prop() readonly bufferAmount: number = 5;

  /**
   * Specifies an estimation for the items that will enter in the viewport of
   * the initial render.
   */
  @Prop() readonly initialRenderViewportItems: number = 10;

  /**
   * The array of items to be rendered in the ch-smart-grid.
   */
  @Prop() readonly items!: any[] | undefined;
  @Watch("items")
  itemsChanged(newItems: any[], oldItems: any[]) {
    if (emptyItems(oldItems)) {
      this.#updateViewportItemsOnInitialRender(newItems);
    }
  }

  /**
   * The number of elements in the items array.
   * Use if the array changes, without recreating the array.
   */
  @Prop() readonly itemsCount: number;

  /**
   * Emitted when the array of visible items in the ch-smart-grid changes.
   */
  @Event() virtualItemsChanged: EventEmitter<any[]>;

  #updateViewportItemsOnInitialRender = (items: any[]) => {
    if (emptyItems(items)) {
      this.virtualItemsChanged.emit([]);
      return;
    }

    const itemsCount = items.length;
    this.#endIndex = Math.min(
      this.initialRenderViewportItems + this.bufferAmount * 2,
      itemsCount
    );

    this.virtualItemsChanged.emit(
      items.slice(this.#startIndex, this.#endIndex)
    );
  };

  #handleSizeChange = () => {};

  #setVirtualScroller = () => {
    this.#smartGrid = this.el.closest("ch-smart-grid");

    this.#resizeObserver = new ResizeObserver(this.#handleSizeChange);

    this.#resizeObserver.observe(this.el);
    this.#resizeObserver.observe(this.#smartGrid);
  };

  #checkInitialRenderVisibility = () =>
    this.#syncWithRAF.perform(() => {
      this.waitingForContent = !cellsInViewportAreLoadedAndVisible(
        this.el,
        this.#smartGrid,
        true
      );
    });

  #watchInitialLoad = () => {
    this.el.addEventListener(
      "smartCellDidLoad",
      this.#checkInitialRenderVisibility
    );
  };

  connectedCallback(): void {
    this.#watchInitialLoad();
  }

  componentDidLoad(): void {
    this.#updateViewportItemsOnInitialRender(this.items);

    this.#setVirtualScroller();
  }

  disconnectedCallback(): void {
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = undefined;

    this.#syncWithRAF.cancel();
    this.#syncWithRAF = undefined;
  }

  render() {
    return (
      <Host
        class={
          this.waitingForContent
            ? "ch-smart-virtual-scroller-content-not-loaded"
            : undefined
        }
      >
        <slot
          onSlotchange={
            this.waitingForContent
              ? this.#checkInitialRenderVisibility
              : undefined
          }
        ></slot>
      </Host>
    );
  }
}
