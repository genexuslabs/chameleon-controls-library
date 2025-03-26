import {
  Component,
  ComponentInterface,
  Prop,
  Event,
  EventEmitter,
  h,
  Host,
  State,
  Watch
} from "@stencil/core";
import { tokenMap } from "../../common/utils";
import {
  COMBO_BOX_EXPORT_PARTS,
  PAGINATOR_PARTS_DICTIONARY
} from "../../common/reserved-names";
import { PaginatorTranslations } from "./translations";
import {
  ACTUAL_PAGE,
  FIRST_ITEM_IN_PAGE,
  LAST_ITEM_IN_PAGE,
  TOTAL_ITEMS,
  TOTAL_PAGES,
  TOTAL_PAGES_UNDEFINED
} from "./constants";
import {
  PaginatorRenderHyperlinkModel,
  PaginatorRenderModel,
  PaginatorRenderNumericModel,
  ControlsOrder
} from "./types";
import { ComboBoxModel } from "../combo-box/types";

@Component({
  tag: "ch-paginator-render",
  styleUrl: "paginator-render.scss",
  shadow: true
})
export class ChPaginatorRender implements ComponentInterface {
  /**
   * Specifies the index for the actual page in paginator
   */
  @State() actualPage: number = 1;

  /**
   * State to define the hyperlink or numeric model
   */
  @State() hasHyperlink: boolean = false;

  /**
   * State to obtain the total pages on model,
   * Use -1 if not known and 'hasNextPage' property to indicate
   * that the end has been reached.
   */
  @State() totalPages: number = 1;

  /**
   * State containing an Array of controls to render
   */
  @State() controlsToRender: Array<{
    name: string;
    render: () => Element;
  }> = [];

  /**
   * Indicates that the end has been reached.
   * Use when total pages are not known (totalPages = -1).
   */
  @Prop() readonly hasNextPage: boolean = false;

  /**
   * Number for Total Items Per Page.
   */
  @Prop({ mutable: true }) itemsPerPage: number = 10;

  /**
   * Specifies the options in Items Per Page combo-box.
   */
  @Prop() readonly itemsPerPageOptions: ComboBoxModel;

  /**
   * Number of pages to show starting from the selected page to the left.
   */
  @Prop() readonly maxPagesToShowLeft: number = 3;

  /**
   * Number of pages to show starting from the selected page to the right.
   */
  @Prop() readonly maxPagesToShowRight: number = 3;

  /**
   * Specifies the UI Model for the Paginator.
   */
  @Prop() readonly model: PaginatorRenderModel = [];

  @Watch("model")
  modelChanged() {
    this.hasHyperlink = Array.isArray(this.model);

    if (this.hasHyperlink) {
      this.totalPages = (this.model as PaginatorRenderHyperlinkModel)?.length;
    } else {
      this.totalPages =
        (this.model as PaginatorRenderNumericModel)?.totalPages ??
        TOTAL_PAGES_UNDEFINED;
    }
  }

  /**
   * Specifies the order for the controls.
   */
  @Prop() readonly order: ControlsOrder = {
    itemsPerPage: 1,
    itemsPerPageInfo: 2,
    firstControl: 3,
    prevControl: 4,
    navigationControls: 5,
    nextControl: 6,
    lastControl: 7,
    navigationGoTo: 8,
    navigationControlsInfo: 9
  };

  @Watch("order")
  orderChanged() {
    this.#initializeControls();
  }

  /**
   * Specifies the Selected Page, can be a number or hyperlink.
   */
  @Prop({ mutable: true }) selectedPage: string | number = 1;

  @Watch("selectedPage")
  selectedPageChanged() {
    if (this.hasHyperlink) {
      this.actualPage =
        (this.model as PaginatorRenderHyperlinkModel).indexOf(
          this.selectedPage.toString()
        ) + 1;
    } else {
      this.actualPage = Number(this.selectedPage);
    }
  }

  /**
   * `true` to render the navigation First control.
   */
  @Prop() readonly showFirstControl: boolean = false;

  /**
   * `true` to render the Items Per Page control.
   */
  @Prop() readonly showItemsPerPage: boolean = false;

