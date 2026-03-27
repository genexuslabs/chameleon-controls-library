import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ArgumentTypes } from "../../../../typings/types.js";
import type { ChChat } from "../../chat.lit";
import "../../chat.lit.js";

type AddNewMessageArguments = ArgumentTypes<HTMLChChatElement["addNewMessage"]>;

describe("[ch-chat][addNewMessage]", () => {
  let chatRef: ChChat;

  afterEach(cleanup);

  beforeEach(async () => {
    render(html`<button type="button"></button><ch-chat></ch-chat>`);
    chatRef = document.querySelector("ch-chat")!;
    chatRef.loadingState =
      "all-records-loaded" satisfies HTMLChChatElement["loadingState"];
    await chatRef.updateComplete;
  });

  it("should work when the chat has no items", async () => {
    await chatRef.addNewMessage({
      id: "Test",
      content: "Something",
      role: "assistant"
    } satisfies AddNewMessageArguments[0]);
    await chatRef.updateComplete;

    expect(chatRef.items).toEqual([
      {
        id: "Test",
        content: "Something",
        role: "assistant"
      }
    ]);
  });

  it("should work sequential calls when the chat has no items and without waiting for the virtual-scroller to be defined", async () => {
    await chatRef.addNewMessage({
      id: "Test",
      content: "Something",
      role: "assistant"
    } satisfies AddNewMessageArguments[0]);
    await chatRef.addNewMessage({
      id: "Test2",
      content: "Something2",
      role: "user"
    } satisfies AddNewMessageArguments[0]);
    await chatRef.updateComplete;

    expect(chatRef.items).toEqual([
      {
        id: "Test",
        content: "Something",
        role: "assistant"
      },
      {
        id: "Test2",
        content: "Something2",
        role: "user"
      }
    ]);
  });

  it("should work when the chat already has items", async () => {
    chatRef.items = [
      {
        id: "Test",
        content: "Something",
        role: "assistant"
      }
    ];
    await chatRef.updateComplete;

    // An extra wait for the items to be rendered
    await new Promise(r => requestAnimationFrame(r));
    await chatRef.updateComplete;

    expect(chatRef.items).toEqual([
      {
        id: "Test",
        content: "Something",
        role: "assistant"
      }
    ]);

    await chatRef.addNewMessage({
      id: "Test2",
      content: "Something2",
      role: "user"
    } satisfies AddNewMessageArguments[0]);

    expect(chatRef.items).toEqual([
      {
        id: "Test",
        content: "Something",
        role: "assistant"
      },
      {
        id: "Test2",
        content: "Something2",
        role: "user"
      }
    ]);
  });
});
