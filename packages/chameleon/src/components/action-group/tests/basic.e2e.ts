import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-action-group-render][basic]", () => {
  let page: E2EPage;
  let actionGroupRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-action-group-render></ch-action-group-render>`,
      failOnConsoleError: true
    });
    actionGroupRef = await page.find("ch-action-group-render");
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
      expect(await actionGroupRef.getProperty(propertyName)).toBe(
        propertyValue
      );
    });

  it("should have Shadow DOM", async () => {
    expect(actionGroupRef.shadowRoot).toBeTruthy();
  });

  testDefault("disabled", false, "false");
  testDefault(
    "itemsOverflowBehavior",
    "responsive-collapse",
    "responsive-collapse"
  );
  testDefault("model", undefined, "undefined");
  testDefault(
    "moreActionsAccessibleName",
    "Show more actions",
    "Show more actions"
  );
  testDefault("moreActionsBlockAlign", "outside-end", "outside-end");
  testDefault("moreActionsCaption", undefined, "undefined");
  testDefault("moreActionsInlineAlign", "inside-start", "inside-start");
});
