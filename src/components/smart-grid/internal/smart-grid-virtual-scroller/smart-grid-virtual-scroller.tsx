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
import {
  cellsInViewportAreLoadedAndVisible,
  emptyItems,
  getAmountOfCellsToLoad
} from "./utils";
import { SyncWithRAF } from "../../../../common/sync-with-frames";
import { SmartGridModel } from "../../types";

@Component({
  shadow: true,
  styleUrl: "smart-grid-virtual-scroller.scss",
  tag: "ch-smart-grid-virtual-scroller"
})
export class ChSmartGridVirtualScroller implements ComponentInterface {
  #startIndex = 0;
  #endIndex = 0;

  #canUpdateRenderedCells = true;
  #waitingForCellsToBeRendered = false;

  #abortController: AbortController | undefined; // Allocated at runtime to save resources
  #syncWithRAF = new SyncWithRAF();

  /**
   * The list of items to display within the current viewport.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #virtualItems: SmartGridModel;

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
  #smartGrid!: HTMLChSmartGridElement | undefined;

  @Element() el!: HTMLChSmartGridVirtualScrollerElement;

  /**
   * `true` if the virtual scroller is waiting for all the content to be
   * rendered.
   */
  @State() waitingForContent = true;
  @Watch("waitingForContent")
  waitingForContentChanged() {
    this.#abortController = new AbortController();

    // RAF is used to avoid unnecessary check on the initial load when using
    // inverseLoading, since on the initial load the scroll will be repositioned
    requestAnimationFrame(() => {
      this.#smartGrid.addEventListener(
        "scroll",
        this.#handleSmartGridContentScroll,
        {
          passive: true,
          signal: this.#abortController.signal
        }
      );
    });
  }

  /**
   * The number of elements to be rendered above and below the current
   * container's viewport.
   */
  @Prop() readonly bufferAmount: number = 5;

  /**
   * Specifies an estimation for the items that will enter in the viewport of
   * the initial render.
   */
  // TODO: Ensure a min value
  @Prop() readonly initialRenderViewportItems: number = 10;

  /**
   * When set to `true`, the grid items will be loaded in inverse order, with
   * the first element at the bottom and the "Loading" message (infinite-scroll)
   * at the top.
   */
  @Prop() readonly inverseLoading: boolean = false;

  /**
   * The array of items to be rendered in the ch-smart-grid.
   */
  @Prop() readonly items!: SmartGridModel | undefined;
  @Watch("items")
  itemsChanged(newItems: SmartGridModel, oldItems: SmartGridModel) {
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
   * Specifies how the control will behave.
   */
  @Prop() readonly mode: "virtual-scroll" | "lazy-render" = "virtual-scroll";

  /**
   * Emitted when the array of visible items in the ch-smart-grid changes.
   */
  @Event() virtualItemsChanged: EventEmitter<SmartGridModel>;

  /**
   * Fired when the visible content of the virtual scroller did render for the
   * first time.
   */
  @Event() virtualScrollerDidLoad: EventEmitter;

  #handleSmartGridContentScroll = () => {
    if (this.#canUpdateRenderedCells) {
      this.#syncWithRAF.perform(this.#updateRenderedCells);
    }
  };

  #updateRenderedCells = () => {
    // this.#canUpdateRenderedCells = false;

    // requestAnimationFrame(() => {
    // this.#canUpdateRenderedCells = true;
    // });

    const cellsToRender = getAmountOfCellsToLoad(
      this.el,
      this.#smartGrid,
      this.#virtualItems,
      this.bufferAmount
    );

    this.#waitingForCellsToBeRendered = !!cellsToRender.break;

    if (
      this.#waitingForCellsToBeRendered ||
      (cellsToRender.startShift === 0 && cellsToRender.endShift === 0)
    ) {
      return;
    }

    this.#shiftIndex(cellsToRender.startShift, cellsToRender.endShift);

    if (cellsToRender.endShift > 0) {
      console.log("ADD", cellsToRender);
    } else if (cellsToRender.endShift < 0) {
      console.log("REMOVE", cellsToRender);
    }
  };

  #emitVirtualItemsChange = () => {
    const virtualItems = this.items.slice(this.#startIndex, this.#endIndex);

    this.#virtualItems = virtualItems;
    this.virtualItemsChanged.emit(virtualItems);
  };

  #updateViewportItemsOnInitialRender = (items: SmartGridModel) => {
    if (emptyItems(items)) {
      this.#emitVirtualItemsChange();
      return;
    }

    const indexToShift = this.initialRenderViewportItems + this.bufferAmount;

    if (this.inverseLoading) {
      this.#shiftIndex(indexToShift, 0);
    } else {
      this.#shiftIndex(0, indexToShift);
    }
  };

  #shiftIndex = (startIndexShift: number, endIndexShift: number) => {
    const startShift =
      this.mode === "lazy-render"
        ? Math.max(0, startIndexShift)
        : startIndexShift;
    const endShift =
      this.mode === "lazy-render" ? Math.max(0, endIndexShift) : endIndexShift;

    this.#startIndex = Math.max(0, this.#startIndex - startShift);
    this.#endIndex = Math.min(this.#endIndex + endShift, this.items.length);

    this.#emitVirtualItemsChange();
  };

  #handleSizeChange = () => {};

  #setVirtualScroller = () => {
    this.#smartGrid = this.el.closest("ch-smart-grid");

    this.#resizeObserver = new ResizeObserver(this.#handleSizeChange);

    this.#resizeObserver.observe(this.el);
    this.#resizeObserver.observe(this.#smartGrid);
  };

  #handleRenderedCell = () => {
    if (this.waitingForContent) {
      this.#checkInitialRenderVisibility();
    } else {
      this.#checkCellsRenderedAtRuntime();
    }
  };

  #checkInitialRenderVisibility = () =>
    this.#syncWithRAF.perform(() => {
      const waitingForContent = !cellsInViewportAreLoadedAndVisible(
        this.el,
        this.#smartGrid,
        this.inverseLoading
      );

      if (!waitingForContent) {
        requestAnimationFrame(() => {
          this.virtualScrollerDidLoad.emit();
          this.waitingForContent = waitingForContent;
        });
      }

      console.log("checkInitialRenderVisibility...");
    });

  #checkCellsRenderedAtRuntime = () => {
    if (this.#waitingForCellsToBeRendered) {
      console.log(
        "PROCESS EDGE CASE * -* -* -* - *- * - *- * - * -* - * -* -* - *- * - *"
      );

      this.#waitingForCellsToBeRendered = false;
      this.#handleSmartGridContentScroll();
    }
  };

  #watchInitialLoad = () => {
    this.el.addEventListener("smartCellDidLoad", this.#handleRenderedCell);
  };

  connectedCallback(): void {
    this.#watchInitialLoad();

    if (this.inverseLoading) {
      const lastIndex = this.items.length - 1;

      this.#startIndex = lastIndex;
      this.#endIndex = lastIndex;
    }
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

    // Remove scroll events in the smart grid
    this.#abortController.abort();
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
