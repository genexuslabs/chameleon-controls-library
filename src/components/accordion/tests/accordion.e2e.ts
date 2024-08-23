import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-accordion-render]", () => {
  let page: E2EPage;
  let accordionRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-accordion-render></ch-accordion-render>`
    });
    accordionRef = await page.find("ch-accordion-render");
  });

  it("should have Shadow DOM", () => {
    expect(accordionRef.shadowRoot).toBeDefined();
  });
});
