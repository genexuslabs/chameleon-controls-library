import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { simpleModelComboBox1 } from "../../../showcase/assets/components/combo-box/models";
import { ComboBoxSuggestOptions } from "../types";

const FORM_ENTRY = "combo-box";

const getTemplate = (suggest: boolean) => `<button>Dummy button</button>
      <form>
        <ch-combo-box-render name="${FORM_ENTRY}${
  suggest ? " suggest" : ""
}"></ch-combo-box-render>
      </form>`;

type KeyToPress =
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "Enter"
  | "Escape"
  | "NumpadEnter"
  | "Space"
  | "Tab"
  | "Home"
  | "End";

const COMBO_BOX_KEYS_TO_NOT_OPEN: KeyToPress[] = [
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "Home",
  "End",
  "Escape",
  "Tab"
];
const SUGGEST_KEYS_TO_NOT_OPEN: KeyToPress[] = [
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "Escape",
  "Tab"
];

const COMBO_BOX_KEYS_TO_OPEN: KeyToPress[] = [
  "Space",
  "Enter"
  // "NumpadEnter"
];
const SUGGEST_KEYS_TO_OPEN: KeyToPress[] = [
  // TODO: Fix $0.focus() to fix these tests
  // "ArrowDown",
  // "ArrowUp",
  "Space",
  "Enter"
  // "NumpadEnter"
];

const COMBO_BOX_KEYS_TO_NOT_CLOSE: KeyToPress[] = [
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "Home",
  "End",
  "Space"
];
const COMBO_BOX_KEYS_TO_CLOSE: KeyToPress[] = [
  "Enter",
  "Escape",
  // "NumpadEnter",
  "Tab"
];

const COMBO_BOX_KEYS_TO_CLOSE_AND_RETURN_FOCUS: KeyToPress[] = [
  // TODO: Fix these tests
  "Enter",
  "Escape",
  "Tab"
  // "NumpadEnter"
];

const STRICT_FILTERS: ComboBoxSuggestOptions = { strict: true };

