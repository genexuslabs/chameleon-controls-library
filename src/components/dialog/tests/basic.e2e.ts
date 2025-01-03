import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-dialog][basic]", () => {
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
    chDialogRef.setProperty("resizable", true);
    chDialogRef.setProperty("show", true);
    await page.waitForChanges();
  });

  it("should not include an id on any of the resize-bar elements", async () => {
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
      expect(resizePartRef).not.toHaveAttribute("id");
    }
  });

  it("should not include an id on the part='content' element", async () => {
    const contentPartRef = await page.find("ch-dialog >>> [part='content']");
    expect(contentPartRef).not.toHaveAttribute("id");
  });

  it("should not include an id on the part='close-button' element", async () => {
    const closeButtonPartRef = await page.find(
      "ch-dialog >>> [part='close-button']"
    );
    expect(closeButtonPartRef).not.toHaveAttribute("id");
  });
});
