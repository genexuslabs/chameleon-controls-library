import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import type { ChatMessage } from "../../types";

// TODO: Simplify unit tests
describe("[ch-chat][callbacks]", () => {
  let page: E2EPage;
  let chatRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<button type="button"></button><ch-chat></ch-chat>`,
      failOnConsoleError: true
    });
    chatRef = await page.find("ch-chat");
  });

  const getChEditRef = () => page.find("ch-chat >>> ch-edit");
  const getSendButtonRef = () => page.find("ch-chat >>> [part='send-button']");

  const setBasicProperties = async (
    setCallbacks = true,
    validateCallback = false
  ) => {
    chatRef.setProperty("items", []);
    chatRef.setProperty("loadingState", "all-records-loaded");

    // TODO: Add unit tests for async validateSendChatMessage
    if (setCallbacks) {
      if (validateCallback) {
        await page.evaluate(() => {
          document.querySelector("ch-chat").callbacks = {
            clear: () => Promise.resolve(),
            validateSendChatMessage: (chat: ChatMessage) =>
              chat.content !== "error",
            sendChatToLLM: () => {},
            uploadImage: () => Promise.resolve("")
          } satisfies HTMLChChatElement["callbacks"];
        });
      } else {
        await page.evaluate(() => {
          document.querySelector("ch-chat").callbacks = {
            clear: () => Promise.resolve(),
            sendChatToLLM: () => {},
            uploadImage: () => Promise.resolve("")
          } satisfies HTMLChChatElement["callbacks"];
        });
      }
    }
    await page.waitForChanges();
  };

  it("[sendChat] should not send the message when the ch-edit is empty", async () => {
    await setBasicProperties();

    const buttonRef = await getSendButtonRef();
    await buttonRef.press("Space");
    await page.waitForChanges();

    // TODO: Check that the sendChat callback is not called
    expect(await chatRef.getProperty("items")).toEqual([]);
  });

  it("[validateSendChatMessage] should send the message when the callbacks property is not defined and the ch-edit has content", async () => {
    await setBasicProperties(false);

    const editRef = await getChEditRef();
    editRef.setProperty("value", "Hola");
    await page.waitForChanges();

    const buttonRef = await getSendButtonRef();
    await buttonRef.press("Space");
    await page.waitForChanges();

    const chatItems = await chatRef.getProperty("items");

    // TODO: Check that the sendChat callback is called
    expect(chatItems).toHaveLength(1);
    expect(chatItems[0].content).toBe("Hola");
  });

  it("[validateSendChatMessage] should send the message when the validateSendChatMessage callback is not defined and the ch-edit has content", async () => {
    await setBasicProperties();

    const editRef = await getChEditRef();
    editRef.setProperty("value", "Hola");
    await page.waitForChanges();

    const buttonRef = await getSendButtonRef();
    await buttonRef.press("Space");
    await page.waitForChanges();

    const chatItems = await chatRef.getProperty("items");

    // TODO: Check that the sendChat callback is called
    expect(chatItems).toHaveLength(1);
    expect(chatItems[0].content).toBe("Hola");
  });

  it("[validateSendChatMessage] should send the message when the validateSendChatMessage is true and the ch-edit has content", async () => {
    await setBasicProperties(true, true);

    const editRef = await getChEditRef();
    editRef.setProperty("value", "Hola");
    await page.waitForChanges();

    const buttonRef = await getSendButtonRef();
    await buttonRef.press("Space");
    await page.waitForChanges();

    const chatItems = await chatRef.getProperty("items");

    // TODO: Check that the sendChat callback is called
    expect(chatItems).toHaveLength(1);
    expect(chatItems[0].content).toBe("Hola");
  });

  it("[validateSendChatMessage] should send the message when the validateSendChatMessage is false and the ch-edit has content", async () => {
    await setBasicProperties(true, true);

    const editRef = await getChEditRef();
    editRef.setProperty("value", "error");
    await page.waitForChanges();

    const buttonRef = await getSendButtonRef();
    await buttonRef.press("Space");
    await page.waitForChanges();

    const chatItems = await chatRef.getProperty("items");

    // TODO: Check that the sendChat callback is called
    expect(chatItems).toHaveLength(0);
  });
});
