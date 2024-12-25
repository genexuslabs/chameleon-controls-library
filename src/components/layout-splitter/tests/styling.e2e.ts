import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-layout-splitter][styling]", () => {
  let page: E2EPage;
  let layoutSplitterRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-layout-splitter></ch-layout-splitter>`,
      failOnConsoleError: true
    });
    layoutSplitterRef = await page.find("ch-layout-splitter");
  });

  const getCustomVarValue = (customVar: string) =>
    page.evaluate(
      (customVarName: string) =>
        getComputedStyle(
          document.querySelector("ch-layout-splitter")
        ).getPropertyValue(customVarName),
      customVar
    );

  const testStyling = (propertyName: string, propertyValue: string) =>
    it(`should have ${propertyName}: ${propertyValue} by default`, async () => {
      expect((await layoutSplitterRef.getComputedStyle())[propertyName]).toBe(
        propertyValue
      );
    });

  it('should have "--ch-drag-bar__size: 5px" by default', async () => {
    expect(await getCustomVarValue("--ch-drag-bar__size")).toBe("5px");
  });

  testStyling("display", "grid");
  testStyling("position", "static");
  // testStyling("inline-size", "auto");
  // testStyling("block-size", "auto");
});
