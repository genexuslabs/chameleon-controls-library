import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { testDefaultProperties } from "../../../testing/utils.e2e";

testDefaultProperties("ch-status", {
  accessibleName: undefined,
  loadingRegionRef: undefined
});

describe("[ch-status][basic]", () => {
  let page: E2EPage;
  let statusRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-status></ch-status>`,
      failOnConsoleError: true
    });
    statusRef = await page.find("ch-status");
  });

  it("should have Shadow DOM", () => expect(statusRef.shadowRoot).toBeTruthy());
});
