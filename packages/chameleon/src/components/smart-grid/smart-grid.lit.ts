import { Component, KasstorElement } from "@genexus/kasstor-core/decorators/component.js";
import { Event, type EventEmitter } from "@genexus/kasstor-core/decorators/event.js";
import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";
import { state } from "lit/decorators/state.js";

import type { AccessibleNameComponent } from "../../typings/accessibility.js";
import type { ChameleonControlsTagName } from "../../typings/chameleon-components.js";
import type { SmartGridDataState } from "../infinite-scroll/types";
import type { VirtualScrollVirtualItems } from "../virtual-scroller/types.js";

import { Host } from "../../utilities/host/host.js";
import { SCROLLABLE_CLASS } from "../../utilities/reserved-names/common.js";
import { adoptCommonThemes } from "../../utilities/theme.js";
import { calculateSpaceToReserve } from "./calculate-space-to-reserve.js";

import styles from "./smart-grid.scss?inline";

const HIDE_CONTENT_AFTER_LOADING_CLASS = "ch-smart-grid--loaded-render-delay";

const SMART_GRID_CELL_TAG_NAME = "ch-smart-grid-cell" satisfies ChameleonControlsTagName;

const RESERVED_SPACE_CLASS_NAME = "ch-smart-grid-cell-reserve-space";
const RESERVED_SPACE_CUSTOM_VAR = "--ch-smart-grid-smart-cell-reserved-space-size";

/**
 * The `ch-smart-grid` component is an accessible grid layout for data-driven applications that require infinite scrolling, virtual rendering, and dynamic content loading.
 *
 * @remarks
 * ## Features
 *  - Infinite scrolling via `ch-infinite-scroll` integration with configurable thresholds.
 *  - Standard and inverse loading orders (newest items at the bottom or top).
 *  - Automatic scroll-position management to prevent layout shifts (CLS) during async content loads.
 *  - Anchor a specific cell at the top of the viewport with reserved space, similar to code editors (via `scrollEndContentToPosition`).
 *  - Auto-grow mode (`autoGrow`) to adjust size to content, or fixed size with scrollbars.
 *  - ARIA live-region support for accessible announcements.
 *  - Virtual-scroller integration for rendering only visible items.
 *
 * ## Use when
 *  - Building chat-like interfaces with inverse loading.
 *  - Displaying large, dynamically loaded data sets with virtual scrolling.
 *  - Infinite-scroll or paginated feeds with bottom-to-top inverse loading (e.g., chat, activity streams).
 *
 * ## Do not use when
 *  - Displaying static tabular data with columns and headers -- use `ch-tabular-grid` instead.
 *  - A fixed, non-scrollable list is sufficient -- prefer `ch-action-list-render`.
 *
 * ## Accessibility
 *  - The host element uses `aria-live="polite"` to announce content changes to assistive technologies.
 *  - `aria-busy` is set to `"true"` during `"initial"` and `"loading"` states, preventing premature announcements.
 *  - The `accessibleName` property maps to `aria-label` on the host.
 *
 * @status experimental
 *
 * @slot grid-initial-loading-placeholder - Placeholder content shown during the initial loading state before any data has been fetched.
 * @slot grid-content - Primary content slot for grid cells. Rendered when the grid has records and is not in the initial loading state.
 * @slot grid-content-empty - Fallback content displayed when the grid has finished loading but contains no records.
 */
@Component({
  shadow: {},
  styles,
  tag: "ch-smart-grid"
})
export class ChSmartGrid extends KasstorElement implements AccessibleNameComponent {
  #lastCellRef: HTMLChSmartGridCellElement | null = null;

  /**
   * Used in virtual scroll scenarios. Enables infinite scrolling if the
   * virtual items are closer to the real threshold.
   */
  @state() infiniteScrollEnabled = true;

