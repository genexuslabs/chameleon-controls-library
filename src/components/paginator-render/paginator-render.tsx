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
  AMOUNT_ITEMS_IN_PAGE,
  TOTAL_ITEMS,
  TOTAL_PAGES
} from "./constants";
import {
  PaginatorRenderHyperlinkModel,
  PaginatorRenderModel,
  PaginatorRenderNumericModel,
  ControlsOrder
} from "./types";
import { ComboBoxModel } from "../../components";

@Component({
  tag: "ch-paginator-render",
  styleUrl: "paginator-render.scss",
  shadow: true
})
export class ChPaginator implements ComponentInterface {
  /**
   * Specifies the index for the actual page in paginator
   */
  @State() actualPage: number = 1;

  /**
   * State to obtain the total pages on model,
   * Use -1 if not known and 'hasNextPage' property to indicate
   * that the end has been reached.
   */
  @State() totalPages: number = 1;

  /**
   * State to define the hyperlink or numeric model
   */
  @State() hasHyperlink: boolean = false;

  /**
   * Specifies the UI Model for the Paginator
   */
  @Prop()
  readonly model: PaginatorRenderModel = [];

  @Watch("model")
  modelChanged() {
    this.hasHyperlink = Array.isArray(this.model);

    if (this.hasHyperlink) {
      this.totalPages = (this.model as PaginatorRenderHyperlinkModel)?.length;
    } else {
      this.totalPages =
        (this.model as PaginatorRenderNumericModel)?.totalPages ?? -1;
    }
  }

  /**
   * Specifies the Selected Page, can be a number or hyperlink, default number = 1.
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
   * Number for Total Items, default = undefined.
   */
  @Prop() readonly totalItems: number | undefined = undefined;

  /**
   * Number for Total Items Per Page, default = 10.
   */
  @Prop({ mutable: true }) itemsPerPage: number = 10;

  /**
   * Indicates that the end has been reached.
   * Use when total pages are not known (totalPages = -1).
   */
  @Prop() readonly hasNextPage: boolean = false;

  /**
   * Number of pages to show starting from the selected page to the left, default = 3.
   */
  @Prop() readonly maxPagesToShowLeft: number = 3;

  /**
   * Number of pages to show starting from the selected page to the right, default = 3..
   */
  @Prop() readonly maxPagesToShowRight: number = 3;

  /**
   * `true` to render the Items Per Page control, default = false;
   */
  @Prop() readonly showItemsPerPage: boolean = false;

  /**
   * Specifies the options in Items Per Page combo-box
   */
  @Prop() readonly itemsPerPageOptions: ComboBoxModel;

  /**
   * `true` to render the Items Per Page Info, default = false;
   */
  @Prop() readonly showItemsPerPageInfo: boolean = false;

  /**
   * `true` to render the navigation controls, default = true;
   */
  // eslint-disable-next-line @stencil-community/ban-default-true
  @Prop() readonly showNavigationControls: boolean = true;

  /**
   * `true` to render the navigation Go To control, default = false;
   */
  @Prop() readonly showNavigationGoTo: boolean = false;

  /**
   * `true` to render the navigation First control, default = false;
   */
  @Prop() readonly showFirstControl: boolean = false;

  /**
   * `true` to render the navigation Last control, default = false;
   */
  @Prop() readonly showLastControl: boolean = false;

  /**
   * `true` to render the navigation Prev control, default = false;
   */
  @Prop() readonly showPrevControl: boolean = false;

  /**
   * `true` to render the navigation Next control, default = false;
   */
  @Prop() readonly showNextControl: boolean = false;

  /**
   * `true` to render the navigation Info, default = false;
   */
  @Prop() readonly showNavigationControlsInfo: boolean = false;

  /**
   * Specifies the order for the controls
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

  /**
   * Specifies the literals required in the control.
   */
  @Prop() readonly translations: PaginatorTranslations = {
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
      showingItems: `Showing ${AMOUNT_ITEMS_IN_PAGE} of ${TOTAL_ITEMS} items`,
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
    this.hasHyperlink = Array.isArray(this.model);

    if (this.hasHyperlink) {
      this.totalPages = (this.model as PaginatorRenderHyperlinkModel).length;
    } else {
      this.totalPages =
        (this.model as PaginatorRenderNumericModel)?.totalPages ?? -1;
    }
  }

