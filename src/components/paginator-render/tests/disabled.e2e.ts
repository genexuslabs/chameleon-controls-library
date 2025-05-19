import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { paginatorRenderNumericModel } from "../../../showcase/assets/components/paginator-render/models";

describe("[ch-paginator-render][disabled]", () => {
  let page: E2EPage;
  let paginatorRenderRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-paginator-render></ch-paginator-render>`,
      failOnConsoleError: true
    });
    paginatorRenderRef = await page.find("ch-paginator-render");
    paginatorRenderRef.setProperty("model", paginatorRenderNumericModel);
  });

  it("should have first and previous buttons disabled when the selected page is the first", async () => {
    paginatorRenderRef.setProperty("selectedPage", 1);
    paginatorRenderRef.setProperty("showFirstControl", true);
    paginatorRenderRef.setProperty("showPrevControl", true);
    await page.waitForChanges();

    const firstButton = await page.find(
      "ch-paginator-render >>> button[part*='first__button']"
    );
    const prevButton = await page.find(
      "ch-paginator-render >>> button[part*='prev__button']"
    );

    expect(firstButton).toHaveAttribute("disabled");
    expect(prevButton).toHaveAttribute("disabled");
  });

  it("should have first and previous buttons disabled when the first page is reached", async () => {
    paginatorRenderRef.setProperty("selectedPage", 3);
    paginatorRenderRef.setProperty("showFirstControl", true);
    paginatorRenderRef.setProperty("showPrevControl", true);
    await page.waitForChanges();

    await page.click("ch-paginator-render >>> button[part*='first__button']");
    await page.waitForChanges();

    const firstButton = await page.find(
      "ch-paginator-render >>> button[part*='first__button']"
    );
    const prevButton = await page.find(
      "ch-paginator-render >>> button[part*='prev__button']"
    );

    expect(firstButton).toHaveAttribute("disabled");
    expect(prevButton).toHaveAttribute("disabled");
  });

  it("should not have attribute disabled last and next button, when there are more pages to search", async () => {
    paginatorRenderRef.setProperty("selectedPage", 1);
    paginatorRenderRef.setProperty("showLastControl", true);
    paginatorRenderRef.setProperty("showNextControl", true);
    await page.waitForChanges();

    const lastButton = await page.find(
      "ch-paginator-render >>> button[part*='last__button']"
    );
    const nextButton = await page.find(
      "ch-paginator-render >>> button[part*='next__button']"
    );

    expect(lastButton).not.toHaveAttribute("disabled");
    expect(nextButton).not.toHaveAttribute("disabled");
  });

  it("should set last and next buttons disabled when selected there's no more pages to show", async () => {
    paginatorRenderRef.setProperty("showLastControl", true);
    paginatorRenderRef.setProperty("showNextControl", true);
    await page.waitForChanges();

    await page.click("ch-paginator-render >>> button[part*='last__button']");
    await page.waitForChanges();

    const lastButton = await page.find(
      "ch-paginator-render >>> button[part*='last__button']"
    );
    const nextButton = await page.find(
      "ch-paginator-render >>> button[part*='next__button']"
    );

    expect(lastButton).toHaveAttribute("disabled");
    expect(nextButton).toHaveAttribute("disabled");
  });
});