  @state() cellRefAlignedAtTheTop: HTMLChSmartGridCellElement | null = null;
  @Observe("cellRefAlignedAtTheTop")
  protected cellRefAlignedAtTheTopChanged(
    newValue: HTMLChSmartGridCellElement | null,
    oldValue: HTMLChSmartGridCellElement | null
  ) {
    this.#reserveSpaceInLastCellToKeepAnchorCellAlignedAtTheStart();

    // Connect watcher to keep the anchor cell aligned
    if (oldValue === null) {
      this.addEventListener(
        "smartCellDidLoad",
        this.#reserveSpaceInLastCellToKeepAnchorCellAlignedAtTheStart
      );
      this.addEventListener(
        "smartCellDisconnectedCallback",
        this.#observeCellRemovals as EventListener
      );
    }
    // The anchor cell no longer exists, remove watcher
    else if (newValue === null) {
      this.removeEventListener(
        "smartCellDidLoad",
        this.#reserveSpaceInLastCellToKeepAnchorCellAlignedAtTheStart
      );
      this.removeEventListener(
        "smartCellDisconnectedCallback",
        this.#observeCellRemovals as EventListener
      );
    }
  }

  /**
   * This variable is used to avoid layout shifts (CLS) at the initial load,
   * due to the async render of the content.
   */
  #contentIsHidden = false;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @property({ attribute: "accessible-name" }) accessibleName: string | undefined;

  /**
   * When `true`, the control size grows automatically to fit its content
   * (no scrollbars). When `false`, the control has a fixed size and
   * shows scrollbars if the content overflows.
   *
   * When `false`, the `ch-scrollable` class is applied to the host,
   * enabling `contain: strict` and `overflow: auto`.
   *
   * Interacts with `inverseLoading`: when both `autoGrow` and
   * `inverseLoading` are `true`, the CLS-avoidance opacity class is
   * removed after the first render instead of waiting for the
   * virtual-scroller load event.
   */
  @property({ type: Boolean, attribute: "auto-grow" }) readonly autoGrow: boolean | undefined =
    false;

  /**
   * Specifies how the scroll position will be adjusted when the content size
   * changes when using `inverseLoading = true`.
   *   - "at-scroll-end": If the scroll is positioned at the end of the content,
   *   the chat will maintain the scroll at the end while the content size
   *   changes.
   *
   *  - "never": The scroll position won't be adjusted when the content size
   *   changes.
   */
  @property({ attribute: "auto-scroll" }) readonly autoScroll: "never" | "at-scroll-end" =
    "at-scroll-end";

  /**
   * `true` if the control has an external data provider and therefore must
   * implement infinite scrolling to load data progressively.
   * When `true`, a `ch-infinite-scroll` element is rendered at the top
   * (if `inverseLoading`) or bottom of the grid content.
   */
  @property({ type: Boolean, attribute: "data-provider" })
  readonly dataProvider: boolean | undefined = false;

  /**
   * When set to `true`, the grid items will be loaded in inverse order, with
   * the first element at the bottom and the "Loading" message (infinite-scroll)
   * at the top.
   */
  @property({ type: Boolean, attribute: "inverse-loading" })
  readonly inverseLoading: boolean | undefined = false;

  /**
   * The current number of items (rows/cells) in the grid.
   * This is a required property used to trigger re-renders whenever the
   * data set changes. When `itemsCount` is `0`, the `grid-content-empty`
   * slot is rendered instead of `grid-content`.
   *
   * If not specified, grid empty and loading placeholders may not work
   * correctly.
   */
  @property({ type: Number, attribute: "items-count" })
  readonly itemsCount!: number;

  /**
   * Specifies the loading state of the grid:
   *  - `"initial"`: First load; shows the `grid-initial-loading-placeholder`
   *    slot.
   *  - `"loading"`: Data is being fetched (infinite scroll triggered). The
   *    `ch-infinite-scroll` component shows its loading indicator.
   *  - `"loaded"`: Data fetch is complete. Normal content is rendered.
   *
   * This property is mutable: the component sets it to `"loading"` when
   * the infinite-scroll threshold is reached.
   */
  @property({ attribute: "loading-state" }) loadingState: SmartGridDataState = "initial";
  // @Watch("loadingState")
  // loadingStateChange(_, oldLoadingState: SmartGridDataState) {
  //   if (oldLoadingState === "initial") {
  //     this.#avoidCLSOnInitialLoad();
  //   }
  // }

  /**
   * The threshold distance from the bottom of the content to call the
   * `infinite` output event when scrolled. The threshold value can be either a
   * percent, or in pixels. For example, use the value of `10%` for the
   * `infinite` output event to get called when the user has scrolled 10% from
   * the bottom of the page. Use the value `100px` when the scroll is within
   * 100 pixels from the bottom of the page.
   */
  @property() readonly threshold: string = "10px";

