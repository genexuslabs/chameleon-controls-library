import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChChat } from "../chat.lit";
import "../chat.lit.js";

describe("[ch-chat][basic]", () => {
  let chatRef: ChChat;

  afterEach(cleanup);

  beforeEach(async () => {
    render(html`<ch-chat></ch-chat>`);
    chatRef = document.querySelector("ch-chat")!;
    await chatRef.updateComplete;
  });

  it("should have Shadow DOM", () => {
    expect(chatRef.shadowRoot).toBeTruthy();
  });

  // Default property values
  it("should have 'autoScroll' default to 'at-scroll-end'", () => {
    expect(chatRef.autoScroll).toBe("at-scroll-end");
  });

  it("should have 'callbacks' default to undefined", () => {
    expect(chatRef.callbacks).toBeUndefined();
  });

  it("should have 'disabled' default to false", () => {
    expect(chatRef.disabled).toBe(false);
  });

  it("should have 'items' default to an empty array", () => {
    expect(chatRef.items).toEqual([]);
  });

  it("should have 'liveMode' default to false", () => {
    expect(chatRef.liveMode).toBe(false);
  });

  it("should have 'liveModeConfiguration' default to undefined", () => {
    expect(chatRef.liveModeConfiguration).toBeUndefined();
  });

  it("should have 'loadingState' default to 'initial'", () => {
    expect(chatRef.loadingState).toBe("initial");
  });

  it("should have 'markdownTheme' default to 'ch-markdown-viewer'", () => {
    expect(chatRef.markdownTheme).toBe("ch-markdown-viewer");
  });

  it("should have 'newUserMessageAlignment' default to 'end'", () => {
    expect(chatRef.newUserMessageAlignment).toBe("end");
  });

  it("should have 'newUserMessageScrollBehavior' default to 'instant'", () => {
    expect(chatRef.newUserMessageScrollBehavior).toBe("instant");
  });

  it("should have 'sendButtonDisabled' default to false", () => {
    expect(chatRef.sendButtonDisabled).toBe(false);
  });

  it("should have 'sendInputDisabled' default to false", () => {
    expect(chatRef.sendInputDisabled).toBe(false);
  });

  it("should have 'showAdditionalContent' default to false", () => {
    expect(chatRef.showAdditionalContent).toBe(false);
  });

  it("should have 'sendContainerLayout' default to { sendContainerAfter: ['send-button'] }", () => {
    expect(chatRef.sendContainerLayout).toEqual({
      sendContainerAfter: ["send-button"]
    });
  });

  it("should have 'theme' default to undefined", () => {
    expect(chatRef.theme).toBeUndefined();
  });

  it("should have 'translations' with expected defaults", () => {
    expect(chatRef.translations).toEqual({
      accessibleName: {
        clearChat: "Clear chat",
        copyMessageContent: "Copy message content",
        downloadCodeButton: "Download code",
        sendButton: "Send",
        sendInput: "Message",
        stopResponseButton: "Stop generating answer"
      },
      placeholder: {
        sendInput: "Ask me a question..."
      },
      text: {
        copyCodeButton: "Copy code",
        copyMessageContent: "Copy",
        processing: "Processing...",
        sourceFiles: "Source files:"
      }
    });
  });

  it("should have 'virtualScrollerBufferSize' default to 5", () => {
    expect(chatRef.virtualScrollerBufferSize).toBe(5);
  });

  it("should have 'waitingResponse' default to false", () => {
    expect(chatRef.waitingResponse).toBe(false);
  });

  // Default CSS properties
  it("should have 'display' default to 'grid'", () => {
    const computedStyle = getComputedStyle(chatRef);
    expect(computedStyle.display).toBe("grid");
  });
});
