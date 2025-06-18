import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { testDefaultProperties } from "../../../testing/utils.e2e";

// Prueba las propiedades predeterminadas del componente ch-status
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

  it("should render with default properties", async () => {
    const accessibleName = await statusRef.getProperty("accessibleName");
    expect(accessibleName).toBeUndefined();

    const loadingRegionRef = await statusRef.getProperty("loadingRegionRef");
    expect(loadingRegionRef).toBeUndefined();
  });
});
