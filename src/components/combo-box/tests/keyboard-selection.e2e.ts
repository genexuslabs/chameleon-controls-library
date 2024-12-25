import {
  E2EElement,
  E2EPage,
  EventSpy,
  newE2EPage
} from "@stencil/core/testing";
import { simpleModelComboBox1 } from "../../../showcase/assets/components/combo-box/models";
import { ComboBoxSuggestOptions } from "../types";

const FORM_ENTRY = "combo-box";

const getTemplate = () => `<button>Dummy button</button>
      <form>
        <ch-combo-box-render name="${FORM_ENTRY}"></ch-combo-box-render>
      </form>`;

type KeyToPress =
  | "ArrowDown"
  | "ArrowUp"
  | "End"
  | "Enter"
  | "Escape"
  | "Home"
  | "NumpadEnter"
  | "Tab";

type ConfirmKeys =
  | Exclude<KeyToPress, "ArrowDown" | "ArrowUp" | "Home" | "End">
  | "LeftMouseClick"
  | "MiddleMouseClick"
  | "RightMouseClick";

const mouseClickToPuppeteerMouseOptions = {
  LeftMouseClick: "left",
  MiddleMouseClick: "middle",
  RightMouseClick: "right"
} as const;

const DEFAULT_EVENT_INPUT_RECEIVED_TIMES = 1;
const STRICT_FILTERS: ComboBoxSuggestOptions = { strict: true };