  /**
   * Emitted every time the infinite-scroll threshold is reached.
   * The host should respond by fetching the next page of data and updating
   * `loadingState` back to `"loaded"` when done.
   *
   * Does not bubble (`bubbles: false`). Not cancelable. Payload is `void`.
   * Before emitting, the component automatically sets `loadingState` to
   * `"loading"`.
   */
  @Event({ bubbles: false })
  protected infiniteThresholdReached!: EventEmitter<void>;

  /**
   * Scrolls the grid so that the cell identified by `cellId` is aligned at
   * the `"start"` or `"end"` of the viewport.
   *
   * When `position === "start"`, the component reserves extra space after
   * the last cell (similar to how the Monaco editor reserves space for the
   * last lines) to keep the anchor cell visible at the top even when there
   * is not enough content below it.
   *
   * The reserved space is automatically recalculated as cells are added or
   * removed. Call `removeScrollEndContentReference()` to clear the anchor.
   */
  public async scrollEndContentToPosition(
    cellId: string,
    options: { position: "start" | "end"; behavior?: ScrollBehavior }
  ) {
    const cellRef = this.#getCellById(cellId);
    this.cellRefAlignedAtTheTop = options.position === "start" ? cellRef : null;

    if (cellRef) {
      // Since the space reservation is performed in a rAF, we have to perform
      // the scroll repositioning in the same frame calling rAF
      requestAnimationFrame(
        () =>
          setTimeout(() =>
            this.scrollBy({
              top: cellRef.offsetTop,
              behavior: options.behavior ?? "auto"
            })
          )
        // 100
      );
    }
  }

  // TODO: This method should probably not exists. We should find a better way
  // to implement this.
  /**
   * Removes the cell reference that is aligned at the start of the viewport.
   *
   * In other words, removes the reserved space that is used to aligned
   * `scrollEndContentToPosition(cellId, { position: "start" })`
   */
  public async removeScrollEndContentReference() {
    this.cellRefAlignedAtTheTop = null;
  }

  #handleVirtualItemsChanged = (event: CustomEvent<VirtualScrollVirtualItems>) => {
    const { startIndex, endIndex, totalItems } = event.detail;