const testOpeningClosing = (suggest: boolean, strict?: true) => {
  const testDescription = `[ch-combo-box-render][opening/closing][${
    suggest ? "suggest" : "combo-box"
  }]${strict ? "[strict]" : ""}`;

  // TODO: Fix this. The focusable element should not change
  //  const focusableElementTagName = suggest ? "input" : "div";

  describe(testDescription, () => {
    let page: E2EPage;
    let comboBoxRef: E2EElement;
    const keysToNotOpen: KeyToPress[] = suggest
      ? SUGGEST_KEYS_TO_NOT_OPEN
      : COMBO_BOX_KEYS_TO_NOT_OPEN;
    const keysToOpen: KeyToPress[] = suggest
      ? SUGGEST_KEYS_TO_OPEN
      : COMBO_BOX_KEYS_TO_OPEN;

    const keysToNotClose: KeyToPress[] = COMBO_BOX_KEYS_TO_NOT_CLOSE;

    // TODO: Add Mouse click in the test
    const keysToClose: KeyToPress[] = COMBO_BOX_KEYS_TO_CLOSE;

    const checkPopoverDefined = async (shouldBeDefined: boolean) => {
      const popoverRef = await page.find("ch-combo-box-render >>> ch-popover");

      if (shouldBeDefined) {
        expect(popoverRef).not.toBeNull();
      } else {
        expect(popoverRef).toBeNull();
      }
    };

    const pressKey = async (key: KeyToPress) => {
      await comboBoxRef.press(key);
      await page.waitForChanges();
    };

    beforeEach(async () => {
      page = await newE2EPage({
        html: getTemplate(suggest),
        failOnConsoleError: true
      });
      comboBoxRef = await page.find("ch-combo-box-render");
      await comboBoxRef.setProperty("model", simpleModelComboBox1);

      if (strict) {
        await comboBoxRef.setProperty("suggestOptions", STRICT_FILTERS);
      }
      await page.waitForChanges();
    });

    it("should not open the popover when focusing the control via JS (.focus())", async () => {
      await page.focus("ch-combo-box-render");
      await page.waitForChanges();
      await checkPopoverDefined(false);
    });

    keysToNotOpen.forEach(key => {
      it(`should not open the popover when pressing KEY = "${key}"`, async () => {
        await page.focus("ch-combo-box-render");
        await page.waitForChanges();
        await pressKey(key);
        await checkPopoverDefined(false);
      });
    });

    it("should open the popover when clicking the control", async () => {
      await page.click("ch-combo-box-render");
      await page.waitForChanges();
      await checkPopoverDefined(true);
    });

    keysToOpen.forEach(key => {
      it(`should not open the popover when pressing KEY = "${key}", if readonly = "true"`, async () => {
        await comboBoxRef.setProperty("readonly", true);
        await page.waitForChanges();
        await page.focus("ch-combo-box-render");
        await page.waitForChanges();
        await pressKey(key);
        await checkPopoverDefined(false);
      });
    });

    it('should not open the popover when clicking the control, if readonly = "true"', async () => {
      await comboBoxRef.setProperty("readonly", true);
      await page.waitForChanges();
      await page.click("ch-combo-box-render");
      await page.waitForChanges();
      await checkPopoverDefined(false);
    });

    keysToOpen.forEach(key => {
      it(`should open the popover when pressing KEY = "${key}"`, async () => {
        await page.focus("ch-combo-box-render");
        await page.waitForChanges();
        await pressKey(key);
        await checkPopoverDefined(true);
      });
    });

    keysToNotClose.forEach(key => {
      it(`should not close the popover when pressing KEY = "${key}"`, async () => {
        await page.click("ch-combo-box-render");
        await page.waitForChanges();
        await pressKey(key);
        await checkPopoverDefined(true);
      });
    });

    // TODO: Enter key should not emit the input event if the selection was not updated.
    // TODO: Should we add a property to configure if the combo-box should close with enter when the selection is not updated?
    keysToClose.forEach(key => {
      it(`should close the popover when pressing KEY = "${key}"`, async () => {
        await page.click("ch-combo-box-render");
        await page.waitForChanges();
        await pressKey(key);
        await checkPopoverDefined(false);
      });
    });

    COMBO_BOX_KEYS_TO_CLOSE_AND_RETURN_FOCUS.forEach(key => {
      it(`should close the popover when pressing KEY = "${key}" and return the focus to the combo-box`, async () => {
        await page.click("ch-combo-box-render");
        await page.waitForChanges();
        await pressKey(key);
        await checkPopoverDefined(false);

        const focusedElementTagName = await page.evaluate(() =>
          document.activeElement.tagName.toLowerCase()
        );
        expect(focusedElementTagName).toBe("ch-combo-box-render");
      });
    });

    COMBO_BOX_KEYS_TO_CLOSE_AND_RETURN_FOCUS.forEach(key => {
      it(`should close the popover when pressing KEY = "${key}" and return the focus to the combo-box even if the selection is updated`, async () => {
        await page.click("ch-combo-box-render");
        await page.waitForChanges();
        await pressKey("ArrowDown");
        await pressKey(key);
        await checkPopoverDefined(false);

        const focusedElementTagName = await page.evaluate(() =>
          document.activeElement.tagName.toLowerCase()
        );
        expect(focusedElementTagName).toBe("ch-combo-box-render");
      });
    });

    if (suggest) {
      // TODO: Fix this test
      it.skip("should keep opened the popover when clicking the combo-box", async () => {
        await page.click("ch-combo-box-render");
        await page.waitForChanges();
        await checkPopoverDefined(true);

        await page.click("ch-combo-box-render");
        await page.waitForChanges();
        await checkPopoverDefined(true);
      });
    } else {
      it("should close the popover when clicking the combo-box", async () => {
        await page.click("ch-combo-box-render");
        await page.waitForChanges();
        await checkPopoverDefined(true);

        await page.click("ch-combo-box-render");
        await page.waitForChanges();
        await checkPopoverDefined(false);
      });
    }

    // TODO: Fix this test
    it.skip("should close the popover when clicking outside the combo-box", async () => {
      await page.click("ch-combo-box-render");
      await page.waitForChanges();
      await checkPopoverDefined(true);

      await page.click("button");
      await page.waitForChanges();
      await checkPopoverDefined(false);
    });

    // TODO: Fix this test
    it.skip("should close the popover when focusing other element", async () => {
      await page.click("ch-combo-box-render");
      await page.waitForChanges();
      await checkPopoverDefined(true);

      await page.focus("button");
      await page.waitForChanges();
      await checkPopoverDefined(false);
    });
  });
};

testOpeningClosing(false);
testOpeningClosing(true);
testOpeningClosing(true, true);
