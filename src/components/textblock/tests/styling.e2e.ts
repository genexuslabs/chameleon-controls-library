import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-textblock][styling]", () => {
  let page: E2EPage;
  let tooltipRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-textblock></ch-textblock>`,
      failOnConsoleError: true
    });
    tooltipRef = await page.find("ch-textblock");
  });
  const testStyling = (
    propertyName: string,
    propertyValue: string,
    additionalDescription?: string
  ) =>
    it(`should have "${propertyName}: ${propertyValue}" by default${
      additionalDescription ? " " + additionalDescription : ""
    }`, async () => {
      expect((await tooltipRef.getComputedStyle())[propertyName]).toBe(
        propertyValue
      );
    });

  testStyling("display", "inline-grid");
  testStyling("grid-auto-rows", "max-content");
  testStyling("position", "relative");
  testStyling("text-align", "start");
  testStyling(
    "whiteSpace",
    "break-spaces",
    "to support line breaks with white spaces"
  );
});
