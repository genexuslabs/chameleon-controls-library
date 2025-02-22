import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import {
  testDefaultCssProperties,
  testDefaultProperties
} from "../../../testing/utils.e2e";

testDefaultProperties("ch-markdown-viewer", {
  avoidFlashOfUnstyledContent: false,
  rawHtml: false,
  renderCode: undefined,
  showIndicator: false,
  theme: "ch-markdown-viewer",
  value: undefined
});

testDefaultCssProperties("ch-markdown-viewer", {
  "--ch-markdown-viewer-indicator-color": "currentColor",
  "--ch-markdown-viewer-inline-size": "1.125ch",
  "--ch-markdown-viewer-block-size": "1em"
});

describe("[ch-markdown-viewer][basic]", () => {
  let page: E2EPage;
  let markdownViewerRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-markdown-viewer></ch-markdown-viewer>`,
      failOnConsoleError: true
    });
    markdownViewerRef = await page.find("ch-markdown-viewer");
  });

  it("should have Shadow DOM", () =>
    expect(markdownViewerRef.shadowRoot).toBeTruthy());
});
