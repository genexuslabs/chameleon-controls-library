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
import { SmartGridCellVirtualSize } from "./types";
import {
  updateVirtualScroll,
  updateVirtualScroll2
} from "./update-virtual-scroll";
import { ChSmartGridCellCustomEvent } from "../../../../components";

const VIRTUAL_SCROLL_START_SIZE_CUSTOM_VAR =
  "--ch-smart-grid-virtual-scroll__scroll-start-size";

const VIRTUAL_SCROLL_END_SIZE_CUSTOM_VAR =
  "--ch-smart-grid-virtual-scroll__scroll-end-size";

@Component({
  shadow: true,
  styleUrl: "smart-grid-virtual-scroller.scss",
  tag: "ch-smart-grid-virtual-scroller"
})
export class ChSmartGridVirtualScroller implements ComponentInterface {
  #startIndex = 0;
  #endIndex = 0;

  #virtualStartSize = 0;
  #virtualEndSize = 0;

  #canUpdateRenderedCells = true;
  #waitingForCellsToBeRendered = false;

  #abortController: AbortController | undefined; // Allocated at runtime to save resources
  #syncWithRAF = new SyncWithRAF();

  /**
   * The list of items to display within the current viewport.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #virtualItems: SmartGridModel;

  #virtualSizes: Map<string, SmartGridCellVirtualSize> | undefined; // Allocated at runtime to save resources

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
          // passive: true,
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

  // TODO: Add support to remove the gap between the virtual scroll and the
  // items if the virtual scroll does not have size
  // TODO: Check what happens when the cells has margin
  #updateVirtualSize = (removedCells?: HTMLChSmartGridCellElement[]) => {
    this.#virtualStartSize = 0;
    this.#virtualEndSize = 0;

    // - - - - - - - - - - - - - DOM read operations - - - - - - - - - - - - -
    const smartGridScrollTop = this.#smartGrid.scrollTop;
    // const smartGridScrollHeight = this.#smartGrid.scrollHeight; // TODO: Check what happens if the grid has padding, margin and borders
    // const scrollerComputedStyle = getComputedStyle(this.el);
    // const rowGap = Number(scrollerComputedStyle.rowGap.replace("px", ""));

    // console.log("rowGap", rowGap);

    this.#virtualSizes.forEach((virtualSize, key) => {
      if (key === "13") {
        // console.log(key, "smartGridScrollTop " + smartGridScrollTop);
      }

      if (virtualSize.offsetTop <= smartGridScrollTop) {
        this.#virtualStartSize = Math.max(
          this.#virtualStartSize,
          virtualSize.offsetTop + virtualSize.height
        );
      } else {
        // console.log(
        //   "ADDING virtualSize to the end virtual " + key,
        //   virtualSize,
        //   key
        // );
        this.#virtualEndSize += virtualSize.height;
      }
    });

    // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
    // Faster removal of the cells, due to the virtual height will be updated
    // in the next DOM write operation
    removedCells?.forEach(removedCell => {
      removedCell.style.display = "none";
    });

    this.el.style.setProperty(
      VIRTUAL_SCROLL_START_SIZE_CUSTOM_VAR,
      `${this.#virtualStartSize}px`
    );

    // console.log("virtualStartSize", virtualStartSize);

    this.el.style.setProperty(
      VIRTUAL_SCROLL_END_SIZE_CUSTOM_VAR,
      `${this.#virtualEndSize}px`
    );

    // console.log(
    //   "NEW VIRTUAL START SIZE:::::::::::::::::::::::",
    //   virtualStartSize
    // );

    // console.log("NEW VIRTUAL END SIZE:::::::::::::::::::::::", virtualEndSize);
  };

  #handleSmartGridContentScroll = () => {
    if (this.#canUpdateRenderedCells) {
      console.log("///Try to update", this.#smartGrid.scrollTop);
      this.#syncWithRAF.perform(this.#updateRenderedCells);
    }
  };

  #updateRenderedCells = () => {
    // this.#canUpdateRenderedCells = false;

    // requestAnimationFrame(() => {
    //   this.#canUpdateRenderedCells = true;
    // });

    const cellsToRender = getAmountOfCellsToLoad(
      this.el,
      this.#smartGrid,
      this.items,
      this.#virtualSizes,
      this.#virtualStartSize,
      this.#virtualEndSize,
      this.bufferAmount
    );

    if (cellsToRender.type === "break") {
      console.log("/////BREAK");
      this.#waitingForCellsToBeRendered = true;
      return;
    }

    this.#waitingForCellsToBeRendered = false;

    if (cellsToRender.type === "shift") {
      if (cellsToRender.startShift === 0 && cellsToRender.endShift === 0) {
        return;
      }

      this.#shiftIndex(
        cellsToRender.startShift,
        cellsToRender.endShift,
        cellsToRender.renderedCells
      );
    }
    //
    else {
      // console.log(cellsToRender);

      const { startIndex, endIndex } = cellsToRender;

      // Nothing to update
      if (this.#startIndex === startIndex && this.#endIndex === endIndex) {
        // console.log("Nothing to update (new strategy)");
        return;
      }

      const removedCells = updateVirtualScroll2(
        this.mode,
        cellsToRender.newRenderedCellStartIndex,
        cellsToRender.newRenderedCellEndIndex,
        this.#virtualSizes,
        cellsToRender.renderedCells
      );

      // console.log("New Virtual Index (new strategy)", startIndex, endIndex);

      this.#startIndex = startIndex;
      this.#endIndex = endIndex;

      this.#emitVirtualItemsChange(removedCells);
    }

    // if (cellsToRender.endShift > 0) {
    //   console.log("ADD", cellsToRender);
    // } else if (cellsToRender.endShift < 0) {
    //   console.log("REMOVE", cellsToRender);
    // }
  };

  #emitVirtualItemsChange = (removedCells?: HTMLChSmartGridCellElement[]) => {
    const virtualItems = this.items.slice(this.#startIndex, this.#endIndex);

    // console.log(
    //   "this.#virtualStartSizes LENGTH BEFORE REMOVING",
    //   this.#virtualStartSizes.size
    // );
    // console.log(
    //   "this.#virtualEndSizes LENGTH BEFORE REMOVING",
    //   this.#virtualEndSizes.size
    // );

    this.#updateVirtualSize(removedCells);

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

  #shiftIndex = (
    startIncomingShift: number,
    endIncomingShift: number,
    renderedCells?: HTMLChSmartGridCellElement[]
  ) => {
    const startShift =
      this.mode === "lazy-render"
        ? Math.max(0, startIncomingShift)
        : startIncomingShift;
    const endShift =
      this.mode === "lazy-render"
        ? Math.max(0, endIncomingShift)
        : endIncomingShift;

    // Nothing to update
    if (startShift === 0 && endShift === 0) {
      return;
    }

    const newEndIndex = Math.min(
      this.#endIndex + endShift,
      this.items.length - 1
    );

    // const lastEndIndex = this.items.length - 1 === endShift;
    // const adjustmentToAvoidFlickering = lastEndIndex ? 1 : 0;

    const newStartIndex = Math.max(0, this.#startIndex - startShift);

    // Nothing to update
    if (this.#startIndex === newStartIndex && this.#endIndex === newEndIndex) {
      return;
    }

    const removedCells = updateVirtualScroll(
      this.mode,
      startShift,
      endShift,
      this.#virtualSizes,
      renderedCells
    );

    // console.log("New Virtual Index", newStartIndex, newEndIndex);

    this.#startIndex = newStartIndex;
    this.#endIndex = newEndIndex;

    this.#emitVirtualItemsChange(removedCells);
  };

  #handleSizeChange = () => {};

  #setVirtualScroller = () => {
    this.#smartGrid = this.el.closest("ch-smart-grid");

    this.#resizeObserver = new ResizeObserver(this.#handleSizeChange);

    this.#resizeObserver.observe(this.el);
    this.#resizeObserver.observe(this.#smartGrid);
  };

  #handleRenderedCell = (event: ChSmartGridCellCustomEvent<string>) => {
    if (this.waitingForContent) {
      this.#checkInitialRenderVisibility();
    } else {
      this.#checkCellsRenderedAtRuntime(event.detail);
    }
  };

  #checkInitialRenderVisibility = () => {
    if (this.waitingForContent) {
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

        // console.log("checkInitialRenderVisibility...");
      });
    }
  };

  #checkCellsRenderedAtRuntime = (cellId: string) => {
    // Delete virtual size, since the cell is now rendered
    this.#virtualSizes.delete(cellId);

    console.log("Did load", cellId);

    if (this.#waitingForCellsToBeRendered) {
      // console.log(
      //   "PROCESS EDGE CASE * -* -* -* - *- * - *- * - * -* - * -* -* - *- * - *"
      // );

      this.#handleSmartGridContentScroll();
    } else {
      this.#updateVirtualSize();
    }
  };

  #watchInitialLoad = () => {
    this.el.addEventListener("smartCellDidLoad", this.#handleRenderedCell);
  };

  connectedCallback(): void {
    this.#watchInitialLoad();

    if (this.mode === "virtual-scroll") {
      this.#virtualSizes = new Map();
    }

    if (this.inverseLoading) {
      const lastIndex = this.items.length - 1;

      this.#startIndex = lastIndex;
      this.#endIndex = lastIndex;
    }
  }

  componentDidLoad(): void {
    this.#setVirtualScroller();
    this.#updateViewportItemsOnInitialRender(this.items);
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
            ? "ch-smart-virtual-scroller--content-not-loaded"
            : "ch-smart-virtual-scroller--content-loaded"
        }
      >
        {!this.waitingForContent && this.mode === "virtual-scroll" && (
          <div aria-hidden="true" class="virtual-scroll-start"></div>
        )}

        <slot
          onSlotchange={
            this.waitingForContent
              ? this.#checkInitialRenderVisibility
              : undefined
          }
        ></slot>

        {!this.waitingForContent && this.mode === "virtual-scroll" && (
          <div aria-hidden="true" class="virtual-scroll-end"></div>
        )}
      </Host>
    );
  }
}
