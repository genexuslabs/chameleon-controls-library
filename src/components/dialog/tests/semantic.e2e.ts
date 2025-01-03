import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-dialog][semantic]", () => {
  let page: E2EPage;
  let chDialogRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-dialog></ch-dialog>`,
      failOnConsoleError: true
    });

    chDialogRef = await page.find("ch-dialog");

    // Set properties
    chDialogRef.setProperty("showHeader", true);
    await page.waitForChanges();
    chDialogRef.setProperty("showFooter", true);
    await page.waitForChanges();
    // chDialogRef.setProperty("resizable", true);
    // await page.waitForChanges();
    chDialogRef.setProperty("show", true);
    await page.waitForChanges();
  });

  it("should not render a header element", async () => {
    const headerEl = await page.find("ch-dialog >>> header");
    expect(headerEl).toBeNull();
  });

  it("should not render a footer element", async () => {
    const footerEl = await page.find("ch-dialog >>> footer");
    expect(footerEl).toBeNull();
  });

  it("should not include a role='banner' attribute on the part='header' element", async () => {
    const headerPartRef = await page.find("ch-dialog >>> [part='header']");
    await page.waitForChanges();
    expect(headerPartRef).not.toBeNull();

    const roleAttribute = headerPartRef.getAttribute("role");
    expect(roleAttribute).not.toBe("banner");
  });

  it("should not include a role='contentinfo' attribute on the part='footer' element", async () => {
    const footerPartRef = await page.find("ch-dialog >>> [part='footer']");
    await page.waitForChanges();
    expect(footerPartRef).not.toBeNull();

    const roleAttribute = footerPartRef.getAttribute("role");
    expect(roleAttribute).not.toBe("contentinfo");
  });

  it.skip("should not include an id on any of the resize-bar elements", async () => {
    const partsSelectors = [
      "ch-dialog >>> [part='edge edge-block-start']",
      "ch-dialog >>> [part='edge edge-inline-end']",
      "ch-dialog >>> [part='edge edge-block-end']",
      "ch-dialog >>> [part='edge edge-inline-start']",
      "ch-dialog >>> [part='corner corner-block-start-inline-start']",
      "ch-dialog >>> [part='corner corner-block-start-inline-end']",
      "ch-dialog >>> [part='corner corner-block-end-inline-start']",
      "ch-dialog >>> [part='corner corner-block-end-inline-end']"
    ];

    for (const part of partsSelectors) {
      const resizePartRef = await page.find(part);

      if (resizePartRef) {
        const idAttribute = await resizePartRef.getAttribute("id");
        expect(idAttribute).toBeNull();
      } else {
        throw new Error(`Element with part "${part}" not found.`);
      }
    }
  });

  it("should not include an id on the part='content' element", async () => {
    const contentPartRef = await page.find("ch-dialog >>> [part='content']");
    await page.waitForChanges();
    expect(contentPartRef).not.toBeNull();

    const contentId = contentPartRef.getAttribute("id");
    expect(contentId).toBeNull();
  });
});
