import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChChat } from "../chat.lit";
import "../chat.lit.js";

// TODO: Refactor these test when we have migrated to Playwright
describe("[ch-chat][send-message-by-user-interaction]", () => {
  let chatRef: ChChat;
  let getChatMessageFiles: number;
  let sendChatMessages: number;

  afterEach(cleanup);

  beforeEach(async () => {
    getChatMessageFiles = 0;
    sendChatMessages = 0;

    render(html`<button type="button"></button><ch-chat></ch-chat>`);
    chatRef = document.querySelector("ch-chat")!;
    chatRef.callbacks = {
      getChatMessageFiles: () => {
        getChatMessageFiles++;
        return [];
      },
      sendChatMessages: () => {
        sendChatMessages++;
      }
    };
    await chatRef.updateComplete;
  });

  const canTryToSendMessage = (
    disabled: boolean,
    waitingResponse: boolean,
    liveMode: boolean,
    loadingState: HTMLChChatElement["loadingState"]
  ) =>
    !(
      waitingResponse ||
      disabled ||
      liveMode ||
      loadingState === "initial" ||
      loadingState === "loading"
    );

  const runTestWithLoadingState = (
    disabled: boolean,
    waitingResponse: boolean,
    liveMode: boolean,
    loadingState: HTMLChChatElement["loadingState"],
    sendInputContent: string
  ) => {
    if (
      !canTryToSendMessage(disabled, waitingResponse, liveMode, loadingState)
    ) {
      it(`[disabled = ${disabled}][waitingResponse = ${waitingResponse}][liveMode = ${liveMode}][loadingState = "${loadingState}"][send-input content = "${sendInputContent}"] should not send any message and should not execute any callback`, async () => {
        // TODO: We should test this without any items
        chatRef.items = [
          { id: "Test 1", role: "assistant", content: "assistant content" }
        ];
        chatRef.disabled = disabled;
        chatRef.waitingResponse = waitingResponse;
        chatRef.liveMode = liveMode;
        chatRef.loadingState = loadingState;
        await chatRef.updateComplete;

        // Attempt to send a message using the public method
        await chatRef.sendChatMessage({
          id: "user-msg",
          role: "user",
          content: sendInputContent
        });
        await chatRef.updateComplete;

        expect(getChatMessageFiles).toBe(0);
        expect(sendChatMessages).toBe(0);
      });
    }
  };

  runTestWithLoadingState(false, false, false, "loading", "Hola");
  runTestWithLoadingState(true, false, false, "all-records-loaded", "Hola");
  runTestWithLoadingState(false, true, false, "all-records-loaded", "Hola");
  runTestWithLoadingState(false, false, true, "all-records-loaded", "Hola");
  runTestWithLoadingState(false, false, false, "initial", "Hola");
});
