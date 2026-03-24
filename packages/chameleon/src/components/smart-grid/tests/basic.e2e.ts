import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import {
  testDefaultCssProperties,
  testDefaultProperties
} from "../../../testing/utils.e2e";

testDefaultProperties("ch-smart-grid", {
  accessibleName: undefined,
  autoGrow: false,
  autoScroll: "at-scroll-end",
  dataProvider: false,
  inverseLoading: false,
  itemsCount: undefined,
  loadingState: "initial",
  threshold: "10px"
});

testDefaultCssProperties("ch-smart-grid", {
  display: "grid"
});

describe("[ch-smart-grid][basic]", () => {
  let page: E2EPage;
  let smartGridRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-smart-grid></ch-smart-grid>`,
      failOnConsoleError: true
    });

    smartGridRef = await page.find("ch-smart-grid");
  });

  it("should have Shadow DOM", () =>
    expect(smartGridRef.shadowRoot).toBeTruthy());
});
