import { newE2EPage } from "@stencil/core/testing";

describe("ch-sidebar-menu", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<ch-sidebar-menu></ch-sidebar-menu>");

    const element = await page.find("ch-sidebar-menu");
    expect(element).toHaveClass("hydrated");
  });
});
