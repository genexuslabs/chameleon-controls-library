import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { property } from "lit/decorators/property.js";
import { state } from "lit/decorators/state.js";
import type { EventEmitter } from "@genexus/kasstor-core/decorators/event.js";
import { Event } from "@genexus/kasstor-core/decorators/event.js";
import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import { html } from "lit-html";
import { classMap } from "lit-html/directives/class-map.js";

import type { ChSmartGridCellCustomEvent } from "../../components";

import { SyncWithRAF } from "../../utilities/sync-with-frames";
import type { SmartGridModel } from "../smart-grid/types";
import { cellsInViewportAreLoadedAndVisible } from "./cells-in-viewport-are-rendered-and-visible";
import { getNewStartAndEndIndexes } from "./get-new-start-and-end-indexes";
import type {
  SmartGridCellVirtualSize,
  VirtualScrollVirtualItems
} from "./types";
import { updateVirtualScrollSize } from "./update-virtual-scroll";
import { emptyItems } from "./utils";

import styles from "./virtual-scroller.scss?inline";

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
  tag: "ch-virtual-scroller",
  shadow: true,
  styles
})
export class ChVirtualScroller extends KasstorElement {
  #startIndex = 0;
  #endIndex = 0;

  #virtualStartSize = 0;
  #virtualEndSize = 0;

  #canUpdateRenderedCells = true;
  #waitingForCellsToBeRendered = false;

  #abortController: AbortController | undefined;
  #syncWithRAF = new SyncWithRAF();

  #virtualSizes: Map<string, SmartGridCellVirtualSize> | undefined;

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
  #smartGrid!: HTMLChSmartGridElement | undefined;

  /**
   * `true` if the virtual scroller is waiting for all the content to be
   * rendered.
   */
  @state() waitingForContent = true;
  @Observe("waitingForContent")
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
  @property({ attribute: "buffer-amount", type: Number }) bufferAmount: number = 5;

  /**
   * Specifies an estimated count of items that fit in the viewport for the
   * initial render. Combined with `bufferAmount`, this determines how many
   * items are rendered before the first scroll event. A value that is too
   * low may cause visible blank space on initial load; a value that is too
   * high increases initial DOM size.
   *
   * Defaults to `10`. Init-only — only used during the first render cycle.
   */
  @property({ attribute: "initial-render-viewport-items", type: Number })
  initialRenderViewportItems: number = 10;

  /**
   * When set to `true`, the grid items will be loaded in inverse order, with
   * the scroll positioned at the bottom on the initial load.
   *
   * If `mode="virtual-scroll"`, only the items at the start of the viewport
   * that are not visible will be removed from the DOM. The items at the end of
   * the viewport that are not visible will remain rendered to avoid flickering
   * issues.
   */
  @property({ attribute: "inverse-loading", type: Boolean }) inverseLoading: boolean = false;

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
  @property({ attribute: false }) items!: SmartGridModel | undefined;
  @Observe("items")
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
  @property({ attribute: "items-count", type: Number }) itemsCount: number;

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
  @property() mode: "virtual-scroll" | "lazy-render" = "virtual-scroll";

  /**
   * Emitted when the slice of visible items changes due to scrolling, resizing,
   * or programmatic updates. The payload includes `startIndex`, `endIndex`,
   * `totalItems`, and the `virtualItems` sub-array that should be rendered.
   *
   * This event is the primary mechanism for the parent `ch-smart-grid` to know
   * which cells to render.
   */
  @Event()
  protected virtualItemsChanged!: EventEmitter<VirtualScrollVirtualItems>;

