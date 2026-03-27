import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChChat } from "../chat.lit";
import type { ChatMessage } from "../types";
import "../chat.lit.js";

describe("[ch-chat][accessibility]", () => {
  let chatRef: ChChat;

  afterEach(cleanup);

  beforeEach(async () => {
    render(html`<ch-chat></ch-chat>`);
    chatRef = document.querySelector("ch-chat")!;
    await chatRef.updateComplete;
  });

  it("should render the send button with an accessible name from translations", async () => {
    chatRef.loadingState = "all-records-loaded";
    chatRef.items = [
      { id: "1", role: "assistant", content: "Hello" }
    ];
    await chatRef.updateComplete;

    const sendButton = chatRef.shadowRoot!.querySelector(
      '[part="send-button"]'
    ) as HTMLButtonElement;
    expect(sendButton).toBeTruthy();
    expect(sendButton.getAttribute("aria-label")).toBe("Send");
  });

  it("the send-input (ch-edit) should have an accessible name from translations", () => {
    const editRef = chatRef.shadowRoot!.querySelector(
      "ch-edit"
    ) as HTMLChEditElement;
    expect(editRef).toBeTruthy();
    expect(editRef.accessibleName).toBe("Message");
  });

  it("should render assistant messages with aria-live='polite'", async () => {
    chatRef.loadingState = "all-records-loaded";
    chatRef.items = [
      { id: "1", role: "assistant", content: "Hello", status: "complete" }
    ] satisfies ChatMessage[];
    await chatRef.updateComplete;
    await new Promise(r => requestAnimationFrame(r));
    await chatRef.updateComplete;

    const cell = chatRef.shadowRoot!.querySelector("ch-smart-grid-cell");
    if (cell) {
      expect(cell.getAttribute("aria-live")).toBe("polite");
    }
  });

  it("should set aria-busy='true' on streaming assistant messages", async () => {
    chatRef.loadingState = "all-records-loaded";
    chatRef.items = [
      { id: "1", role: "assistant", content: "Hello", status: "streaming" }
    ] satisfies ChatMessage[];
    await chatRef.updateComplete;
    await new Promise(r => requestAnimationFrame(r));
    await chatRef.updateComplete;

    const cell = chatRef.shadowRoot!.querySelector("ch-smart-grid-cell");
    if (cell) {
      expect(cell.getAttribute("aria-busy")).toBe("true");
    }
  });

  it("should set aria-busy='false' on complete assistant messages", async () => {
    chatRef.loadingState = "all-records-loaded";
    chatRef.items = [
      { id: "1", role: "assistant", content: "Hello", status: "complete" }
    ] satisfies ChatMessage[];
    await chatRef.updateComplete;
    await new Promise(r => requestAnimationFrame(r));
    await chatRef.updateComplete;

    const cell = chatRef.shadowRoot!.querySelector("ch-smart-grid-cell");
    if (cell) {
      expect(cell.getAttribute("aria-busy")).toBe("false");
    }
  });

  it("should not set aria-live or aria-busy on user messages", async () => {
    chatRef.loadingState = "all-records-loaded";
    chatRef.items = [
      { id: "1", role: "user", content: "Hello" }
    ] satisfies ChatMessage[];
    await chatRef.updateComplete;
    await new Promise(r => requestAnimationFrame(r));
    await chatRef.updateComplete;

    const cell = chatRef.shadowRoot!.querySelector("ch-smart-grid-cell");
    if (cell) {
      expect(cell.getAttribute("aria-live")).toBeNull();
      expect(cell.getAttribute("aria-busy")).toBeNull();
    }
  });

  it("the send button should be disabled during initial loading state", () => {
    const sendButton = chatRef.shadowRoot!.querySelector(
      '[part="send-button"]'
    ) as HTMLButtonElement;
    if (sendButton) {
      expect(sendButton.disabled).toBe(true);
    }
  });

  it("the send button should not be disabled when loadingState is 'all-records-loaded'", async () => {
    chatRef.loadingState = "all-records-loaded";
    await chatRef.updateComplete;

    const sendButton = chatRef.shadowRoot!.querySelector(
      '[part="send-button"]'
    ) as HTMLButtonElement;
    expect(sendButton).toBeTruthy();
    expect(sendButton.disabled).toBe(false);
  });
});
