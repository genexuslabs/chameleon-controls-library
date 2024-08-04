import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  Watch,
  h
} from "@stencil/core";
import { AccessibleNameComponent } from "../../common/interfaces";
import { SmartGridDataState } from "./internal/infinite-scroll/types";

const HIDE_CONTENT_AFTER_LOADING_CLASS = "ch-smart-grid--loaded-render-delay";

@Component({
  shadow: true,
  styleUrl: "smart-grid.scss",
  tag: "ch-smart-grid"
})
export class ChSmartGrid
  implements AccessibleNameComponent, ComponentInterface
{
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
   * Specifies the loading state of the grid.
   */
  @Prop({ mutable: true }) loadingState!: SmartGridDataState;
  @Watch("loadingState")
  loadingStateChange(_, oldLoadingState: SmartGridDataState) {
    if (oldLoadingState === "initial") {
      this.#avoidCLSOnInitialLoad();
    }
  }

  /**
   * Grid current row count. This property is used in order to be able to
   * re-render the Grid every time the Grid data changes.
   * If not specified, then grid empty and loading placeholders may not work
   * correctly.
   */
  @Prop() readonly recordCount!: number;

  /**
   * The threshold distance from the bottom of the content to call the
   * `infinite` output event when scrolled. The threshold value can be either a
   * percent, or in pixels. For example, use the value of `10%` for the
   * `infinite` output event to get called when the user has scrolled 10% from
   * the bottom of the page. Use the value `100px` when the scroll is within
   * 100 pixels from the bottom of the page.
   */
  @Prop() readonly threshold: string = "150px";

  /**
   * This Handler will be called every time grid threshold is reached. Needed
   * for infinite scrolling grids.
   */
  @Event({ bubbles: false }) infiniteThresholdReached: EventEmitter<void>;

  #avoidCLSOnInitialLoad = () => {
    this.#contentIsHidden = true;
    this.el.classList.add(HIDE_CONTENT_AFTER_LOADING_CLASS);
  };

  connectedCallback(): void {
    if (this.loadingState !== "initial") {
      this.#avoidCLSOnInitialLoad();
    }
  }

  componentDidRender(): void {
    if (this.#contentIsHidden) {
      this.#contentIsHidden = false;

      requestAnimationFrame(() => {
        this.el.classList.remove(HIDE_CONTENT_AFTER_LOADING_CLASS);
      });
    }
  }

  render() {
    const initialLoad = this.loadingState === "initial";
    const hasRecords = this.recordCount > 0;

    return (
      <Host
        aria-label={this.accessibleName || undefined}
        class={{
          "ch-smart-grid--inverse-loading": hasRecords && this.inverseLoading,
          "ch-smart-grid--data-provider":
            hasRecords && this.dataProvider && !this.inverseLoading,
          "ch-smart-grid--scroll": !this.autoGrow
        }}
      >
        {initialLoad ? (
          <slot name="grid-initial-loading-placeholder" />
        ) : (
          [
            hasRecords && this.inverseLoading && (
              <ch-infinite-scroll
                dataProvider={this.dataProvider}
                loadingState={this.loadingState}
                position="top"
                threshold={this.threshold}
              ></ch-infinite-scroll>
            ),

            <slot name={hasRecords ? "grid-content" : "grid-content-empty"} />,

            hasRecords && this.dataProvider && !this.inverseLoading && (
              <ch-infinite-scroll
                dataProvider
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
