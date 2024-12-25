import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { getTestDefaultDescription } from "../../../testing/utils.e2e";

describe("[ch-layout-splitter][basic]", () => {
  let page: E2EPage;
  let layoutSplitterRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-layout-splitter></ch-layout-splitter>`,
      failOnConsoleError: true
    });
    layoutSplitterRef = await page.find("ch-layout-splitter");
  });

  const testDefault = (
    propertyName: string,
    propertyValue: any,
    propertyValueDescription: string
  ) =>
    it(
      getTestDefaultDescription(
        propertyName,
        propertyValue,
        propertyValueDescription
      ),
      async () => {
        expect(await layoutSplitterRef.getProperty(propertyName)).toBe(
          propertyValue
        );
      }
    );

  it("should have Shadow DOM", () => {
    expect(layoutSplitterRef.shadowRoot).toBeTruthy();
  });

  testDefault("barAccessibleName", "Resize", "Resize");
  testDefault("dragBarDisabled", false, "false");
  testDefault("incrementWithKeyboard", 2, "2");
  testDefault("model", undefined, "undefined");

  it("should render empty by default", () => {
    expect(layoutSplitterRef.shadowRoot.innerHTML).toBeFalsy();
  });
});
