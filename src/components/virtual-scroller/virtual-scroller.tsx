import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Method,
  Prop,
  State,
  Watch
} from "@stencil/core";
import type { ChSmartGridCellCustomEvent } from "../../components";

import { SyncWithRAF } from "../../common/sync-with-frames";
import type { SmartGridModel } from "../smart-grid/types";
import { cellsInViewportAreLoadedAndVisible } from "./cells-in-viewport-are-rendered-and-visible";
import { getNewStartAndEndIndexes } from "./get-new-start-and-end-indexes";
import type {
  SmartGridCellVirtualSize,
  VirtualScrollVirtualItems
} from "./types";
import { updateVirtualScrollSize } from "./update-virtual-scroll";
import { emptyItems } from "./utils";

const VIRTUAL_SCROLL_CUSTOM_VAR_PREFIX = "--ch-virtual-scroll__scroll-";

const VIRTUAL_SCROLL_START_SIZE_CUSTOM_VAR = `${VIRTUAL_SCROLL_CUSTOM_VAR_PREFIX}start-size`;
const VIRTUAL_SCROLL_START_DISPLAY_CUSTOM_VAR = `${VIRTUAL_SCROLL_CUSTOM_VAR_PREFIX}start-display`;

const VIRTUAL_SCROLL_END_SIZE_CUSTOM_VAR = `${VIRTUAL_SCROLL_CUSTOM_VAR_PREFIX}end-size`;
const VIRTUAL_SCROLL_END_DISPLAY_CUSTOM_VAR = `${VIRTUAL_SCROLL_CUSTOM_VAR_PREFIX}end-display`;

/**
 * The `ch-virtual-scroller` component provides efficient virtual scrolling for large lists of items within a `ch-smart-grid`, keeping only visible items plus a configurable buffer in the DOM.
 *
 * @remarks
 * ## Features
 *  - `"virtual-scroll"` mode: removes items outside the viewport from the DOM, using CSS pseudo-element spacers (`::before` / `::after`) to maintain scroll height. Lowest memory footprint.
 *  - `"lazy-render"` mode: lazily renders items as they scroll into view, but keeps them in the DOM once rendered. Avoids re-rendering costs at the expense of higher memory usage.
 *  - Configurable buffer amount (`bufferAmount`) for items rendered above and below the viewport.
 *  - Inverse loading support (`inverseLoading`) for chat-style interfaces where the newest items are at the bottom and the scroll starts at the end.
 *  - Automatic re-rendering on scroll and resize events via `requestAnimationFrame`-synced updates.
 *  - Emits `virtualItemsChanged` whenever the visible slice changes, enabling the parent to render only the required cells.
 *  - Hides content with `opacity: 0` until the initial viewport cells are fully loaded, then fires `virtualScrollerDidLoad`.
 *
 * ## Use when
 *  - Rendering hundreds or thousands of items inside a `ch-smart-grid`.
 *  - Building chat interfaces that need efficient inverse-loaded virtual scrolling.
 *
 * ## Do not use when
 *  - The list has fewer than ~100 items — the overhead of virtual scrolling is not justified.
 *  - Used outside of `ch-smart-grid` — this component is designed to work exclusively with `ch-smart-grid`.
 *
 * ## Accessibility
 *  - This component is structural and does not render visible interactive content. Accessibility semantics are handled by the parent `ch-smart-grid` and its cells.
 *
 * ```
 *   <ch-smart-grid>
 *     #shadow-root (open)
 *     |  <slot name="grid-content"></slot>
 *     <ch-virtual-scroller slot="grid-content">
 *       <ch-smart-grid-cell>...</ch-smart-grid-cell>
 *       <ch-smart-grid-cell>...</ch-smart-grid-cell>
 *       ...
 *     </ch-virtual-scroller>
 *   </ch-smart-grid>
 * ```
 *
 * @status experimental
 *
 * @slot - Default slot. The slot for `ch-smart-grid-cell` elements representing the items to be virtually scrolled.
 *
 */
@Component({
  shadow: true,
  styleUrl: "virtual-scroller.scss",
  tag: "ch-virtual-scroller"
})
export class ChVirtualScroller implements ComponentInterface {
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

  @Element() el!: HTMLChVirtualScrollerElement;

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
   * The number of extra elements to render above and below the current
   * container's viewport. A higher value reduces the chance of blank areas
   * during fast scrolling but increases DOM size.
   *
   * The new value is used on the next scroll or resize update.
   */
  @Prop() readonly bufferAmount: number = 5;

  /**
   * Specifies an estimated count of items that fit in the viewport for the
   * initial render. Combined with `bufferAmount`, this determines how many
   * items are rendered before the first scroll event. A value that is too
   * low may cause visible blank space on initial load; a value that is too
   * high increases initial DOM size.
   *
   * Defaults to `10`. Init-only — only used during the first render cycle.
   */
  // TODO: Ensure a min value
  @Prop() readonly initialRenderViewportItems: number = 10;

  /**
   * When set to `true`, the grid items will be loaded in inverse order, with
   * the scroll positioned at the bottom on the initial load.
   *
   * If `mode="virtual-scroll"`, only the items at the start of the viewport
   * that are not visible will be removed from the DOM. The items at the end of
   * the viewport that are not visible will remain rendered to avoid flickering
   * issues.
   */
  @Prop() readonly inverseLoading: boolean = false;

