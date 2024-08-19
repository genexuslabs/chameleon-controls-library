import { newE2EPage } from "@stencil/core/testing";
import { DEFAULT_DECORATIVE_SIZE } from "../../../testing/constants.e2e";

describe("[ch-combo-box-render][behavior]", () => {
  it("the picker should have a visible size by default", async () => {
    const page = await newE2EPage();
    await page.setContent(`<ch-combo-box-render></ch-combo-box-render>`);

    // This does not computed the custom vars: comboBoxRef.getComputedStyle()
    const pickerSize = await page.evaluate(() =>
      getComputedStyle(
        document.querySelector("ch-combo-box-render")
      ).getPropertyValue("--ch-combo-box__picker-size")
    );

    expect(pickerSize).toBe(DEFAULT_DECORATIVE_SIZE);
  });
});
