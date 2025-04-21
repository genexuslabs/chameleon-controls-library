import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { testDefaultProperties } from "../../../testing/utils.e2e";

testDefaultProperties("ch-progress", {
  accessibleName: undefined,
  accessibleValueText: undefined,
  indeterminate: false,
  loadingRegionRef: undefined,
  max: 100,
  min: 0,
  renderType: "custom",
  value: 0
});

describe("[ch-progress][basic]", () => {
  let page: E2EPage;
  let progressRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-progress></ch-progress>`,
      failOnConsoleError: true
    });
    progressRef = await page.find("ch-progress");
  });

  it("should have Shadow DOM", () =>
    expect(progressRef.shadowRoot).toBeTruthy());
});
