import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-tab-render][basic]", () => {
  let page: E2EPage;
  let tabRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-tab-render></ch-tab-render>`,
      failOnConsoleError: true
    });
    tabRef = await page.find("ch-tab-render");
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
      expect(await tabRef.getProperty(propertyName)).toBe(propertyValue);
    });

  it("should have Shadow DOM", async () => {
    expect(tabRef.shadowRoot).toBeTruthy();
  });

  testDefault("accessibleName", undefined, "undefined");
  testDefault("closeButton", false, "false");
  testDefault("closeButtonAccessibleName", "Close", "Close");
  testDefault("contain", "none", "none");
  testDefault("disabled", false, "false");
  testDefault("dragOutside", false, "false");
  testDefault("expanded", true, "true");
  testDefault("model", undefined, "undefined");
  testDefault("overflow", "visible", "visible");
  testDefault("selectedId", undefined, "undefined");
  testDefault("showCaptions", true, "true");
  testDefault("showTabListEnd", false, "false");
  testDefault("showTabListStart", false, "false");
  testDefault("sortable", false, "false");
  testDefault("tabButtonHidden", false, "false");
  testDefault("tabListPosition", "block-start", "block-start");
});
