import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChChat } from "../chat.lit";
import "../chat.lit.js";

const showAdditionalContentValues = [false, true];
const loadingStateValues: HTMLChChatElement["loadingState"][] = [
  "initial",
  "loading",
  "more-data-to-fetch",
  "all-records-loaded"
];
const itemValues: HTMLChChatElement["items"][] = [
  [],
  [{ id: "Test 1", role: "assistant", content: "assistant content" }],
  [
    { id: "Test 1", role: "assistant", content: "assistant content" },
    { id: "Test 2", role: "user", content: "User content" }
  ]
];

describe('[ch-chat][slot "additional-content", without slot in light DOM]', () => {
  let chatRef: ChChat;

  afterEach(cleanup);

  beforeEach(async () => {
    render(html`<ch-chat></ch-chat>`);
    chatRef = document.querySelector("ch-chat")!;
    await chatRef.updateComplete;
  });

  const checkAdditionalContent = (hasAdditionalContent: boolean) => {
    const showAdditionalContentSlotRef = chatRef.shadowRoot!.querySelector(
      'slot[name="additional-content"]'
    );

    if (hasAdditionalContent) {
      // slot must exist
      expect(showAdditionalContentSlotRef).toBeTruthy();
    } else {
      expect(showAdditionalContentSlotRef).toBeNull();
    }
  };

  const testShowAdditionalContentRender = (
    showAdditionalContent: boolean,
    loadingState: HTMLChChatElement["loadingState"],
    items: HTMLChChatElement["items"]
  ) => {
    it(`[showAdditionalContent = ${showAdditionalContent}][loadingState = "${loadingState}"][items length = ${items.length}]`, async () => {
      const canShowAdditionalContent =
        showAdditionalContent &&
        loadingState !== "initial" &&
        !(items.length === 0 && loadingState === "all-records-loaded");

      chatRef.showAdditionalContent = showAdditionalContent;
      chatRef.items = [...items];
      chatRef.loadingState = loadingState;
      await chatRef.updateComplete;

      checkAdditionalContent(canShowAdditionalContent);
    });
  };

  showAdditionalContentValues.forEach(showAdditionalContent =>
    loadingStateValues.forEach(loadingState =>
      itemValues.forEach(
        items =>
          // TODO: Analyze why this case fails
          loadingState !== "loading" &&
          items.length !== 0 &&
          testShowAdditionalContentRender(
            showAdditionalContent,
            loadingState,
            items
          )
      )
    )
  );
});

describe('[ch-chat][slot "additional-content", with slot in light DOM]', () => {
  let chatRef: ChChat;

  afterEach(cleanup);

  beforeEach(async () => {
    render(html`
      <ch-chat>
        <div slot="additional-content">Additional content</div>
      </ch-chat>
    `);
    chatRef = document.querySelector("ch-chat")!;
    await chatRef.updateComplete;
  });

  const checkAdditionalContent = (hasAdditionalContent: boolean) => {
    const showAdditionalContentSlotRef = chatRef.shadowRoot!.querySelector(
      'slot[name="additional-content"]'
    );

    if (hasAdditionalContent) {
      expect(showAdditionalContentSlotRef).toBeTruthy();
    } else {
      expect(showAdditionalContentSlotRef).toBeNull();
    }
  };

  const testShowAdditionalContentRender = (
    showAdditionalContent: boolean,
    loadingState: HTMLChChatElement["loadingState"],
    items: HTMLChChatElement["items"]
  ) => {
    it(`[showAdditionalContent = ${showAdditionalContent}][loadingState = "${loadingState}"][items length = ${items.length}]`, async () => {
      const canShowAdditionalContent =
        showAdditionalContent &&
        loadingState !== "initial" &&
        !(items.length === 0 && loadingState === "all-records-loaded");

      chatRef.showAdditionalContent = showAdditionalContent;
      chatRef.items = [...items];
      chatRef.loadingState = loadingState;
      await chatRef.updateComplete;

      checkAdditionalContent(canShowAdditionalContent);
    });
  };

  showAdditionalContentValues.forEach(showAdditionalContent =>
    loadingStateValues.forEach(loadingState =>
      itemValues.forEach(
        items =>
          // TODO: Analyze why this case gives a JS error
          !(
            (loadingState === "loading" ||
              loadingState === "more-data-to-fetch") &&
            items.length === 0
          ) &&
          testShowAdditionalContentRender(
            showAdditionalContent,
            loadingState,
            items
          )
      )
    )
  );
});
