import {
  E2EElement,
  E2EPage,
  EventSpy,
  newE2EPage
} from "@stencil/core/testing";
import { EditType } from "../types";
import { isActiveElement } from "../../../testing/utils.e2e";

// Increase/adjust these values if CI tests fail
// const NO_DEBOUNCE_THRESHOLD_TIME = 140;
// const DEBOUNCE_VALUE = 180;
// const WAIT_FOR_DEBOUNCE_VALUE = DEBOUNCE_VALUE + 30;
const FORM_ENTRY = "edit";
const CLEAR_BUTTON_SELECTOR = "ch-edit >>> [part*='clear-button']";

const VALUE = "hello world";
const VALUE_DATE = "1988-11-24";
const VALUE_DATE_TIME = "1988-11-24T00:00";
const VALUE_TIME = "00:00:00";
const VALUE_NUMBER = "1988";
const VALUE_URL = "www.genexus.com";
const VALUE_EMAIL = "info@genexus.com";
const VALUE_TELEPHONE = "+598 2601-2082";

const getTestDescription = (multiline: boolean, type?: EditType) => {
  if (multiline) {
    return "[ch-edit][clear-button][multiline]";
  }

  return `[ch-edit][clear-button][default][type=\"${type}\"]`;
};

const testWithDebounce = (multiline: boolean, type?: EditType) => {
  describe(getTestDescription(multiline, type), () => {
    let page: E2EPage;
    let editRef: E2EElement;
    let inputRef: E2EElement;
    let inputEventSpy: EventSpy;

    const getValueByType = () => {
      if (type === "date") {
        return VALUE_DATE;
      }
      if (type === "datetime-local") {
        return VALUE_DATE_TIME;
      }
      if (type === "time") {
        return VALUE_TIME;
      }
      if (type === "number") {
        return VALUE_NUMBER;
      }
      if (type === "url") {
        return VALUE_URL;
      }
      if (type === "email") {
        return VALUE_EMAIL;
      }
      if (type === "tel") {
        return VALUE_TELEPHONE;
      }

      return VALUE;
    };

    const checkValues = async (
      value: string | undefined | null,
      disabled: boolean | undefined | null
    ) => {
      expect(await editRef.getProperty("value")).toBe(value);

      const pageEvaluation = await page.evaluate(isMultiline => {
        const formElement = document.querySelector("form");
        const editDOMRef = document.querySelector("ch-edit");

        const formData = new FormData(formElement);
        return {
          formData: Object.fromEntries(formData.entries()),
          // The input's value attribute is not reflected in the DOM
          inputValue: editDOMRef.shadowRoot.querySelector(
            isMultiline ? "textarea" : "input"
          ).value
        };
      }, multiline);

      if (disabled) {
        expect(pageEvaluation.formData[FORM_ENTRY]).toBe(undefined);
      } else {
        expect(pageEvaluation.formData[FORM_ENTRY]).toBe(value);
      }

      expect(pageEvaluation.inputValue).toBe(value);
    };

    const getClearButtonRef = async () =>
      await page.find(CLEAR_BUTTON_SELECTOR);

    beforeEach(async () => {
      page = await newE2EPage({
        failOnConsoleError: true,
        html: multiline
          ? `<form>
              <ch-edit name="edit" multiline></ch-edit>
              <button type="button"></button>
            </form>`
          : `<form>
              <ch-edit name="edit" type="${type}"></ch-edit>
              <button type="button"></button>
            </form>`
      });
      editRef = await page.find("ch-edit");
      inputEventSpy = await editRef.spyOnEvent("input");
      inputRef = await page.find(
        multiline ? "ch-edit >>> textarea" : "ch-edit >>> input"
      );
    });

    it("should not display the clear button by default", async () => {
      const clearButtonRef = await getClearButtonRef();
      expect(clearButtonRef).toBeFalsy();
    });

    if (type === "search" && !multiline) {
      it("should display the clear button when the value is set in the interface", async () => {
        editRef.setProperty("value", VALUE);
        await page.waitForChanges();

        const clearButtonRef = await getClearButtonRef();
        expect(clearButtonRef).toBeTruthy();
      });

      it("should display the clear button when the value is set via keyboard", async () => {
        await inputRef.press("h");
        await inputRef.press("e");
        await inputRef.press("l");
        await inputRef.press("l");
        await inputRef.press("o");
        await page.waitForChanges();

        const clearButtonRef = await getClearButtonRef();
        expect(clearButtonRef).toBeTruthy();
      });

      it("should focus the input after clicking the clear button", async () => {
        editRef.setProperty("value", VALUE);
        await page.waitForChanges();

        await page.click(CLEAR_BUTTON_SELECTOR);
        await page.waitForChanges();

        const inputIsFocused = await isActiveElement(page, "ch-edit >>> input");
        expect(inputIsFocused).toBe(true);
      });

      it("should hide the clear button after clearing the value", async () => {
        editRef.setProperty("value", VALUE);
        await page.waitForChanges();

        await page.click(CLEAR_BUTTON_SELECTOR);
        await page.waitForChanges();

        checkValues("", false);
        expect(inputEventSpy).toHaveReceivedEventDetail("");
      });

      it("should hide the clear button after clearing the value in the interface", async () => {
        editRef.setProperty("value", VALUE);
        await page.waitForChanges();

        const clearButtonRef = await getClearButtonRef();
        expect(clearButtonRef).toBeTruthy();

        editRef.setProperty("value", "");
        await page.waitForChanges();

        checkValues("", false);
        expect(inputEventSpy).toHaveReceivedEventTimes(0);
      });

      it('should not work the clear button when disabled = "true"', async () => {
        editRef.setProperty("value", VALUE);
        editRef.setProperty("disabled", true);
        await page.waitForChanges();

        await page.click(CLEAR_BUTTON_SELECTOR);
        await page.waitForChanges();
        checkValues(VALUE, true);
        expect(inputEventSpy).toHaveReceivedEventTimes(0);
      });

      it('should work the clear button when readonly = "true"', async () => {
        editRef.setProperty("value", VALUE);
        editRef.setProperty("readonly", true);
        await page.waitForChanges();

        await page.click(CLEAR_BUTTON_SELECTOR);
        await page.waitForChanges();
        checkValues("", false);
        expect(inputEventSpy).toHaveReceivedEventDetail("");
      });

      it('should not work the clear button when disabled = "true" and readonly = "true"', async () => {
        editRef.setProperty("value", VALUE);
        editRef.setProperty("disabled", true);
        editRef.setProperty("readonly", true);
        await page.waitForChanges();

        await page.click(CLEAR_BUTTON_SELECTOR);
        await page.waitForChanges();
        checkValues(VALUE, true);
        expect(inputEventSpy).toHaveReceivedEventTimes(0);
      });

      it.todo(
        "should debounce the input event clicking the clear button if debounce > 0"
      );
    } else {
      it("should not display the clear button when the value is set", async () => {
        editRef.setProperty("value", getValueByType());
        await page.waitForChanges();

        const clearButtonRef = await getClearButtonRef();
        expect(clearButtonRef).toBeFalsy();
      });
    }
  });
};

// TODO: Complete the test suite for all types
(
  [
    "number",
    "date",
    "datetime-local",
    "email",
    // "file",
    "password",
    "search",
    "tel",
    "text",
    "time",
    "url"
  ] satisfies EditType[]
).forEach(type => testWithDebounce(false, type));

testWithDebounce(true);
