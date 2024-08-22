import { E2EPage, newE2EPage } from "@stencil/core/testing";
import { ChThemeCustomEvent } from "../../../components";
import { ChThemeLoadedEvent } from "../theme-types";
import { delayTest } from "../../../testing/utils.e2e";

const TIMEOUT = 500;
const DELAY = TIMEOUT + 220;

describe("[ch-theme]", () => {
  let page: E2EPage;

  beforeEach(async () => {
    page = await newE2EPage();
  });

  it("should always be hidden", async () => {
    await page.setContent(`<ch-theme></ch-theme>`);
    const themeRef = await page.find("ch-theme");

    expect((await themeRef.getComputedStyle()).display).toEqual("none");
  });

  it("should not have Shadow DOM", async () => {
    await page.setContent(`<ch-theme></ch-theme>`);
    const themeRef = await page.find("ch-theme");

    expect(themeRef.shadowRoot).toBe(null);
  });

  it("should hide the root node if avoidFlashOfUnstyledContent is set", async () => {
    await page.setContent(`<ch-theme model="dummy"></ch-theme>`);
    const themeRef = await page.find("ch-theme");

    expect(themeRef.innerHTML).toBe(
      "<style>:host,html{visibility:hidden !important}</style>"
    );
  });

  it("should not hide the root node if avoidFlashOfUnstyledContent is false", async () => {
    await page.setContent(
      `<ch-theme avoid-flash-of-unstyled-content="false" model="url"></ch-theme>`
    );
    const themeRef = await page.find("ch-theme");

    expect(themeRef.innerHTML).toBe("");
  });

  it("should not fire the themeLoaded event if the model is undefined", async () => {
    await page.setContent(`<ch-theme timeout="${TIMEOUT}"></ch-theme>`);
    const themeRef = await page.find("ch-theme");

    const themeLoadedSpy = await themeRef.spyOnEvent("themeLoaded");
    await delayTest(DELAY);

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
    await delayTest(DELAY);

    expect(consoleMessages.length).toBe(0);
  });

  it("should fire the themeLoaded event when setting a valid model", async () => {
    await page.setContent(`<ch-theme></ch-theme>`);

    const themeRef = await page.find("ch-theme");
    const themeLoadedEvent = themeRef.waitForEvent("themeLoaded");

    themeRef.setProperty("model", {
      name: "chameleon/scrollbar",
      url: "showcase/scrollbar.css"
    });

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

    const themeRef = await page.find("ch-theme");
    const themeLoadedSpy = await themeRef.spyOnEvent("themeLoaded");

    await delayTest(DELAY);

    expect(themeLoadedSpy).toHaveReceivedEventDetail({
      success: []
    } satisfies ChThemeLoadedEvent);

    expect(consoleMessages[0]).toContain("Failed to load themes:");
  });

  it("should adopt the stylesheet when the root node is the document", async () => {
    await page.setContent(`<ch-theme></ch-theme>`);

    const themeRef = await page.find("ch-theme");
    const themeLoadedEvent = themeRef.waitForEvent("themeLoaded");

    themeRef.setProperty("model", {
      name: "chameleon/scrollbar",
      url: "showcase/scrollbar.css"
    });

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
    await page.setContent(`<ch-theme></ch-theme>`);

    const themeRef = await page.find("ch-theme");
    const themeLoadedEvent = themeRef.waitForEvent("themeLoaded");

    themeRef.setProperty("model", {
      name: "chameleon/scrollbar",
      url: "showcase/scrollbar.css"
    });

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

  it.skip("should adopt the stylesheet defined by another ch-theme", async () => {
    // TODO: Add implementation
  });

  it.skip("should reuse the stylesheet defined by another ch-theme", async () => {
    // TODO: Add implementation
  });
});
