import {
  Component,
  ComponentInterface,
  Element,
  Host,
  Prop,
  Watch,
  h
} from "@stencil/core";
import { SmartGridDataState } from "./types";
import { getScrollableParentToAttachInfiniteScroll } from "./utils";

/**
 * Due to floating point precision errors, we have to ensure a safe threshold
 * to update the scroll position to the bottom.
 */
const PRECISION_OFFSET = 2;

@Component({
  shadow: true,
  styleUrl: "infinite-scroll.scss",
  tag: "ch-infinite-scroll"
})
export class ChInfiniteScroll implements ComponentInterface {
  // Stored values
  #lastClientHeight = 0;
  #lastScrollHeight = 0;
  #lastScrollTop = 0;

  // Observers
  #ioWatcher: IntersectionObserver | undefined;
  #resizeWatcher: ResizeObserver | undefined;
  #abortController: AbortController | undefined; // Allocated at runtime to save resources

  // Refs
  #smartGridRef!: HTMLChSmartGridElement;
  #scrollableParent!: Element | HTMLElement;

  #typeOfParentElementAttached: "ch-smart-grid" | "window" | "other" = "other";

  @Element() el!: HTMLChInfiniteScrollElement;

  /**
   * Specifies how the scroll position will be adjusted when the content size
   * changes when using `position = "bottom"`.
   *   - "at-scroll-end": If the scroll is positioned at the end of the content,
   *   the infinite-scroll will maintain the scroll at the end while the
   *   content size changes.
   *
   *  - "never": The scroll position won't be adjusted when the content size
   *   changes.
   */
  @Prop() readonly autoScroll: "never" | "at-scroll-end" = "at-scroll-end";

