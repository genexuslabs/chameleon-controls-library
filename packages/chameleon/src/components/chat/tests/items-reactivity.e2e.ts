import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChChat } from "../chat.lit";
import type { ChatMessage } from "../types";
import "../chat.lit.js";

const chatModel1: ChatMessage[] = [
  {
    id: "1",
    role: "user",
    content: "Something"
  },
  {
    id: "2",
    role: "assistant",
    content: "Something 2"
  },
  {
    id: "3",
    role: "user",
    content: "Something 3"
  }
];

const chatModel2: ChatMessage[] = [
  {
    id: "1",
    role: "user",
    content: "A different text"
  },
  {
    id: "2",
    role: "assistant",
    content: "A different text 2"
  },
  {
    id: "3",
    role: "user",
    content: "A different text 3"
  }
];

describe("[ch-chat][items reactivity]", () => {
  let chatRef: ChChat;

  afterEach(cleanup);

  beforeEach(async () => {
    render(html`<ch-chat></ch-chat>`);
    chatRef = document.querySelector("ch-chat")!;
    await chatRef.updateComplete;
  });

  it("should have a shadowRoot", () => {
    expect(chatRef.shadowRoot).toBeTruthy();
  });

  it("should display the loading state by default", () => {
    const loadingSlot = chatRef.shadowRoot!.querySelector(
      'slot[name="loading-chat"]'
    );
    expect(loadingSlot).toBeTruthy();
  });

  it("should display the loading state by default even if the model has items", async () => {
    chatRef.items = [...chatModel1];
    await chatRef.updateComplete;

    const loadingSlot = chatRef.shadowRoot!.querySelector(
      'slot[name="loading-chat"]'
    );
    expect(loadingSlot).toBeTruthy();
  });

  it('should not render any items by default if loadingState = "all-records-loaded"', async () => {
    chatRef.loadingState = "all-records-loaded";
    await chatRef.updateComplete;

    const emptyChatSlot = chatRef.shadowRoot!.querySelector(
      'slot[name="empty-chat"]'
    );
    expect(emptyChatSlot).toBeTruthy();
  });

  it('should render items if the model is not empty and the loadingState = "more-data-to-fetch"', async () => {
    chatRef.items = [...chatModel1];
    chatRef.loadingState = "more-data-to-fetch";
    await chatRef.updateComplete;

    // Necessary to wait for the virtual scroller to render the items in the next frame
    await new Promise(r => requestAnimationFrame(r));
    await chatRef.updateComplete;

    const cells = chatRef.shadowRoot!.querySelectorAll("ch-smart-grid-cell");
    // System messages are not rendered, so we expect 3 cells for
    // the 2 user + 1 assistant messages
    expect(cells.length).toBeGreaterThanOrEqual(chatModel1.length);
  });

  it('should update the rendered items if the model is updated at runtime with loadingState = "more-data-to-fetch"', async () => {
    chatRef.items = [...chatModel1];
    chatRef.loadingState = "more-data-to-fetch";
    await chatRef.updateComplete;

    // Necessary to wait for the virtual scroller to render the items in the next frame
    await new Promise(r => requestAnimationFrame(r));
    await chatRef.updateComplete;

    const cellsBefore =
      chatRef.shadowRoot!.querySelectorAll("ch-smart-grid-cell");
    expect(cellsBefore.length).toBeGreaterThanOrEqual(chatModel1.length);

    chatRef.items = [...chatModel2];
    await chatRef.updateComplete;
    await new Promise(r => requestAnimationFrame(r));
    await chatRef.updateComplete;

    const cellsAfter =
      chatRef.shadowRoot!.querySelectorAll("ch-smart-grid-cell");
    expect(cellsAfter.length).toBeGreaterThanOrEqual(chatModel2.length);
  });
});