  /**
   * Fired once when all cells in the initial viewport have been rendered and
   * are visible. After this event, the scroller removes `opacity: 0` and
   * starts listening for scroll/resize events. This event has no payload.
   */
  @Event() protected virtualScrollerDidLoad!: EventEmitter;

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
      this.style.setProperty(VIRTUAL_SCROLL_END_DISPLAY_CUSTOM_VAR, "block");
    }
    // The virtual size must be "destroyed" to avoid displaying and
    // unnecessary gap at the end of the scroll
    else {
      this.style.removeProperty(VIRTUAL_SCROLL_END_DISPLAY_CUSTOM_VAR);
    }
  };

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

    this.style.setProperty(
      VIRTUAL_SCROLL_START_SIZE_CUSTOM_VAR,
      `${this.#virtualStartSize}px`
    );
    this.style.setProperty(
      VIRTUAL_SCROLL_START_DISPLAY_CUSTOM_VAR,
      // The virtual size must be "destroyed" to avoid displaying and
      // unnecessary gap at the start of the scroll
      this.#virtualStartSize === 0 ? "none" : "block"
    );

    this.style.setProperty(
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
    const cellsToRender = getNewStartAndEndIndexes(
      this,
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

    const newStartIndex = Math.max(0, this.#startIndex - startShift);

    // Nothing to update
    if (
      this.#startIndex === newStartIndex &&
      this.#endIndex === newEndIndex &&
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
        this,
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

  #handleSlotChange = () => {
    if (this.waitingForContent) {
      this.#checkInitialRenderVisibility();
    }
  };

  override connectedCallback(): void {
    super.connectedCallback();

    // Listen for the render of the smart cells
    this.addEventListener("smartCellDidLoad", this.#handleRenderedCell);

    this.#resetVirtualScrollerState();
  }

  override firstUpdated(): void {
    this.#smartGrid = this.closest("ch-smart-grid");
    this.#setViewportItemsOnInitialRender(this.items);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    this.#resizeObserver?.disconnect();
    this.#resizeObserver = undefined;

    this.#syncWithRAF.cancel();
    this.#syncWithRAF = undefined;

    // Remove scroll events in the smart grid
    this.#abortController.abort();
  }

  override render() {
    const hostClasses = {
      "ch-virtual-scroller--content-not-loaded": this.waitingForContent,
      "ch-virtual-scroller--content-loaded": !this.waitingForContent,
      "ch-virtual-scroller--virtual-scroll":
        !this.waitingForContent && this.mode === "virtual-scroll"
    };

    Object.keys(hostClasses).forEach(key => {
      if (hostClasses[key]) {
        this.classList.add(key);
      } else {
        this.classList.remove(key);
      }
    });

    return html`<slot @slotchange=${this.#handleSlotChange}></slot>`;
  }
}

export interface HTMLChVirtualScrollerElement extends ChVirtualScroller {}

declare global {
  interface HTMLElementTagNameMap {
    "ch-virtual-scroller": HTMLChVirtualScrollerElement;
  }
}

// ######### Auto generated below #########

declare global {
  // prettier-ignore
  interface HTMLChVirtualScrollerElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChVirtualScrollerElement;
  }

  /** Type of the `ch-virtual-scroller`'s `virtualItemsChanged` event. */
  // prettier-ignore
  type HTMLChVirtualScrollerElementVirtualItemsChangedEvent = HTMLChVirtualScrollerElementCustomEvent<
    HTMLChVirtualScrollerElementEventMap["virtualItemsChanged"]
  >;

  /** Type of the `ch-virtual-scroller`'s `virtualScrollerDidLoad` event. */
  // prettier-ignore
  type HTMLChVirtualScrollerElementVirtualScrollerDidLoadEvent = HTMLChVirtualScrollerElementCustomEvent<
    HTMLChVirtualScrollerElementEventMap["virtualScrollerDidLoad"]
  >;

  interface HTMLChVirtualScrollerElementEventMap {
    virtualItemsChanged: VirtualScrollVirtualItems;
    virtualScrollerDidLoad: void;
  }

  interface HTMLChVirtualScrollerElementEventTypes {
    virtualItemsChanged: HTMLChVirtualScrollerElementVirtualItemsChangedEvent;
    virtualScrollerDidLoad: HTMLChVirtualScrollerElementVirtualScrollerDidLoadEvent;
  }

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
   *
   * @fires virtualItemsChanged Emitted when the slice of visible items changes due to scrolling, resizing,
   *   or programmatic updates. The payload includes `startIndex`, `endIndex`,
   *   `totalItems`, and the `virtualItems` sub-array that should be rendered.
   *   
   *   This event is the primary mechanism for the parent `ch-smart-grid` to know
   *   which cells to render.
   * @fires virtualScrollerDidLoad Fired once when all cells in the initial viewport have been rendered and
   *   are visible. After this event, the scroller removes `opacity: 0` and
   *   starts listening for scroll/resize events. This event has no payload.
   */
  // prettier-ignore
  interface HTMLChVirtualScrollerElement extends ChVirtualScroller {
    // Extend the ChVirtualScroller class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof HTMLChVirtualScrollerElementEventTypes>(type: K, listener: (this: HTMLChVirtualScrollerElement, ev: HTMLChVirtualScrollerElementEventTypes[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof HTMLChVirtualScrollerElementEventTypes>(type: K, listener: (this: HTMLChVirtualScrollerElement, ev: HTMLChVirtualScrollerElementEventTypes[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-virtual-scroller": HTMLChVirtualScrollerElement;
  }

  interface HTMLElementTagNameMap {
    "ch-virtual-scroller": HTMLChVirtualScrollerElement;
  }
}

