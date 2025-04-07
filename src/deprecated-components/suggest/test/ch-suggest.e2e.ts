import { newE2EPage } from "@stencil/core/testing";

describe.skip("ch-suggest", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<ch-suggest></ch-suggest>");

    const element = await page.find("ch-suggest");
    expect(element).toHaveClass("hydrated");
  });
});
