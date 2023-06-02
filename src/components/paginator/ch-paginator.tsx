/* eslint-disable @typescript-eslint/no-empty-function */
import {
  Component,
  Element,
  Event,
  EventEmitter,
  Listen,
  Prop,
  Watch
} from "@stencil/core";
import { ChPaginatorNavigateClickedEvent } from "./paginator-navigate/ch-paginator-navigate-types";
import { ChPaginatorPagesPageChangedEvent } from "./paginator-pages/ch-paginator-pages";

/**
 * The 'ch-paginator' component represents a paginator control for navigating through pages.
 */
@Component({
  tag: "ch-paginator",
  styleUrl: "ch-paginator.scss",
  shadow: false
})
export class ChPaginator {
  private elPages: HTMLChPaginatorPagesElement;
  private elFirst: HTMLChPaginatorNavigateElement;
  private elPrevious: HTMLChPaginatorNavigateElement;
  private elNext: HTMLChPaginatorNavigateElement;
  private elLast: HTMLChPaginatorNavigateElement;

  @Element() el: HTMLChPaginatorElement;

  /**
   * The active page number.
   */
  @Prop({ mutable: true, reflect: true }) activePage = 1;

  @Watch("activePage")
  activePageHandler() {
    this.activePageChanged.emit({ activePage: this.activePage });
  }

  /**
   * The total number of pages.
   * Use -1 if not known and 'hasNextPage' property to indicate
   * that the end has been reached.
   */
  @Prop() readonly totalPages = 1;

  /**
   * Indicates that the end has been reached.
   * Use when total pages are not known (totalPages = -1).
   */
  @Prop() readonly hasNextPage: boolean = false;

  /**
   * Event emitted when the active page changes.
   */
  @Event() activePageChanged: EventEmitter<ChPaginatorActivePageChangedEvent>;

  /**
   * Event emitted when the navigation is requested.
   */
  @Event()
  pageNavigationRequested: EventEmitter<ChPaginatorPageNavigationRequestedEvent>;

  componentWillLoad() {
    this.loadElements();
  }

  @Listen("navigateClicked")
  navigateClickedHandler(
    eventInfo: CustomEvent<ChPaginatorNavigateClickedEvent>
  ) {
    eventInfo.stopPropagation();

    switch (eventInfo.detail.type) {
      case "first":
        this.first();
        break;
      case "previous":
        this.previous();
        break;
      case "next":
        this.next();
        break;
      case "last":
        this.last();
        break;
    }

    this.pageNavigationRequested.emit({ type: eventInfo.detail.type });
  }

  @Listen("pageChanged")
  pageChangedHandler(eventInfo: CustomEvent<ChPaginatorPagesPageChangedEvent>) {
    eventInfo.stopPropagation();
    const emitPageNavigationRequested =
      this.activePage != eventInfo.detail.page;
    this.activePage = eventInfo.detail.page;

    if (emitPageNavigationRequested) {
      this.pageNavigationRequested.emit({
        type: "goto",
        page: eventInfo.detail.page
      });
    }
  }

  private loadElements() {
    this.elPages = this.el.querySelector("ch-paginator-pages");
    this.elFirst = this.el.querySelector("ch-paginator-navigate[type='first']");
    this.elPrevious = this.el.querySelector(
      "ch-paginator-navigate[type='previous']"
    );
    this.elNext = this.el.querySelector("ch-paginator-navigate[type='next']");
    this.elLast = this.el.querySelector("ch-paginator-navigate[type='last']");
  }

  @Listen("keydown", { passive: true })
  keyDownHandler(eventInfo: KeyboardEvent) {
    switch (eventInfo.key) {
      case "Home":
        this.first();
        this.elFirst.focus();
        break;
      case "PageUp":
        this.previous();
        this.elPrevious.focus();
        break;
      case "PageDown":
        this.next();
        this.elNext.focus();
        break;
      case "End":
        this.last();
        this.elLast.focus();
        break;
    }
  }

  private first() {
    this.activePage = 1;
  }
  private previous() {
    this.activePage = Math.max(this.activePage - 1, 1);
  }
  private next() {
    this.activePage =
      this.totalPages < 0
        ? this.activePage + 1
        : Math.min(this.activePage + 1, this.totalPages);
  }
  private last() {
    this.activePage = this.totalPages;
  }

  render() {
    if (this.elPages) {
      this.elPages.totalPages = this.totalPages;
      this.elPages.page = this.activePage;
    }
    if (this.elFirst) {
      this.elFirst.disabled = this.activePage == 1;
    }
    if (this.elPrevious) {
      this.elPrevious.disabled = this.activePage == 1;
    }
    if (this.elNext) {
      this.elNext.disabled =
        this.activePage == this.totalPages ||
        (this.totalPages < 0 && !this.hasNextPage);
    }
    if (this.elLast) {
      this.elLast.disabled =
        this.activePage == this.totalPages ||
        (this.totalPages < 0 && !this.hasNextPage);
    }
  }
}

export interface ChPaginatorActivePageChangedEvent {
  activePage: number;
}
export interface ChPaginatorPageNavigationRequestedEvent {
  type: "first" | "previous" | "next" | "last" | "goto";
  page?: number;
}
