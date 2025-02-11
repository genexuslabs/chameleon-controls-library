import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-action-menu-render][basic]", () => {
  let page: E2EPage;
  let actionMenuRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-action-menu-render></ch-action-menu-render>`,
      failOnConsoleError: true
    });
    actionMenuRef = await page.find("ch-action-menu-render");
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
      expect(await actionMenuRef.getProperty(propertyName)).toBe(propertyValue);
    });

  it("should have Shadow DOM", async () => {
    expect(actionMenuRef.shadowRoot).toBeTruthy();
  });

  testDefault("buttonAccessibleName", undefined, "undefined");
  testDefault("blockAlign", "outside-end", "outside-end");
  testDefault("disabled", false, "false");
  testDefault("expanded", false, "true");
  testDefault("inlineAlign", "center", "center");
  testDefault("model", undefined, "undefined");
});
