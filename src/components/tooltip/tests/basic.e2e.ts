import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { testDefaultProperties } from "../../../testing/utils.e2e";

testDefaultProperties("ch-tooltip", {
  actionElement: undefined,
  actionElementAccessibleName: undefined,
  blockAlign: "outside-end",
  delay: 100,
  inlineAlign: "center"
});

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

  const getCustomVarValue = (customVar: string) =>
    page.evaluate(
      (customVarName: string) =>
        getComputedStyle(document.querySelector("ch-tooltip")).getPropertyValue(
          customVarName
        ),
      customVar
    );

  it("should have Shadow DOM", () =>
    expect(tooltipRef.shadowRoot).toBeTruthy());

  it('should have "display: contents" by default', async () =>
    expect((await tooltipRef.getComputedStyle()).display).toBe("contents"));

  it('should have "--ch-tooltip-separation: 0px" by default', async () =>
    expect(await getCustomVarValue("--ch-tooltip-separation")).toBe("0px"));

  it('should have "--ch-tooltip-separation-x: 0px" by default', async () =>
    expect(await getCustomVarValue("--ch-tooltip-separation-x")).toBe("0px"));

  it('should have "--ch-tooltip-separation-y: 0px" by default', async () =>
    expect(await getCustomVarValue("--ch-tooltip-separation-y")).toBe("0px"));

  it("should not render the ch-popover by default", async () => {
    const popoverRef = await page.find("ch-tooltip >>> ch-popover");
    expect(popoverRef).toBeFalsy();
  });
});
