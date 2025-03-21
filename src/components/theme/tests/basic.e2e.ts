import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { ChThemeCustomEvent } from "../../../components";
import { ChThemeLoadedEvent } from "../theme-types";
import { delayTest } from "../../../testing/utils.e2e";
import { CSS_SCROLLBAR_MODEL } from "./utils.e2e";

const TIMEOUT = 500;
const TIMEOUT_DELAY = TIMEOUT + 220;

describe("[ch-theme][basic]", () => {
  let page: E2EPage;
  let themeRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({ html: `<ch-theme></ch-theme>` });
    themeRef = await page.find("ch-theme");
  });

  it("should have the hidden attribute set", async () => {
    expect(themeRef.getAttribute("hidden")).toEqual("");
  });

  it("should always be hidden", async () => {
    expect((await themeRef.getComputedStyle()).display).toEqual("none");
  });

  it("should not have Shadow DOM", async () => {
    expect(themeRef.shadowRoot).toBeNull();
  });

  it('the "attachStyleSheets" property should be true by default', async () => {
    expect(await themeRef.getProperty("attachStyleSheets")).toBe(true);
  });

  it('the "avoidFlashOfUnstyledContent" property should be true by default', async () => {
    expect(await themeRef.getProperty("avoidFlashOfUnstyledContent")).toBe(
      true
    );
  });

  it('the "model" property should be undefined by default', async () => {
    expect(await themeRef.getProperty("model")).toBeUndefined();
  });

  it('the "timeout" property should equal to 10000 by default', async () => {
    expect(await themeRef.getProperty("timeout")).toBe(10000);
  });

  it("should not fire the themeLoaded event if the model is undefined", async () => {
    await page.setContent(`<ch-theme timeout="${TIMEOUT}"></ch-theme>`);
    themeRef = await page.find("ch-theme");

    const themeLoadedSpy = await themeRef.spyOnEvent("themeLoaded");
    await delayTest(TIMEOUT_DELAY);

    expect(themeLoadedSpy).not.toHaveReceivedEvent();
  });

  it("should not throw error if the model is undefined", async () => {
    const consoleMessages = [];

    page.on("console", message => {
      if (message.type() === "error") {
        consoleMessages.push(message.text());
      }
    });
    await page.setContent(`<ch-theme timeout="${TIMEOUT}"></ch-theme>`);
    await delayTest(TIMEOUT_DELAY);

    expect(consoleMessages.length).toBe(0);
  });

  it("should fire the themeLoaded event when setting a valid model", async () => {
    const themeLoadedEvent = themeRef.waitForEvent("themeLoaded");

    themeRef.setProperty("model", CSS_SCROLLBAR_MODEL);

    await page.waitForChanges();
    const eventDetail: ChThemeCustomEvent<ChThemeLoadedEvent> =
      await themeLoadedEvent;

    expect(themeLoadedEvent).toBeTruthy();
    expect(eventDetail.detail.success.length).toEqual(1);
  });

  it("should timeout if the model does not have a mapped URL", async () => {
    const consoleMessages = [];

    page.on("console", message => {
      if (message.type() === "error") {
        consoleMessages.push(message.text());
      }
    });
    await page.setContent(
      `<ch-theme model="dummy" timeout="${TIMEOUT}"></ch-theme>`
    );

    themeRef = await page.find("ch-theme");
    const themeLoadedSpy = await themeRef.spyOnEvent("themeLoaded");

    await delayTest(TIMEOUT_DELAY);

    expect(themeLoadedSpy).toHaveReceivedEventDetail({
      success: []
    } satisfies ChThemeLoadedEvent);

    expect(consoleMessages[0]).toContain("Failed to load themes:");
  });

  it("should adopt the stylesheet when the root node is the document", async () => {
    const themeLoadedEvent = themeRef.waitForEvent("themeLoaded");

    themeRef.setProperty("model", CSS_SCROLLBAR_MODEL);

    await page.waitForChanges();
    await themeLoadedEvent;

    const adoptedStyleSheets = await page.evaluate(() =>
      document.adoptedStyleSheets.map(sheet => sheet.cssRules[0].cssText)
    );

    // It has an adoptedStyleSheet
    expect(adoptedStyleSheets.length).toBeGreaterThan(0);

    // It contains the style of the scrollbar.css
    expect(
      adoptedStyleSheets.some(item => item.includes(":host(.ch-scrollable)"))
    ).toBeTruthy();
  });

  it.skip("should adopt the stylesheet when the root node is a shadowRoot", async () => {
    // TODO: Add implementation
  });

  it("should maintain the stylesheet in the document when disconnecting the ch-theme", async () => {
    const themeLoadedEvent = themeRef.waitForEvent("themeLoaded");

    themeRef.setProperty("model", CSS_SCROLLBAR_MODEL);

    await page.waitForChanges();
    await themeLoadedEvent;

    const adoptedStyleSheets = await page.evaluate(() =>
      document.adoptedStyleSheets.map(sheet => sheet.cssRules[0].cssText)
    );

    // Stylesheet is defined
    expect(adoptedStyleSheets.length).toBeGreaterThan(0);
    expect(
      adoptedStyleSheets.some(item => item.includes(":host(.ch-scrollable)"))
    ).toBeTruthy();

    // For some reason, this does not work: await page.setContent("");
    await page.evaluate(() => {
      const element = document.querySelector("ch-theme");
      if (element) {
        element.remove();
      }
    });
    await page.waitForChanges();

    // ch-theme is no longer rendered
    const disconnectedThemeRef = await page.find("ch-theme");
    expect(disconnectedThemeRef).toBeNull();

    const adoptedStyleSheetsAfterDisconnection = await page.evaluate(() =>
      document.adoptedStyleSheets.map(sheet => sheet.cssRules[0].cssText)
    );

    // Stylesheet is still defined
    expect(adoptedStyleSheetsAfterDisconnection.length).toBeGreaterThan(0);
    expect(
      adoptedStyleSheetsAfterDisconnection.some(item =>
        item.includes(":host(.ch-scrollable)")
      )
    ).toBeTruthy();
  });

  it.skip("should maintain the stylesheet in the shadowRoot when disconnecting the ch-theme", async () => {
    // TODO: Add implementation
  });

  it.todo(
    "should not hide the UI when all stylesheets are already loaded by another ch-theme"
  );

  it.todo(
    'should work with an item that is an object { name: "something", url: "..." }'
  );
});
