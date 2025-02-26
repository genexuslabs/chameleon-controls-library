import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

const INFINITE_SCROLL_SELECTOR = "ch-smart-grid >>> ch-infinite-scroll";

describe("[ch-smart-grid][infinite scroll]", () => {
  let page: E2EPage;
  let smartGridRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-smart-grid></ch-smart-grid>`,
      failOnConsoleError: true
    });

    smartGridRef = await page.find("ch-smart-grid");
  });

  const getInfiniteScroll = () => page.find(INFINITE_SCROLL_SELECTOR);

  it("should not render the ch-infinite-scroll by default", async () => {
    expect(await getInfiniteScroll()).toBeFalsy();
  });

  it("should not render the ch-infinite-scroll when itemsCount === 0", async () => {
    smartGridRef.setProperty("itemsCount", 0);
    await page.waitForChanges();

    expect(await getInfiniteScroll()).toBeFalsy();
  });

  it("should not render the ch-infinite-scroll when itemsCount < 0", async () => {
    smartGridRef.setProperty("itemsCount", -1);
    await page.waitForChanges();

    expect(await getInfiniteScroll()).toBeFalsy();

    smartGridRef.setProperty("itemsCount", -10);
    await page.waitForChanges();

    expect(await getInfiniteScroll()).toBeFalsy();
  });

  it("should not render the ch-infinite-scroll when itemsCount > 0 and there is not dataProvider or infiniteScroll", async () => {
    smartGridRef.setProperty("itemsCount", 1);
    await page.waitForChanges();

    expect(await getInfiniteScroll()).toBeFalsy();
  });

  // TODO: Fix this test
  it.skip('should render the ch-infinite-scroll when itemsCount > 0, inverseLoading is set and loadingState !== "initial"', async () => {
    smartGridRef.setProperty("itemsCount", 1);
    smartGridRef.setProperty("loadingState", "more-data-to-fetch");
    smartGridRef.setProperty("inverseLoading", true);
    await page.waitForChanges();

    expect(await getInfiniteScroll()).toBeTruthy();
  });

  // TODO: Fix this test
  it.skip("should render the ch-infinite-scroll when itemsCount > 0 and dataProvider is set", async () => {
    smartGridRef.setProperty("itemsCount", 1);
    smartGridRef.setProperty("dataProvider", true);
    await page.waitForChanges();

    expect(await getInfiniteScroll()).toBeTruthy();
  });

  // TODO: Add more unit test to check more combinations
});
