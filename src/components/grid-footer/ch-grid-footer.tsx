import { Component, Host, h, Prop, Event, EventEmitter } from "@stencil/core";

@Component({
  tag: "ch-grid-footer",
  styleUrl: "ch-grid-footer.scss",
  shadow: true,
})
export class ChGridFooter {
  @Event() paginationSelectedPage: EventEmitter;
  selectedPageHandler(paginationNumber) {
    this.paginationSelectedPage.emit(paginationNumber);
  }

  /*******************
  PROPS
  ********************/

  /**
   * The number of pages pagination
   */
  @Prop() paginationItems: number = 1;

  /**
   * The max. number of visibile pages pagination (first and last page are not counted)
   */
  @Prop() maxVisiblePaginationItems: number = 3;

  /**
   * The active page
   */
  @Prop() activePage: number = 1;

  /**
   * The page number where dots should be inserted
   */
  @Prop() pageDots: number = null;

  paginationStructure() {
    console.log("paginationStructure");
    let paginationStructure = [];

    // PREV
    if (this.activePage > 1) {
      paginationStructure.push(
        <li class="footer-pagination__item">
          <button
            class="footer-pagination__button"
            //onClick={this.paginationSelectedPageHandler}
            onClick={() => this.selectedPageHandler("prev")}
            data-value="previous"
          >
            Previous
          </button>
        </li>
      );
    }

    // FIRST ITEM
    if (this.activePage !== 1) {
      paginationStructure.push(
        <li class="footer-pagination__item">
          <button
            class="footer-pagination__button"
            onClick={() => this.selectedPageHandler(1)}
          >
            1
          </button>
        </li>
      );
    }

    // PREV DOTS
    if (this.activePage > 2) {
      paginationStructure.push(<li class="footer-pagination__item">...</li>);
    }

    let lastItem = null;
    for (
      let i = this.activePage;
      i < this.maxVisiblePaginationItems + this.activePage;
      i++
    ) {
      if (i < this.paginationItems) {
        paginationStructure.push(
          <li
            class={{
              "footer-pagination__item": true,
              "footer-pagination__item--active": i === this.activePage,
            }}
          >
            <button
              class="footer-pagination__button"
              onClick={() => this.selectedPageHandler(i)}
            >
              {i}
            </button>
          </li>
        );
        lastItem = i;
      }
    }

    // NEXT DOTS
    if (this.activePage < this.paginationItems - 1) {
      if (lastItem !== null) {
        if (lastItem < this.paginationItems - 1) {
          paginationStructure.push(
            <li class="footer-pagination__item">...</li>
          );
        }
      }
    }

    // LAST ITEM
    paginationStructure.push(
      <li class="footer-pagination__item">
        <button
          class="footer-pagination__button"
          onClick={() => this.selectedPageHandler(this.paginationItems)}
        >
          {this.paginationItems}
        </button>
      </li>
    );

    // NEXT
    if (this.activePage < this.paginationItems) {
      paginationStructure.push(
        <li class="footer-pagination__item">
          <button
            class="footer-pagination__button"
            onClick={() => this.selectedPageHandler("next")}
          >
            Next
          </button>
        </li>
      );
    }

    return paginationStructure;
  }

  render() {
    return (
      <Host>
        <footer>
          <ul class="footer-pagination">{this.paginationStructure()}</ul>
        </footer>
      </Host>
    );
  }
}
