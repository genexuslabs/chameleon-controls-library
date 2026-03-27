import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChatMessage } from "../../types";
import type { ChChat } from "../../chat.lit";
import "../../chat.lit.js";

// TODO: Simplify unit tests
describe("[ch-chat][callbacks]", () => {
  let chatRef: ChChat;

  afterEach(cleanup);

  beforeEach(async () => {
    render(html`<button type="button"></button><ch-chat></ch-chat>`);
    chatRef = document.querySelector("ch-chat")!;
    await chatRef.updateComplete;
  });

  const setBasicProperties = async (
    setCallbacks = true,
    validateCallback = false
  ) => {
    chatRef.items = [];
    chatRef.loadingState = "all-records-loaded";

    // TODO: Add unit tests for async validateSendChatMessage
    if (setCallbacks) {
      if (validateCallback) {
        chatRef.callbacks = {
          validateSendChatMessage: (chat: ChatMessage) =>
            chat.content !== "error",
          sendChatMessages: () => {}
        } satisfies HTMLChChatElement["callbacks"];
      } else {
        chatRef.callbacks = {
          sendChatMessages: () => {}
        } satisfies HTMLChChatElement["callbacks"];
      }
    }
    await chatRef.updateComplete;
  };

  it("[sendChat] should not send the message when the ch-edit is empty", async () => {
    await setBasicProperties();

    // Try to send via the public API with no content
    await chatRef.sendChatMessage();
    await chatRef.updateComplete;

    // TODO: Check that the sendChat callback is not called
    expect(chatRef.items).toEqual([]);
  });

  it("[validateSendChatMessage] should send the message when the callbacks property is not defined and the ch-edit has content", async () => {
    await setBasicProperties(false);

    // Send a message via public API
    await chatRef.sendChatMessage({
      id: "msg-1",
      role: "user",
      content: "Hola"
    });
    await chatRef.updateComplete;

    // TODO: Check that the sendChat callback is called
    expect(chatRef.items).toHaveLength(1);
    expect(chatRef.items[0].content).toBe("Hola");
  });

  it("[validateSendChatMessage] should send the message when the validateSendChatMessage callback is not defined and the ch-edit has content", async () => {
    await setBasicProperties();

    await chatRef.sendChatMessage({
      id: "msg-1",
      role: "user",
      content: "Hola"
    });
    await chatRef.updateComplete;

    // TODO: Check that the sendChat callback is called
    expect(chatRef.items).toHaveLength(1);
    expect(chatRef.items[0].content).toBe("Hola");
  });

  it("[validateSendChatMessage] should send the message when the validateSendChatMessage is true and the ch-edit has content", async () => {
    await setBasicProperties(true, true);

    await chatRef.sendChatMessage({
      id: "msg-1",
      role: "user",
      content: "Hola"
    });
    await chatRef.updateComplete;

    // TODO: Check that the sendChat callback is called
    expect(chatRef.items).toHaveLength(1);
    expect(chatRef.items[0].content).toBe("Hola");
  });

  it("[validateSendChatMessage] should not send the message when the validateSendChatMessage returns false", async () => {
    await setBasicProperties(true, true);

    await chatRef.sendChatMessage({
      id: "msg-1",
      role: "user",
      content: "error"
    });
    await chatRef.updateComplete;

    // TODO: Check that the sendChat callback is called
    expect(chatRef.items).toHaveLength(0);
  });
});
