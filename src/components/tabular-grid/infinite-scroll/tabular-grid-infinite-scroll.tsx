import {
  Component,
  Element,
  Event,
  EventEmitter,
  Method,
  Prop,
  State,
  h
} from "@stencil/core";

export type TabularGridInfiniteScrollState = "loading" | "loaded";

/**
 * The 'ch-tabular-grid-infinite-scroll' provides infinite scroll functionality for a 'ch-tabular-grid' component
 */
@Component({
  tag: "ch-tabular-grid-infinite-scroll",
  styleUrl: "tabular-grid-infinite-scroll.scss",
  shadow: true
})
export class ChTabularGridInfiniteScroll {
  private gridLayoutElement: HTMLElement;
  private intersectionGridLayoutObserver: IntersectionObserver;
  private intersectionDocumentObserver: IntersectionObserver;

  @Element() el: HTMLChTabularGridInfiniteScrollElement;

  @State() hasGridScroll: boolean;

  /**
   * Indicates whether the grid is loading or already loaded.
   */
  @Prop({ mutable: true }) status: TabularGridInfiniteScrollState = "loaded";

  /**
   * Event emitted when end is reached.
   */
  @Event() infinite: EventEmitter;

  componentWillLoad() {
    this.gridLayoutElement = this.el.assignedSlot.closest("section.main");

    this.intersectionGridLayoutObserver = new IntersectionObserver(
      this.intersectionObserverHandler,
      {
        root: this.gridLayoutElement,
        rootMargin: "1px"
      }
    );
    this.intersectionGridLayoutObserver.observe(this.el);

    this.intersectionDocumentObserver = new IntersectionObserver(
      this.intersectionObserverHandler,
      {
        rootMargin: "1px"
      }
    );
    this.intersectionDocumentObserver.observe(this.el);
  }

  disconnectedCallback() {
    if (this.intersectionGridLayoutObserver) {
      this.intersectionGridLayoutObserver.disconnect();
    }
  }

  /**
   * Indicates that the grid is already loaded.
   */
  @Method()
  async complete() {
    this.status = "loaded";
  }

  private intersectionObserverHandler = (
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver
  ) => {
    const hasGridScroll =
      this.gridLayoutElement.scrollHeight !==
      this.gridLayoutElement.clientHeight;
    const emitInfinite = observer.root ? hasGridScroll : !hasGridScroll;

    if (emitInfinite && entries[0].isIntersecting && this.status === "loaded") {
      this.status = "loading";
      this.infinite.emit();
    }
  };

  render() {
    return (
      <div class="loading" hidden={!(this.status === "loading")}>
        <slot></slot>
      </div>
    );
  }
}
