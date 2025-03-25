import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import type { SmartGridDataState } from "../internal/infinite-scroll/types";

const INFINITE_SCROLL_SELECTOR = "ch-smart-grid >>> ch-infinite-scroll";

const INITIAL_LOAD_CONTENT = `<slot name="grid-initial-loading-placeholder"></slot>`;
const EMPTY_ITEMS_CONTENT_SLOT = `<slot name="grid-content-empty"></slot>`;
const CONTENT_SLOT = `<slot name="grid-content"></slot>`;
const CONTENT_WITH_INFINITE_SCROLL_TOP = (
  loading: boolean
) => `<ch-infinite-scroll aria-hidden="true" class="hydrated${
  loading ? " loading" : ""
}"></ch-infinite-scroll>
<slot name="grid-content"></slot>`;

const CONTENT_WITH_INFINITE_SCROLL_BOTTOM = (
  loading: boolean
) => `<slot name="grid-content"></slot>
<ch-infinite-scroll aria-hidden="true" class="hydrated${
  loading ? " loading" : ""
}"></ch-infinite-scroll>`;

const DATA_PROVIDER_VALUES = [false, true];
const INVERSE_LOADING_VALUES = [false, true];

const ITEM_COUNT_VALUES = [0, -1, -10, 1, 10];
const NON_POSITIVE_ITEM_COUNT_VALUES = [0, -1, -10];
const POSITIVE_ITEM_COUNT_VALUES = [1, 10];

const LOADING_STATE_VALUES: SmartGridDataState[] = [
  "loading",
  "more-data-to-fetch",
  "all-records-loaded"
];