  /**
   * `true` to render the Items Per Page Info.
   */
  @Prop() readonly showItemsPerPageInfo: boolean = false;

  /**
   * `true` to render the navigation Last control.
   */
  @Prop() readonly showLastControl: boolean = false;

  /**
   * `true` to render the navigation controls.
   */
  // eslint-disable-next-line @stencil-community/ban-default-true
  @Prop() readonly showNavigationControls: boolean = true;

  /**
   * `true` to render the navigation Info.
   */
  @Prop() readonly showNavigationControlsInfo: boolean = false;

  /**
   * `true` to render the navigation Go To control.
   */
  @Prop() readonly showNavigationGoTo: boolean = false;

  /**
   * `true` to render the navigation Next control.
   */
  @Prop() readonly showNextControl: boolean = false;

  /**
   * `true` to render the navigation Prev control.
   */
  @Prop() readonly showPrevControl: boolean = false;

  /**
   * Number for Total Items, default = undefined.
   */
  @Prop() readonly totalItems: number | undefined = undefined;

  /**
   * Specifies the literals required in the control.
   */
  @Prop() readonly translations: PaginatorTranslations = {
    accessibleName: {
      goToInput: "Go to page",
      itemsPerPageOptions: "Select amount of items to show"
    },
    text: {
      goToButton: "Go",
      itemsPerPage: "Items per page:",
      of: "of ",
      ellipsis: "...",
      first: "First",
      prev: "Prev",
      next: "Next",
      last: "Last",
      unknownPages: "many",
      unknownItems: "many",
      showingItems: `Showing ${FIRST_ITEM_IN_PAGE} - ${LAST_ITEM_IN_PAGE} of ${TOTAL_ITEMS} items`,
      page: "Page:",
      showingPage: `Showing ${ACTUAL_PAGE} of ${TOTAL_PAGES} pages`
    }
  };

  /**
   * Event fired when there is a new page selection.
   */
  @Event() pageChange: EventEmitter<number>;

  /**
   * Event fired when the amount of items per page changes.
   */
  @Event() itemsPerPageChange: EventEmitter<number>;

  connectedCallback(): void {
    this.#initializeControls();
    this.hasHyperlink = Array.isArray(this.model);

    if (this.hasHyperlink) {
      this.totalPages = (this.model as PaginatorRenderHyperlinkModel).length;
    } else {
      this.totalPages =
        (this.model as PaginatorRenderNumericModel)?.totalPages ??
        TOTAL_PAGES_UNDEFINED;
    }
  }

  #initializeControls = () => {
    const controls: Array<{
      name: string;
      render: () => Element;
    }> = [
      {
        name: "itemsPerPage",
        render: () => this.showItemsPerPage && this.#renderItemsPerPage()
      },
      {
        name: "itemsPerPageInfo",
        render: () =>
          this.showItemsPerPageInfo && this.#renderItemsPerPageInfo()
      },
      {
        name: "navigationControls",
        render: () =>
          this.showNavigationControls && this.#renderNavigationControls()
      },
      {
        name: "navigationGoTo",
        render: () => this.showNavigationGoTo && this.#renderNavigationGoTo()
      },
      {
        name: "navigationControlsInfo",
        render: () =>
          this.showNavigationControlsInfo &&
          this.#renderNavigationControlsInfo()
      },
      {
        name: "firstControl",
        render: () => this.showFirstControl && this.#renderFirstControl()
      },
      {
        name: "lastControl",
        render: () => this.showLastControl && this.#renderLastControl()
      },
      {
        name: "prevControl",
        render: () => this.showPrevControl && this.#renderPrevControl()
      },
      {
        name: "nextControl",
        render: () => this.showNextControl && this.#renderNextControl()
      }
    ];

    // Sort visible controls regarding their order value
    controls.sort((a, b) => {
      const orderA =
        this.order[a.name as keyof ControlsOrder] ?? Number.MAX_SAFE_INTEGER;
      const orderB =
        this.order[b.name as keyof ControlsOrder] ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });

