import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { isActiveElement } from "../../../../testing/utils.e2e";
import type { SmartGridDataState } from "../../../smart-grid/internal/infinite-scroll/types";

const TEXTAREA_SELECTOR = "ch-chat >>> ch-edit >>> textarea";

describe("[ch-chat][methods]", () => {
  let page: E2EPage;
  let chatRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<button type="button"></button><ch-chat></ch-chat>`,
      failOnConsoleError: true
    });
    chatRef = await page.find("ch-chat");
  });

  it("[focusChatInput] should focus the textarea", async () => {
    expect(await isActiveElement(page, TEXTAREA_SELECTOR)).toBeFalsy();

    await chatRef.callMethod("focusChatInput");
    await page.waitForChanges();

    expect(await isActiveElement(page, TEXTAREA_SELECTOR)).toBeTruthy();
  });

  const runTestFocusWithLoadingState = (loadingState: SmartGridDataState) =>
    it(`[focusChatInput] should focus the textarea, loadingState = "${loadingState}"`, async () => {
      chatRef.setProperty("loadingState", loadingState);
      await page.waitForChanges();

      expect(await isActiveElement(page, TEXTAREA_SELECTOR)).toBeFalsy();

      await chatRef.callMethod("focusChatInput");
      await page.waitForChanges();

      expect(await isActiveElement(page, TEXTAREA_SELECTOR)).toBeTruthy();
    });

  runTestFocusWithLoadingState("initial");

  // TODO: Fix these failing tests
  // runTestFocusWithLoadingState("loading");
  // runTestFocusWithLoadingState("more-data-to-fetch");

  runTestFocusWithLoadingState("all-records-loaded");
});
