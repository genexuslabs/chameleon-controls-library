import { newE2EPage } from "@stencil/core/testing";

describe("ch-sidebar-menu-list-item", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent(
      "<ch-sidebar-menu-list-item></ch-sidebar-menu-list-item>"
    );

    const element = await page.find("ch-sidebar-menu-list-item");
    expect(element).toHaveClass("hydrated");
  });
});