const testKeyboard = (
  suggest: boolean,
  expanded: boolean,
  confirmKey?: ConfirmKeys,
  strict?: boolean
) => {
  const testDescription = `[ch-combo-box-render][keyboard][${
    suggest ? "suggest" : "combo-box"
  }][${expanded ? "expanded" : "collapsed"}]${
    expanded ? (`[closing with "${confirmKey}"]` as const) : ""
  }${strict ? "[strict]" : ""}` as const;

  describe(testDescription, () => {
    let page: E2EPage;
    let comboBoxRef: E2EElement;
    let inputEventSpy: EventSpy;

    const pressNavigationKey = async (key: KeyToPress) => {
      await comboBoxRef.press(key);
      await page.waitForChanges();
    };

    const checkFormValue = async (formValue: string | undefined) => {
      expect(await comboBoxRef.getProperty("value")).toBe(formValue);

      const formValues = await page.evaluate(() => {
        const formElement = document.querySelector("form") as HTMLFormElement;
        const formData = new FormData(formElement);
        return Object.fromEntries(formData.entries());
      });
      expect(formValues[FORM_ENTRY]).toBe(formValue);
    };

    const checkSelectedValueInPopover = async (valueInPopover: string) => {
      const selectedValue = await page.find(
        `ch-combo-box-render >>> [part*='${valueInPopover}']`
      );

      if (!selectedValue) {
        console.log(
          valueInPopover,
          (await page.find(`ch-combo-box-render >>> ch-popover`)).innerHTML
        );
      }
      expect(selectedValue).not.toBeNull();
      expect(selectedValue.getAttribute("part")).toContain("selected");
      expect(selectedValue).toHaveAttribute("aria-selected");
    };

    const checkFormValueAfterClosing = async (
      formValue: string | undefined,
      eventInputReceivedTimes = 1
    ) => {
      await checkFormValue(formValue);

      if (eventInputReceivedTimes === 0) {
        expect(inputEventSpy).toHaveReceivedEventTimes(0);
      } else {
        expect(inputEventSpy).toHaveReceivedEventTimes(eventInputReceivedTimes);
        expect(inputEventSpy).toHaveReceivedEventDetail(formValue);
      }
    };

    const closeComboBoxAndCheckValues = async (options: {
      formValueBeforeClose: string;
      formValueAfterClose: string;
      captionAfterClose: string;
      confirmKey: ConfirmKeys;
      navigationKey: KeyToPress;
      // expectedRenderedItems: { caption: string }[];
      eventInputReceivedTimes?: number;
    }) => {
      await checkFormValue(options.formValueBeforeClose);

      await pressNavigationKey(options.navigationKey);

      if (expanded) {
        await checkSelectedValueInPopover(options.formValueAfterClose);

        // if (options?.cancelClose) {
        //   return;
        // }

        if (
          options.confirmKey === "LeftMouseClick" ||
          options.confirmKey === "MiddleMouseClick" ||
          options.confirmKey === "RightMouseClick"
        ) {
          await page.click(
            `ch-combo-box-render >>> [part*='${options.formValueAfterClose}']`,
            {
              button: mouseClickToPuppeteerMouseOptions[options.confirmKey]
            }
          );
          await page.waitForChanges();
        } else {
          await pressNavigationKey(options.confirmKey);
        }
      }

      checkFormValueAfterClosing(
        options.captionAfterClose,
        options.eventInputReceivedTimes ?? DEFAULT_EVENT_INPUT_RECEIVED_TIMES
      );
    };

    beforeEach(async () => {
      page = await newE2EPage({
        html: getTemplate(),
        failOnConsoleError: true
      });
      comboBoxRef = await page.find("ch-combo-box-render");
      inputEventSpy = await comboBoxRef.spyOnEvent("input");
      await comboBoxRef.setProperty("model", simpleModelComboBox1);

      if (suggest && expanded) {
        await comboBoxRef.setProperty("suggest", true);

        if (strict) {
          await comboBoxRef.setProperty("suggestOptions", STRICT_FILTERS);
        }
      }

      await page.waitForChanges();

      if (expanded) {
        await page.click("ch-combo-box-render");
        await page.waitForChanges(); // The combo-box content must be rendered
      } else {
        await page.focus("ch-combo-box-render");
      }
    });

    // TODO: This test should fail with suggest and (Escape Key or MouseClick)
    it('should select the first item (KEY = "ArrowDown") when the value is undefined', async () => {
      await closeComboBoxAndCheckValues(
        {
          formValueBeforeClose: undefined,
          navigationKey: "ArrowDown",
          formValueAfterClose: "Value 1",
          captionAfterClose: suggest ? "Label for the value 1" : "Value 1",
          confirmKey,
          eventInputReceivedTimes: 1
        }
        // { value: "Value 1", caption: "Label for the value 1" },
      );
    });

    // When there are filters, the "Home" key only moves the cursor of the input
    if (expanded && suggest) {
      // TODO: Fix this test
      it.skip('should not select the first item (KEY = "Home") when the value is undefined', async () => {
        await closeComboBoxAndCheckValues({
          formValueBeforeClose: undefined,
          navigationKey: "Home",
          formValueAfterClose: undefined,
          captionAfterClose: undefined,
          confirmKey,
          eventInputReceivedTimes: 0
        });
      });

      it('should select the first item (KEY = "Home") when the value is defined', async () => {
        await comboBoxRef.setProperty("value", "Value 2.1");
        await page.waitForChanges();
        await closeComboBoxAndCheckValues({
          formValueBeforeClose: "Value 2.1",
          navigationKey: "Home",
          formValueAfterClose: "Value 2.1",

          // The selected value does not change with filters in this case
          captionAfterClose: "Value 2.1",
          confirmKey,
          eventInputReceivedTimes: 0
        });
      });
    } else {
      it('should select the first item (KEY = "Home") when the value is undefined', async () => {
        await closeComboBoxAndCheckValues({
          formValueBeforeClose: undefined,
          navigationKey: "Home",
          formValueAfterClose: "Value 1",
          captionAfterClose: suggest ? "Label for the value 1" : "Value 1",
          confirmKey,
          eventInputReceivedTimes: 1
        });
      });

      it('should select the first item (KEY = "Home") when the value is defined', async () => {
        await comboBoxRef.setProperty("value", "Value 2.1");
        await page.waitForChanges();
        await closeComboBoxAndCheckValues({
          formValueBeforeClose: "Value 2.1",
          navigationKey: "Home",
          formValueAfterClose: "Value 1",
          captionAfterClose: suggest ? "Label for the value 1" : "Value 1",
          confirmKey,
          eventInputReceivedTimes: 1
        });
      });
    }

    // TODO: Figure out how this should work
    it('should select the last item (KEY = "ArrowUp") when the value is undefined', async () => {
      await closeComboBoxAndCheckValues({
        formValueBeforeClose: undefined,
        navigationKey: "ArrowUp",
        captionAfterClose: suggest ? "Label for the value 12" : "Value 12",
        formValueAfterClose: "Value 12",
        confirmKey,
        eventInputReceivedTimes: 1
      });
    });
    0;

    // When there are filters, the "End" key only moves the cursor of the input
    if (expanded && suggest) {
      // TODO: Fix this test
      it.skip('should not select the last item (KEY = "End") when the value is undefined', async () => {
        await closeComboBoxAndCheckValues({
          formValueBeforeClose: undefined,
          navigationKey: "End",
          formValueAfterClose: undefined,
          captionAfterClose: undefined,
          confirmKey,
          eventInputReceivedTimes: 0
        });
      });

      it('should not select the last item (KEY = "End") when the value is defined', async () => {
        await comboBoxRef.setProperty("value", "Value 2.1");
        await page.waitForChanges();
        await closeComboBoxAndCheckValues({
          formValueBeforeClose: "Value 2.1",
          navigationKey: "End",
          formValueAfterClose: "Value 2.1",

          // The selected value does not change with filters in this case
          captionAfterClose: "Value 2.1",
          confirmKey,
          eventInputReceivedTimes: suggest ? 0 : 1
        });
      });
    } else {
      it('should select the last item (KEY = "End") when the value is undefined', async () => {
        await closeComboBoxAndCheckValues({
          formValueBeforeClose: undefined,
          navigationKey: "End",
          formValueAfterClose: "Value 12",
          captionAfterClose: suggest ? "Label for the value 12" : "Value 12",
          confirmKey,
          eventInputReceivedTimes: 1
        });
      });

      it('should select the last item (KEY = "End") when the value is defined', async () => {
        await comboBoxRef.setProperty("value", "Value 2.1");
        await page.waitForChanges();
        await closeComboBoxAndCheckValues({
          formValueBeforeClose: "Value 2.1",
          navigationKey: "End",
          formValueAfterClose: "Value 12",
          captionAfterClose: suggest ? "Label for the value 12" : "Value 12",
          confirmKey,
          eventInputReceivedTimes: 1
        });
      });
    }

    it('should not navigate to the last item when pressing KEY = "ArrowUp" and the selected value is the first item', async () => {
      await comboBoxRef.setProperty("value", "Value 1");
      await page.waitForChanges();
      await closeComboBoxAndCheckValues({
        formValueBeforeClose: "Value 1",
        navigationKey: "ArrowUp",
        formValueAfterClose: "Value 1",

        // The selected value does not change with filters in this case
        captionAfterClose: "Value 1",
        confirmKey,
        eventInputReceivedTimes: 0
      });
    });

    it('should not navigate to the first item when pressing KEY = "ArrowDown" and the selected value is the last item', async () => {
      await comboBoxRef.setProperty("value", "Value 12");
      await page.waitForChanges();
      await closeComboBoxAndCheckValues({
        formValueBeforeClose: "Value 12",
        navigationKey: "ArrowDown",
        formValueAfterClose: "Value 12",

        // The selected value does not change with filters in this case
        captionAfterClose: "Value 12",
        confirmKey,
        eventInputReceivedTimes: 0
      });
    });

    it('should select the item in the group (KEY = "ArrowDown") when the next item is group (not expandable)', async () => {
      await comboBoxRef.setProperty("value", "Value 1");
      await page.waitForChanges();
      await closeComboBoxAndCheckValues({
        formValueBeforeClose: "Value 1",
        navigationKey: "ArrowDown",

        // TODO: Improve this test since it is filtering the popover
        formValueAfterClose: suggest ? "Value 10" : "Value 2.1",
        captionAfterClose: suggest ? "Label for the value 10" : "Value 2.1",
        confirmKey,
        eventInputReceivedTimes: 1
      });
    });

    // TODO: Improve these test since the suggest property is filtering the popover and thus changing the expected values
    it.skip('should select the item in the group (KEY = "ArrowUp") when the next item is group (not expandable)', async () => {
      await comboBoxRef.setProperty("value", "Value 4");
      await page.waitForChanges();
      await closeComboBoxAndCheckValues({
        formValueBeforeClose: "Value 4",
        navigationKey: "ArrowUp",
        formValueAfterClose: "Value 2.2",
        captionAfterClose: suggest ? "Label for the value 2.2" : "Value 2.2",
        confirmKey,
        eventInputReceivedTimes: 1
      });
    });

    it.skip('should select the next in the group (KEY = "ArrowDown")', async () => {
      await comboBoxRef.setProperty("value", "Value 1");
      await page.waitForChanges();
      await closeComboBoxAndCheckValues({
        formValueBeforeClose: "Value 1",
        navigationKey: "ArrowDown",
        formValueAfterClose: "Value 2.1",
        captionAfterClose: suggest ? "Label for the value 2.1" : "Value 2.1",
        confirmKey,
        eventInputReceivedTimes: 1
      });
    });

    it.skip('should not select a disabled item (KEY = "ArrowDown")', async () => {
      await comboBoxRef.setProperty("value", "Value 2.1");
      await page.waitForChanges();
      await closeComboBoxAndCheckValues({
        formValueBeforeClose: "Value 2.1",
        navigationKey: "ArrowDown",
        formValueAfterClose: "Value 2.2",
        captionAfterClose: suggest ? "Label for the value 2.2" : "Value 2.2",
        confirmKey,
        eventInputReceivedTimes: 1
      });

      await closeComboBoxAndCheckValues({
        formValueBeforeClose: "Value 2.2",
        navigationKey: "ArrowDown",
        formValueAfterClose: "Value 4",
        captionAfterClose: suggest ? "Label for the value 4" : "Value 4",
        confirmKey,
        eventInputReceivedTimes: 2
      });
    });

    it.skip('should not select a disabled item (KEY = "ArrowUp")', async () => {
      await comboBoxRef.setProperty("value", "Value 6.3");
      await page.waitForChanges();
      await closeComboBoxAndCheckValues({
        formValueBeforeClose: "Value 6.3",
        navigationKey: "ArrowUp",
        formValueAfterClose: "Value 4",
        captionAfterClose: suggest ? "Label for the value 4" : "Value 4",
        confirmKey,
        eventInputReceivedTimes: 1
      });
    });

    it.skip('should not select an item in expandable, expanded, disabled and collapsed group (KEY = "ArrowDown")', async () => {
      await comboBoxRef.setProperty("value", "Value 10");
      await page.waitForChanges();
      await closeComboBoxAndCheckValues({
        formValueBeforeClose: "Value 10",
        navigationKey: "ArrowDown",
        formValueAfterClose: "Value 12",
        captionAfterClose: suggest ? "Label for the value 12" : "Value 12",
        confirmKey,
        eventInputReceivedTimes: 1
      });
    });

    it.skip('should not select an item in expandable, expanded, disabled and collapsed group (KEY = "ArrowUp")', async () => {
      await comboBoxRef.setProperty("value", "Value 12");
      await page.waitForChanges();
      await closeComboBoxAndCheckValues({
        formValueBeforeClose: "Value 12",
        navigationKey: "ArrowUp",
        formValueAfterClose: "Value 10",
        captionAfterClose: suggest ? "Label for the value 10" : "Value 10",
        confirmKey,
        eventInputReceivedTimes: 1
      });
    });

    it.todo(
      'should not select an item in a collapsed group (KEY = "ArrowDown")'
    );
    it.todo('should not select an item in a collapsed group (KEY = "ArrowUp")');
  });
};

const keysToConfirmClose: ConfirmKeys[] = [
  "Enter",
  // TODO: Fix this test
  // "Escape",

  // TODO: Fix this test
  // "NumpadEnter",

  "Tab",
  "LeftMouseClick"

  // TODO: Fix this test
  // "MiddleMouseClick",
  // "RightMouseClick"
];
const strictValues = [false, true];
const suggestValues = [false, true];

suggestValues.forEach(suggest => {
  strictValues.forEach(strict => {
    keysToConfirmClose.forEach(keyToConfirmClose =>
      testKeyboard(suggest, true, keyToConfirmClose, strict)
    );
  });
});

testKeyboard(false, false);
