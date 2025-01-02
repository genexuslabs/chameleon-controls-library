import { E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-dialog][slots]", () => {
  let page: E2EPage;
  let dialogRef;
  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-dialog></ch-dialog>`,
      failOnConsoleError: true
    });
    dialogRef = await page.find("ch-dialog");
  });

  // default slot
  it("should have a slot element by default", async () => {
    const slot = await page.find("ch-dialog >>> slot");
    expect(slot).not.toBeNull();
  });

  // footer slot
  it("should render a 'footer' slot if showFooter is true", async () => {
    dialogRef.setProperty("showFooter", true);
    await page.waitForChanges();
    const slotFooter = await page.find(
      "ch-dialog >>> dialog footer slot[name='footer']"
    );
    expect(slotFooter).not.toBeNull();
  });

  it("should not render a 'footer' slot if showFooter is false", async () => {
    dialogRef.setProperty("showFooter", false);
    await page.waitForChanges();
    const slotFooter = await page.find(
      "ch-dialog >>> dialog footer slot[name='footer']"
    );
    expect(slotFooter).toBeNull();
  });

  it("should render multiple elements in the default slot", async () => {
    await page.setContent(`
      <ch-dialog showHeader>
        <div class="default-slot-content">First Content</div>
        <div class="default-slot-content">Second Content</div>
      </ch-dialog>
    `);
    const contents = await page.findAll("ch-dialog .default-slot-content");
    expect(contents.length).toBe(2);
    expect(contents[0].textContent).toBe("First Content");
    expect(contents[1].textContent).toBe("Second Content");
  });
});
