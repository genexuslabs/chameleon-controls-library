import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { SmartGridDataState } from "../../infinite-scroll/types";
import type { ChChat } from "../chat.lit";
import "../chat.lit.js";
import type { ChatMessage } from "../types";
import { EMPTY_ITEMS, LOADING_STATE_VALUES, ONE_ITEM, TEN_ITEMS } from "./utils.e2e";

const ITEMS_VALUE = [EMPTY_ITEMS, ONE_ITEM, TEN_ITEMS];
const NOT_EMPTY_ITEMS_VALUE = [ONE_ITEM, TEN_ITEMS];

describe("[ch-chat][smart-grid]", () => {
  let chatRef: ChChat;

  afterEach(cleanup);

  beforeEach(async () => {
    render(html`<ch-chat></ch-chat>`);
    chatRef = document.querySelector("ch-chat")!;
    await chatRef.updateComplete;
  });

  const getEmptyChatSlot = () => chatRef.shadowRoot!.querySelector('slot[name="empty-chat"]');
  const getLoadingSlot = () => chatRef.shadowRoot!.querySelector('slot[name="loading-chat"]');
  const getSmartGrid = () => chatRef.shadowRoot!.querySelector("ch-smart-grid");
  const getInfiniteScroller = () =>
    chatRef.shadowRoot!.querySelector("ch-smart-grid ch-virtual-scroller");

  it("should render the empty loading indicator by default", () => {
    expect(getLoadingSlot()).toBeTruthy();
    expect(getEmptyChatSlot()).toBeNull();
    expect(getSmartGrid()).toBeNull();
    expect(getInfiniteScroller()).toBeNull();
  });

  const shouldRenderTheLoadingWhenLoadingIsInitialTest = (items: ChatMessage[]) =>
    it(`[items.length = ${items.length}] should render the loading slot when loadingState === "initial"`, async () => {
      chatRef.loadingState = "initial";
      chatRef.items = [...items];
      await chatRef.updateComplete;

      expect(getLoadingSlot()).toBeTruthy();
      expect(getEmptyChatSlot()).toBeNull();
      expect(getSmartGrid()).toBeNull();
      expect(getInfiniteScroller()).toBeNull();
    });

  ITEMS_VALUE.forEach(items => shouldRenderTheLoadingWhenLoadingIsInitialTest(items));

  it('should render the empty-chat slot when loadingState === "all-records-loaded"', async () => {
    chatRef.loadingState = "all-records-loaded";
    await chatRef.updateComplete;

    expect(getLoadingSlot()).toBeNull();
    expect(getEmptyChatSlot()).toBeTruthy();
    expect(getSmartGrid()).toBeNull();
    expect(getInfiniteScroller()).toBeNull();
  });

  it('should render the empty-chat slot when loadingState === "all-records-loaded" and items.length === 0', async () => {
    chatRef.loadingState = "all-records-loaded";
    chatRef.items = [];
    await chatRef.updateComplete;

    expect(getLoadingSlot()).toBeNull();
    expect(getEmptyChatSlot()).toBeTruthy();
    expect(getSmartGrid()).toBeNull();
    expect(getInfiniteScroller()).toBeNull();
  });

  const shouldRenderTheSmartGridWhenHasRecordsAndIsNotInitialLoadTest = (
    items: ChatMessage[],
    loadingState: SmartGridDataState
  ) =>
    it(`[items.length = ${items.length}][loadingState = "${loadingState}"] should render the ch-smart-grid and ch-virtual-scroller when loadingState !== "initial" and has records`, async () => {
      chatRef.loadingState = loadingState;
      chatRef.items = [...items];
      await chatRef.updateComplete;

      expect(getLoadingSlot()).toBeNull();
      expect(getEmptyChatSlot()).toBeNull();
      expect(getSmartGrid()).toBeTruthy();
      expect(getInfiniteScroller()).toBeTruthy();
    });

  NOT_EMPTY_ITEMS_VALUE.forEach(items =>
    LOADING_STATE_VALUES.forEach(loadingState =>
      shouldRenderTheSmartGridWhenHasRecordsAndIsNotInitialLoadTest(items, loadingState)
    )
  );

  const dataProviderBindingTest = (items: ChatMessage[], loadingState: SmartGridDataState) =>
    it(`[items.length = ${items.length}][loadingState = "${loadingState}"] when the ch-smart-grid is rendered it should only set dataProvider = true if loadingState === "more-data-to-fetch"`, async () => {
      chatRef.loadingState = loadingState;
      chatRef.items = [...items];
      await chatRef.updateComplete;

      const smartGrid = getSmartGrid() as HTMLChSmartGridElement;
      expect(smartGrid.dataProvider).toBe(loadingState === "more-data-to-fetch");
    });

  NOT_EMPTY_ITEMS_VALUE.forEach(items =>
    LOADING_STATE_VALUES.forEach(loadingState => dataProviderBindingTest(items, loadingState))
  );

  const inverseLoadingTest = (items: ChatMessage[], loadingState: SmartGridDataState) =>
    it(`[items.length = ${items.length}][loadingState = "${loadingState}"] when the ch-smart-grid and ch-virtual-scroller are rendered, they should have inverseLoading === true`, async () => {
      chatRef.loadingState = loadingState;
      chatRef.items = [...items];
      await chatRef.updateComplete;

      const scroller = getInfiniteScroller() as HTMLChVirtualScrollerElement;
      const smartGrid = getSmartGrid() as HTMLChSmartGridElement;
      expect(scroller.inverseLoading).toBe(true);
      expect(smartGrid.inverseLoading).toBe(true);
    });

  NOT_EMPTY_ITEMS_VALUE.forEach(items =>
    LOADING_STATE_VALUES.forEach(loadingState => inverseLoadingTest(items, loadingState))
  );

  // TODO: Add more unit test to check more property binding combinations
});

