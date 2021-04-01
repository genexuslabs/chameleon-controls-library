import { newE2EPage } from "@stencil/core/testing";

describe("ch-sidebar-menu-list", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<ch-sidebar-menu-list></ch-sidebar-menu-list>");

    const element = await page.find("ch-sidebar-menu-list");
    expect(element).toHaveClass("hydrated");
  });
});
