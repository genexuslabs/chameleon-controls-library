import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

const BUTTON_1_SELECTOR = "[id='button-1']";
const BUTTON_2_SELECTOR = "[id='button-2']";

const performTest = (actionElementBindingType: "nested" | "reference") => {
  const description =
    actionElementBindingType === "nested"
      ? "inside action element"
      : "action element by ref";

  const tooltipHTML =
    actionElementBindingType === "nested"
      ? `
      <button id="button-2" type="button">
        Action 2
        <ch-tooltip></ch-tooltip>
      </button>`
      : `
      <button id="button-2" type="button">
        Action 2
      </button>
      <ch-tooltip></ch-tooltip>`;

  describe(`[ch-tooltip][${description}][show]`, () => {
    let page: E2EPage;
    let button1Ref: E2EElement;
    let button2Ref: E2EElement;
    let tooltipRef: E2EElement;

    beforeEach(async () => {
      page = await newE2EPage({
        html: `<button id="button-1" type="button">Action 1</button>
              ${tooltipHTML}`,
        failOnConsoleError: true
      });
      button1Ref = await page.find(BUTTON_1_SELECTOR);
      button2Ref = await page.find(BUTTON_2_SELECTOR);
      tooltipRef = await page.find("ch-tooltip");
      tooltipRef.setProperty("delay", 0); // Avoid any race condition by removing the delay

      // Set the actionElement binding
      if (actionElementBindingType === "reference") {
        await page.evaluate((actionElementSelector: string) => {
          const actionElementRef = document.querySelector(
            actionElementSelector
          ) as HTMLButtonElement;

          document.querySelector("ch-tooltip").actionElement = actionElementRef;
        }, BUTTON_2_SELECTOR);
      } else {
        tooltipRef.setProperty("actionElement", null);
      }

      await page.waitForChanges();
    });

    const getPopoverRef = () => page.find("ch-tooltip >>> ch-popover");

    it("should show the popover when hovering the action button", async () => {
      await button2Ref.hover();
      await page.waitForChanges();
      expect(await getPopoverRef()).toBeTruthy();
    });

    it("should hide the popover when the mouse leaves the action button, after it was opened with hover", async () => {
      await button2Ref.hover();
      await page.waitForChanges();

      await button1Ref.hover();
      await page.waitForChanges();
      expect(await getPopoverRef()).toBeFalsy();
    });

    it("should show the popover when clicking the action button", async () => {
      await button2Ref.click();
      await page.waitForChanges();
      expect(await getPopoverRef()).toBeTruthy();
    });

    it("should hide the popover when the mouse leaves the action button, after if it was opened with click", async () => {
      await button2Ref.click();
      await page.waitForChanges();

      await button1Ref.hover();
      await page.waitForChanges();
      expect(await getPopoverRef()).toBeFalsy();
    });

    it("should show the popover when focusing the action button", async () => {
      await button2Ref.focus();
      await page.waitForChanges();
      expect(await getPopoverRef()).toBeTruthy();
    });

    it.skip("should not hide the popover when the mouse leaves the action button, because it was focused via JS", async () => {
      await button2Ref.focus();
      await page.waitForChanges();

      await button1Ref.hover();
      await page.waitForChanges();
      expect(await getPopoverRef()).toBeFalsy();
    });

    it("should show the popover when focusing the action button with the Tab key", async () => {
      await button1Ref.focus();
      await button1Ref.press("Tab");
      await page.waitForChanges();
      expect(await getPopoverRef()).toBeTruthy();
    });

    it("should not hide the popover when the mouse leaves the action button, because the action is focused with the Tab key", async () => {
      await button1Ref.focus();
      await button1Ref.press("Tab");
      await page.waitForChanges();

      await button1Ref.hover();
      await page.waitForChanges();
      expect(await getPopoverRef()).toBeTruthy();
    });

    it("should hide the popover when the focused element changes (Tab key press)", async () => {
      // Open the tooltip with the Tab Key
      await button1Ref.focus();
      await button1Ref.press("Tab");
      await page.waitForChanges();

      // Focus a different in the DOM
      await button2Ref.press("Tab");
      await page.waitForChanges();
      expect(await getPopoverRef()).toBeFalsy();
    });

    it.skip("should not hide the popover when the focused element changes (Tab key press), because the mouse is over the action element", async () => {
      // Open the tooltip with the Tab Key
      await button1Ref.focus();
      await button1Ref.press("Tab");
      await page.waitForChanges();

      // Focus a different element in the DOM
      await button2Ref.hover(); // DO NOT CHANGE THE ORDER
      await button2Ref.press("Tab");
      await page.waitForChanges();
      expect(await getPopoverRef()).toBeTruthy();
    });

    it.todo("should not hide the tooltip when hovering the tooltip content");
  });
};

performTest("reference");
performTest("nested");

// TODO: Add "standalone" case (ch-tooltip without an actionElement)
