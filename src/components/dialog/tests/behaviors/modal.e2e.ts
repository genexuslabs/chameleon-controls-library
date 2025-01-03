import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-dialog][modal]", () => {
  let page: E2EPage;
  let chDialogRef: E2EElement;

  beforeEach(async () => {
    // Initialize the page with a button
    page = await newE2EPage({
      html: `<ch-dialog>Dialog Content</ch-dialog>`,
      failOnConsoleError: true
    });
    await page.setViewport({ width: 1920, height: 1080 });
    // Apply generous viewport dimensions to ensure that a mouse click
    // effectively is triggered on the body.

    chDialogRef = await page.find("ch-dialog");

    // Attach click listener to document.body in browser context
    await page.evaluate(() => {
      document.documentElement.style.blockSize = "100%";
      document.body.style.blockSize = "100%";
      document.body.style.margin = "0";

      const windowRef = window as any;
      windowRef.bodyClickCount = 0;
      document.body.addEventListener("click", () => {
        windowRef.bodyClickCount += 1;
      });
    });
    await page.waitForChanges();
  });

  it("should not block body clicks when dialog is non-modal", async () => {
    chDialogRef.setProperty("modal", false);
    await page.waitForChanges();

    chDialogRef.setProperty("show", true);
    await page.waitForChanges();

    await page.mouse.click(10, 10);
    await page.waitForChanges();

    const clickCount = await page.evaluate(() => {
      return (window as any).bodyClickCount;
    });

    expect(clickCount).toBe(1);
  });

  it("should block body clicks when dialog is non-modal", async () => {
    chDialogRef.setProperty("modal", true);
    await page.waitForChanges();

    chDialogRef.setProperty("show", true);
    await page.waitForChanges();

    await page.mouse.click(10, 10);
    await page.waitForChanges();

    const clickCount = await page.evaluate(() => {
      return (window as any).bodyClickCount;
    });

    expect(clickCount).toBe(0);
  });
});
