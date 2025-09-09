import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

const SEND_BUTTON = "ch-chat >>> [part*='send-button']";
const TEXTAREA_SELECTOR = "ch-chat >>> ch-edit >>> textarea";
const EDIT_SELECTOR = "ch-chat >>> ch-edit";

// TODO: Refactor these test when we have migrated to Playwright
describe.skip("[ch-chat][send-message-by-user-interaction]", () => {
  let page: E2EPage;
  let chatRef: E2EElement;
  let getChatMessageFiles = 0;
  let sendChatMessages = 0;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<button type="button"></button><ch-chat></ch-chat>`,
      failOnConsoleError: true
    });

    // This is a dummy way to WA the issue of Puppeteer not working with Jest mock
    getChatMessageFiles = 0;
    sendChatMessages = 0;

    chatRef = await page.find("ch-chat");
    chatRef.setProperty("callbacks", {
      getChatMessageFiles: () => {
        getChatMessageFiles++;

        return [];
      },
      sendChatMessages: () => {
        sendChatMessages++;
      }
    } satisfies HTMLChChatElement["callbacks"]);
    await page.waitForChanges();
  });

  const setEditContent = async (content: string) =>
    (await page.find(EDIT_SELECTOR)).setProperty("value", content);

  const performSendAction = async (
    sendMessageAction: "send-input keyboard enter" | "send-button click"
  ) => {
    if (sendMessageAction === "send-input keyboard enter") {
      await (await page.find(TEXTAREA_SELECTOR)).press("Enter");
    } else {
      await (await page.find(SEND_BUTTON)).press("Enter");
    }
  };

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

  const runTestFocusWithLoadingState = (
    sendMessageAction: "send-input keyboard enter" | "send-button click",
    disabled: boolean,
    waitingResponse: boolean,
    liveMode: boolean,
    loadingState: HTMLChChatElement["loadingState"],
    sendInputContent: string
  ) => {
    if (
      !canTryToSendMessage(disabled, waitingResponse, liveMode, loadingState)
    ) {
      it(`[${sendMessageAction}][disabled = ${disabled}][waitingResponse = ${waitingResponse}][liveMode = ${liveMode}][loadingState = "${loadingState}"][send-input content = "${sendInputContent}"] should not send any message and should not execute any callback`, async () => {
        // TODO: We should test this without any items
        chatRef.setProperty("items", [
          { id: "Test 1", role: "assistant", content: "assistant content" }
        ]);
        chatRef.setProperty("disabled", disabled);
        chatRef.setProperty("waitingResponse", waitingResponse);
        chatRef.setProperty("liveMode", liveMode);
        chatRef.setProperty("loadingState", loadingState);
        await setEditContent(sendInputContent);

        await page.waitForChanges();

        await performSendAction(sendMessageAction);
        await page.waitForChanges();

        expect(getChatMessageFiles).toBe(0);
        expect(sendChatMessages).toBe(0);
      });
    }
  };

  runTestFocusWithLoadingState(
    "send-input keyboard enter",
    false,
    false,
    false,
    "loading",
    "Hola"
  );

  // it(`[focusChatInput] should focus the textarea, loadingState = "${loadingState}"`, async () => {
  //   chatRef.setProperty("loadingState", loadingState);
  //   await page.waitForChanges();

  //   expect(await isActiveElement(page, TEXTAREA_SELECTOR)).toBeFalsy();

  //   await chatRef.callMethod("focusChatInput");
  //   await page.waitForChanges();

  //   expect(await isActiveElement(page, TEXTAREA_SELECTOR)).toBeTruthy();
  // });
});
