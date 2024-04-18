import { newE2EPage } from "@stencil/core/testing";

describe("ch-suggest-list-item", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<ch-suggest-list-item></ch-suggest-list-item>");

    const element = await page.find("ch-suggest-list-item");
    expect(element).toHaveClass("hydrated");
  });
});
