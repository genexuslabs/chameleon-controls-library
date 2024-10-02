import {
  E2EElement,
  E2EPage,
  EventSpy,
  newE2EPage
} from "@stencil/core/testing";
import { DEFAULT_DECORATIVE_SIZE } from "../../../testing/constants.e2e";
import {
  dataTypeInGeneXus,
  simpleModelComboBox1
} from "../../../showcase/assets/components/combo-box/models";
import { ComboBoxSuggestOptions } from "../types";

const FORM_ENTRY = "combo-box";
const STRICT_FILTERS: ComboBoxSuggestOptions = { strict: true };

const SIMPLE_MODEL_ALL_CAPTIONS = [
  { caption: "Label for the value 1" },
  { caption: "Label for the value 2.1" },
  { caption: "Label for the value 2.2" },
  { caption: "Label for the value 3" },
  { caption: "Label for the value 4" },
  { caption: "Label for the value 5.1" },
  { caption: "Label for the value 5.2" },
  { caption: "Label for the value 5.3" },
  { caption: "Label for the value 5.4" },
  { caption: "Label for the value 6.1" },
  { caption: "Label for the value 6.2" },
  { caption: "Label for the value 6.3" },
  { caption: "Label for the value 6.4" },
  { caption: "Label for the value 7" },
  { caption: "Label for the value 8" },
  { caption: "Label for the value 10" },
  { caption: "Label for the value 11.1" },
  { caption: "Label for the value 11.2" },
  { caption: "Label for the value 11.3" },
  { caption: "Label for the value 11.4" },
  { caption: "Label for the value 12" }
] as const;

const testBehavior = (suggest: boolean, strict?: boolean) => {
  const getTemplate = () => `<button>Dummy button</button>
        <form>
          <ch-combo-box-render name="${FORM_ENTRY}" ${
    suggest ? "suggest" : ""
  }></ch-combo-box-render>
        </form>`;

  const testDescription = `[ch-combo-box-render][behavior][${
    suggest ? "suggest" : "combo-box"
  }]${suggest && strict ? "[strict]" : ""}` as const;

  describe(testDescription, () => {
    let page: E2EPage;
    let comboBoxRef: E2EElement;
    let inputRef: E2EElement;
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
      inputRef = await page.find("ch-combo-box-render >>> input");

      if (strict) {
        comboBoxRef.setProperty("suggestOptions", STRICT_FILTERS);
      }
      await page.waitForChanges();
    });

    it('should not have an aria-hidden="true" attribute the input-container', async () => {
      const maskRef = comboBoxRef.shadowRoot.querySelector(".input-container");
      expect(maskRef).not.toHaveAttribute("aria-hidden");
    });

    it("should properly display the selected caption when updating the value in the interface", async () => {
      comboBoxRef.setProperty("model", simpleModelComboBox1);
      await page.waitForChanges();
      comboBoxRef.setProperty("value", "Value 1");
      await page.waitForChanges();

      expect(await inputRef.getProperty("value")).toBe("Label for the value 1");
      expect(inputEventSpy).toHaveReceivedEventTimes(0);
    });

    // TODO: Check the value in the form
    it("should properly display the selected caption when updating the model in the interface", async () => {
      comboBoxRef.setProperty("value", "Value 1");
      await page.waitForChanges();
      expect(await inputRef.getProperty("value")).toBe("");

      comboBoxRef.setProperty("model", simpleModelComboBox1);
      await page.waitForChanges();
      expect(await inputRef.getProperty("value")).toBe("Label for the value 1");

      expect(inputEventSpy).toHaveReceivedEventTimes(0);
    });

    it("should properly display the selected caption when updating the value and model in the interface", async () => {
      comboBoxRef.setProperty("model", simpleModelComboBox1);
      comboBoxRef.setProperty("value", "Value 1");
      await page.waitForChanges();
      expect(await inputRef.getProperty("value")).toBe("Label for the value 1");

      comboBoxRef.setProperty("value", "_Blob");
      await page.waitForChanges();
      expect(await inputRef.getProperty("value")).toBe("");

      comboBoxRef.setProperty("model", dataTypeInGeneXus);
      await page.waitForChanges();
      expect(await inputRef.getProperty("value")).toBe("Blob");

      comboBoxRef.setProperty("value", "Value 2");
      await page.waitForChanges();
      expect(await inputRef.getProperty("value")).toBe("");

      comboBoxRef.setProperty("model", simpleModelComboBox1);
      await page.waitForChanges();
      // TODO: GROUPS MUST NOT BE SELECTABLE
      expect(await inputRef.getProperty("value")).toBe(
        "Label for the value 222 (not expandable)"
      );

      expect(inputEventSpy).toHaveReceivedEventTimes(0);
    });

    it.skip("should update the rendered items when setting the value in the interface", async () => {
      // Expand the combo-box
      await page.click("ch-combo-box-render");

      comboBoxRef.setProperty("value", "Value 3");
      await page.waitForChanges();
      let renderedItems = await getRenderedItems();
      expect(renderedItems).toEqual([]);

      comboBoxRef.setProperty("model", simpleModelComboBox1);
      await page.waitForChanges();
      renderedItems = await getRenderedItems();

      expect(renderedItems).toEqual(
        suggest
          ? // For some reason this does not work well
            [
              {
                caption: "Label for the value 3"
              }
            ]
          : SIMPLE_MODEL_ALL_CAPTIONS
      );
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