  /**
   * `true` if the infinite scroll is used in a grid that has data provider.
   * This attribute determine the utility of the infinite scroll, because in
   * certain configurations the infinite scroll can be used only to implement
   * the inverse loading utility.
   */
  @Prop() readonly dataProvider: boolean = false;
  @Watch("dataProvider")
  dataProviderChanged(hasDataProvider: boolean) {
    if (hasDataProvider) {
      // Wait until the main thread has rendered the UI
      requestAnimationFrame(this.#setInfiniteScroll);
    } else {
      this.#disconnectInfiniteScroll();
    }
  }

  /**
   * Specifies if the infinite scroll is disabled. When disabled, the infinite
   * scroll won't fire any event when reaching the threshold.
   * The `dataProvider` property can be `true` and this property can be `false`
   * at the same time, meaning that the infinite scroll is disabled, but if the
   * control has `inverseLoading`, the `dataProvider` property will re-position
   * the scrollbar when new content is added to the grid.
   */
  @Prop() readonly disabled: boolean = false;
  @Watch("disabled")
  disabledChanged(isDisabled: boolean) {
    if (isDisabled) {
      this.#disconnectInfiniteScroll();
    } else {
      // Wait until the main thread has rendered the UI
      requestAnimationFrame(this.#setInfiniteScroll);
    }
  }

  /**
   * This callback will be called every time the `threshold` is reached.
   *
   * When the threshold is met and this callback is executed, the internal
   * `loadingState` will be changed to `"loading"` and the user has to keep in
   * sync the `loadingState` of the component with the real state of the data.
   */
  @Prop() readonly infiniteThresholdReachedCallback!: () => void;

  /**
   * If `"more-data-to-fetch"`, the infinite scroll will execute the
   * `infiniteThresholdReachedCallback` when the `threshold` is met. When the
   * threshold is met, the internal `loadingState` will be changed to
   * `"loading"` and the user has to keep in sync the `loadingState` of the
   * component with the real state of the data.
   *
   * Set this to `"all-records-loaded"` to disable the infinite scroll from
   * actively trying to receive new data while reaching the threshold. This is
   * useful when it is known that there is no more data that can be added, and
   * the infinite scroll is no longer needed.
   */
  @Prop({ mutable: true }) loadingState!: SmartGridDataState;
  @Watch("loadingState")
  loadingStateChanged(newValue: SmartGridDataState) {
    this.#checkIfCanFetchMoreData();

    if (newValue === "initial") {
      this.#lastClientHeight = 0;
      this.#lastScrollHeight = 0;
      this.#lastScrollTop = 0;
    }
  }

  /**
   * The position of the infinite scroll element.
   * The value can be either `top` or `bottom`. When `position === "top"`, the
   * control also implements inverse loading.
   */
  @Prop() readonly position: "top" | "bottom" = "bottom";

  /**
   * The threshold distance from the bottom of the content to call the
   * `infinite` output event when scrolled.
   * The threshold value can be either a percent, or in pixels. For example,
   * use the value of `10%` for the `infinite` output event to get called when
   * the user has scrolled 10% from the bottom of the page. Use the value
   * `100px` when the scroll is within 100 pixels from the bottom of the page.
   */
  @Prop() readonly threshold: string = "150px";
  @Watch("threshold")
  thresholdChanged() {
    this.#checkIfCanFetchMoreData();
  }

  #canFetch = () => this.loadingState === "more-data-to-fetch";

  /**
   * This function unobserves and re-observes the infinite scroll element when
   * new items are added in the grid. Without this configuration, if the grid
   * has no scroll even after new items are added, the intersection observer
   * won't fire a new interruption because it is still visible in the viewport.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #checkIfCanFetchMoreData = () => {
    this.#disconnectInfiniteScroll();

    // Wait until the main thread has rendered the UI
    requestAnimationFrame(this.#setInfiniteScroll);
  };

  #emitInfiniteEvent = () => {
    if (this.loadingState !== "loading") {
      // Ensure the infinite scroll is not triggered twice
      this.loadingState = "loading";
      this.infiniteThresholdReachedCallback();
    }
  };

  #setInfiniteScroll = () => {
    // The observer was already set
    if (!this.dataProvider || this.disabled) {
      return;
    }

    // Track the threshold changes after the DOM is updated
    requestAnimationFrame(() => {
      // The ioWatcher must be checked inside the RAF, to avoid memory issues,
      // due to dispatching multiple #setInfiniteScroll, without the watcher defined
      if (!this.#canFetch() || this.#ioWatcher) {
        return;
      }

      const options: IntersectionObserverInit = {
        root: this.#scrollableParent,
        rootMargin: this.threshold
      };

      this.#ioWatcher = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          this.#emitInfiniteEvent();
        }
      }, options);

      this.#ioWatcher.observe(this.el);
    });
  };

  #attachScroll = () => {
    this.#abortController ??= new AbortController();

    this.#scrollableParent.addEventListener(
      "scroll",
      this.#trackLastScrollTop,
      { capture: true, passive: true, signal: this.#abortController.signal }
    );
  };

  #trackLastScrollTop = () => {
    this.#lastScrollTop = this.#scrollableParent.scrollTop;
    this.#lastScrollHeight = this.#scrollableParent.scrollHeight;
  };

  #setInverseLoading = () => {
    // Inverse loading is not supported when the scroll is attached to the window.
    // The current implementation "supports" this scenario, but since this use
    // case changes the position of the scroll every time the grid retrieves
    // data, unexpected behaviors will occur.
    // Also, Android does not support Inverse Loading in this scenario either.
    if (
      this.#typeOfParentElementAttached === "window" ||
      this.position !== "top"
    ) {
      return;
    }

    // Attach scroll after the DOM is rendered
    requestAnimationFrame(this.#attachScroll);

    /**
     * This element represents the cell container (`[slot="grid-content"]`).
     * ```tsx
     *   <ch-smart-grid>
     *     #shadow-root (open)
     *     |  <ch-infinite-scroll></ch-infinite-scroll>
     *     |  <slot name="grid-content"></slot>
     *     <div slot="grid-content">
     *       <ch-smart-grid-cell>...</ch-smart-grid-cell>
     *       <ch-smart-grid-cell>...</ch-smart-grid-cell>
     *       ...
     *     </div>
     *   </ch-smart-grid>
     * ```
     */
    const overflowingContent = this.#smartGridRef.querySelector(
      "[slot='grid-content']"
    ) as HTMLElement;

    overflowingContent.scrollTop =
      overflowingContent.scrollHeight + PRECISION_OFFSET;

    this.#resizeWatcher = new ResizeObserver(
      this.#adjustInverseScrollPositionWhenContentSizeChanges
    );

