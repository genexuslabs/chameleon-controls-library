import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import {
  testDefaultCssProperties,
  testDefaultProperties
} from "../../../testing/utils.e2e";

const defaultOrder = {
  itemsPerPage: 1,
  itemsPerPageInfo: 2,
  firstControl: 3,
  prevControl: 4,
  navigationControls: 5,
  nextControl: 6,
  lastControl: 7,
  navigationGoTo: 8,
  navigationControlsInfo: 9
} satisfies HTMLChPaginatorRenderElement["order"];

const defaultTranslations = {
  accessibleName: {
    goToInput: "Go to page",
    itemsPerPageOptions: "Select amount of items to show",
    firstButton: "Go to first page",
    nextButton: "Go to next page",
    lastButton: "Go to last page",
    previousButton: "Go to previous page"
  },
  text: {
    ellipsis: "...",
    first: "First",
    goToButton: "Go",
    goToInputLabel: "Page:",
    itemsPerPage: "Items per page:",
    last: "Last",
    next: "Next",
    of: "of ",
    prev: "Prev",
    showingItems:
      "Showing {{FIRST_ITEM_IN_PAGE}} - {{LAST_ITEM_IN_PAGE}} of {{TOTAL_ITEMS}} items",
    showingPage: "Showing {{ACTUAL_PAGE}} of {{TOTAL_PAGES}} pages",
    unknownItems: "many",
    unknownPages: "many"
  }
} satisfies HTMLChPaginatorRenderElement["translations"];

testDefaultProperties("ch-paginator-render", {
  hasNextPage: false,
  itemsPerPage: 10,
  itemsPerPageOptions: undefined,
  maxPagesToShowLeft: 3,
  maxPagesToShowRight: 3,
  model: [],
  order: defaultOrder,
  selectedPage: 1,
  showFirstControl: false,
  showItemsPerPage: false,
  showItemsPerPageInfo: false,
  showLastControl: false,
  showNavigationControls: true,
  showNavigationControlsInfo: false,
  showNavigationGoTo: false,
  showNextControl: false,
  showPrevControl: false,
  totalItems: undefined,
  translations: defaultTranslations
});

testDefaultCssProperties("ch-paginator-render", {
  display: "flex",
  "align-items": "center"
});

describe("[ch-paginator-render][basic]", () => {
  let page: E2EPage;
  let paginatorRenderRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-paginator-render></ch-paginator-render>`,
      failOnConsoleError: true
    });
    paginatorRenderRef = await page.find("ch-paginator-render");
  });

  it("should have Shadow DOM", () =>
    expect(paginatorRenderRef.shadowRoot).toBeTruthy());
});
