import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import {
  testDefaultCssProperties,
  testDefaultProperties
} from "../../../testing/utils.e2e";

testDefaultProperties("ch-popover", {
  actionById: false,
  actionElement: undefined,
  allowDrag: "no",
  blockAlign: "center",
  blockSizeMatch: "content",
  closeOnClickOutside: false,
  firstLayer: true,
  inlineAlign: "center",
  inlineSizeMatch: "content",
  mode: "auto",
  overflowBehavior: "overflow",
  positionTry: "none",
  resizable: false,
  show: false
});

testDefaultCssProperties("ch-popover", {
  "--ch-popover-block-size": "max-content",
  "--ch-popover-inline-size": "max-content",
  "--ch-popover-max-block-size": "auto",
  "--ch-popover-max-inline-size": "auto",
  "--ch-popover-min-block-size": "auto",
  "--ch-popover-min-inline-size": "auto",
  "--ch-popover-resize-threshold": "8px",
  "--ch-popover-separation-x": "0px",
  "--ch-popover-separation-y": "0px"
});

describe("[ch-popover][basic]", () => {
  let page: E2EPage;
  let popoverRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-popover></ch-popover>`,
      failOnConsoleError: true
    });
    popoverRef = await page.find("ch-popover");
  });

  it("should have Shadow DOM", () =>
    expect(popoverRef.shadowRoot).toBeTruthy());

  // TODO: Don't render the internal slot by default
  it.skip("should render empty by default", () =>
    expect(popoverRef.shadowRoot.innerHTML).toBeFalsy());
});
