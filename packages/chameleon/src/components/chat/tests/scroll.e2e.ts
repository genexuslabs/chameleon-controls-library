import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ArgumentTypes } from "../../../typings/types.js";
import type { SmartGridDataState } from "../../infinite-scroll/types";
import type { ChChat } from "../chat.lit";
import "../chat.lit.js";
import type { ChatMessage } from "../types";
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

type UpdateLastChatMessageArgTypes = ArgumentTypes<HTMLChChatElement["updateLastMessage"]>;

describe("[ch-chat][scroll]", () => {
  let chatRef: ChChat;

  afterEach(cleanup);

  beforeEach(async () => {
    render(html`
      <div style="display: grid; block-size: 500px; inline-size: 500px">
        <ch-chat></ch-chat>
      </div>
    `);
    chatRef = document.querySelector("ch-chat")!;
    await chatRef.updateComplete;
  });

  const scrollIsAtTheBottom = (sizes: {
    scrollTop: number;
    scrollHeight: number;
    offsetHeight: number;
  }) =>
    sizes.scrollTop !== 0 &&
    sizes.offsetHeight !== sizes.scrollHeight &&
    sizes.scrollHeight <= sizes.scrollTop + sizes.offsetHeight;

  const getContentScrollPosition = async () => {
    const smartGridRef = chatRef.shadowRoot!.querySelector("ch-smart-grid") as HTMLElement;

    return {
      scrollTop: smartGridRef.scrollTop,
      scrollHeight: smartGridRef.scrollHeight,
      offsetHeight: smartGridRef.offsetHeight
    };
  };

  const updateScrollPosition = async (scrollTop: number) => {
    const smartGridRef = chatRef.shadowRoot!.querySelector("ch-smart-grid") as HTMLElement;
    smartGridRef.scrollTop = scrollTop;
    await chatRef.updateComplete;
  };

  const setInitialModel = async (loadingState: SmartGridDataState, model: ChatMessage[]) => {
    chatRef.loadingState = loadingState;
    chatRef.items = [...model];
    await chatRef.updateComplete;

    // We need to wait an extra frame to compute the sizes, because the
    // infinite scroll and virtual scroller can not do the rendering and
    // positioning in only one frame
    await new Promise(r => requestAnimationFrame(r));
    await chatRef.updateComplete;
  };

  const scrollPositionIsAtBottomOnInitialLoadTest = (loadingState: SmartGridDataState) => {
    it(`[loadingState = "${loadingState}"] should set scroll at the bottom when items are rendered for the first time`, async () => {
      await setInitialModel(loadingState, TWENTY_ITEMS as any);

      const sizes = await getContentScrollPosition();

      expect(scrollIsAtTheBottom(sizes)).toBe(true);
    });
  };

  const shouldCorrectlySetTheScrollTopPositionTest = (loadingState: SmartGridDataState) => {
    it(`[loadingState = "${loadingState}"] should work setting the scrollTop`, async () => {
      await setInitialModel(loadingState, TWENTY_ITEMS as any);

      const sizes = await getContentScrollPosition();
      const newScrollPosition = sizes.scrollTop - 200;

      await updateScrollPosition(newScrollPosition);

      const sizesAfterUpdate = await getContentScrollPosition();

      expect(valuesAreEqualInMarginOfError(sizesAfterUpdate.scrollTop, newScrollPosition)).toBe(
        true
      );
    });
  };

  const shouldKeepTheScrollAtTheBottomWhenSwitchingModelsTest = (
    loadingState: SmartGridDataState
  ) => {
    it(`[loadingState = "${loadingState}"] switching between models should re position the scroll at the bottom (model with more items)`, async () => {
      await setInitialModel(loadingState, TWENTY_ITEMS as any);

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
      await setInitialModel(loadingState, TWENTY_ITEMS as any);

      const sizes = await getContentScrollPosition();
      const newScrollPosition = sizes.scrollTop - 200;

      // Re position the scroll
      await updateScrollPosition(newScrollPosition);

      // Set a model with less items
      await setInitialModel(loadingState, FIFTEEN_ITEMS);

      const sizesAfterUpdate = await getContentScrollPosition();

      expect(scrollIsAtTheBottom(sizesAfterUpdate)).toBe(true);
    });
  };

  const shouldNotMoveTheScrollTopWhenUpdatingTheLastChatMessage = (
    loadingState: SmartGridDataState
  ) => {
    it(`[loadingState = "${loadingState}"] if the scroll is not at the bottom, it should not change the scrollTop position when updating the last chat message`, async () => {
      await setInitialModel(loadingState, TWENTY_ITEMS as any);

      const sizes = await getContentScrollPosition();
      const newScrollPosition = sizes.scrollTop - 200;

      // Re position the scroll
      await updateScrollPosition(newScrollPosition);

      // Update message content
      await chatRef.updateLastMessage(
        {
          role: TWENTY_ITEMS[19].role,
          content: LONG_STRING + LONG_STRING + LONG_STRING + LONG_STRING
        } satisfies UpdateLastChatMessageArgTypes[0],
        "concat" satisfies UpdateLastChatMessageArgTypes[1]
      );
      await chatRef.updateComplete;

      const sizesAfterUpdate = await getContentScrollPosition();

      // Just in case, ensure the scrollHeight is larger than before
      expect(sizes.scrollHeight).toBeLessThan(sizesAfterUpdate.scrollHeight);
      expect(valuesAreEqualInMarginOfError(sizesAfterUpdate.scrollTop, newScrollPosition)).toBe(
        true
      );
    });
  };

  const shouldKeepTheScrollAtTheBottomWhenUpdatingTheLastChatMessage = (
    loadingState: SmartGridDataState
  ) => {
    it(`[loadingState = "${loadingState}"] if the scroll is at the bottom, it should keep it at the bottom when updating the last chat message`, async () => {
      await setInitialModel(loadingState, TWENTY_ITEMS as any);

      // Update message content
      await chatRef.updateLastMessage(
        {
          role: TWENTY_ITEMS[19].role,
          content: LONG_STRING + LONG_STRING + LONG_STRING + LONG_STRING
        } satisfies UpdateLastChatMessageArgTypes[0],
        "concat" satisfies UpdateLastChatMessageArgTypes[1]
      );
      await chatRef.updateComplete;
      await new Promise(r => requestAnimationFrame(r));

      const sizesAfterUpdate = await getContentScrollPosition();

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

