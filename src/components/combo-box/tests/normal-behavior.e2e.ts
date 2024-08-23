import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { DEFAULT_DECORATIVE_SIZE } from "../../../testing/constants.e2e";

describe("[ch-combo-box-render][behavior]", () => {
  let page: E2EPage;
  let comboBoxRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-combo-box-render></ch-combo-box-render>`
    });
    comboBoxRef = await page.find("ch-combo-box-render");
  });

  it('should not have an aria-hidden="true" attribute the mask', async () => {
    const maskRef = comboBoxRef.shadowRoot.querySelector(".mask");
    expect(maskRef).not.toHaveAttribute("aria-hidden");
  });

  it("the picker should have a visible size by default", async () => {
    // This does not computed the custom vars: comboBoxRef.getComputedStyle()
    const pickerSize = await page.evaluate(() =>
      getComputedStyle(
        document.querySelector("ch-combo-box-render")
      ).getPropertyValue("--ch-combo-box__picker-size")
    );

    expect(pickerSize).toBe(DEFAULT_DECORATIVE_SIZE);
  });
});
