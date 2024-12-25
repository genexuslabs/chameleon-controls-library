import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-textblock][basic]", () => {
  let page: E2EPage;
  let textBlockRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-textblock></ch-textblock>`,
      failOnConsoleError: true
    });
    textBlockRef = await page.find("ch-textblock");
  });

  const testDefault = (
    propertyName: string,
    propertyValue: any,
    propertyValueDescription: string
  ) =>
    it(`the "${propertyName}" property should be ${
      typeof propertyValue === "string"
        ? `"${propertyValueDescription}"`
        : propertyValueDescription
    } by default`, async () => {
      expect(await textBlockRef.getProperty(propertyName)).toBe(propertyValue);
    });

  it("should have Shadow DOM", async () => {
    expect(textBlockRef.shadowRoot).toBeTruthy();
  });

  testDefault("autoGrow", false, "false");
  testDefault("caption", undefined, "undefined");
  testDefault("characterToMeasureLineHeight", "A", "A");
  testDefault("format", "text", "text");
  testDefault("highlightPattern", undefined, "undefined");
  testDefault("showTooltipOnOverflow", false, "false");
});
