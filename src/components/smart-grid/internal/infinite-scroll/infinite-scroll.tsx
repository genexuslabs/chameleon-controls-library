import {
  Component,
  ComponentInterface,
  Element,
  Host,
  Method,
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
  #scrollIsAttached: boolean = false;

  // Refs
  #scrollableParent!: Element | HTMLElement;

  #typeOfParentElementAttached: "ch-smart-grid" | "window" | "other" = "other";

  @Element() el!: HTMLChInfiniteScrollElement;

  /**
   * If `true`, the infinite scroll will be hidden and scroll event listeners
   * will be removed.
   *
   * Set this to `false` to disable the infinite scroll from actively trying to
   * receive new data while reaching the threshold. This is useful when it is
   * known that there is no more data that can be added, and the infinite
   * scroll is no longer needed.
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
   * `true` if the infinite scroll is used in a grid that has data provider.
   * This attribute determine the utility of the infinite scroll, because in
   * certain configurations the infinite scroll can be used only to implement
   * the inverse loading utility.
   */
  @Prop() readonly dataProvider: boolean = false;

  /**
   * This Handler will be called every time grid threshold is reached. Needed
   * for infinite scrolling grids.
   */
  @Prop() readonly infiniteThresholdReachedCallback!: () => void;

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
  @Prop() readonly threshold: string = "15%";
  @Watch("threshold")
  thresholdChanged() {
    this.#checkIfCanFetchMoreData();
  }

  /**
   * Call `complete()` within the `gxInfinite` output event handler when
   * your async operation has completed. For example, the `loading`
   * state is while the app is performing an asynchronous operation,
   * such as receiving more data from an AJAX request to add more items
   * to a data list. Once the data has been received and UI updated, you
   * then call this method to signify that the loading has completed.
   * This method will change the infinite scroll's state from `loading`
   * to `enabled`.
   */
  @Method()
  async complete() {
    // this.waitingForData = false;
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

    // Try to re-observe the element when the DOM is updated
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
    if (this.#ioWatcher) {
      return;
    }

    requestAnimationFrame(() => {
      if (!this.#canFetch()) {
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

      // Attach scroll is not previously attached
      if (!this.#scrollIsAttached) {
        this.#scrollIsAttached = true;

        // Track scroll changes when the DOM is updated
        requestAnimationFrame(() => {
          this.#scrollableParent.addEventListener(
            "scroll",
            this.#trackLastScrollTop,
            { passive: true }
          );
        });
      }
    });
  };

  #disconnectInfiniteScroll = () => {
    this.#ioWatcher?.disconnect();
    this.#ioWatcher = undefined;

    // Remove scroll position tracker, if necessary
    if (
      this.loadingState === "initial" ||
      this.loadingState === "all-records-loaded"
    ) {
      this.#scrollIsAttached = false;
      this.#scrollableParent.removeEventListener(
        "scroll",
        this.#trackLastScrollTop
      );
    }
  };

  #trackLastScrollTop = () => {
    this.#lastScrollTop = this.#scrollableParent.scrollTop;
    this.#lastScrollHeight = this.#scrollableParent.scrollHeight;
  };

  #setInverseLoading = () => {
    if (this.position !== "top") {
      return;
    }

    const smartGridParent = (this.el.getRootNode() as ShadowRoot)
      .host as HTMLChSmartGridElement;

    const result = getScrollableParentToAttachInfiniteScroll(smartGridParent);
    this.#typeOfParentElementAttached = result[0];
    this.#scrollableParent = result[1];

    // Inverse loading is not supported when the scroll is attached to the window.
    // The current implementation "supports" this scenario, but since this use
    // case changes the position of the scroll every time the grid retrieves
    // data, unexpected behaviors will occur.
    // Also, Android does not support Inverse Loading in this scenario either.
    if (this.#typeOfParentElementAttached === "window") {
      return;
    }

    /**
     * This element represents the cell container (`[slot="grid-content"]`).
     * ```tsx
     *   <ch-smart-grid>
     *     #shadow-root (open)
     *     | <ch-infinite-scroll></ch-infinite-scroll>
     *     | <slot name="grid-content"></slot>
     *     <div slot="grid-content">
     *       <ch-smart-grid-cell>...</ch-smart-grid-cell>
     *       <ch-smart-grid-cell>...</ch-smart-grid-cell>
     *       ...
     *     </div>
     *   </ch-smart-grid>
     * ```
     */
    const overflowingContent = smartGridParent.querySelector(
      "[slot='grid-content']"
    ) as HTMLElement;

    overflowingContent.scrollTop =
      overflowingContent.scrollHeight + PRECISION_OFFSET;

    this.#resizeWatcher = new ResizeObserver(() => {
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
      // scroll was at the bottom position. When the grid has a data provider
      // items can be loaded via infinite scroll, so the scroll position needs
      // adjusted when new items are added
      if (this.dataProvider || scrollWasAtTheBottom) {
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
    });

    this.#resizeWatcher.observe(overflowingContent);
    this.#resizeWatcher.observe(this.#scrollableParent);
  };

  #disconnectInverseLoading = () => {
    this.#resizeWatcher?.disconnect();
    this.#resizeWatcher = undefined;
  };

  componentDidLoad() {
    // Inverse Loading
    this.#setInverseLoading();

    // Infinite Scroll
    this.#setInfiniteScroll();
  }

  disconnectedCallback() {
    this.#disconnectInfiniteScroll();
    this.#disconnectInverseLoading();
  }

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
