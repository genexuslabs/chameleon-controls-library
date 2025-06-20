import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { PaginatorControlsOrder } from "../types";

// Function to swap elements in an array based on given indices
const swapElements = <PaginatorControlsOrder>(
  array: PaginatorControlsOrder[],
  indices: number[]
): PaginatorControlsOrder[] => {
  const newArray = [...array];
  const temp = newArray[indices[0]];

  // Swap the elements at the specified positions
  for (let i = 0; i < indices.length - 1; i++) {
    newArray[indices[i]] = newArray[indices[i + 1]];
  }
  newArray[indices[indices.length - 1]] = temp;

  return newArray;
};

// Function to generate variations of the PaginatorControlsOrder object by swapping elements
const generateOrderVariations = (
  testOrder: PaginatorControlsOrder,
  swapSize: number
): PaginatorControlsOrder[] => {
  const keys = Object.keys(testOrder);
  const variations: PaginatorControlsOrder[] = [];

  // Recursive function to generate all combinations of indices to swap
  const generateIndices = (start: number, current: number[], size: number) => {
    if (current.length === size) {
      // Create a new variation with the swapped elements
      const newVariation = swapElements(keys, current);
      // Convert the variation back to a Paginator Controls Order object
      const variationObject: PaginatorControlsOrder = Object.fromEntries(
        newVariation.map(key => [key, testOrder[key]])
      );
      variations.push(variationObject);
      return;
    }

    for (let i = start; i < keys.length; i++) {
      generateIndices(i + 1, [...current, i], size);
    }
  };
  // Generate combinations of indices for the specified size
  generateIndices(0, [], swapSize);

  return variations;
};

describe("[ch-paginator-render][order]", () => {
  let page: E2EPage;
  let paginatorRenderRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-paginator-render></ch-paginator-render>`,
      failOnConsoleError: true
    });
    paginatorRenderRef = await page.find("ch-paginator-render");
  });

  // Function to set control visibility based on the expected order
  const setControlVisibility = async (
    paginatorRenderRef: E2EElement,
    expectedOrder: PaginatorControlsOrder
  ) => {
    paginatorRenderRef.setProperty(
      "showItemsPerPage",
      !!expectedOrder.itemsPerPage
    );
    paginatorRenderRef.setProperty(
      "showItemsPerPageInfo",
      !!expectedOrder.itemsPerPageInfo
    );
    paginatorRenderRef.setProperty(
      "showNavigationControls",
      !!expectedOrder.navigationControls
    );
    paginatorRenderRef.setProperty(
      "showNavigationControlsInfo",
      !!expectedOrder.navigationControlsInfo
    );
    paginatorRenderRef.setProperty(
      "showNavigationGoTo",
      !!expectedOrder.navigationGoTo
    );
    paginatorRenderRef.setProperty(
      "showFirstControl",
      !!expectedOrder.firstControl
    );
    paginatorRenderRef.setProperty(
      "showLastControl",
      !!expectedOrder.lastControl
    );
    paginatorRenderRef.setProperty(
      "showNextControl",
      !!expectedOrder.nextControl
    );
    paginatorRenderRef.setProperty(
      "showPrevControl",
      !!expectedOrder.prevControl
    );
    await page.waitForChanges(); // Wait for changes to take effect
  };

  // Function to test the order of paginator controls
  const testPaginatorRenderOrder = async (
    paginatorRenderRef: E2EElement,
    expectedOrder: PaginatorControlsOrder
  ): Promise<void> => {
    // Set control visibility based on expected order
    await setControlVisibility(paginatorRenderRef, expectedOrder);

    // Set the order in the paginator
    paginatorRenderRef.setProperty("order", expectedOrder);
    await page.waitForChanges();

    // Get the controls in the modified order using specific selectors
    const paginatorControlsRendered = await paginatorRenderRef.findAll(
      "ch-paginator-render >>> :where(.items-per-page, .items-per-page-info, .first-button, .prev-button, .pages, .next-button, .last-button, .go-to, .navigation-info)"
    );

    // Verify the number of rendered controls
    expect(paginatorControlsRendered).toHaveLength(
      Object.keys(expectedOrder).length
    );

    const controlsClassMap = {
      itemsPerPage: "items-per-page",
      itemsPerPageInfo: "items-per-page-info",
      firstControl: "first-button",
      prevControl: "prev-button",
      navigationControls: "pages",
      nextControl: "next-button",
      lastControl: "last-button",
      navigationGoTo: "go-to",
      navigationControlsInfo: "navigation-info"
    };

    // Iterate over the expectedOrder object to verify the controls position
    for (const [key, value] of Object.entries(expectedOrder)) {
      if (value) {
        const expectedClass = controlsClassMap[key];
        expect(paginatorControlsRendered[value - 1]).toHaveClass(expectedClass);
      }
    }
  };

  // Function to run tests with customized order
  const testPaginatorRenderWithCustomizedOrder = (
    expectedOrder: PaginatorControlsOrder
  ) => {
    it(`should validate the controls order with: ${JSON.stringify(
      expectedOrder
    )}`, async () => {
      await testPaginatorRenderOrder(paginatorRenderRef, expectedOrder);
    });
  };

  describe("Paginator Order Tests", () => {
    const completePaginatorControlsOrder: PaginatorControlsOrder = {
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
    const completePaginatorControlsOrderToTest = generateOrderVariations(
      completePaginatorControlsOrder,
      4
    );
    completePaginatorControlsOrderToTest.forEach(order => {
      testPaginatorRenderWithCustomizedOrder(order);
    });

    const reducedPaginatorControlsOrder: PaginatorControlsOrder = {
      firstControl: 1,
      prevControl: 2,
      navigationControls: 3,
      nextControl: 4,
      lastControl: 5
    };

    const reducedPaginatorControlsOrderToTest = generateOrderVariations(
      reducedPaginatorControlsOrder,
      3
    );
    reducedPaginatorControlsOrderToTest.forEach(order => {
      testPaginatorRenderWithCustomizedOrder(order);
    });
  });
});