    this.infiniteScrollEnabled =
      (this.inverseLoading && startIndex === 0) ||
      (!this.inverseLoading && endIndex === totalItems - 1);
  };

  #getCellById = (cellId: string) =>
    this.querySelector(
      `${SMART_GRID_CELL_TAG_NAME}[cell-id="${cellId}"]`
    ) as HTMLChSmartGridCellElement | null;

  #infiniteThresholdReachedCallback = () => {
    this.loadingState = "loading";
    this.infiniteThresholdReached.emit();
  };

  #avoidCLSOnInitialLoad = () => {
    if (this.inverseLoading) {
      this.#contentIsHidden = true;
      this.classList.add(HIDE_CONTENT_AFTER_LOADING_CLASS);
    }
  };

  #removeAvoidCLS = () => {
    this.#contentIsHidden = false;
    this.removeEventListener("virtualScrollerDidLoad", this.#removeAvoidCLS);

    requestAnimationFrame(() => this.classList.remove(HIDE_CONTENT_AFTER_LOADING_CLASS));
  };

  #checkIfAnchorWasRemoved = (): boolean => {
    if (this.cellRefAlignedAtTheTop === null) {
      this.style.removeProperty(RESERVED_SPACE_CUSTOM_VAR);
      this.#lastCellRef = null;
      return true;
    }

    return false;
  };

  #reserveSpaceInLastCellToKeepAnchorCellAlignedAtTheStart = () => {
    // Remove min-block-size from the last cell, since the anchor cell doesn't
    // exists
    if (this.#checkIfAnchorWasRemoved()) {
      return;
    }

    // We have to wait until the data-did-load attr is attached to the rendered
    // cell in order to properly calculate the distance to the DOM, since when
    // the cell doesn't have that attribute in the virtual-scroller scenario,
    // it has "display: none" to avoid any flickering
    setTimeout(() => {
      // We have to check this condition here too, since the timeout can be
      // queued before the removal of the anchor and then executed after the
      // anchor has been removed
      if (this.#checkIfAnchorWasRemoved()) {
        return;
      }

      // - - - - - - - - - - - - - DOM read operations - - - - - - - - - - - - -
      const newLastCell = this.querySelector(
        `:scope > [slot="grid-content"] > ${SMART_GRID_CELL_TAG_NAME}:last-child`
      ) as HTMLChSmartGridCellElement | null;

      if (this.#lastCellRef !== newLastCell) {
        const newSize = newLastCell
          ? calculateSpaceToReserve(
              this as unknown as HTMLChSmartGridElement,
              this.cellRefAlignedAtTheTop!,
              newLastCell
            )
          : 0;

        // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
        this.style.removeProperty(RESERVED_SPACE_CUSTOM_VAR);
        this.#lastCellRef?.classList.remove(RESERVED_SPACE_CLASS_NAME);
        this.#lastCellRef = newLastCell;

        // TODO: Properly recalculate
        if (newLastCell) {
          newLastCell.classList.add(RESERVED_SPACE_CLASS_NAME);
          this.style.setProperty(RESERVED_SPACE_CUSTOM_VAR, newSize + "px");
        }
      }
    });
  };

  #observeCellRemovals = (event: CustomEvent<HTMLChSmartGridCellElement>) => {
    const removedCellRef = event.detail;

    // Removed the anchor cell
    if (this.cellRefAlignedAtTheTop === removedCellRef) {
      // TODO: StencilJS' algorithm for reconciliate list has several side
      // effects that will trigger the following line when it is not necessary
      // so we are commenting it at the moment to make work the
      // scrollEndContentToTop feature
      // this.cellRefAlignedAtTheTop = null;
    }
    // Removed the last cell
    else if (this.#lastCellRef === removedCellRef) {
      this.#lastCellRef = null;
      this.#reserveSpaceInLastCellToKeepAnchorCellAlignedAtTheStart();
    }
  };

  override connectedCallback(): void {
    super.connectedCallback();

    // TODO: Investigate this. If we don't add this function call, but we add
    // the class in the Host, the scrollbar is styled, but it shouldn't
    adoptCommonThemes(this.shadowRoot!.adoptedStyleSheets);
    this.#avoidCLSOnInitialLoad();

    if (this.inverseLoading && !this.autoGrow) {
      this.addEventListener("virtualScrollerDidLoad", this.#removeAvoidCLS);
    }

    // Listen for virtualItemsChanged from ch-virtual-scroller
    this.addEventListener("virtualItemsChanged", this.#handleVirtualItemsChanged as EventListener);
  }

  override updated(): void {
    if (!this.#contentIsHidden) {
      return;
    }

    if (this.inverseLoading && this.autoGrow) {
      this.#removeAvoidCLS();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    this.removeEventListener(
      "virtualItemsChanged",
      this.#handleVirtualItemsChanged as EventListener
    );
  }

  override render() {
    const initialLoad = this.loadingState === "initial";
    const hasRecords = this.itemsCount > 0;

    Host(this, {
      properties: {
        ariaLabel: this.accessibleName,
        // Improve accessibility by announcing live changes
        ariaLive: "polite",
        // Wait until all changes are made to prevents assistive
        // technologies from announcing changes before updates are done
        ariaBusy: initialLoad || this.loadingState === "loading" ? "true" : "false"
      },
      class: {
        "ch-smart-grid--inverse-loading": hasRecords && !!this.inverseLoading,
        "ch-smart-grid--data-provider": hasRecords && !!this.dataProvider && !this.inverseLoading,
        [SCROLLABLE_CLASS]: !this.autoGrow
      }
    });

    if (initialLoad) {
      return html`<slot name="grid-initial-loading-placeholder"></slot>`;
    }

    return html`${hasRecords && this.inverseLoading
        ? html`<ch-infinite-scroll
            .autoScroll=${this.autoScroll}
            .dataProvider=${this.dataProvider}
            .disabled=${!this.infiniteScrollEnabled}
            .infiniteThresholdReachedCallback=${this.#infiniteThresholdReachedCallback}
            .loadingState=${this.loadingState}
            .position=${"top"}
            .threshold=${this.threshold}
          ></ch-infinite-scroll>`
        : nothing}
      <slot name=${hasRecords ? "grid-content" : "grid-content-empty"}></slot>
      ${hasRecords && this.dataProvider && !this.inverseLoading
        ? html`<ch-infinite-scroll
            .dataProvider=${true}
            .disabled=${!this.infiniteScrollEnabled}
            .infiniteThresholdReachedCallback=${this.#infiniteThresholdReachedCallback}
            .loadingState=${this.loadingState}
            .threshold=${this.threshold}
          ></ch-infinite-scroll>`
        : nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ch-smart-grid": ChSmartGrid;
  }
}

// ######### Auto generated below #########

declare global {
  // prettier-ignore
  interface HTMLChSmartGridElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChSmartGridElement;
  }

  /** Type of the `ch-smart-grid`'s `infiniteThresholdReached` event. */
  // prettier-ignore
  type HTMLChSmartGridElementInfiniteThresholdReachedEvent = HTMLChSmartGridElementCustomEvent<
    HTMLChSmartGridElementEventMap["infiniteThresholdReached"]
  >;

  interface HTMLChSmartGridElementEventMap {
    infiniteThresholdReached: void;
  }

  interface HTMLChSmartGridElementEventTypes {
    infiniteThresholdReached: HTMLChSmartGridElementInfiniteThresholdReachedEvent;
  }

  /**
   * The `ch-smart-grid` component is an accessible grid layout for data-driven applications that require infinite scrolling, virtual rendering, and dynamic content loading.
   *
   * @remarks
   * ## Features
   *  - Infinite scrolling via `ch-infinite-scroll` integration with configurable thresholds.
   *  - Standard and inverse loading orders (newest items at the bottom or top).
   *  - Automatic scroll-position management to prevent layout shifts (CLS) during async content loads.
   *  - Anchor a specific cell at the top of the viewport with reserved space, similar to code editors (via `scrollEndContentToPosition`).
   *  - Auto-grow mode (`autoGrow`) to adjust size to content, or fixed size with scrollbars.
   *  - ARIA live-region support for accessible announcements.
   *  - Virtual-scroller integration for rendering only visible items.
   *
   * ## Use when
   *  - Building chat-like interfaces with inverse loading.
   *  - Displaying large, dynamically loaded data sets with virtual scrolling.
   *  - Infinite-scroll or paginated feeds with bottom-to-top inverse loading (e.g., chat, activity streams).
   *
   * ## Do not use when
   *  - Displaying static tabular data with columns and headers -- use `ch-tabular-grid` instead.
   *  - A fixed, non-scrollable list is sufficient -- prefer `ch-action-list-render`.
   *
   * ## Accessibility
   *  - The host element uses `aria-live="polite"` to announce content changes to assistive technologies.
   *  - `aria-busy` is set to `"true"` during `"initial"` and `"loading"` states, preventing premature announcements.
   *  - The `accessibleName` property maps to `aria-label` on the host.
   *
   * @status experimental
   *
   * @slot grid-initial-loading-placeholder - Placeholder content shown during the initial loading state before any data has been fetched.
   * @slot grid-content - Primary content slot for grid cells. Rendered when the grid has records and is not in the initial loading state.
   * @slot grid-content-empty - Fallback content displayed when the grid has finished loading but contains no records.
   *
   * @fires infiniteThresholdReached Emitted every time the infinite-scroll threshold is reached.
   *   The host should respond by fetching the next page of data and updating
   *   `loadingState` back to `"loaded"` when done.
   *   
   *   Does not bubble (`bubbles: false`). Not cancelable. Payload is `void`.
   *   Before emitting, the component automatically sets `loadingState` to
   *   `"loading"`.
   */
  // prettier-ignore
  interface HTMLChSmartGridElement extends ChSmartGrid {
    // Extend the ChSmartGrid class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof HTMLChSmartGridElementEventTypes>(type: K, listener: (this: HTMLChSmartGridElement, ev: HTMLChSmartGridElementEventTypes[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof HTMLChSmartGridElementEventTypes>(type: K, listener: (this: HTMLChSmartGridElement, ev: HTMLChSmartGridElementEventTypes[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-smart-grid": HTMLChSmartGridElement;
  }

  interface HTMLElementTagNameMap {
    "ch-smart-grid": HTMLChSmartGridElement;
  }
}

