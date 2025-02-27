import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import type { SmartGridDataState } from "../../smart-grid/internal/infinite-scroll/types";
import { ChatMessage } from "../types";

const EMPTY_CHAT_SELECTOR = 'ch-chat >>> slot[name="empty-chat"]';
const LOADING_SELECTOR = 'ch-chat >>> [slot="empty-chat"]';
const INFINITE_SCROLLER_SELECTOR =
  "ch-chat >>> ch-smart-grid > ch-virtual-scroller";
const SMART_GRID_SELECTOR = "ch-chat >>> ch-smart-grid";

const EMPTY_ITEMS = [];
const ONE_ITEM: ChatMessage[] = [{ id: "1", role: "assistant", content: "1" }];
const TEN_ITEMS: ChatMessage[] = [
  { id: "1", role: "assistant", content: "Content 1" },
  { id: "2", role: "error", content: "Content 2" },
  { id: "3", role: "system", content: "Content 3" },
  { id: "4", role: "user", content: "Content 4" },
  { id: "5", role: "assistant", content: "Content 5" },
  { id: "6", role: "error", content: "Content 6" },
  { id: "7", role: "system", content: "Content 7" },
  { id: "8", role: "user", content: "Content 8" },
  { id: "9", role: "assistant", content: "Content 9" },
  { id: "10", role: "error", content: "Content 10" }
];

const ITEMS_VALUE = [EMPTY_ITEMS, ONE_ITEM, TEN_ITEMS];
const NOT_EMPTY_ITEMS_VALUE = [ONE_ITEM, TEN_ITEMS];

const LOADING_STATE_VALUES: SmartGridDataState[] = [
  "loading",
  "more-data-to-fetch",
  "all-records-loaded"
];

describe("[ch-chat][smart-grid]", () => {
  let page: E2EPage;
  let chatRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-chat></ch-chat>`,
      failOnConsoleError: true
    });

    chatRef = await page.find("ch-chat");
  });

  const getEmptyChatSlot = () => page.find(EMPTY_CHAT_SELECTOR);
  const getLoadingSlot = () => page.find(LOADING_SELECTOR);
  const getInfiniteScroller = () => page.find(INFINITE_SCROLLER_SELECTOR);
  const getSmartGrid = () => page.find(SMART_GRID_SELECTOR);

  it("should render the empty loading indicator by default", async () => {
    expect(await getLoadingSlot()).toBeTruthy();
    expect(await getEmptyChatSlot()).toBeFalsy();
    expect(await getSmartGrid()).toBeFalsy();
    expect(await getInfiniteScroller()).toBeFalsy();
  });

  const shouldRenderTheLoadingWhenLoadingIsInitialTest = (
    items: ChatMessage[]
  ) =>
    it(`[items.length = ${items.length}] should render the loading slot when loadingState === "initial"`, async () => {
      chatRef.setProperty("loadingState", "initial");
      chatRef.setProperty("items", items);
      await page.waitForChanges();

      expect(await getLoadingSlot()).toBeTruthy();
      expect(await getEmptyChatSlot()).toBeFalsy();
      expect(await getSmartGrid()).toBeFalsy();
      expect(await getInfiniteScroller()).toBeFalsy();
    });

  ITEMS_VALUE.forEach(items =>
    shouldRenderTheLoadingWhenLoadingIsInitialTest(items)
  );

  it(`should render the empty-chat slot when loadingState === "all-records-loaded"`, async () => {
    chatRef.setProperty("loadingState", "all-records-loaded");
    await page.waitForChanges();

    expect(await getLoadingSlot()).toBeFalsy();
    expect(await getEmptyChatSlot()).toBeTruthy();
    expect(await getSmartGrid()).toBeFalsy();
    expect(await getInfiniteScroller()).toBeFalsy();
  });

  it(`should render the empty-chat slot when loadingState === "all-records-loaded" and items.length === 0`, async () => {
    chatRef.setProperty("loadingState", "all-records-loaded");
    chatRef.setProperty("items", []);
    await page.waitForChanges();

    expect(await getLoadingSlot()).toBeFalsy();
    expect(await getEmptyChatSlot()).toBeTruthy();
    expect(await getSmartGrid()).toBeFalsy();
    expect(await getInfiniteScroller()).toBeFalsy();
  });

  const shouldRenderTheSmartGridWhenHasRecordsAndIsNotInitialLoadTest = (
    items: ChatMessage[],
    loadingState: SmartGridDataState
  ) =>
    it(`[items.length = ${items.length}][loadingState = "${loadingState}"] should render the ch-smart-grid and ch-infinite-scroller when loadingState !== "initial" and has records`, async () => {
      chatRef.setProperty("loadingState", loadingState);
      chatRef.setProperty("items", items);
      await page.waitForChanges();

      expect(await getLoadingSlot()).toBeFalsy();
      expect(await getEmptyChatSlot()).toBeFalsy();
      expect(await getSmartGrid()).toBeTruthy();
      expect(await getInfiniteScroller()).toBeTruthy();
    });

  NOT_EMPTY_ITEMS_VALUE.forEach(items =>
    LOADING_STATE_VALUES.forEach(loadingState =>
      shouldRenderTheSmartGridWhenHasRecordsAndIsNotInitialLoadTest(
        items,
        loadingState
      )
    )
  );

  const dataProviderBindingTest = (
    items: ChatMessage[],
    loadingState: SmartGridDataState
  ) =>
    it(`[items.length = ${items.length}][loadingState = "${loadingState}"] when the ch-smart-grid is rendered it should only set dataProvider = true if loadingState === "more-data-to-fetch"`, async () => {
      chatRef.setProperty("loadingState", loadingState);
      chatRef.setProperty("items", items);
      await page.waitForChanges();

      expect(await (await getSmartGrid()).getProperty("dataProvider")).toBe(
        loadingState === "more-data-to-fetch"
      );
    });

  NOT_EMPTY_ITEMS_VALUE.forEach(items =>
    LOADING_STATE_VALUES.forEach(loadingState =>
      dataProviderBindingTest(items, loadingState)
    )
  );

  const inverseLoadingTest = (
    items: ChatMessage[],
    loadingState: SmartGridDataState
  ) =>
    it(`[items.length = ${items.length}][loadingState = "${loadingState}"] when the ch-smart-grid and ch-virtual-scroller are rendered, they should have inverseLoading === true`, async () => {
      chatRef.setProperty("loadingState", loadingState);
      chatRef.setProperty("items", items);
      await page.waitForChanges();

      expect(
        await (await getInfiniteScroller()).getProperty("inverseLoading")
      ).toBe(true);
      expect(await (await getSmartGrid()).getProperty("inverseLoading")).toBe(
        true
      );
    });

  NOT_EMPTY_ITEMS_VALUE.forEach(items =>
    LOADING_STATE_VALUES.forEach(loadingState =>
      inverseLoadingTest(items, loadingState)
    )
  );

  // TODO: Add more unit test to check more property binding combinations
});