describe("[ch-smart-grid][infinite scroll]", () => {
  let page: E2EPage;
  let smartGridRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      // TODO: Add unit tests without the slot="grid-content" div
      html: `<ch-smart-grid><div slot="grid-content"></div></ch-smart-grid>`,
      failOnConsoleError: true
    });

    smartGridRef = await page.find("ch-smart-grid");
  });

  const getInfiniteScroll = () => page.find(INFINITE_SCROLL_SELECTOR);

  it("should only render a slot by default", () =>
    expect(smartGridRef.shadowRoot).toEqualHtml(INITIAL_LOAD_CONTENT));

  const shouldOnlyRenderASlotTest = (
    itemsCount: number,
    dataProvider: boolean,
    inverseLoading: boolean
  ) =>
    it(`[itemsCount = ${itemsCount}][dataProvider = ${dataProvider}][inverseLoading = ${inverseLoading}] should only render a slot by default because it has loadingState === "initial"`, async () => {
      smartGridRef.setProperty("itemsCount", itemsCount);
      smartGridRef.setProperty("dataProvider", dataProvider);
      smartGridRef.setProperty("inverseLoading", inverseLoading);
      await page.waitForChanges();

      // Refresh the reference
      smartGridRef = await page.find("ch-smart-grid");

      expect(smartGridRef.shadowRoot).toEqualHtml(INITIAL_LOAD_CONTENT);
    });

  ITEM_COUNT_VALUES.forEach(itemsCount =>
    DATA_PROVIDER_VALUES.forEach(dataProvider =>
      INVERSE_LOADING_VALUES.forEach(inverseLoading =>
        shouldOnlyRenderASlotTest(itemsCount, dataProvider, inverseLoading)
      )
    )
  );

  const shouldOnlyRenderAnSlotWhenEmptyTest = (
    itemsCount: number,
    loadingState: SmartGridDataState,
    dataProvider: boolean,
    inverseLoading: boolean
  ) =>
    it(`[itemsCount = ${itemsCount}][loadingState = "${loadingState}"][dataProvider = ${dataProvider}][inverseLoading = ${inverseLoading}] should only render a slot since it doesn't have records and loadingState !== "initial"`, async () => {
      smartGridRef.setProperty("itemsCount", itemsCount);
      smartGridRef.setProperty("loadingState", loadingState);
      smartGridRef.setProperty("dataProvider", dataProvider);
      smartGridRef.setProperty("inverseLoading", inverseLoading);
      await page.waitForChanges();

      // Refresh the reference
      smartGridRef = await page.find("ch-smart-grid");

      expect(smartGridRef.shadowRoot).toEqualHtml(EMPTY_ITEMS_CONTENT_SLOT);
    });

  NON_POSITIVE_ITEM_COUNT_VALUES.forEach(itemsCount =>
    LOADING_STATE_VALUES.forEach(loadingState =>
      DATA_PROVIDER_VALUES.forEach(dataProvider =>
        INVERSE_LOADING_VALUES.forEach(inverseLoading =>
          shouldOnlyRenderAnSlotWhenEmptyTest(
            itemsCount,
            loadingState,
            dataProvider,
            inverseLoading
          )
        )
      )
    )
  );

  const shouldOnlyRenderAnSlotForTheContentTest = (
    itemsCount: number,
    loadingState: SmartGridDataState
  ) =>
    it(`[itemsCount = ${itemsCount}][loadingState = "${loadingState}"] should only render a slot for the content since it has records and loadingState !== "initial", but no dataProvider and inverseLoading`, async () => {
      smartGridRef.setProperty("itemsCount", itemsCount);
      smartGridRef.setProperty("loadingState", loadingState);
      smartGridRef.setProperty("dataProvider", false);
      smartGridRef.setProperty("inverseLoading", false);
      await page.waitForChanges();

      // Refresh the reference
      smartGridRef = await page.find("ch-smart-grid");

      expect(smartGridRef.shadowRoot).toEqualHtml(CONTENT_SLOT);
    });

  POSITIVE_ITEM_COUNT_VALUES.forEach(itemsCount =>
    LOADING_STATE_VALUES.forEach(loadingState =>
      shouldOnlyRenderAnSlotForTheContentTest(itemsCount, loadingState)
    )
  );

  const shouldRenderInfiniteScrollAndSlotWhenContentAndInverseLoadingTest = (
    itemsCount: number,
    loadingState: SmartGridDataState,
    dataProvider: boolean
  ) =>
    it(`[itemsCount = ${itemsCount}][loadingState = "${loadingState}"][dataProvider = ${dataProvider}] should render the ch-infinite-scroll and then a slot for the content since it has records, loadingState !== "initial" and inverseLoading`, async () => {
      smartGridRef.setProperty("itemsCount", itemsCount);
      smartGridRef.setProperty("loadingState", loadingState);
      smartGridRef.setProperty("dataProvider", dataProvider);
      smartGridRef.setProperty("inverseLoading", true);
      await page.waitForChanges();

      // Refresh the reference
      smartGridRef = await page.find("ch-smart-grid");

      expect(smartGridRef.shadowRoot).toEqualHtml(
        CONTENT_WITH_INFINITE_SCROLL_TOP(loadingState === "loading")
      );
    });

  POSITIVE_ITEM_COUNT_VALUES.forEach(itemsCount =>
    LOADING_STATE_VALUES.forEach(loadingState =>
      DATA_PROVIDER_VALUES.forEach(dataProvider =>
        shouldRenderInfiniteScrollAndSlotWhenContentAndInverseLoadingTest(
          itemsCount,
          loadingState,
          dataProvider
        )
      )
    )
  );

  const shouldRenderSlotAndInfiniteScrollWhenContentHasDataProviderButNotInverseLoadingTest =
    (itemsCount: number, loadingState: SmartGridDataState) =>
      it(`[itemsCount = ${itemsCount}][loadingState = "${loadingState}"] should render a slot for the content and then the ch-infinite-scroll since it has records, loadingState !== "initial", dataProvider but no inverseLoading`, async () => {
        smartGridRef.setProperty("itemsCount", itemsCount);
        smartGridRef.setProperty("loadingState", loadingState);
        smartGridRef.setProperty("dataProvider", true);
        smartGridRef.setProperty("inverseLoading", false);
        await page.waitForChanges();

        // Refresh the reference
        smartGridRef = await page.find("ch-smart-grid");

        expect(smartGridRef.shadowRoot).toEqualHtml(
          CONTENT_WITH_INFINITE_SCROLL_BOTTOM(loadingState === "loading")
        );
      });

  POSITIVE_ITEM_COUNT_VALUES.forEach(itemsCount =>
    LOADING_STATE_VALUES.forEach(loadingState =>
      shouldRenderSlotAndInfiniteScrollWhenContentHasDataProviderButNotInverseLoadingTest(
        itemsCount,
        loadingState
      )
    )
  );

  const checkDataProviderBindingInfiniteScroll = (
    itemsCount: number,
    loadingState: SmartGridDataState,
    dataProvider: boolean,
    inverseLoading: boolean
  ) =>
    // Only run the test when the ch-infinite-scroll is rendered
    (dataProvider || inverseLoading) &&
    it(`[itemsCount = ${itemsCount}][loadingState = "${loadingState}"][dataProvider = ${dataProvider}][inverseLoading = ${inverseLoading}] should properly bind the dataProvider property in the ch-infinite-scroll when it's rendered`, async () => {
      smartGridRef.setProperty("itemsCount", itemsCount);
      smartGridRef.setProperty("loadingState", loadingState);
      smartGridRef.setProperty("dataProvider", dataProvider);
      smartGridRef.setProperty("inverseLoading", inverseLoading);
      await page.waitForChanges();

      expect(
        await (await getInfiniteScroll()).getProperty("dataProvider")
      ).toBe(dataProvider);
    });

  POSITIVE_ITEM_COUNT_VALUES.forEach(itemsCount =>
    LOADING_STATE_VALUES.forEach(loadingState =>
      DATA_PROVIDER_VALUES.forEach(dataProvider =>
        INVERSE_LOADING_VALUES.forEach(inverseLoading =>
          checkDataProviderBindingInfiniteScroll(
            itemsCount,
            loadingState,
            dataProvider,
            inverseLoading
          )
        )
      )
    )
  );

  // TODO: Add more unit test to check more property binding combinations
});
