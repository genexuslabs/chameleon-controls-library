import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import {
  testDefaultCssProperties,
  testDefaultProperties
} from "../../../testing/utils.e2e";
import { paginatorRenderNumericModel } from "../../../showcase/assets/components/paginator-render/models";

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
};

const defaultTranslations = {
  accessibleName: {
    goToInput: "Go to page",
    itemsPerPageOptions: "Select amount of items to show"
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
};

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

  it("should have the correct amount of pages rendered", async () => {
    const emptyNavigationOrderedListItems = await page.findAll(
      "ch-paginator-render >>> ol[part*='pages'] li"
    );

    // Pages without a model set should be the selected page:
    // Page rendered: [1]
    expect(emptyNavigationOrderedListItems).toHaveLength(1);

    // change to a model that shows 5 elements plus ellipsis
    paginatorRenderRef.setProperty("model", paginatorRenderNumericModel);
    await page.waitForChanges();

    const navigationOrderedListItems = await page.findAll(
      "ch-paginator-render >>> ol[part*='pages'] li"
    );

    // Pages with the configuration should be 6
    // Pages rendered: [1,2,3,4,(ellipsis),30]
    expect(navigationOrderedListItems).toHaveLength(6);
  });

  it("should properly display the elements in order selected", async () => {
    const testOrderedElements = {
      firstControl: 3,
      prevControl: 4,
      nextControl: 1,
      lastControl: 2
    };

    paginatorRenderRef.setProperty("showNavigationControls", false);
    paginatorRenderRef.setProperty("showFirstControl", true);
    paginatorRenderRef.setProperty("showLastControl", true);
    paginatorRenderRef.setProperty("showNextControl", true);
    paginatorRenderRef.setProperty("showPrevControl", true);
    await page.waitForChanges();

    const paginatorChildrenDefaultOrder = await page.findAll(
      "ch-paginator-render >>> *"
    );

    // Validate the default order of elements
    expect(paginatorChildrenDefaultOrder).toHaveLength(4);
    expect(paginatorChildrenDefaultOrder[0]).toHaveClass("first-button");
    expect(paginatorChildrenDefaultOrder[1]).toHaveClass("prev-button");
    expect(paginatorChildrenDefaultOrder[2]).toHaveClass("next-button");
    expect(paginatorChildrenDefaultOrder[3]).toHaveClass("last-button");

    // Change the order in the paginator
    paginatorRenderRef.setProperty("order", testOrderedElements);
    await page.waitForChanges();

    const paginatorChildrenModifiedOrder = await page.findAll(
      "ch-paginator-render >>> *"
    );

    // Validate the updated order of elements
    expect(paginatorChildrenModifiedOrder[2]).toHaveClass("first-button");
    expect(paginatorChildrenModifiedOrder[3]).toHaveClass("prev-button");
    expect(paginatorChildrenModifiedOrder[0]).toHaveClass("next-button");
    expect(paginatorChildrenModifiedOrder[1]).toHaveClass("last-button");
  });
});