    this.controlsToRender = controls;
  };

  #getFirstItemInPage = () =>
    `${this.actualPage * this.itemsPerPage - this.itemsPerPage + 1}`;

  #getLastItemInPage = () => {
    if (
      !this.totalItems ||
      this.totalItems > this.actualPage * this.itemsPerPage ||
      this.totalItems < 0
    ) {
      return `${this.actualPage * this.itemsPerPage}`;
    }
    return `${this.totalItems}`;
  };

  #getTotalItemsString = () =>
    !this.totalItems || this.totalItems < 0
      ? `${this.translations.text.unknownItems}`
      : `${this.totalItems}`;

  #getPaginationRange = (): number[] => {
    const { actualPage, maxPagesToShowLeft, maxPagesToShowRight } = this;
    const totalPages = this.totalPages;

    // Set array with pages to show, it starts with the first page on the array.
    // If page is an ellipsis, array number will be -1
    const pages: number[] = [1]; // Start with the first page

    // Check pages to display at the start and end of the navigation control
    let startPage = Math.max(actualPage - maxPagesToShowLeft, 2);
    let endPage = Math.min(actualPage + maxPagesToShowRight, totalPages - 1);

    // If not enough pages to show left, adjust the max pages to show
    if (actualPage - startPage < maxPagesToShowLeft) {
      startPage = Math.max(
        endPage - maxPagesToShowLeft - maxPagesToShowRight,
        2
      );
    }

    // If not enough pages to show right, adjust the max pages to show
    if (endPage - actualPage < maxPagesToShowRight) {
      endPage = Math.min(
        startPage + maxPagesToShowLeft + maxPagesToShowRight,
        totalPages - 1
      );
    }

    // Add pages in range to the array
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Validate if ellipsis are needed in range
    if (totalPages > maxPagesToShowLeft + maxPagesToShowRight) {
      // Append ellipsis at start if necessary
      if (startPage > 2) {
        pages.splice(1, 0, -1); // Append ellipsis after the first page
      }

      // Append ellipsis at end if necessary
      if (endPage < totalPages - 1) {
        pages.push(-1); // Append ellipsis if there are pages after the last visible page
      }
    }

    // Append last page at the end if necessary
    if (totalPages > 1) {
      pages.push(totalPages); // Ensure the last page is always included
    }

    return pages;
  };

  #handleFirst = () => {
    this.actualPage = 1;
    this.pageChange.emit(this.actualPage);
  };

  #handleLast = () => {
    this.actualPage = this.totalPages;
    this.pageChange.emit(this.actualPage);
  };

  #handleNext = () => {
    this.actualPage += 1;
    this.pageChange.emit(this.actualPage);
  };

  #handlePrev = () => {
    this.actualPage -= 1;
    this.pageChange.emit(this.actualPage);
  };

  #handleItemsPerPageChange = (event: Event) => {
    const select = event.target as HTMLSelectElement;
    const newItemsPerPage = Number(select.value);
    this.itemsPerPage = newItemsPerPage;
    this.itemsPerPageChange.emit(newItemsPerPage);
  };

  #handleGoToOnKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      this.#handleGotoPageChange(event);
    }
  };

  #handleGoToOnBlur = (event: FocusEvent) => {
    this.#handleGotoPageChange(event);
  };

  #handleGotoPageChange = (event: Event) => {
    const input = event.target as HTMLInputElement;

    const page = Number(input.value);

    if (this.totalPages < 0) {
      this.pageChange.emit(page);
    }

    // Validate if page exceeds total pages range
    if (page >= 1 && page <= this.totalPages) {
      this.actualPage = Math.max(Math.min(page, this.totalPages), 1);
      this.pageChange.emit(this.actualPage);
    }
  };

  #handleSelectedPageChange = (event: PointerEvent) => {
    event.stopPropagation();
    const elementRef = event.composedPath()[0] as
      | HTMLAnchorElement
      | HTMLButtonElement;

    // Check the click event is performed in a button and anchor element
    if (
      elementRef.tagName.toLowerCase() !== "button" &&
      elementRef.tagName.toLowerCase() !== "a"
    ) {
      return;
    }
    event.preventDefault();

    let newPageSelected: string;

    if (elementRef.tagName.toLowerCase() === "a") {
      newPageSelected = this.hasHyperlink
        ? (elementRef as HTMLAnchorElement)?.href
        : elementRef?.id;
    } else {
      newPageSelected = (elementRef as HTMLButtonElement)?.value;
    }

    // Don't fire the selectedItemChange event if the button is already selected
    if (this.selectedPage === newPageSelected) {
      return;
    }
    this.selectedPage = newPageSelected;

    const eventInfo = this.pageChange.emit(this.actualPage);

    if (!eventInfo.defaultPrevented) {
      this.selectedPage = newPageSelected;
    }
  };

  #renderItemsPerPage = () => (
    <form
      class="items-per-page"
      part={PAGINATOR_PARTS_DICTIONARY.ITEMS_PER_PAGE}
    >
      <label
        htmlFor="items-per-page"
        part={PAGINATOR_PARTS_DICTIONARY.ITEMS_PER_PAGE__LABEL}
      >
        {this.translations.text.itemsPerPage}
      </label>
      <ch-combo-box-render
        class="combo-box"
        id="items-per-page"
        name="items-per-page"
        model={this.itemsPerPageOptions}
        onChange={this.#handleItemsPerPageChange}
        hostParts={PAGINATOR_PARTS_DICTIONARY.ITEMS_PER_PAGE__COMBO_BOX}
        value={this.itemsPerPage.toString()}
        exportparts={COMBO_BOX_EXPORT_PARTS}
        accessibleName={this.translations.accessibleName.itemsPerPageOptions}
      />
    </form>
  );

  #renderItemsPerPageInfo = () => (
    <div
      class="items-per-page-info"
      part={PAGINATOR_PARTS_DICTIONARY.ITEMS_PER_PAGE_INFO}
    >
      <span part={PAGINATOR_PARTS_DICTIONARY.ITEMS_PER_PAGE_INFO__TEXT}>
        {this.translations.text.showingItems
          .replace(FIRST_ITEM_IN_PAGE, this.#getFirstItemInPage())
          .replace(LAST_ITEM_IN_PAGE, this.#getLastItemInPage())
          .replace(TOTAL_ITEMS, this.#getTotalItemsString())}
      </span>
    </div>
  );

  #renderFirstControl = () => (
    <button
      class="first-button"
      part={tokenMap({
        [PAGINATOR_PARTS_DICTIONARY.FIRST]: true,
        [PAGINATOR_PARTS_DICTIONARY.DISABLED]: this.actualPage === 1
      })}
      disabled={this.actualPage === 1}
      onClick={this.actualPage !== 1 && this.#handleFirst}
      type="button"
    >
      {this.translations.text.first}
    </button>
  );

  #renderLastControl = () => (
    <button
      class="last-button"
      part={tokenMap({
        [PAGINATOR_PARTS_DICTIONARY.LAST]: true,
        [PAGINATOR_PARTS_DICTIONARY.DISABLED]:
          this.actualPage === this.totalPages
      })}
      onClick={
        (this.actualPage !== this.totalPages || this.hasNextPage) &&
        this.#handleLast
      }
      disabled={this.actualPage === this.totalPages}
      type="button"
    >
      {this.translations.text.last}
    </button>
  );

  #renderNextControl = () => (
    <button
      class="next-button"
      part={tokenMap({
        [PAGINATOR_PARTS_DICTIONARY.NEXT]: true,
        [PAGINATOR_PARTS_DICTIONARY.DISABLED]:
          this.actualPage === this.totalPages
      })}
      disabled={this.actualPage === this.totalPages}
      onClick={
        (this.actualPage !== this.totalPages || this.hasNextPage) &&
        this.#handleNext
      }
      type="button"
    >
      {this.translations.text.next}
    </button>
  );

  #renderPrevControl = () => (
    <button
      class="prev-button"
      part={tokenMap({
        [PAGINATOR_PARTS_DICTIONARY.PREV]: true,
        [PAGINATOR_PARTS_DICTIONARY.DISABLED]: this.actualPage === 1
      })}
      disabled={this.actualPage === 1}
      onClick={this.actualPage !== 1 && this.#handlePrev}
      type="button"
    >
      {this.translations.text.prev}
    </button>
  );

  #renderNavigationControls = () => (
    <ol
      class="pages"
      onClick={this.#handleSelectedPageChange}
      part={PAGINATOR_PARTS_DICTIONARY.PAGES}
      role="navigation"
    >
      {this.#getPaginationRange().map(this.#renderPaginatorItem)}
    </ol>
  );

  #renderNavigationControlsInfo = () => (
    <div
      part={PAGINATOR_PARTS_DICTIONARY.NAVIGATION_INFO}
      class="navigation-info"
    >
      <span part={PAGINATOR_PARTS_DICTIONARY.NAVIGATION_INFO__TEXT}>
        {this.translations.text.showingPage
          .replace(ACTUAL_PAGE, this.actualPage?.toString())
          .replace(
            TOTAL_PAGES,
            (this.totalPages > 0 && this.totalPages?.toString()) ||
              this.translations.text.unknownPages
          )}
      </span>
    </div>
  );

  #renderNavigationGoTo = () => (
    <div part={PAGINATOR_PARTS_DICTIONARY.GO_TO} class="go-to">
      <label
        htmlFor="goto-input"
        part={PAGINATOR_PARTS_DICTIONARY.GO_TO__LABEL}
      >
        {this.translations.text.page}
      </label>
      <input
        id="goto-input"
        part={PAGINATOR_PARTS_DICTIONARY.GO_TO__INPUT}
        type="number"
        min="1"
        max={this.totalPages}
        value={this.actualPage}
        onKeyDown={this.#handleGoToOnKeyDown}
        onBlur={this.#handleGoToOnBlur}
        aria-label={this.translations.accessibleName.goToInput}
      />
      {this.translations.text.of}
      {this.translations.text.of &&
        ((this.totalPages > 0 && this.totalPages?.toString()) ||
          this.translations.text.unknownPages)}
    </div>
  );

  #renderPaginatorItem = (page: number, index: number) => {
    if (page > 0) {
      // Validate if pagination has hyperlink
      if (this.hasHyperlink) {
        return (
          <li>
            <a
              key={index}
              part={tokenMap({
                [PAGINATOR_PARTS_DICTIONARY.PAGE]: true,
                [PAGINATOR_PARTS_DICTIONARY.PAGE_ACTIVE]:
                  this.actualPage === page
              })}
              href={this.model[page - 1]}
            >
              {page}
            </a>
          </li>
        );
      }
      // Validate if pagination has urlMapping, if true, return anchor element
      if ((this.model as PaginatorRenderNumericModel)?.urlMapping) {
        return (
          <li>
            <a
              key={index}
              id={page.toString()}
              part={tokenMap({
                [PAGINATOR_PARTS_DICTIONARY.PAGE]: true,
                [PAGINATOR_PARTS_DICTIONARY.PAGE_ACTIVE]:
                  this.actualPage === page
              })}
              href={(this.model as PaginatorRenderNumericModel).urlMapping(
                page
              )}
            >
              {page}
            </a>
          </li>
        );
      }
      // Else, return a button with page number as value
      return (
        <li>
          <button
            key={index}
            part={tokenMap({
              [PAGINATOR_PARTS_DICTIONARY.PAGE]: true,
              [PAGINATOR_PARTS_DICTIONARY.PAGE_ACTIVE]: this.actualPage === page
            })}
            value={page}
            type="button"
          >
            {page}
          </button>
        </li>
      );
    }
    // if page is "-1", it renders a span with the ellipsis
    return (
      <li>
        <span
          key={index}
          part={
            (PAGINATOR_PARTS_DICTIONARY.PAGE,
            PAGINATOR_PARTS_DICTIONARY.ELLIPSIS)
          }
        >
          {this.translations.text.ellipsis}
        </span>
      </li>
    );
  };

  render() {
    return (
      <Host>{this.controlsToRender.map(control => control.render())}</Host>
    );
  }
}
