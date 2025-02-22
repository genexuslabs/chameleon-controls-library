import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

const CODE_SELECTOR = "ch-markdown-viewer >>> ch-code";

const CODE_ONLY = "```\nDummy code```";
const CODE_WITH_TEXT_AT_THE_END = "```\nDummy code\n```\nAnother text";

describe("[ch-markdown-viewer][showIndicator]", () => {
  let page: E2EPage;
  let markdownViewerRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-markdown-viewer></ch-markdown-viewer>`,
      failOnConsoleError: true
    });
    markdownViewerRef = await page.find("ch-markdown-viewer");
  });

  it('when the ch-code is rendered not at the end its "showIndicator" property should be false by default', async () => {
    markdownViewerRef.setProperty("value", CODE_WITH_TEXT_AT_THE_END);
    await page.waitForChanges();
    const codeRef = await page.find(CODE_SELECTOR);

    expect(await codeRef.getProperty("showIndicator")).toBe(false);
  });

  it('when the ch-code is rendered at the end its "showIndicator" property should be false by default', async () => {
    markdownViewerRef.setProperty("value", CODE_ONLY);
    await page.waitForChanges();
    const codeRef = await page.find(CODE_SELECTOR);

    expect(await codeRef.getProperty("showIndicator")).toBe(false);
  });

  it('when the ch-code is rendered not at the end its "showIndicator" property should be false, even if the markdown-viewer has "showIndicator" = true', async () => {
    markdownViewerRef.setProperty("showIndicator", true);
    markdownViewerRef.setProperty("value", CODE_WITH_TEXT_AT_THE_END);
    await page.waitForChanges();
    const codeRef = await page.find(CODE_SELECTOR);

    expect(await codeRef.getProperty("showIndicator")).toBe(false);
  });

  it('when the ch-code is rendered at the end its "showIndicator" property should be true, if the markdown-viewer has "showIndicator" = true', async () => {
    markdownViewerRef.setProperty("showIndicator", true);
    markdownViewerRef.setProperty("value", CODE_ONLY);
    await page.waitForChanges();
    const codeRef = await page.find(CODE_SELECTOR);

    expect(await codeRef.getProperty("showIndicator")).toBe(true);
  });

  it("when the value is updated at runtime and showIndicator = true, the showIndicator should be removed from the ch-code", async () => {
    markdownViewerRef.setProperty("showIndicator", true);
    markdownViewerRef.setProperty("value", CODE_ONLY);
    await page.waitForChanges();

    // At this point, codeRef.showIndicator === true

    markdownViewerRef.setProperty("value", CODE_WITH_TEXT_AT_THE_END);
    await page.waitForChanges();

    const codeRef = await page.find(CODE_SELECTOR);
    expect(await codeRef.getProperty("showIndicator")).toBe(false);
  });
});
