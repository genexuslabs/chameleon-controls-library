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
    paginatorRenderRef.setProperty("showFirstControl", true);
    paginatorRenderRef.setProperty("showPrevControl", true);
    paginatorRenderRef.setProperty("showLastControl", true);
    paginatorRenderRef.setProperty("showNextControl", true);
    await page.waitForChanges();
  });

  it("should have first and previous buttons disabled when the selected page is the first", async () => {
    paginatorRenderRef.setProperty("selectedPage", 1);
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

  it("should have next and last buttons not disabled when there are more pages to select", async () => {
    const lastButton = await page.find(
      "ch-paginator-render >>> button[part*='last__button']"
    );
    const nextButton = await page.find(
      "ch-paginator-render >>> button[part*='next__button']"
    );

    expect(lastButton).not.toHaveAttribute("disabled");
    expect(nextButton).not.toHaveAttribute("disabled");
  });

  it("should have first and previous buttons disabled when the first page is reached by user interaction", async () => {
    paginatorRenderRef.setProperty("selectedPage", 3);
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

  it("should have first and previous buttons disabled when the first page is reached by updating the selectedPage", async () => {
    paginatorRenderRef.setProperty("selectedPage", 3);
    await page.waitForChanges();

    const firstButton = await page.find(
      "ch-paginator-render >>> button[part*='first__button']"
    );
    const prevButton = await page.find(
      "ch-paginator-render >>> button[part*='prev__button']"
    );

    expect(firstButton).not.toHaveAttribute("disabled");
    expect(prevButton).not.toHaveAttribute("disabled");

    paginatorRenderRef.setProperty("selectedPage", 1);
    await page.waitForChanges();

    const firstButtonUpdated = await page.find(
      "ch-paginator-render >>> button[part*='first__button']"
    );
    const prevButtonUpdated = await page.find(
      "ch-paginator-render >>> button[part*='prev__button']"
    );

    expect(firstButtonUpdated).toHaveAttribute("disabled");
    expect(prevButtonUpdated).toHaveAttribute("disabled");
  });

  it.todo(
    "should have first and previous buttons disabled when we change the hyperlink model to match the selectedPage with the first rendered link"
  );

  it.todo(
    "should have first and previous buttons disabled when we reduce the size of the model to 1"
  );

  it("should not have attribute disabled last and next button, when there are more pages to search", async () => {
    paginatorRenderRef.setProperty("selectedPage", 1);
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

  it("should set last and next buttons disabled when last page is reached by user interaction", async () => {
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

  it("should set last and next buttons disabled when last page is reached by updating the selectedPage", async () => {
    paginatorRenderRef.setProperty("selectedPage", 30);
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

  it.todo(
    "should have next and last buttons disabled when we change the hyperlink model to match the selectedPage with the next rendered link"
  );

  it.todo(
    "should have next and last buttons disabled when we reduce the size of the model to 1"
  );
});
