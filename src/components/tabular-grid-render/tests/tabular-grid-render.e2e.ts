import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { basicModel } from "../../../showcase/assets/components/tabular-grid-render/models";

describe("[ch-tabular-grid-render]", () => {
  let page: E2EPage;
  let tabularGridRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-tabular-grid-render></ch-tabular-grid-render>`,
      failOnConsoleError: true
    });
    tabularGridRef = await page.find("ch-tabular-grid-render");
    tabularGridRef.setProperty("model", basicModel);
    await page.waitForChanges();
  });

  it("should have Shadow DOM", async () => {
    expect(tabularGridRef.shadowRoot).toBeDefined();
  });
});
