import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import {
  testDefaultCssProperties,
  testDefaultProperties
} from "../../../testing/utils.e2e";

testDefaultProperties("ch-navigation-list-render", {
  autoGrow: false,
  expandableButton: "decorative",
  expandableButtonPosition: "start",
  expanded: true,
  expandSelectedLink: false,
  getImagePathCallback: undefined,
  gxImageConstructor: undefined,
  gxSettings: undefined,
  model: undefined,
  selectedLink: {
    link: { url: undefined }
  },
  selectedLinkIndicator: false,
  showCaptionOnCollapse: "inline",
  tooltipDelay: 100,
  useGxRender: false
});

testDefaultCssProperties("ch-navigation-list-render", {
  display: "grid"
  // Add unit tests for the rest of the custom vars
});

// TODO: Add basic unit tests for the ch-navigation-list-item control
describe("[ch-navigation-list-render][basic]", () => {
  let page: E2EPage;
  let navigationListRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-navigation-list-render></ch-navigation-list-render>`,
      failOnConsoleError: true
    });

    navigationListRef = await page.find("ch-navigation-list-render");
  });

  it("should have Shadow DOM", () =>
    expect(navigationListRef.shadowRoot).toBeTruthy());
});
