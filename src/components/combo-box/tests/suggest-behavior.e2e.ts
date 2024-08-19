import { newE2EPage } from "@stencil/core/testing";

describe("[ch-combo-box-render][behavior][suggest]", () => {
  it("the picker should not have a visible size by default", async () => {
    const page = await newE2EPage();
    await page.setContent(
      `<ch-combo-box-render filter-type="caption"></ch-combo-box-render>`
    );

    // This does not computed the custom vars: comboBoxRef.getComputedStyle()
    const pickerSize = await page.evaluate(() =>
      getComputedStyle(
        document.querySelector("ch-combo-box-render")
      ).getPropertyValue("--ch-combo-box__picker-size")
    );

    expect(pickerSize).toBe("0px");
  });
});
