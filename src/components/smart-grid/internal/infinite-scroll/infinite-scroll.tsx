import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  Host,
  Method,
  Prop,
  State,
  Watch,
  h,
  writeTask
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
  /**
   * `true` if the `componentDidLoad()` method was called
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #didLoad = false;

  // Stored values
  #lastClientHeight = 0;
  #lastScrollHeight = 0;
  #lastScrollTop = 0;

  #newRecords = false;

  // Observers
  #ioWatcher: IntersectionObserver;
  #resizeWatcher: ResizeObserver;

  // Refs
  #scrollableParent: Element | HTMLElement;

  #typeOfParentElementAttached: "ch-smart-grid" | "window" | "other" = "other";

  @Element() el!: HTMLChInfiniteScrollElement;

  @State() waitingForData = false;

  /**
   * If `true`, the infinite scroll will be hidden and scroll event listeners
   * will be removed.
   *
   * Set this to `false` to disable the infinite scroll from actively trying to
   * receive new data while reaching the threshold. This is useful when it is
   * known that there is no more data that can be added, and the infinite
   * scroll is no longer needed.
   */
  @Prop() readonly loadingState!: SmartGridDataState;

  @Watch("loadingState")
  loadingStateChanged(newDataState: SmartGridDataState) {
    if (!this.#didLoad) {
      return;
    }

    // All data was fully loaded
    if (newDataState === "all-records-loaded") {
      this.#disconnectInfiniteScroll();
    }
    // The grid has data provider and there is data that can be loaded
    else if (this.#canFetch()) {
      this.#setInfiniteScroll();
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
   * This property must be bounded to grid item count property.
   * It's unique purpose is to update the position of the control in the
   * inverse loading scenario (`position === "top"`).
   */
  @Prop() readonly recordCount: number = 0;
  @Watch("recordCount")
  recordCountChanged() {
    if (!this.#didLoad) {
      return;
    }

    this.#newRecords = true;
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
  @Prop() readonly threshold: string = "15%";
  @Watch("threshold")
  thresholdChanged() {
    if (this.loadingState === "all-records-loaded") {
      return;
    }
    // @todo TODO: Check if this works when a new threshold comes
    this.#disconnectInfiniteScroll();
    this.#setInfiniteScroll();
  }

  /**
   * Emitted when the scroll reaches the threshold distance. From within your
   * infinite handler, you must call the infinite scroll's `complete()` method
   * when your async operation has completed.
   */
  @Event({ bubbles: false }) gxInfinite!: EventEmitter<void>;

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
    this.waitingForData = false;
    this.#checkIfCanFetchMoreData();
  }

  #canFetch = () =>
    this.dataProvider && this.loadingState === "more-data-to-fetch";

  /**
   * This functions unobserves and re-observes the infinite scroll element when
   * new items are added in the grid. Without this configuration, if the grid
   * has no scroll even after new items are added, the intersection observer
   * won't fire a new interruption because it is still visible in the viewport.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #checkIfCanFetchMoreData = () => {
    // The infinite scroll was disconnected
    if (!this.#canFetch() || !this.#ioWatcher) {
      return;
    }
    this.#ioWatcher.unobserve(this.el);

    // Try to re-observe the element when the DOM is updated
    requestAnimationFrame(() => {
      writeTask(() => {
        // The infinite scroll was disconnected
        if (!this.#canFetch() || !this.#ioWatcher) {
          return;
        }

        this.#ioWatcher.observe(this.el);
      });
    });
  };

  #emitInfiniteEvent = () => {
    if (this.waitingForData) {
      return;
    }

    this.waitingForData = true;
    this.gxInfinite.emit();
  };

  #setInfiniteScroll = () => {
    // The observer was already set
    if (this.#ioWatcher) {
      return;
    }

    requestAnimationFrame(() => {
      writeTask(() => {
        const options: IntersectionObserverInit = {
          root: this.#scrollableParent,
          rootMargin: this.threshold
        };

        this.#ioWatcher = new IntersectionObserver(entries => {
          if (!entries[0].isIntersecting) {
            return;
          }
          this.#emitInfiniteEvent();
        }, options);

        this.#ioWatcher.observe(this.el);
      });
    });
  };

  #disconnectInfiniteScroll = () => {
    this.#ioWatcher?.disconnect();
    this.#ioWatcher = null;
  };

  #trackLastScrollTop = () => {
    this.#lastScrollTop = this.#scrollableParent.scrollTop;

    // If the grid added new records, don't track the scrollHeight changes
    if (this.#newRecords) {
      // Wait until the resize observer has executed its adjustment to keep
      // tracking the scrollHeight
      requestAnimationFrame(() => {
        writeTask(() => {
          this.#newRecords = false;
        });
      });
      return;
    }

    this.#lastScrollHeight = this.#scrollableParent.scrollHeight;
  };

  #setInverseLoading = (overflowingContent: HTMLElement) => {
    // Inverse loading is not supported when the scroll is attached to the window.
    // The current implementation "supports" this scenario, but since this use
    // case changes the position of the scroll every time the grid retrieves
    // data, unexpected behaviors will occur.
    // Also, Android does not support Inverse Loading in this scenario either.
    if (this.#typeOfParentElementAttached === "window") {
      return;
    }

    this.#resizeWatcher = new ResizeObserver(() => {
      // Current values
      const currentClientHeight = this.#scrollableParent.clientHeight;
      const currentScrollHeight = this.#scrollableParent.scrollHeight;

      const firstTimeThatContentOverflows =
        this.#lastClientHeight === this.#lastScrollHeight &&
        currentClientHeight < currentScrollHeight;

      // Must set the scroll at the bottom position
      if (firstTimeThatContentOverflows) {
        const newScrollTop = currentScrollHeight - currentClientHeight;

        this.#lastClientHeight = currentClientHeight;
        this.#lastScrollHeight = currentScrollHeight;
        this.#scrollableParent.scrollTop = newScrollTop + PRECISION_OFFSET; // Scroll to bottom
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
      }

      this.#lastClientHeight = currentClientHeight;
      this.#lastScrollHeight = currentScrollHeight;
    });

    this.#resizeWatcher.observe(overflowingContent);
    this.#resizeWatcher.observe(this.#scrollableParent);

    this.#scrollableParent.addEventListener("scroll", this.#trackLastScrollTop);
  };

  #disconnectInverseLoading = () => {
    if (this.#resizeWatcher) {
      this.#resizeWatcher.disconnect();
      this.#resizeWatcher = null;

      this.#scrollableParent.removeEventListener(
        "scroll",
        this.#trackLastScrollTop
      );
    }
  };

  componentDidLoad() {
    this.#didLoad = true;

    // Set infinite scroll position if position === "top"
    this.recordCountChanged();

    const smartGridParent = (this.el.getRootNode() as ShadowRoot)
      .host as HTMLChSmartGridElement;

    const result = getScrollableParentToAttachInfiniteScroll(smartGridParent);
    this.#typeOfParentElementAttached = result[0];
    this.#scrollableParent = result[1];

    // Inverse Loading
    if (this.position === "top") {
      /**
       * This element represents the cell container (`[slot="grid-content"]`).
       * ```
       *   <ch-smart-grid>
       *     <div slot="grid-content">
       *       <ch-smart-grid-cell>...</ch-smart-grid-cell>
       *       <ch-smart-grid-cell>...</ch-smart-grid-cell>
       *       ...
       *     </div>
       *     <ch-infinite-scroll></ch-infinite-scroll>
       *   </ch-smart-grid>
       * ```
       */
      const overflowingContent = smartGridParent.querySelector(
        "[slot='grid-content']"
      ) as HTMLElement;

      this.#setInverseLoading(overflowingContent);
    }

    // Infinite Scroll
    if (this.#canFetch()) {
      this.#setInfiniteScroll();
    }
  }

  disconnectedCallback() {
    this.#disconnectInfiniteScroll();
    this.#disconnectInverseLoading();
  }

  render() {
    return (
      <Host
        class={this.waitingForData ? "gx-loading" : undefined}
        aria-hidden="true"
      >
        {this.dataProvider && <slot />}
      </Host>
    );
  }
}