  #getPaginationRange() {
    const { actualPage, maxPagesToShowLeft, maxPagesToShowRight } = this;
    const totalPages = this.totalPages;

    // Set array with pages to show, it starts with the first page on the array.
    // If page is an ellipsis, array number will be -1
    const pages = [1]; // Start with the first page

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
  }

  #handlePrev = () => {
    if (this.actualPage > 1) {
      this.actualPage -= 1;
      this.pageChange.emit(this.actualPage);
    }
  };

  #handleNext = () => {
    if (
      this.actualPage < this.totalPages ||
      (this.totalPages < 0 && this.hasNextPage)
    ) {
      this.actualPage += 1;
      this.pageChange.emit(this.actualPage);
    }
  };

  #handleFirst = () => {
    if (this.actualPage !== 1) {
      this.actualPage = 1;
      this.pageChange.emit(this.actualPage);
    }
  };

  #handleLast = () => {
    if (
      this.actualPage !== this.totalPages ||
      (this.totalPages < 0 && this.hasNextPage)
    ) {
      this.actualPage = this.totalPages;
      this.pageChange.emit(this.actualPage);
    }
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

    let newPageSelected;

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

  #renderItemsPerPage = () => {
    return (
      <form
        class="form"
        part={tokenMap({ [PAGINATOR_PARTS_DICTIONARY.ITEMS_PER_PAGE]: true })}
      >
        <label htmlFor="items-per-page">
          {this.translations.text.itemsPerPage}
        </label>
        <ch-combo-box-render
          class="combo-box"
          id="items-per-page"
          name="items-per-page"
          model={this.itemsPerPageOptions}
          onChange={this.#handleItemsPerPageChange}
          hostParts={tokenMap({
            [PAGINATOR_PARTS_DICTIONARY.ITEMS_PER_PAGE__COMBO_BOX]: true
          })}
          value={this.itemsPerPage.toString()}
          exportparts={COMBO_BOX_EXPORT_PARTS}
        />
      </form>
    );
  };

  #renderItemsPerPageInfo = () => {
    return (
      <div part={tokenMap({ [PAGINATOR_PARTS_DICTIONARY.INFO]: true })}>
        <span
          part={tokenMap({ [PAGINATOR_PARTS_DICTIONARY.INFO__TEXT]: true })}
        >
          {this.translations.text.showingItems
            .replace(AMOUNT_ITEMS_IN_PAGE, this.itemsPerPage.toString())
            .replace(
              TOTAL_ITEMS,
              this.totalItems.toString() || this.translations.text.unknownItems
            )}
        </span>
      </div>
    );
  };

  #renderFirstControl = () => {
    return (
      <button
        part={tokenMap({
          [PAGINATOR_PARTS_DICTIONARY.FIRST]: true,
          [PAGINATOR_PARTS_DICTIONARY.DISABLED]: this.actualPage === 1
        })}
        disabled={this.actualPage === 1}
        onClick={this.#handleFirst}
      >
        {this.translations.text.first}
      </button>
    );
  };

  #renderLastControl = () => {
    return (
      <button
        part={tokenMap({
          [PAGINATOR_PARTS_DICTIONARY.LAST]: true,
          [PAGINATOR_PARTS_DICTIONARY.DISABLED]:
            this.actualPage === this.totalPages
        })}
        onClick={this.#handleLast}
        disabled={this.actualPage === this.totalPages}
      >
        {this.translations.text.last}
      </button>
    );
  };

  #renderPrevControl = () => {
    return (
      <button
        part={tokenMap({
          [PAGINATOR_PARTS_DICTIONARY.PREV]: true,
          [PAGINATOR_PARTS_DICTIONARY.DISABLED]: this.actualPage === 1
        })}
        onClick={this.#handlePrev}
        disabled={this.actualPage === 1}
      >
        {this.translations.text.prev}
      </button>
    );
  };

  #renderNextControl = () => {
    return (
      <button
        part={tokenMap({
          [PAGINATOR_PARTS_DICTIONARY.NEXT]: true,
          [PAGINATOR_PARTS_DICTIONARY.DISABLED]:
            this.actualPage === this.totalPages
        })}
        disabled={this.actualPage === this.totalPages}
        onClick={this.#handleNext}
      >
        {this.translations.text.next}
      </button>
    );
  };

  #renderNavigationControls = () => {
    return (
      <ol
        class="pages"
        part={tokenMap({ [PAGINATOR_PARTS_DICTIONARY.PAGES]: true })}
        onClick={this.#handleSelectedPageChange}
      >
        {this.#getPaginationRange().map((page, index) => {
          if (page > 0) {
            // Validate if pagination has hyperlink
            if (this.hasHyperlink) {
              return (
                <li>
                  <a
                    key={index}
                    part={tokenMap({
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
                      [PAGINATOR_PARTS_DICTIONARY.PAGE_ACTIVE]:
                        this.actualPage === page
                    })}
                    href={(
                      this.model as PaginatorRenderNumericModel
                    ).urlMapping(page)}
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
                    [PAGINATOR_PARTS_DICTIONARY.PAGE_ACTIVE]:
                      this.actualPage === page
                  })}
                  value={page}
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
                part={tokenMap({
                  [PAGINATOR_PARTS_DICTIONARY.ELLIPSIS]: true
                })}
              >
                {this.translations.text.ellipsis}
              </span>
            </li>
          );
        })}
      </ol>
    );
  };

  #renderNavigationControlsInfo = () => (
    <div part={tokenMap({ [PAGINATOR_PARTS_DICTIONARY.INFO]: true })}>
      <span part={tokenMap({ [PAGINATOR_PARTS_DICTIONARY.INFO__TEXT]: true })}>
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
    <div part={tokenMap({ [PAGINATOR_PARTS_DICTIONARY.GO_TO]: true })}>
      {this.translations.text.page}
      <input
        part={tokenMap({ [PAGINATOR_PARTS_DICTIONARY.GO_TO__INPUT]: true })}
        type="number"
        min="1"
        max={this.totalPages}
        value={this.actualPage}
        onKeyDown={this.#handleGoToOnKeyDown}
        onBlur={this.#handleGoToOnBlur}
      />
      {this.translations.text.of}
      {this.translations.text.of &&
        ((this.totalPages > 0 && this.totalPages?.toString()) ||
          this.translations.text.unknownPages)}
    </div>
  );

  render() {
    // Array with controls for mapping
    const controls = [
      {
        name: "itemsPerPage",
        render: () => this.#renderItemsPerPage(),
        show: this.showItemsPerPage
      },
      {
        name: "itemsPerPageInfo",
        render: () => this.#renderItemsPerPageInfo(),
        show: this.showItemsPerPageInfo
      },
      {
        name: "navigationControls",
        render: () => this.#renderNavigationControls(),
        show: this.showNavigationControls
      },
      {
        name: "navigationGoTo",
        render: () => this.#renderNavigationGoTo(),
        show: this.showNavigationGoTo
      },
      {
        name: "navigationControlsInfo",
        render: () => this.#renderNavigationControlsInfo(),
        show: this.showNavigationControlsInfo
      },
      {
        name: "firstControl",
        render: () => this.#renderFirstControl(),
        show: this.showFirstControl
      },
      {
        name: "lastControl",
        render: () => this.#renderLastControl(),
        show: this.showLastControl
      },
      {
        name: "prevControl",
        render: () => this.#renderPrevControl(),
        show: this.showPrevControl
      },
      {
        name: "nextControl",
        render: () => this.#renderNextControl(),
        show: this.showNextControl
      }
    ];

    // Filter controls that has to be shown
    const visibleControls = controls.filter(control => control.show);

    // Sort visible controls regarding their order value
    visibleControls.sort((a, b) => {
      const orderA =
        this.order[a.name as keyof ControlsOrder] ?? Number.MAX_SAFE_INTEGER;
      const orderB =
        this.order[b.name as keyof ControlsOrder] ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });

    return (
      <Host part={tokenMap({ [PAGINATOR_PARTS_DICTIONARY.CONTROLS]: true })}>
        {visibleControls.map(control => control.render())}
      </Host>
    );
  }
}
