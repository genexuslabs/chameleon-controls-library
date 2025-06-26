import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import {
  paginatorRenderHyperlinkModel,
  paginatorRenderNumericModel,
  paginatorRenderNumericModelWithoutTotalPages,
  paginatorRenderNumericModelWithoutUrlMapping
} from "../../../showcase/assets/components/paginator-render/models";
import { PaginatorRenderModel } from "../types";

const runModelRenderedTest = (
  description: string,
  model: PaginatorRenderModel,
  expectedNotSelectedCount: number,
  expectedEllipsisCount: number,
  selectedPage: number | string = 1 // Default value for selectedPage
) => {
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

    it(description, async () => {
      paginatorRenderRef.setProperty("model", model);
      paginatorRenderRef.setProperty("selectedPage", selectedPage);

      await page.waitForChanges();

      const navigationPageSelected = await page.findAll(
        "ch-paginator-render >>> [part='page selected']"
      );
      const navigationPagesNotSelected = await page.findAll(
        "ch-paginator-render >>> [part='page not-selected']"
      );
      const navigationPagesEllipsis = await page.findAll(
        "ch-paginator-render >>> [part='page ellipsis']"
      );

      expect(navigationPageSelected).toHaveLength(1); // page selected should always be 1
      expect(navigationPagesNotSelected).toHaveLength(expectedNotSelectedCount);
      expect(navigationPagesEllipsis).toHaveLength(expectedEllipsisCount);
    });
  });
};

runModelRenderedTest(
  "should render 4 not selected pages and 1 ellipsis when Numeric Model is passed and selectedPage is 1",
  paginatorRenderNumericModel,
  4, // Expected count of not selected pages
  1 // Expected count of ellipsis items
);

runModelRenderedTest(
  "should render 8 not selected pages and 2 ellipsis when Numeric Model is passed and selected page is 10",
  paginatorRenderNumericModel,
  8, // Expected count of not selected pages
  2, // Expected count of ellipsis items
  10 // When selectedPage 10, expected items should change
);

runModelRenderedTest(
  "should render 4 not selected pages and 1 ellipsis when Hyperlink Model is passed and selectedPage is 1",
  paginatorRenderHyperlinkModel,
  4, // Expected count of not selected pages
  1, // Expected count of ellipsis items
  "http://localhost:3333/#paginator-render?page=1"
);

runModelRenderedTest(
  "should render 7 not selected pages and 1 ellipsis when Hyperlink Model is passed and selected page is 4",
  paginatorRenderHyperlinkModel,
  7, // Expected count of not selected pages
  1, // Expected count of ellipsis items
  "http://localhost:3333/#paginator-render?page=4" // When selectedPage 4, expected items should change
);

runModelRenderedTest(
  "should render 4 not selected pages and 1 ellipsis when Numeric Model without UrlMapping is passed and selectedPage is 1",
  paginatorRenderNumericModelWithoutUrlMapping,
  4, // Expected count of not selected pages
  1 // Expected count of ellipsis items
);

runModelRenderedTest(
  "should render 8 not selected pages and 2 ellipsis when Numeric Model without UrlMapping is passed and selected page is 10",
  paginatorRenderNumericModelWithoutUrlMapping,
  8, // Expected count of not selected pages
  2, // Expected count of ellipsis items
  10 // When selectedPage 10, expected items should change
);

runModelRenderedTest(
  "should not render not selected pages or ellipsis when Numeric Model without totalPages is passed and selectedPage is 1",
  paginatorRenderNumericModelWithoutTotalPages,
  0, // Expected count of not selected pages
  0 // Expected count of ellipsis items
);
