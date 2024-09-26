import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { simpleModelComboBox1 } from "../../../showcase/assets/components/combo-box/models";

describe("[ch-combo-box-render][behavior][suggest]", () => {
  let page: E2EPage;
  let comboBoxRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<button>Dummy button</button>
      <ch-combo-box-render suggest></ch-combo-box-render>`,
      failOnConsoleError: true
    });
    comboBoxRef = await page.find("ch-combo-box-render");
  });

  it('should not have an aria-hidden="true" attribute the mask', async () => {
    const maskRef = comboBoxRef.shadowRoot.querySelector(".mask");
    expect(maskRef).not.toHaveAttribute("aria-hidden");
  });

  it("the picker should not have a visible size by default", async () => {
    // This does not computed the custom vars: comboBoxRef.getComputedStyle()
    const pickerSize = await page.evaluate(() =>
      getComputedStyle(
        document.querySelector("ch-combo-box-render")
      ).getPropertyValue("--ch-combo-box__picker-size")
    );

    expect(pickerSize).toBe("0px");
  });

  it("should not render items if the popover is not displayed", async () => {
    let popoverRef = await page.find("ch-combo-box-render >>> ch-popover");
    expect(popoverRef).toBeNull();

    await comboBoxRef.setProperty("model", simpleModelComboBox1);
    await page.waitForChanges();
    popoverRef = await page.find("ch-combo-box-render >>> ch-popover");
    expect(popoverRef).toBeNull();
  });

  it("should destroy the items after the popover is closed", async () => {
    await comboBoxRef.setProperty("model", simpleModelComboBox1);
    await page.waitForChanges();
    await page.click("ch-combo-box-render");
    await page.waitForChanges();

    let popoverRef = await page.find("ch-combo-box-render >>> ch-popover");
    expect(popoverRef).toBeDefined();

    await page.click("button");
    await page.waitForChanges();
    popoverRef = await page.find("ch-combo-box-render >>> ch-popover");
    expect(popoverRef).toBeNull();
  });
});
