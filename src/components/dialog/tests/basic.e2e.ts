import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-dialog][basic]", () => {
  let page: E2EPage;
  let dialogRef: E2EElement;

  const testDefaultProperty = async (
    propertyName: string,
    expectedValue: any
  ) => {
    it(`the "${propertyName}" property should be ${
      expectedValue === undefined ? "undefined" : `"${expectedValue}"`
    }`, async () => {
      const propertyValue = await dialogRef.getProperty(propertyName);
      if (expectedValue === undefined) {
        expect(propertyValue).toBeUndefined();
      } else {
        expect(propertyValue).toBe(expectedValue);
      }
    });
  };

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-dialog></ch-dialog>`,
      failOnConsoleError: true
    });

    dialogRef = await page.find("ch-dialog");
  });

  // Validate shadowRoot

  it("should have a shadowRoot", async () => {
    expect(dialogRef.shadowRoot).toBeTruthy();
  });

  // Validate properties default values

  testDefaultProperty("adjustPositionAfterResize", false);

  testDefaultProperty("allowDrag", "no");

  testDefaultProperty("caption", undefined);

  testDefaultProperty("closeButtonAccessibleName", undefined);

  testDefaultProperty("show", false);

  testDefaultProperty("modal", true);

  testDefaultProperty("resizable", false);

  testDefaultProperty("showFooter", false);

  testDefaultProperty("showHeader", false);

  // Validate id's

  it("should not include an id on any of the resize-bar elements", async () => {
    dialogRef.setProperty("resizable", true);
    dialogRef.setProperty("show", true);
    await page.waitForChanges();

    const partsNames = [
      "edge edge-block-start",
      "edge edge-inline-end",
      "edge edge-block-end",
      "edge edge-inline-start",
      "corner corner-block-start-inline-start",
      "corner corner-block-start-inline-end",
      "corner corner-block-end-inline-start",
      "corner corner-block-end-inline-end"
    ];

    for (const part of partsNames) {
      const resizePartRef = await page.find(`ch-dialog >>> [part="${part}"]`);
      expect(resizePartRef).not.toHaveAttribute("id");
    }
  });

  it("should not include an id on the part='content' element", async () => {
    dialogRef.setProperty("show", true);
    await page.waitForChanges();
    const contentPartRef = await page.find("ch-dialog >>> [part='content']");
    expect(contentPartRef).not.toHaveAttribute("id");
  });

  it("should not include an id on the part='close-button' element", async () => {
    dialogRef.setProperty("showHeader", true);
    dialogRef.setProperty("show", true);
    await page.waitForChanges();

    const closeButtonPartRef = await page.find(
      "ch-dialog >>> [part='close-button']"
    );
    expect(closeButtonPartRef).not.toHaveAttribute("id");
  });
});
