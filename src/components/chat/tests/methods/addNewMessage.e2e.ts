import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { ArgumentTypes } from "../../../../common/types";

type AddNewMessageArguments = ArgumentTypes<HTMLChChatElement["addNewMessage"]>;

describe("[ch-chat][addNewMessage]", () => {
  let page: E2EPage;
  let chatRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<button type="button"></button><ch-chat></ch-chat>`,
      failOnConsoleError: true
    });
    chatRef = await page.find("ch-chat");
    chatRef.setProperty(
      "loadingState",
      "all-records-loaded" satisfies HTMLChChatElement["loadingState"]
    );
    await page.waitForChanges();
  });

  it("should work when the chat has no items", async () => {
    await chatRef.callMethod("addNewMessage", {
      id: "Test",
      content: "Something",
      role: "assistant"
    } satisfies AddNewMessageArguments[0]);
    await page.waitForChanges();

    expect(await chatRef.getProperty("items")).toEqual([
      {
        id: "Test",
        content: "Something",
        role: "assistant"
      }
    ]);
  });

  it("should work sequential calls when the chat has no items and without waiting for the virtual-scroller to be defined", async () => {
    await chatRef.callMethod("addNewMessage", {
      id: "Test",
      content: "Something",
      role: "assistant"
    } satisfies AddNewMessageArguments[0]);
    await chatRef.callMethod("addNewMessage", {
      id: "Test2",
      content: "Something2",
      role: "user"
    } satisfies AddNewMessageArguments[0]);
    await page.waitForChanges();

    expect(await chatRef.getProperty("items")).toEqual([
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
    chatRef.setProperty("items", [
      {
        id: "Test",
        content: "Something",
        role: "assistant"
      }
    ]);
    await page.waitForChanges();

    // An extra wait for the items to be rendered, since we have the
    // ch-chat-lit that requires and extra await
    await page.waitForChanges();

    expect(await chatRef.getProperty("items")).toEqual([
      {
        id: "Test",
        content: "Something",
        role: "assistant"
      }
    ]);

    await chatRef.callMethod("addNewMessage", {
      id: "Test2",
      content: "Something2",
      role: "user"
    } satisfies AddNewMessageArguments[0]);

    expect(await chatRef.getProperty("items")).toEqual([
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