    this.#resizeWatcher.observe(overflowingContent);
    this.#resizeWatcher.observe(this.#scrollableParent);
  };

  #adjustInverseScrollPositionWhenContentSizeChanges = () => {
    // console.log("adjustInverseScrollPositionWhenContentSizeChanges...");

    // Current values
    const currentClientHeight = this.#scrollableParent.clientHeight;
    const currentScrollHeight = this.#scrollableParent.scrollHeight;

    const firstTimeThatContentOverflows =
      this.#lastClientHeight === this.#lastScrollHeight &&
      currentClientHeight < currentScrollHeight;

    // Must set the scroll at the bottom position
    if (firstTimeThatContentOverflows) {
      const newScrollTop =
        currentScrollHeight - currentClientHeight + PRECISION_OFFSET;

      this.#lastClientHeight = currentClientHeight;
      this.#lastScrollHeight = currentScrollHeight;

      // Scroll to bottom
      this.#scrollableParent.scrollTop = newScrollTop;
      this.#lastScrollTop = newScrollTop;
      return;
    }

    const scrollWasAtTheBottom =
      this.#lastScrollHeight <=
      this.#lastClientHeight + this.#lastScrollTop + PRECISION_OFFSET;

    // The scroll is only adjusted if the grid has a data provider or the
    // scroll was at the bottom position (and has to keep the scroll at the
    // bottom).
    // When the grid has a data provider items can be loaded via infinite
    // scroll, so the scroll position needs adjusted when new items are added
    if (
      this.dataProvider ||
      (this.autoScroll === "at-scroll-end" && scrollWasAtTheBottom)
    ) {
      const scrollOffset = currentScrollHeight - this.#lastScrollHeight;
      const clientHeightOffset =
        currentClientHeight < this.#lastClientHeight
          ? this.#lastClientHeight - currentClientHeight
          : 0;

      const newScrollTop =
        this.#lastScrollTop +
        scrollOffset +
        clientHeightOffset +
        (scrollWasAtTheBottom ? PRECISION_OFFSET : 0); // Scroll to bottom

      this.#scrollableParent.scrollTop = newScrollTop;
      this.#lastScrollTop = newScrollTop;
    }

    this.#lastClientHeight = currentClientHeight;
    this.#lastScrollHeight = currentScrollHeight;
  };

  #disconnectInverseLoading = () => {
    this.#resizeWatcher?.disconnect();
    this.#resizeWatcher = undefined;

    // Remove scroll events in the smart grid
    this.#abortController.abort();
  };

  #disconnectInfiniteScroll = () => {
    this.#ioWatcher?.disconnect();
    this.#ioWatcher = undefined;
  };

  componentDidLoad() {
    this.#smartGridRef = (this.el.getRootNode() as ShadowRoot)
      .host as HTMLChSmartGridElement;

    const result = getScrollableParentToAttachInfiniteScroll(
      this.#smartGridRef
    );
    this.#typeOfParentElementAttached = result[0];
    this.#scrollableParent = result[1];

    this.#setInverseLoading();

    // Wait until the main thread has rendered the UI
    requestAnimationFrame(this.#setInfiniteScroll);
  }

  disconnectedCallback() {
    this.#disconnectInfiniteScroll();
    this.#disconnectInverseLoading();
  }

  // TODO: Ensure the ch-infinite-scroll doesn't crash when is only used by
  // itself (without a ch-smart-grid as a parent)
  render() {
    return (
      <Host
        class={this.loadingState === "loading" ? "loading" : undefined}
        aria-hidden="true"
      >
        {this.loadingState === "loading" && <slot />}
      </Host>
    );
  }
}
