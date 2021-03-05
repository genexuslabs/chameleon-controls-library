import { newE2EPage, E2EElement, E2EPage } from "@stencil/core/testing";

describe("ch-icon", () => {
  let page: E2EPage;
  let icon: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage();

    await page.setContent(`<ch-icon></ch-icon>`);
    icon = await page.find("ch-icon");
  });

  it("renders", async () => {
    expect(icon).toHaveClass("hydrated");
  });
});
