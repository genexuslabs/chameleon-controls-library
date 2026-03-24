import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { ArgumentTypes } from "../../../common/types";
import { SmartGridDataState } from "../../smart-grid/internal/infinite-scroll/types";
import { ChatMessage } from "../types";
import {
  FIFTEEN_ITEMS,
  LOADING_STATE_VALUES,
  LONG_STRING,
  TWENTY_FIVE_ITEMS,
  TWENTY_ITEMS
} from "./utils.e2e";

const FLOATING_POINT_ERROR_PRECISION = 1;

const valuesAreEqualInMarginOfError = (a: number, b: number) =>
  Math.abs(a - b) <= FLOATING_POINT_ERROR_PRECISION;

type UpdateLastChatMessageArgTypes = ArgumentTypes<
  HTMLChChatElement["updateLastMessage"]
>;

describe("[ch-chat][scroll]", () => {
  let page: E2EPage;
  let chatRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `
      <div style="display: grid; block-size: 500px; inline-size: 500px">
        <ch-chat></ch-chat>
      </div>
      `,
      failOnConsoleError: true
    });

    chatRef = await page.find("ch-chat");
  });

  const scrollIsAtTheBottom = (sizes: {
    scrollTop: number;
    scrollHeight: number;
    offsetHeight: number;
  }) =>
    sizes.scrollTop !== 0 &&
    sizes.offsetHeight !== sizes.scrollHeight &&
    sizes.scrollHeight <= sizes.scrollTop + sizes.offsetHeight;

  const getContentScrollPosition = (): Promise<{
    scrollTop: number;
    scrollHeight: number;
    offsetHeight: number;
  }> =>
    page.evaluate(() => {
      const chatRef = document.querySelector("ch-chat");

      const smartGridRef = chatRef.shadowRoot.querySelector(
        "ch-smart-grid"
      ) as HTMLChSmartGridElement;

      return {
        scrollTop: smartGridRef.scrollTop,
        scrollHeight: smartGridRef.scrollHeight,
        offsetHeight: smartGridRef.offsetHeight
      };
    });

  const updateScrollPosition = async scrollTop => {
    await page.evaluate((scrollTop: number) => {
      document
        .querySelector("ch-chat")
        .shadowRoot.querySelector("ch-smart-grid").scrollTop = scrollTop;
    }, scrollTop);

    // Just in case, wait for changes to be completed
    await page.waitForChanges();
  };

  const setInitialModel = async (
    loadingState: SmartGridDataState,
    model: ChatMessage[]
  ) => {
    chatRef.setProperty("loadingState", loadingState);
    chatRef.setProperty("items", model);
    await page.waitForChanges();

    // We need to wait an extra frame to compute the sizes, because the
    // infinite scroll and virtual scroller can not do the rendering and
    // positioning in only one frame
    await page.waitForChanges();
  };

  const scrollPositionIsAtBottomOnInitialLoadTest = (
    loadingState: SmartGridDataState
  ) => {
    it(`[loadingState = "${loadingState}"] should set scroll at the bottom when items are rendered for the first time`, async () => {
      await setInitialModel(loadingState, TWENTY_ITEMS);

      const sizes = await getContentScrollPosition();

      expect(scrollIsAtTheBottom(sizes)).toBe(true);
    });
  };

  const shouldCorrectlySetTheScrollTopPositionTest = (
    loadingState: SmartGridDataState
  ) => {
    it(`[loadingState = "${loadingState}"] should work setting the scrollTop`, async () => {
      await setInitialModel(loadingState, TWENTY_ITEMS);

      const sizes = await getContentScrollPosition();
      const newScrollPosition = sizes.scrollTop - 200;

      await updateScrollPosition(newScrollPosition);

      const sizesAfterUpdate = await getContentScrollPosition();

      expect(
        valuesAreEqualInMarginOfError(
          sizesAfterUpdate.scrollTop,
          newScrollPosition
        )
      ).toBe(true);
    });
  };

  const shouldKeepTheScrollAtTheBottomWhenSwitchingModelsTest = (
    loadingState: SmartGridDataState
  ) => {
    it(`[loadingState = "${loadingState}"] switching between models should re position the scroll at the bottom (model with more items)`, async () => {
      await setInitialModel(loadingState, TWENTY_ITEMS);

      const sizes = await getContentScrollPosition();
      const newScrollPosition = sizes.scrollTop - 200;

      // Re position the scroll
      await updateScrollPosition(newScrollPosition);

      // Set a model with more items
      await setInitialModel(loadingState, TWENTY_FIVE_ITEMS);

      const sizesAfterUpdate = await getContentScrollPosition();

      expect(scrollIsAtTheBottom(sizesAfterUpdate)).toBe(true);
    });

    it(`[loadingState = "${loadingState}"] switching between models should re position the scroll at the bottom (model with less items)`, async () => {
      await setInitialModel(loadingState, TWENTY_ITEMS);

      const sizes = await getContentScrollPosition();
      const newScrollPosition = sizes.scrollTop - 200;

      // Re position the scroll
      await updateScrollPosition(newScrollPosition);

      // Set a model with more items
      await setInitialModel(loadingState, FIFTEEN_ITEMS);

      const sizesAfterUpdate = await getContentScrollPosition();

      expect(scrollIsAtTheBottom(sizesAfterUpdate)).toBe(true);
    });
  };

  const shouldNotMoveTheScrollTopWhenUpdatingTheLastChatMessage = (
    loadingState: SmartGridDataState
  ) => {
    it(`[loadingState = "${loadingState}"] if the scroll is not at the bottom, it should not change the scrollTop position when updating the last chat message`, async () => {
      await setInitialModel(loadingState, TWENTY_ITEMS);

      const sizes = await getContentScrollPosition();
      const newScrollPosition = sizes.scrollTop - 200;

      // Re position the scroll
      await updateScrollPosition(newScrollPosition);

      // Update message content
      await chatRef.callMethod(
        "updateLastMessage",
        {
          role: TWENTY_ITEMS[19].role,
          content: LONG_STRING + LONG_STRING + LONG_STRING + LONG_STRING
        } satisfies UpdateLastChatMessageArgTypes[0],
        "concat" satisfies UpdateLastChatMessageArgTypes[1]
      );
      await page.waitForChanges();

      const sizesAfterUpdate = await getContentScrollPosition();

      // Just in case, ensure the scrollHeight is larger than before
      expect(sizes.scrollHeight).toBeLessThan(sizesAfterUpdate.scrollHeight);
      expect(
        valuesAreEqualInMarginOfError(
          sizesAfterUpdate.scrollTop,
          newScrollPosition
        )
      ).toBe(true);
    });
  };

  const shouldKeepTheScrollAtTheBottomWhenUpdatingTheLastChatMessage = (
    loadingState: SmartGridDataState
  ) => {
    it(`[loadingState = "${loadingState}"] if the scroll is at the bottom, it should keep it at the bottom when updating the last chat message`, async () => {
      await setInitialModel(loadingState, TWENTY_ITEMS);

      const sizes = await getContentScrollPosition();

      // Update message content
      await chatRef.callMethod(
        "updateLastMessage",
        {
          role: TWENTY_ITEMS[19].role,
          content: LONG_STRING + LONG_STRING + LONG_STRING + LONG_STRING
        } satisfies UpdateLastChatMessageArgTypes[0],
        "concat" satisfies UpdateLastChatMessageArgTypes[1]
      );
      await page.waitForChanges();

      // This extra await is necessary since the ch-chat has to wait for the
      // re-render in the ch-chat-lit component
      await page.waitForChanges();

      const sizesAfterUpdate = await getContentScrollPosition();

      // Just in case, ensure the scrollHeight is larger than before
      expect(sizes.scrollHeight).toBeLessThan(sizesAfterUpdate.scrollHeight);
      expect(scrollIsAtTheBottom(sizesAfterUpdate)).toBe(true);
    });
  };

  LOADING_STATE_VALUES.forEach(loadingState => {
    scrollPositionIsAtBottomOnInitialLoadTest(loadingState);
    shouldCorrectlySetTheScrollTopPositionTest(loadingState);

    // TODO: Fix these tests
    if (loadingState !== "more-data-to-fetch") {
      shouldKeepTheScrollAtTheBottomWhenSwitchingModelsTest(loadingState);

      // This test fails because the infinite scroll repositions the chat
      // message, even if no data was loaded
      shouldNotMoveTheScrollTopWhenUpdatingTheLastChatMessage(loadingState);
    }

    shouldKeepTheScrollAtTheBottomWhenUpdatingTheLastChatMessage(loadingState);
  });
});
