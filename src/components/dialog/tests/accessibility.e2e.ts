import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-dialog][accessibility]", () => {
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
    chDialogRef.setProperty("showFooter", true);
    chDialogRef.setProperty("show", true);
    await page.waitForChanges();
  });

  it("should not render a header element", async () => {
    const headerEl = await page.find("ch-dialog >>> header");
    expect(headerEl).toBeFalsy();
  });

  it("should not render a footer element", async () => {
    const footerEl = await page.find("ch-dialog >>> footer");
    expect(footerEl).toBeFalsy();
  });

  it("should not include a role attribute on the part='header' element", async () => {
    const headerPartRef = await page.find("ch-dialog >>> [part='header']");
    expect(headerPartRef).not.toHaveAttribute("role");
  });

  it("should not include a role attribute on the part='footer' element", async () => {
    const footerPartRef = await page.find("ch-dialog >>> [part='footer']");
    expect(footerPartRef).not.toHaveAttribute("role");
  });
});
