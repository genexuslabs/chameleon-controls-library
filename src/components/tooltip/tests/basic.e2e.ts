import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-tooltip][basic]", () => {
  let page: E2EPage;
  let tooltipRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-tooltip></ch-tooltip>`,
      failOnConsoleError: true
    });
    tooltipRef = await page.find("ch-tooltip");
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
      expect(await tooltipRef.getProperty(propertyName)).toBe(propertyValue);
    });

  const getCustomVarValue = (customVar: string) =>
    page.evaluate(
      (customVarName: string) =>
        getComputedStyle(document.querySelector("ch-tooltip")).getPropertyValue(
          customVarName
        ),
      customVar
    );

  it("should have Shadow DOM", async () => {
    expect(tooltipRef.shadowRoot).toBeTruthy();
  });

  testDefault("actionElement", undefined, "undefined");
  testDefault("blockAlign", "outside-end", "outside-end");
  testDefault("delay", 100, "100");
  testDefault("inlineAlign", "center", "center");

  it('should have "display: contents" by default', async () => {
    expect((await tooltipRef.getComputedStyle()).display).toBe("contents");
  });

  it('should have "--ch-tooltip-separation: 0px" by default', async () => {
    expect(await getCustomVarValue("--ch-tooltip-separation")).toBe("0px");
  });

  it('should have "--ch-tooltip-separation-x: 0px" by default', async () => {
    expect(await getCustomVarValue("--ch-tooltip-separation-x")).toBe("0px");
  });

  it('should have "--ch-tooltip-separation-y: 0px" by default', async () => {
    expect(await getCustomVarValue("--ch-tooltip-separation-y")).toBe("0px");
  });

  it("should not render the ch-popover by default", async () => {
    const popoverRef = await page.find("ch-tooltip >>> ch-popover");
    expect(popoverRef).toBeFalsy();
  });
});
