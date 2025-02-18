import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import {
  testDefaultCssProperties,
  testDefaultProperties
} from "../../../testing/utils.e2e";

testDefaultProperties("ch-tooltip", {
  actionElement: undefined,
  actionElementAccessibleName: undefined,
  blockAlign: "outside-end",
  delay: 100,
  inlineAlign: "center"
});

testDefaultCssProperties("ch-tooltip", {
  display: "contents",
  "--ch-tooltip-separation": "0px",
  "--ch-tooltip-separation-x": "0px",
  "--ch-tooltip-separation-y": "0px"
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

  it("should have Shadow DOM", () =>
    expect(tooltipRef.shadowRoot).toBeTruthy());

  it("should not render the ch-popover by default", async () => {
    const popoverRef = await page.find("ch-tooltip >>> ch-popover");
    expect(popoverRef).toBeFalsy();
  });
});
