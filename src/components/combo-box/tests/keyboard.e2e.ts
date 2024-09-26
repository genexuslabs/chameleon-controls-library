import {
  E2EElement,
  E2EPage,
  EventSpy,
  newE2EPage
} from "@stencil/core/testing";
import { simpleModelComboBox1 } from "../../../showcase/assets/components/combo-box/models";

const FORM_ENTRY = "combo-box";

const getTemplate = () => `<button>Dummy button</button>
      <form>
        <ch-combo-box-render name="${FORM_ENTRY}"></ch-combo-box-render>
      </form>`;

type OptionsToClose = {
  formValueBeforeClose?: string | undefined;
  eventInputReceivedTimes?: number;
  cancelClose?: boolean;
};

type Options = {
  confirmClose?: boolean;
  currentValue?: string | undefined;
  eventInputReceivedTimes?: number;
};

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

const DEFAULT_CURRENT_VALUE = undefined;
const DEFAULT_EVENT_INPUT_RECEIVED_TIMES = 1;

const testKeyboard = (expanded: boolean, confirmKey?: ConfirmKeys) => {
  const testDescription = `[ch-combo-box-render][keyboard][combo-box][${
    expanded ? "expanded" : "collapsed"
  }]${expanded ? `[closing with "${confirmKey}"]` : ""}` as const;

  describe(testDescription, () => {
    let page: E2EPage;
    let comboBoxRef: E2EElement;
    let inputEventSpy: EventSpy;

    const checkValues = async (
      formValue: string | undefined,
      options: Options = {
        confirmClose: false,
        currentValue: DEFAULT_CURRENT_VALUE,
        eventInputReceivedTimes: DEFAULT_EVENT_INPUT_RECEIVED_TIMES
      }
    ) => {
      expect(await comboBoxRef.getProperty("value")).toBe(formValue);

      const formValues = await page.evaluate(() => {
        const formElement = document.querySelector("form") as HTMLFormElement;
        const formData = new FormData(formElement);
        return Object.fromEntries(formData.entries());
      });
      expect(formValues[FORM_ENTRY]).toBe(formValue);

      // If the popover is displayed an it's not closed, the value is not yet
      // emitted to the form. Check that the current selected
      if (expanded && !options.confirmClose && options.currentValue) {
        const selectedValue = await page.find(
          `ch-combo-box-render >>> [part*='${options.currentValue}']`
        );
        expect(selectedValue).not.toBeNull();
        expect(selectedValue.getAttribute("part")).toContain("selected");
        expect(selectedValue).toHaveAttribute("aria-selected");

        return;
      }

      if (options?.eventInputReceivedTimes === 0) {
        expect(inputEventSpy).toHaveReceivedEventTimes(0);
      } else {
        expect(inputEventSpy).toHaveReceivedEventTimes(
          options.eventInputReceivedTimes ?? DEFAULT_EVENT_INPUT_RECEIVED_TIMES
        );
        expect(inputEventSpy).toHaveReceivedEventDetail(formValue);
      }
    };

    const pressKey = async (key: KeyToPress) => {
      await comboBoxRef.press(key);
      await page.waitForChanges();
    };

    const closeComboBoxAndCheckValues = async (
      value: string,
      key?: ConfirmKeys,
      options?: OptionsToClose
    ) => {
      if (expanded) {
        await checkValues(options?.formValueBeforeClose, {
          currentValue: value
        });

        if (options?.cancelClose) {
          return;
        }

        if (
          key === "LeftMouseClick" ||
          key === "MiddleMouseClick" ||
          key === "RightMouseClick"
        ) {
          await page.click(`ch-combo-box-render >>> [part*='${value}']`, {
            button: mouseClickToPuppeteerMouseOptions[key]
          });
          await page.waitForChanges();
        } else {
          await pressKey(key);
        }
      }

      await checkValues(value, {
        confirmClose: true,
        eventInputReceivedTimes: options?.eventInputReceivedTimes
      });
    };

    beforeEach(async () => {
      page = await newE2EPage({
        html: getTemplate(),
        failOnConsoleError: true
      });
      comboBoxRef = await page.find("ch-combo-box-render");
      await comboBoxRef.setProperty("model", simpleModelComboBox1);
      await page.waitForChanges();
      inputEventSpy = await comboBoxRef.spyOnEvent("input");

      if (expanded) {
        await page.click("ch-combo-box-render");
        await page.waitForChanges(); // The combo-box content must be rendered
      } else {
        await page.focus("ch-combo-box-render");
      }
    });

    it('should select the first item (KEY = "ArrowDown") when the value is undefined', async () => {
      await pressKey("ArrowDown");
      await closeComboBoxAndCheckValues("Value 1", confirmKey);
    });

    it('should select the first item (KEY = "Home") when the value is undefined', async () => {
      await pressKey("Home");
      await closeComboBoxAndCheckValues("Value 1", confirmKey);
    });

    it('should select the first item (KEY = "Home") when the value is defined', async () => {
      await comboBoxRef.setProperty("value", "Value 2.1");
      await page.waitForChanges();
      await pressKey("Home");
      await closeComboBoxAndCheckValues("Value 1", confirmKey, {
        formValueBeforeClose: "Value 2.1"
      });
    });

    // TODO: Figure out how this should work
    it('should select the last item (KEY = "ArrowUp") when the value is undefined', async () => {
      await pressKey("ArrowUp");
      await closeComboBoxAndCheckValues("Value 10", confirmKey);
    });
    0;

    it('should select the last item (KEY = "End") when the value is undefined', async () => {
      await pressKey("End");
      await closeComboBoxAndCheckValues("Value 10", confirmKey);
    });

    it('should select the last item (KEY = "End") when the value is defined', async () => {
      await comboBoxRef.setProperty("value", "Value 2.1");
      await page.waitForChanges();
      await pressKey("End");
      await closeComboBoxAndCheckValues("Value 10", confirmKey, {
        formValueBeforeClose: "Value 2.1"
      });
    });

    it('should not navigate to the last item when pressing KEY = "ArrowUp" and the selected value is the first item', async () => {
      await comboBoxRef.setProperty("value", "Value 1");
      await page.waitForChanges();
      await pressKey("ArrowUp");
      await closeComboBoxAndCheckValues("Value 1", confirmKey, {
        formValueBeforeClose: "Value 1",
        eventInputReceivedTimes: 0
      });
    });

    it('should not navigate to the first item when pressing KEY = "ArrowDown" and the selected value is the last item', async () => {
      await comboBoxRef.setProperty("value", "Value 10");
      await page.waitForChanges();
      await pressKey("ArrowDown");
      await closeComboBoxAndCheckValues("Value 10", confirmKey, {
        formValueBeforeClose: "Value 10",
        eventInputReceivedTimes: 0
      });
    });

    it('should select the item in the group (KEY = "ArrowDown") when the next item is group (not expandable)', async () => {
      await comboBoxRef.setProperty("value", "Value 1");
      await page.waitForChanges();
      await pressKey("ArrowDown");
      await closeComboBoxAndCheckValues("Value 2.1", confirmKey, {
        formValueBeforeClose: "Value 1"
      });
    });

    it('should select the item in the group (KEY = "ArrowUp") when the next item is group (not expandable)', async () => {
      await comboBoxRef.setProperty("value", "Value 4");
      await page.waitForChanges();
      await pressKey("ArrowUp");
      await closeComboBoxAndCheckValues("Value 2.2", confirmKey, {
        formValueBeforeClose: "Value 4"
      });
    });

    it('should select the next in the group (KEY = "ArrowDown")', async () => {
      await comboBoxRef.setProperty("value", "Value 1");
      await page.waitForChanges();
      await pressKey("ArrowDown");
      await closeComboBoxAndCheckValues("Value 2.1", confirmKey, {
        formValueBeforeClose: "Value 1"
      });
    });

    it('should not select a disabled item (KEY = "ArrowDown")', async () => {
      await comboBoxRef.setProperty("value", "Value 2.1");
      await page.waitForChanges();
      await pressKey("ArrowDown");
      await closeComboBoxAndCheckValues("Value 2.2", confirmKey, {
        formValueBeforeClose: "Value 2.1",
        cancelClose: true
      });

      await pressKey("ArrowDown");
      await closeComboBoxAndCheckValues("Value 4", confirmKey, {
        formValueBeforeClose: "Value 2.1",
        eventInputReceivedTimes: expanded ? 1 : 2
      });
    });

    it('should not select a disabled item (KEY = "ArrowUp")', async () => {
      await comboBoxRef.setProperty("value", "Value 6.3");
      await page.waitForChanges();
      await pressKey("ArrowUp");
      await closeComboBoxAndCheckValues("Value 4", confirmKey, {
        formValueBeforeClose: "Value 6.3"
      });
    });

    it.todo(
      'should not select an item in a collapsed group (KEY = "ArrowDown")'
    );
    it.todo('should not select an item in a collapsed group (KEY = "ArrowUp")');

    it.todo(
      'should not select an item in expandable, expanded, disabled and collapsed group (KEY = "ArrowDown")'
    );
    it.todo(
      'should not select an item in expandable, expanded, disabled and collapsed group (KEY = "ArrowUp")'
    );
  });
};

const keysToConfirmClose: ConfirmKeys[] = [
  "Enter",
  "Escape",

  // TODO: Fix this test
  // "NumpadEnter",

  "Tab",
  "LeftMouseClick"

  // TODO: Fix this test
  // "MiddleMouseClick",
  // "RightMouseClick"
];

keysToConfirmClose.forEach(keyToConfirmClose =>
  testKeyboard(true, keyToConfirmClose)
);
testKeyboard(false);
