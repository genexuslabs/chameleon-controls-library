import {
  E2EElement,
  E2EPage,
  EventSpy,
  newE2EPage
} from "@stencil/core/testing";
import { dataTypeInGeneXus } from "../../../showcase/assets/components/combo-box/models";
import { ComboBoxSuggestOptions } from "../types";

const FORM_ENTRY = "combo-box";

const getTemplate = () => `<button>Dummy button</button>
      <form>
        <ch-combo-box-render suggest name="${FORM_ENTRY}"></ch-combo-box-render>
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

const testKeyboard = (confirmKey?: ConfirmKeys, strict?: boolean) => {
  const testDescription =
    `[ch-combo-box-render][keyboard][suggest and filters][closing with "${confirmKey}"]${
      strict ? "[strict]" : ""
    }` as const;

  describe(testDescription, () => {
    let page: E2EPage;
    let comboBoxRef: E2EElement;
    let inputEventSpy: EventSpy;
    let filterChangeEventSpy: EventSpy;

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

    const pressNavigationKey = async (key: KeyToPress) => {
      await comboBoxRef.press(key);
      await page.waitForChanges();
    };

    const pressFilterKey = async (keyToPress: string, eventDetail: string) => {
      await comboBoxRef.press(keyToPress);
      await page.waitForChanges();
      expect(filterChangeEventSpy).toHaveReceivedEventDetail(eventDetail);
    };

    const getRenderedItems = (): Promise<{ caption: string }[]> =>
      page.evaluate(() =>
        [
          ...document
            .querySelector("ch-combo-box-render")
            .shadowRoot.querySelectorAll("[role='option']")
        ].map(el => ({ caption: el.textContent }))
      );

    const closeComboBoxAndCheckValues = async (options: {
      formValueBeforeClose: string;
      formValueAfterClose: string;
      confirmKey: ConfirmKeys;
      expectedRenderedItems: { caption: string }[];
      eventInputReceivedTimes?: number;
    }) => {
      await checkFormValue(options.formValueBeforeClose);
      await checkSelectedValueInPopover(options.formValueAfterClose);

      const renderedItems = await getRenderedItems();
      expect(renderedItems).toEqual(options.expectedRenderedItems);

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

      checkFormValueAfterClosing(
        options.formValueAfterClose,
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
      filterChangeEventSpy = await comboBoxRef.spyOnEvent("filterChange");
      comboBoxRef.setProperty("model", dataTypeInGeneXus);
      comboBoxRef.setProperty("suggestDebounce", 0);

      if (strict) {
        comboBoxRef.setProperty("suggestOptions", STRICT_FILTERS);
      }
      await page.waitForChanges();
      await page.click("ch-combo-box-render");
      await page.waitForChanges(); // The combo-box content must be rendered
    });

    // TODO: Fix this test
    it.skip('should properly filter items (filter = "di")', async () => {
      await pressFilterKey("d", "d");
      await pressFilterKey("i", "di");

      const renderedItems = await getRenderedItems();
      expect(renderedItems).toEqual([
        { caption: "Audio" },
        { caption: "Directory" },
        { caption: "AudioPlayerCustomAction, GeneXus.SD.Media" },
        { caption: "AudioPlayerSettings, GeneXus.SD.Media" },
        { caption: "CardInformation, GeneXus.SD" }
      ]);
    });

    it('should select the filtered item (KEY = "ArrowDown")', async () => {
      await pressFilterKey("B", "B");
      await pressFilterKey("l", "Bl");
      await pressFilterKey("o", "Blo");
      await pressNavigationKey("ArrowDown");
      await closeComboBoxAndCheckValues({
        formValueBeforeClose: undefined,
        formValueAfterClose: "_Blob",
        expectedRenderedItems: [
          { caption: "Blob" },
          { caption: "BlobFile" }
          // { caption: "Boolean" }
        ],
        confirmKey
      });
    });

    it('should select the filtered item (KEY = "ArrowUp")', async () => {
      await pressFilterKey("B", "B");
      await pressFilterKey("l", "Bl");
      await pressFilterKey("o", "Blo");
      await pressNavigationKey("ArrowUp");
      await closeComboBoxAndCheckValues({
        formValueBeforeClose: undefined,
        formValueAfterClose: "_BlobFile",
        expectedRenderedItems: [
          { caption: "Blob" },
          { caption: "BlobFile" }
          // { caption: "Boolean" }
        ],
        confirmKey
      });
    });

    it.skip("should display all items when clearing the input", async () => {
      const allRenderedItems = await getRenderedItems();

      await pressFilterKey("B", "B");
      await pressNavigationKey("ArrowDown");
      await pressFilterKey("Backspace", "");
      await page.waitForChanges();

      await closeComboBoxAndCheckValues({
        formValueBeforeClose: undefined,
        formValueAfterClose: "_Blob",
        expectedRenderedItems: allRenderedItems,
        confirmKey
      });
    });

    if (strict) {
      it.skip("should rollback the change, because the caption does not map to an item", async () => {
        await comboBoxRef.setProperty("value", "_Blob");
        await page.waitForChanges();

        await pressFilterKey("b", "Blobb");
        await closeComboBoxAndCheckValues({
          formValueBeforeClose: "_Blob",
          formValueAfterClose: "_Blob",
          expectedRenderedItems: [
            // { caption: "Boolean" }
          ],
          confirmKey
        });
      });
    }

    // // When there are filters, the "Home" key only moves the cursor of the input
    // // TODO: Fix this test
    // it.skip('should not select the first item (KEY = "Home") when the value is undefined', async () => {
    //   await pressKey("Home");
    //   await closeComboBoxAndCheckValues(undefined, confirmKey, {
    //     eventInputReceivedTimes: 0
    //   });
    // });

    // it('should select the first item (KEY = "Home") when the value is defined', async () => {
    //   await comboBoxRef.setProperty("value", "Value 2.1");
    //   await page.waitForChanges();
    //   await pressKey("Home");
    //   await closeComboBoxAndCheckValues("Value 2.1", confirmKey, {
    //     formValueBeforeClose: "Value 2.1",
    //     eventInputReceivedTimes: 0
    //   });
    // });

    // // TODO: Figure out how this should work
    // it('should select the last item (KEY = "ArrowUp") when the value is undefined', async () => {
    //   await pressKey("ArrowUp");
    //   await closeComboBoxAndCheckValues("Value 12", confirmKey);
    // });
    // 0;

    // // When there are filters, the "End" key only moves the cursor of the input
    // // TODO: Fix this test
    // it.skip('should not select the last item (KEY = "End") when the value is undefined', async () => {
    //   await pressKey("End");
    //   await closeComboBoxAndCheckValues(undefined, confirmKey, {
    //     eventInputReceivedTimes: 0
    //   });
    // });

    // it('should not select the last item (KEY = "End") when the value is defined', async () => {
    //   await comboBoxRef.setProperty("value", "Value 2.1");
    //   await page.waitForChanges();
    //   await pressKey("End");
    //   await closeComboBoxAndCheckValues("Value 2.1", confirmKey, {
    //     formValueBeforeClose: "Value 2.1",
    //     eventInputReceivedTimes: 0
    //   });
    // });

    // it('should not navigate to the last item when pressing KEY = "ArrowUp" and the selected value is the first item', async () => {
    //   await comboBoxRef.setProperty("value", "Value 1");
    //   await page.waitForChanges();
    //   await pressKey("ArrowUp");
    //   await closeComboBoxAndCheckValues("Value 1", confirmKey, {
    //     formValueBeforeClose: "Value 1",
    //     eventInputReceivedTimes: 0
    //   });
    // });

    // it('should not navigate to the first item when pressing KEY = "ArrowDown" and the selected value is the last item', async () => {
    //   await comboBoxRef.setProperty("value", "Value 12");
    //   await page.waitForChanges();
    //   await pressKey("ArrowDown");
    //   await closeComboBoxAndCheckValues("Value 12", confirmKey, {
    //     formValueBeforeClose: "Value 12",
    //     eventInputReceivedTimes: 0
    //   });
    // });

    // it('should select the item in the group (KEY = "ArrowDown") when the next item is group (not expandable)', async () => {
    //   await comboBoxRef.setProperty("value", "Value 1");
    //   await page.waitForChanges();
    //   await pressKey("ArrowDown");
    //   await closeComboBoxAndCheckValues("Value 2.1", confirmKey, {
    //     formValueBeforeClose: "Value 1"
    //   });
    // });

    // it('should select the item in the group (KEY = "ArrowUp") when the next item is group (not expandable)', async () => {
    //   await comboBoxRef.setProperty("value", "Value 4");
    //   await page.waitForChanges();
    //   await pressKey("ArrowUp");
    //   await closeComboBoxAndCheckValues("Value 2.2", confirmKey, {
    //     formValueBeforeClose: "Value 4"
    //   });
    // });

    // it('should select the next in the group (KEY = "ArrowDown")', async () => {
    //   await comboBoxRef.setProperty("value", "Value 1");
    //   await page.waitForChanges();
    //   await pressKey("ArrowDown");
    //   await closeComboBoxAndCheckValues("Value 2.1", confirmKey, {
    //     formValueBeforeClose: "Value 1"
    //   });
    // });

    // it('should not select a disabled item (KEY = "ArrowDown")', async () => {
    //   await comboBoxRef.setProperty("value", "Value 2.1");
    //   await page.waitForChanges();
    //   await pressKey("ArrowDown");
    //   await closeComboBoxAndCheckValues("Value 2.2", confirmKey, {
    //     formValueBeforeClose: "Value 2.1",
    //     cancelClose: true
    //   });

    //   await pressKey("ArrowDown");
    //   await closeComboBoxAndCheckValues("Value 4", confirmKey, {
    //     formValueBeforeClose: "Value 2.1",
    //     eventInputReceivedTimes: 1
    //   });
    // });

    // it('should not select a disabled item (KEY = "ArrowUp")', async () => {
    //   await comboBoxRef.setProperty("value", "Value 6.3");
    //   await page.waitForChanges();
    //   await pressKey("ArrowUp");
    //   await closeComboBoxAndCheckValues("Value 4", confirmKey, {
    //     formValueBeforeClose: "Value 6.3"
    //   });
    // });

    // it('should not select an item in expandable, expanded, disabled and collapsed group (KEY = "ArrowDown")', async () => {
    //   await comboBoxRef.setProperty("value", "Value 10");
    //   await page.waitForChanges();
    //   await pressKey("ArrowDown");
    //   await closeComboBoxAndCheckValues("Value 12", confirmKey, {
    //     formValueBeforeClose: "Value 10"
    //   });
    // });

    // it('should not select an item in expandable, expanded, disabled and collapsed group (KEY = "ArrowUp")', async () => {
    //   await comboBoxRef.setProperty("value", "Value 12");
    //   await page.waitForChanges();
    //   await pressKey("ArrowUp");
    //   await closeComboBoxAndCheckValues("Value 10", confirmKey, {
    //     formValueBeforeClose: "Value 12"
    //   });
    // });

    // it.todo(
    //   'should not select an item in a collapsed group (KEY = "ArrowDown")'
    // );
    // it.todo('should not select an item in a collapsed group (KEY = "ArrowUp")');
  });
};

const keysToConfirmClose: ConfirmKeys[] = [
  "Enter",
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

strictValues.forEach(strict => {
  keysToConfirmClose.forEach(keyToConfirmClose =>
    testKeyboard(keyToConfirmClose, strict)
  );
});

// const keysToConfirmClose: ConfirmKeys[] = [
//   "Enter"
//   // "Escape",

//   // TODO: Fix this test
//   // "NumpadEnter",

//   // "Tab",
//   // "LeftMouseClick"

//   // TODO: Fix this test
//   // "MiddleMouseClick",
//   // "RightMouseClick"
// ];
// const strictValues = [true];

// strictValues.forEach(strict => {
//   keysToConfirmClose.forEach(keyToConfirmClose =>
//     testKeyboard(keyToConfirmClose, strict)
//   );
// });
