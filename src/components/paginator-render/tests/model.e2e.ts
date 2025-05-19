import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { paginatorRenderNumericModel } from "../../../showcase/assets/components/paginator-render/models";

describe("[ch-paginator-render][model]", () => {
  let page: E2EPage;
  let paginatorRenderRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-paginator-render></ch-paginator-render>`,
      failOnConsoleError: true
    });
    paginatorRenderRef = await page.find("ch-paginator-render");
  });

  it("should have the correct amount of pages rendered", async () => {
    const emptyNavigationOrderedListItems = await page.findAll(
      "ch-paginator-render >>> nav[part*='pages'] >>> ol li"
    );

    // Pages without a model set should be the selected page:
    // Page rendered: [1]
    expect(emptyNavigationOrderedListItems).toHaveLength(1);

    // change to a model that shows 5 elements plus ellipsis
    paginatorRenderRef.setProperty("model", paginatorRenderNumericModel);
    await page.waitForChanges();

    const navigationOrderedListItems = await page.findAll(
      "ch-paginator-render >>> nav[part*='pages'] >>> ol li"
    );

    // Pages with the configuration should be 6
    // Pages rendered: [1,2,3,4,(ellipsis),30]
    expect(navigationOrderedListItems).toHaveLength(6);

    // TODO: create a test to validate this functionality on different amount of pages for each model
  });
  // TODO: create tests to check each models behavior
});
