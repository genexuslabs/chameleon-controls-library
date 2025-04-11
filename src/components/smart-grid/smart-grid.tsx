import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  Host,
  Listen,
  Method,
  Prop,
  State,
  // Watch,
  h
} from "@stencil/core";
import type { AccessibleNameComponent } from "../../common/interfaces";
import type { SmartGridDataState } from "./internal/infinite-scroll/types";
import type { VirtualScrollVirtualItems } from "../virtual-scroller/types";
import type { ChVirtualScrollerCustomEvent } from "../../components";
import type { ChameleonControlsTagName } from "../../common/types";

import { SCROLLABLE_CLASS } from "../../common/reserved-names";
import { adoptCommonThemes } from "../../common/theme";

const HIDE_CONTENT_AFTER_LOADING_CLASS = "ch-smart-grid--loaded-render-delay";

const SMART_GRID_CELL_TAG_NAME =
  "ch-smart-grid-cell" satisfies ChameleonControlsTagName;

@Component({
  shadow: true,
  styleUrl: "smart-grid.scss",
  tag: "ch-smart-grid"
})
export class ChSmartGrid
  implements AccessibleNameComponent, ComponentInterface
{
  /**
   * Used in virtual scroll scenarios. Enables infinite scrolling if the
   * virtual items are closer to the real threshold.
   */
  @State() infiniteScrollEnabled = true;

  /**
   * This variable is used to avoid layout shifts (CLS) at the initial load,
   * due to the async render of the content.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #contentIsHidden = false;

  @Element() el: HTMLChSmartGridElement;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @Prop() readonly accessibleName: string;

  /**
   * This attribute defines if the control size will grow automatically,
   * to adjust to its content size.
   * If set to `false`, it won't grow automatically and it will show scrollbars
   * if the content overflows.
   */
  @Prop() readonly autoGrow: boolean = false;

  /**
   * TODO.
   *
   * Only used when inverseLoading = true.
   */
  @Prop() readonly autoScroll: "never" | "at-scroll-end" = "at-scroll-end";

  /**
   * `true` if the control has a data provider and therefore must implement a
   * infinite scroll to load data.
   */
  @Prop() readonly dataProvider: boolean = false;

  /**
   * When set to `true`, the grid items will be loaded in inverse order, with
   * the first element at the bottom and the "Loading" message (infinite-scroll)
   * at the top.
   */
  @Prop() readonly inverseLoading: boolean = false;

  /**
   * Grid current row count. This property is used in order to be able to
   * re-render the Grid every time the Grid data changes.
   * If not specified, then grid empty and loading placeholders may not work
   * correctly.
   */
  @Prop() readonly itemsCount!: number;

  /**
   * Specifies the loading state of the grid.
   */
  @Prop({ mutable: true }) loadingState: SmartGridDataState = "initial";
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
  @Prop() readonly threshold: string = "10px";

  /**
   * This Handler will be called every time grid threshold is reached. Needed
   * for infinite scrolling grids.
   */
  @Event({ bubbles: false }) infiniteThresholdReached: EventEmitter<void>;

  /**
   * Given the cell ID, it position the item at the top of the scrollbar,
   * reserving the necessary space to visualize the item at the top if the
   * content is not large enough.
   *
   * This behavior is the same as the Monaco editor does for reserving space
   * when visualizing the last lines positioned at the top of the editor.
   */
  @Method()
  async scrollEndContentToTop(cellId: string) {
    const cellRef = this.el.querySelector(
      `${SMART_GRID_CELL_TAG_NAME}[cell-id="${cellId}"]`
    ) as HTMLChSmartGridElement | null;

    if (!cellRef) {
      return;
    }

    this.el.scrollTop = cellRef.offsetTop;
  }

  @Listen("virtualItemsChanged")
  handleVirtualItemsChanged(
    event: ChVirtualScrollerCustomEvent<VirtualScrollVirtualItems>
  ) {
    const { startIndex, endIndex, totalItems } = event.detail;

    this.infiniteScrollEnabled =
      (this.inverseLoading && startIndex === 0) ||
      (!this.inverseLoading && endIndex === totalItems - 1);
  }

  #infiniteThresholdReachedCallback = () => {
    this.loadingState = "loading";
    this.infiniteThresholdReached.emit();
  };

  #avoidCLSOnInitialLoad = () => {
    if (this.inverseLoading) {
      this.#contentIsHidden = true;
      this.el.classList.add(HIDE_CONTENT_AFTER_LOADING_CLASS);
    }
  };

  #removeAvoidCLS = () => {
    this.#contentIsHidden = false;
    this.el.removeEventListener("virtualScrollerDidLoad", this.#removeAvoidCLS);

    requestAnimationFrame(() => {
      this.el.classList.remove(HIDE_CONTENT_AFTER_LOADING_CLASS);
    });
  };

  connectedCallback(): void {
    // TODO: Investigate this. If we don't add this function call, but we add
    // the class in the Host, the scrollbar is styled, but it shouldn't
    adoptCommonThemes(this.el.shadowRoot.adoptedStyleSheets);
    this.#avoidCLSOnInitialLoad();

    if (this.inverseLoading && !this.autoGrow) {
      this.el.addEventListener("virtualScrollerDidLoad", this.#removeAvoidCLS);
    }
  }

  componentDidRender(): void {
    if (!this.#contentIsHidden) {
      return;
    }

    if (this.inverseLoading && this.autoGrow) {
      this.#removeAvoidCLS();
    }
  }

  render() {
    const initialLoad = this.loadingState === "initial";
    const hasRecords = this.itemsCount > 0;

    return (
      <Host
        aria-label={this.accessibleName || undefined}
        // Improve accessibility by announcing live changes
        aria-live="polite"
        // Wait until all changes are made to prevents assistive
        // technologies from announcing changes before updates are done
        aria-busy={
          initialLoad || this.loadingState === "loading" ? "true" : "false"
        }
        class={{
          "ch-smart-grid--inverse-loading": hasRecords && this.inverseLoading,
          "ch-smart-grid--data-provider":
            hasRecords && this.dataProvider && !this.inverseLoading,
          [SCROLLABLE_CLASS]: !this.autoGrow
        }}
      >
        {initialLoad ? (
          <slot name="grid-initial-loading-placeholder" />
        ) : (
          [
            // TODO: Don't attach the ch-infinite-scroll component if the
            // smart-grid doesn't have an slot "grid-content" in its Light DOM
            // Otherwise, the ch-infinite-scroll will break in runtime
            hasRecords && this.inverseLoading && (
              <ch-infinite-scroll
                autoScroll={this.autoScroll}
                dataProvider={this.dataProvider}
                disabled={!this.infiniteScrollEnabled}
                infiniteThresholdReachedCallback={
                  this.#infiniteThresholdReachedCallback
                }
                loadingState={this.loadingState}
                position="top"
                threshold={this.threshold}
              ></ch-infinite-scroll>
            ),

            <slot name={hasRecords ? "grid-content" : "grid-content-empty"} />,

            hasRecords && this.dataProvider && !this.inverseLoading && (
              <ch-infinite-scroll
                dataProvider
                disabled={!this.infiniteScrollEnabled}
                infiniteThresholdReachedCallback={
                  this.#infiniteThresholdReachedCallback
                }
                loadingState={this.loadingState}
                threshold={this.threshold}
              ></ch-infinite-scroll>
            )
          ]
        )}
      </Host>
    );
  }
}
