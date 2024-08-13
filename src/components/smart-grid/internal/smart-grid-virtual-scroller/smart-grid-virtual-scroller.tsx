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
import { emptyItems } from "./utils";
import { SyncWithRAF } from "../../../../common/sync-with-frames";
import { SmartGridModel } from "../../types";
import {
  SmartGridCellVirtualSize,
  SmartGridVirtualScrollVirtualItems
} from "./types";
import { updateVirtualScrollSize } from "./update-virtual-scroll";
import { ChSmartGridCellCustomEvent } from "../../../../components";
import { cellsInViewportAreLoadedAndVisible } from "./cells-in-viewport-are-rendered-and-visible";
import { getNewStartAndEndIndexes } from "./get-new-start-and-end-indexes";

const VIRTUAL_SCROLL_CUSTOM_VAR_PREFIX =
  "--ch-smart-grid-virtual-scroll__scroll-";

const VIRTUAL_SCROLL_START_SIZE_CUSTOM_VAR = `${VIRTUAL_SCROLL_CUSTOM_VAR_PREFIX}start-size`;
const VIRTUAL_SCROLL_START_DISPLAY_CUSTOM_VAR = `${VIRTUAL_SCROLL_CUSTOM_VAR_PREFIX}start-display`;

const VIRTUAL_SCROLL_END_SIZE_CUSTOM_VAR = `${VIRTUAL_SCROLL_CUSTOM_VAR_PREFIX}end-size`;
const VIRTUAL_SCROLL_END_DISPLAY_CUSTOM_VAR = `${VIRTUAL_SCROLL_CUSTOM_VAR_PREFIX}end-display`;

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
    this.#setVirtualScroller();
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
  @Event()
  virtualItemsChanged: EventEmitter<SmartGridVirtualScrollVirtualItems>;

  /**
   * Fired when the visible content of the virtual scroller did render for the
   * first time.
   */
  @Event() virtualScrollerDidLoad: EventEmitter;

  // TODO: Check what happens when the cells has margin
  #updateVirtualScrollSize = (removedCells?: HTMLChSmartGridCellElement[]) => {
    this.#virtualStartSize = 0;
    this.#virtualEndSize = 0;

    const items = this.items;
    const virtualSizes = this.#virtualSizes;
    const lastIndex = items.length - 1;

    // - - - - - - - - - - - - - DOM read operations - - - - - - - - - - - - -
    const lastIndexForVirtualStartSize = Math.max(0, this.#startIndex - 1);
    const firstIndexForVirtualEndSize = Math.min(lastIndex, this.#endIndex + 1);

    const lastCellForVirtualStartSize = virtualSizes.get(
      items[lastIndexForVirtualStartSize].id
    );
    const firstCellForVirtualEndSize = virtualSizes.get(
      items[firstIndexForVirtualEndSize].id
    );

    // The virtual start size is at least the last unrendered cell
    if (lastCellForVirtualStartSize) {
      this.#virtualStartSize =
        lastCellForVirtualStartSize.offsetTop +
        lastCellForVirtualStartSize.height;
    }

    const additionalHeightsStartIndex = Math.max(1, this.#startIndex);

    // TODO: Add support for gap in this virtual sizes
    // Between two different animation frames, rendered cells can be destroyed
    // and replaced by other new ones. When cells are destroyed the scroll size
    // must be maintained. To do this, the virtual start size is increased by
    // the size of the cells that have not yet been rendered
    for (
      let virtualIndex = additionalHeightsStartIndex;
      virtualIndex < this.#endIndex;
      virtualIndex++
    ) {
      const cellIdToAddVirtualSize = items[virtualIndex].id;
      const virtualSize = virtualSizes.get(cellIdToAddVirtualSize);

      if (virtualSize) {
        this.#virtualStartSize += virtualSize.height;
      }
    }

    // Additional size for the virtual start scroll
    if (this.#endIndex === lastIndex) {
      const cellIdToAddVirtualSize = items[this.#endIndex].id;
      const virtualSize = virtualSizes.get(cellIdToAddVirtualSize);

      if (virtualSize) {
        this.#virtualStartSize += virtualSize.height;
      }
    }
    // Virtual end scroll
    else if (firstCellForVirtualEndSize) {
      let maxSmartGridVirtualHeight = 0;

      virtualSizes.forEach(virtualSize => {
        maxSmartGridVirtualHeight = Math.max(
          maxSmartGridVirtualHeight,
          virtualSize.offsetTop + virtualSize.height
        );
      });

      this.#virtualEndSize =
        maxSmartGridVirtualHeight - firstCellForVirtualEndSize.offsetTop;
    }

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
    this.el.style.setProperty(
      VIRTUAL_SCROLL_START_DISPLAY_CUSTOM_VAR,
      // The virtual size must be "destroyed" to avoid displaying and
      // unnecessary gap at the start of the scroll
      this.#virtualStartSize === 0 ? "none" : "block"
    );

    this.el.style.setProperty(
      VIRTUAL_SCROLL_END_SIZE_CUSTOM_VAR,
      `${this.#virtualEndSize}px`
    );
    this.el.style.setProperty(
      VIRTUAL_SCROLL_END_DISPLAY_CUSTOM_VAR,
      // The virtual size must be "destroyed" to avoid displaying and
      // unnecessary gap at the end of the scroll
      this.#virtualEndSize === 0 ? "none" : "block"
    );
  };

  #handleSmartGridContentScroll = () => {
    if (this.#canUpdateRenderedCells) {
      this.#syncWithRAF.perform(this.#updateRenderedCells);
    }
  };

  #updateRenderedCells = () => {
    // this.#canUpdateRenderedCells = false;

    // requestAnimationFrame(() => {
    //   this.#canUpdateRenderedCells = true;
    // });

    const cellsToRender = getNewStartAndEndIndexes(
      this.el,
      this.#smartGrid,
      this.items,
      this.#virtualSizes,
      this.#virtualStartSize,
      this.#virtualEndSize,
      this.bufferAmount
    );

    if (cellsToRender.type === "waiting-for-cells-to-render") {
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
      const { startIndex, endIndex } = cellsToRender;

      // Nothing to update
      if (this.#startIndex === startIndex && this.#endIndex === endIndex) {
        return;
      }

      const removedCells = updateVirtualScrollSize(
        cellsToRender,
        this.#virtualSizes,
        this.items
      );

      this.#startIndex = startIndex;
      this.#endIndex = endIndex;

      this.#emitVirtualItemsChange(removedCells);
    }
  };

  #emitVirtualItemsChange = (removedCells?: HTMLChSmartGridCellElement[]) => {
    this.#updateVirtualScrollSize(removedCells);
    const virtualItems = this.items.slice(this.#startIndex, this.#endIndex + 1);

    this.virtualItemsChanged.emit({
      startIndex: this.#startIndex,
      endIndex: this.#endIndex,
      totalItems: this.items.length,
      virtualItems
    });
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

    this.#startIndex = newStartIndex;
    this.#endIndex = newEndIndex;

    const removedCells =
      this.mode === "virtual-scroll" &&
      renderedCells !== undefined &&
      renderedCells.length > 0
        ? updateVirtualScrollSize(
            {
              endIndex: this.#endIndex,
              startIndex: this.#startIndex,
              renderedCells,
              type: "index"
            },
            this.#virtualSizes,
            this.items
          )
        : [];

    this.#emitVirtualItemsChange(removedCells);
  };

  #setVirtualScroller = () => {
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

      this.#resizeObserver = new ResizeObserver(
        this.#handleSmartGridContentScroll
      );
      this.#resizeObserver.observe(this.#smartGrid);
    });
  };

  #handleRenderedCell = (event: ChSmartGridCellCustomEvent<string>) => {
    if (this.waitingForContent) {
      this.#checkInitialRenderVisibility();
    } else {
      this.#checkCellsRenderedAtRuntime(event.detail);
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
    });

  #checkCellsRenderedAtRuntime = (cellId: string) => {
    // Delete virtual size, since the cell is now rendered
    this.#virtualSizes.delete(cellId);

    this.#updateVirtualScrollSize();

    if (this.#waitingForCellsToBeRendered) {
      this.#handleSmartGridContentScroll();
    }
  };

  connectedCallback(): void {
    // Listen for the render of the smart cells
    this.el.addEventListener("smartCellDidLoad", this.#handleRenderedCell);

    if (this.mode === "virtual-scroll") {
      this.#virtualSizes = new Map();
    }

    // Render the last items when the scroll is inverted
    if (this.inverseLoading) {
      const lastIndex = this.items.length - 1;

      this.#startIndex = lastIndex;
      this.#endIndex = lastIndex;
    }
  }

  componentDidLoad(): void {
    this.#smartGrid = this.el.closest("ch-smart-grid");
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
        class={{
          "ch-smart-virtual-scroller--content-not-loaded":
            this.waitingForContent,
          "ch-smart-virtual-scroller--content-loaded": !this.waitingForContent,
          "ch-smart-virtual-scroller--virtual-scroll":
            !this.waitingForContent && this.mode === "virtual-scroll"
        }}
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