  /**
   * The array of items to be rendered in the `ch-smart-grid`. Each item must
   * have a unique `id` property used internally for virtual size tracking.
   *
   * When a new array reference is assigned, the virtual scroller resets its
   * internal state (indexes, virtual sizes) and performs a fresh initial
   * render. For incremental additions, prefer the `addItems()` method to
   * avoid a full reset.
   *
   * Setting to `undefined` or an empty array emits an empty
   * `virtualItemsChanged` event.
   */
  @Prop() readonly items!: SmartGridModel | undefined;
  @Watch("items")
  itemsChanged(newItems: SmartGridModel) {
    this.#resetVirtualScrollerState();
    this.#setViewportItemsOnInitialRender(newItems);
  }

  /**
   * The total number of elements in the `items` array. Set this property when
   * you mutate the existing array (e.g., push/splice) without assigning a new
   * reference, so the virtual scroller knows the length has changed.
   *
   * If `items` is reassigned as a new array reference, this property is not
   * needed since the `@Watch` on `items` will handle the reset.
   */
  @Prop() readonly itemsCount: number;

  /**
   * Specifies how the control will behave.
   *   - "virtual-scroll": Only the items at the start of the viewport that are
   *   not visible will be removed from the DOM. The items at the end of the
   *   viewport that are not visible will remain rendered to avoid flickering
   *   issues.
   *
   *   - "lazy-render": It behaves similarly to "virtual-scroll" on the initial
   *   load, but when the user scrolls and new items are rendered, those items
   *   that are outside of the viewport won't be removed from the DOM.
   */
  @Prop() readonly mode: "virtual-scroll" | "lazy-render" = "virtual-scroll";

  /**
   * Emitted when the slice of visible items changes due to scrolling, resizing,
   * or programmatic updates. The payload includes `startIndex`, `endIndex`,
   * `totalItems`, and the `virtualItems` sub-array that should be rendered.
   *
   * This event is the primary mechanism for the parent `ch-smart-grid` to know
   * which cells to render.
   */
  @Event()
  virtualItemsChanged: EventEmitter<VirtualScrollVirtualItems>;

  /**
   * Fired once when all cells in the initial viewport have been rendered and
   * are visible. After this event, the scroller removes `opacity: 0` and
   * starts listening for scroll/resize events. This event has no payload.
   */
  @Event() virtualScrollerDidLoad: EventEmitter;

  /**
   * Adds items to the beginning or end of the `items` array without resetting
   * the virtual scroller's internal indexes. This is the preferred way to
   * append or prepend items to the collection (e.g., infinite scroll or
   * chat message loading). When `position` is `"start"`, internal start/end
   * indexes are shifted by the number of added items to keep the viewport
   * stable.
   *
   * After mutation, the scroller triggers a scroll handler update to
   * recalculate visible items.
   *
   * @param position - `"start"` to prepend items, `"end"` to append.
   * @param items - One or more `SmartGridModel` items to add.
   */
  @Method()
  async addItems(position: "start" | "end", ...items: SmartGridModel) {
    if (position === "start") {
      this.items.unshift(...items);

      const newItemsCount = items.length;
      this.#startIndex += newItemsCount;
      this.#endIndex += newItemsCount;
    } else {
      this.items.push(...items);
    }

    this.#handleSmartGridContentScroll();
  }

  #toggleVirtualScrollEndVisibility = () => {
    const makeVisible = this.#virtualEndSize !== 0;

    if (makeVisible) {
      this.el.style.setProperty(VIRTUAL_SCROLL_END_DISPLAY_CUSTOM_VAR, "block");
    }
    // The virtual size must be "destroyed" to avoid displaying and
    // unnecessary gap at the end of the scroll
    else {
      this.el.style.removeProperty(VIRTUAL_SCROLL_END_DISPLAY_CUSTOM_VAR);
    }
  };

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
    this.#toggleVirtualScrollEndVisibility();
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
      this.bufferAmount,
      this.inverseLoading
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

  #resetVirtualScrollerState = () => {
    this.#virtualStartSize = 0;
    this.#virtualEndSize = 0;

    // Render the last items when the scroll is inverted
    if (this.inverseLoading) {
      const lastIndex = this.items.length - 1;

      this.#startIndex = lastIndex;
      this.#endIndex = lastIndex;
    } else {
      this.#startIndex = 0;
      this.#endIndex = 0;
    }

    if (this.mode === "virtual-scroll") {
      this.#virtualSizes = new Map();
    }
  };

  #setViewportItemsOnInitialRender = (items: SmartGridModel) => {
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
    if (
      this.#startIndex === newStartIndex &&
      this.#endIndex === newEndIndex &&
      // TODO: Add a unit test for this use case
      this.items.length > 1
    ) {
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

    this.#resetVirtualScrollerState();
  }

  componentDidLoad(): void {
    this.#smartGrid = this.el.closest("ch-smart-grid");
    this.#setViewportItemsOnInitialRender(this.items);
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
          "ch-virtual-scroller--content-not-loaded": this.waitingForContent,
          "ch-virtual-scroller--content-loaded": !this.waitingForContent,
          "ch-virtual-scroller--virtual-scroll":
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
