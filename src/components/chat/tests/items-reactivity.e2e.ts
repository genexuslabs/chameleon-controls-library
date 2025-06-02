import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { ChatMessage, ChatMessageByRole } from "../types";

const INITIAL_LOAD_RENDERED_CONTENT =
  '<slot name="loading-chat"></slot><div class="send-container" part="send-container"><div class="send-input-wrapper" part="send-input-wrapper"><ch-edit class="ch-edit--cursor-text ch-edit--multiline hydrated" part="ch-edit--empty-value send-input" data-text-align=""></ch-edit></div><button aria-label="Send" title="Send" class="send-or-audio-button" part="send-button" disabled="" type="button"></button></div>';

const EMPTY_RENDERED_CONTENT =
  '<slot name="empty-chat"></slot><div class="send-container" part="send-container"><div class="send-input-wrapper" part="send-input-wrapper"><ch-edit class="ch-edit--cursor-text ch-edit--multiline hydrated" part="ch-edit--empty-value send-input" data-text-align=""></ch-edit></div><button aria-label="Send" title="Send" class="send-or-audio-button" part="send-button" type="button"></button></div>';

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

const USER_CELL = <I extends string, T extends string>(id: I, content: T) =>
  `<ch-smart-grid-cell part="message user ${id} has-content" role="gridcell" cell-id="${id}" class="hydrated" data-did-load="true"><div part="content-container user ${id}">${content}</div></ch-smart-grid-cell>`;

const ASSISTANT_CELL = <I extends string>(
  id: I,
  assistantState: ChatMessageByRole<"assistant">["status"]
) =>
  `<ch-smart-grid-cell aria-live="polite" aria-busy="false" part="message assistant ${id} has-content ${assistantState}" role="gridcell" cell-id="${id}" class="hydrated" data-did-load="true"><div part="content-container assistant ${id} ${assistantState}"><ch-markdown-viewer part="assistant content ${id} ${assistantState}" class="hydrated"></ch-markdown-viewer><button aria-label="Copy message content" part="assistant copy-message-content ${id}" type="button">Copy</button></div></ch-smart-grid-cell>`;

describe("[ch-chat][items reactivity]", () => {
  let page: E2EPage;
  let chatRef: E2EElement;

  const getChatRenderedContent = () =>
    page.evaluate(() =>
      document.querySelector("ch-chat").shadowRoot.innerHTML.toString()
    );

  const getChatRenderedItems = () =>
    page.evaluate(() =>
      document
        .querySelector("ch-chat")
        .shadowRoot.querySelector("ch-virtual-scroller")
        .innerHTML.toString()
    );

  beforeEach(async () => {
    page = await newE2EPage({
      failOnConsoleError: true,
      html: `<ch-chat></ch-chat>`
    });
    chatRef = await page.find("ch-chat");
  });

  it("should have a shadowRoot", () => {
    expect(chatRef.shadowRoot).toBeTruthy();
  });

  it("should display the loading state by default", async () => {
    expect(await getChatRenderedContent()).toEqual(
      INITIAL_LOAD_RENDERED_CONTENT
    );
  });

  it("should display the loading state by default even if the model has items", async () => {
    await chatRef.setProperty("items", chatModel1);
    await page.waitForChanges();

    expect(await getChatRenderedContent()).toEqual(
      INITIAL_LOAD_RENDERED_CONTENT
    );
  });

  it('should not render any items by default if loadingState = "all-records-loaded"', async () => {
    await chatRef.setProperty("loadingState", "all-records-loaded");
    await page.waitForChanges();

    expect(await getChatRenderedContent()).toEqual(EMPTY_RENDERED_CONTENT);
  });

  it('should render items if the model is not empty and the loadingState = "all-records-loaded"', async () => {
    await chatRef.setProperty("items", chatModel1);
    await chatRef.setProperty("loadingState", "more-data-to-fetch");
    await page.waitForChanges();

    // Necessary to wait for the virtual scroller to render the items in the next frame
    await page.waitForChanges();

    expect(await getChatRenderedItems()).toEqual(
      USER_CELL("1", "Something") +
        ASSISTANT_CELL("2", "complete") +
        USER_CELL("3", "Something 3")
    );
  });

  it('should update the rendered items if the model is updated at runtime with loadingState = "all-records-loaded"', async () => {
    await chatRef.setProperty("items", chatModel1);
    await chatRef.setProperty("loadingState", "more-data-to-fetch");
    await page.waitForChanges();

    // Necessary to wait for the virtual scroller to render the items in the next frame
    await page.waitForChanges();

    expect(await getChatRenderedItems()).toEqual(
      USER_CELL("1", "Something") +
        ASSISTANT_CELL("2", "complete") +
        USER_CELL("3", "Something 3")
    );

    await chatRef.setProperty("items", chatModel2);
    await page.waitForChanges();

    expect(await getChatRenderedItems()).toEqual(
      USER_CELL("1", "A different text") +
        ASSISTANT_CELL("2", "complete") +
        USER_CELL("3", "A different text 3")
    );
  });
});
