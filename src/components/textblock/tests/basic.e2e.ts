import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { testDefaultProperties } from "../../../testing/utils.e2e";

testDefaultProperties("ch-textblock", {
  accessibleRole: "p",
  autoGrow: false,
  caption: undefined,
  characterToMeasureLineHeight: "A",
  format: "text",
  showTooltipOnOverflow: false
});

describe("[ch-textblock][basic]", () => {
  let page: E2EPage;
  let textblockRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-textblock></ch-textblock>`,
      failOnConsoleError: true
    });
    textblockRef = await page.find("ch-textblock");
  });

  it("should have Shadow DOM", () =>
    expect(textblockRef.shadowRoot).toBeTruthy());
});
