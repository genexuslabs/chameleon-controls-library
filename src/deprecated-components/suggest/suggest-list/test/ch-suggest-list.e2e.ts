import { newE2EPage } from "@stencil/core/testing";

describe("ch-suggest-list", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<ch-suggest-list></ch-suggest-list>");

    const element = await page.find("ch-suggest-list");
    expect(element).toHaveClass("hydrated");
  });
});
