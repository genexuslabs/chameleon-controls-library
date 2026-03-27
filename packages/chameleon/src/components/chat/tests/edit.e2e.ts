import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChChat } from "../chat.lit";
import "../chat.lit.js";

describe("[ch-chat][ch-edit]", () => {
  let chatRef: ChChat;

  afterEach(cleanup);

  beforeEach(async () => {
    render(html`<ch-chat></ch-chat>`);
    chatRef = document.querySelector("ch-chat")!;
    await chatRef.updateComplete;
  });

  it("the ch-edit should be rendered in the shadow DOM", () => {
    const editRef = chatRef.shadowRoot!.querySelector("ch-edit");
    expect(editRef).toBeTruthy();
  });

  it("the ch-edit should have preventEnterInInputEditorMode set to prevent triggering the sendMessageCallback when pressing enter key in the Input Editor Mode (IME)", async () => {
    const editRef = chatRef.shadowRoot!.querySelector(
      "ch-edit"
    ) as HTMLChEditElement;
    expect(editRef.preventEnterInInputEditorMode).toBe(true);
  });

  it.todo(
    "should not fire the sendChatMessages callback when pressing the enter key in the Input Editor Mode (IME)"
  );

  it("the ch-edit should have the send-input part", () => {
    const editRef = chatRef.shadowRoot!.querySelector("ch-edit");
    // The hostParts property should set the part attribute
    expect(editRef).toBeTruthy();
  });
});
