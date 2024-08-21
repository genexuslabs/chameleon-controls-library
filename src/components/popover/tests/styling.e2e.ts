import { newE2EPage } from "@stencil/core/testing";

// Fix ch-theme reactivity
describe.skip('should style the ch-popover\'s scrollbar when setting a ch-theme with "chameleon/scrollbar"', () => {
  it("should fetch and check the CSS file", async () => {
    const page = await newE2EPage();

    await page.setContent(`<ch-theme></ch-theme>
      <ch-popover></ch-popover>`);

    const themeRef = await page.find("ch-theme");
    const themeLoadedEvent = themeRef.waitForEvent("themeLoaded");

    // TODO: The ch-theme is not reactive. Add support to update the model at runtime
    themeRef.setProperty("model", {
      name: "chameleon/scrollbar",
      url: "showcase/scrollbar.css"
    });

    await page.waitForChanges();
    await themeLoadedEvent;

    expect(themeLoadedEvent).toBeTruthy();

    const adoptedStyleSheets = await page.evaluate(() => {
      const popoverRef = document.querySelector("ch-popover");
      return popoverRef.shadowRoot.adoptedStyleSheets.map(
        sheet => sheet.cssRules[0].cssText
      );
    });

    // It has an adoptedStyleSheet
    expect(adoptedStyleSheets.length).toBeGreaterThan(0);

    // It contains the style of the scrollbar.css
    expect(adoptedStyleSheets).toContain(":host(.ch-scrollable)");
  });
});
