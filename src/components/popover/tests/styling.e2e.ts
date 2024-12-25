import { E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-popover]", () => {
  let page: E2EPage;

  beforeEach(async () => {
    page = await newE2EPage({ failOnConsoleError: true });
  });

  it('should style the ch-popover\'s scrollbar when setting a ch-theme with "chameleon/scrollbar"', async () => {
    await page.setContent(`<ch-theme></ch-theme>
      <ch-popover></ch-popover>`);

    const themeRef = await page.find("ch-theme");
    const themeLoadedEvent = themeRef.waitForEvent("themeLoaded");

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
    expect(
      adoptedStyleSheets.some(item => item.includes(":host(.ch-scrollable)"))
    ).toBeTruthy();
  });
});
