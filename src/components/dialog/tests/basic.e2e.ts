import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-dialog][basic]", () => {
  let page: E2EPage;
  let dialogRef: E2EElement;

  // Helper functions
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
});
