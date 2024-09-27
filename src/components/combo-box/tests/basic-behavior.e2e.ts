import {
  E2EElement,
  E2EPage,
  EventSpy,
  newE2EPage
} from "@stencil/core/testing";
import { DEFAULT_DECORATIVE_SIZE } from "../../../testing/constants.e2e";
import { simpleModelComboBox1 } from "../../../showcase/assets/components/combo-box/models";
import { ComboBoxSuggestOptions } from "../types";

const FORM_ENTRY = "combo-box";
const STRICT_FILTERS: ComboBoxSuggestOptions = { strict: true };

const testBehavior = (suggest: boolean, strict?: boolean) => {
  const getTemplate = () => `<button>Dummy button</button>
        <form>
          <ch-combo-box-render name="${FORM_ENTRY}" ${
    suggest ? "suggest" : ""
  }></ch-combo-box-render>
        </form>`;

  const testDescription =
    `[ch-combo-box-render][behavior][suggest and filters][${
      suggest ? "suggest" : "combo-box"
    }]${suggest && strict ? "[strict]" : ""}` as const;

  describe(testDescription, () => {
    let page: E2EPage;
    let comboBoxRef: E2EElement;
    let inputEventSpy: EventSpy;

    const getRenderedItems = (): Promise<{ caption: string }[]> =>
      page.evaluate(() =>
        [
          ...document
            .querySelector("ch-combo-box-render")
            .shadowRoot.querySelectorAll("[role='option']")
        ].map(el => ({ caption: el.textContent }))
      );

    beforeEach(async () => {
      page = await newE2EPage({
        html: getTemplate(),
        failOnConsoleError: true
      });
      comboBoxRef = await page.find("ch-combo-box-render");
      inputEventSpy = await comboBoxRef.spyOnEvent("input");

      if (strict) {
        await comboBoxRef.setProperty("suggestOptions", STRICT_FILTERS);
      }
      await page.waitForChanges();
    });

    it('should not have an aria-hidden="true" attribute the mask', async () => {
      const maskRef = comboBoxRef.shadowRoot.querySelector(".mask");
      expect(maskRef).not.toHaveAttribute("aria-hidden");
    });

    it("should properly display the selected caption when updating the value in the interface", async () => {
      await comboBoxRef.setProperty("model", simpleModelComboBox1);
      await page.waitForChanges();
      await comboBoxRef.setProperty("value", "_Blob");
      await page.waitForChanges();

      const renderedItems = await getRenderedItems();
      expect(renderedItems).toEqual([
        { caption: "Blob" },
        { caption: "BlobFile" }
      ]);

      expect(inputEventSpy).toHaveReceivedEventTimes(0);
    });

    // The picker is not visible by default when using suggest
    if (suggest) {
      it("the picker should not have a visible size by default", async () => {
        // This does not computed the custom vars: comboBoxRef.getComputedStyle()
        const pickerSize = await page.evaluate(() =>
          getComputedStyle(
            document.querySelector("ch-combo-box-render")
          ).getPropertyValue("--ch-combo-box__picker-size")
        );

        expect(pickerSize).toBe("0px");
      });
    } else {
      it("the picker should have a visible size by default", async () => {
        // This does not computed the custom vars: comboBoxRef.getComputedStyle()
        const pickerSize = await page.evaluate(() =>
          getComputedStyle(
            document.querySelector("ch-combo-box-render")
          ).getPropertyValue("--ch-combo-box__picker-size")
        );

        expect(pickerSize).toBe(DEFAULT_DECORATIVE_SIZE);
      });
    }

    it("should not render items if the popover is not displayed", async () => {
      let popoverRef = await page.find("ch-combo-box-render >>> ch-popover");
      expect(popoverRef).toBeNull();

      await comboBoxRef.setProperty("model", simpleModelComboBox1);
      await page.waitForChanges();
      popoverRef = await page.find("ch-combo-box-render >>> ch-popover");
      expect(popoverRef).toBeNull();
    });

    it("should destroy the items after the popover is closed (by clicking outside of the combo-box)", async () => {
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
};

testBehavior(false, false);
testBehavior(true, false);
testBehavior(true, true);
