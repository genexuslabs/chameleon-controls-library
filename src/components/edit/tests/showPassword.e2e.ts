import {
  E2EElement,
  E2EPage,
  EventSpy,
  newE2EPage
} from "@stencil/core/testing";
import { EditType } from "../types";

const FORM_ENTRY = "edit";

const VALUE = "hello world";
const VALUE_DATE = "1988-11-24";
const VALUE_DATE_TIME = "1988-11-24T00:00";
const VALUE_TIME = "00:00:00";
const VALUE_NUMBER = "1988";
const VALUE_URL = "www.genexus.com";
const VALUE_EMAIL = "info@genexus.com";
const VALUE_TELEPHONE = "+598 2601-2082";

const testShowPassword = (
  type: EditType,
  disabled: boolean,
  readonly: boolean
) => {
  describe(`[ch-edit][showPassword][type=\"${type}\"][disabled = ${disabled}][readonly = ${readonly}]`, () => {
    let page: E2EPage;
    let editRef: E2EElement;
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

      const pageEvaluation = await page.evaluate(() => {
        const formElement = document.querySelector("form");
        const editDOMRef = document.querySelector("ch-edit");

        const formData = new FormData(formElement);
        return {
          formData: Object.fromEntries(formData.entries()),
          // The input's value attribute is not reflected in the DOM
          inputValue: editDOMRef.shadowRoot.querySelector("input").value
        };
      });

      if (disabled) {
        expect(pageEvaluation.formData[FORM_ENTRY]).toBe(undefined);
      } else {
        expect(pageEvaluation.formData[FORM_ENTRY]).toBe(value);
      }

      expect(pageEvaluation.inputValue).toBe(value);
    };

    beforeEach(async () => {
      page = await newE2EPage({
        failOnConsoleError: true,
        html: `<form>
              <ch-edit name="edit" type="${type}" ${
          disabled ? "disabled" : ""
        } ${readonly ? "readonly" : ""}></ch-edit>
              <button type="button"></button>
            </form>`
      });
      editRef = await page.find("ch-edit");
      inputEventSpy = await editRef.spyOnEvent("input");
    });

    const getInputRef = () => page.find("ch-edit >>> input");

    it("should set the explicit type by default", async () => {
      expect(await getInputRef()).toEqualAttribute("type", type);
    });

    it("should set the explicit type when showPassword = false", async () => {
      editRef.setProperty("showPassword", false);
      await page.waitForChanges();

      expect(await getInputRef()).toEqualAttribute("type", type);
    });

    if (type === "password") {
      it('should set type="text" in the internal input when showPassword = true', async () => {
        editRef.setProperty("showPassword", true);
        await page.waitForChanges();

        expect(await getInputRef()).toEqualAttribute("type", "text");
      });
    } else {
      it("should not change the internal type of the input, even if showPassword = true", async () => {
        editRef.setProperty("showPassword", true);
        await page.waitForChanges();

        expect(await getInputRef()).toEqualAttribute("type", type);
      });
    }

    it("should not update the internal input value when setting showPassword = true", async () => {
      editRef.setProperty("value", getValueByType());
      editRef.setProperty("showPassword", true);
      await page.waitForChanges();

      checkValues(getValueByType(), disabled);
      expect(inputEventSpy).not.toHaveReceivedEvent();
    });
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
).forEach(type =>
  [false, true].forEach(disabled =>
    [false, true].forEach(readonly =>
      testShowPassword(type, disabled, readonly)
    )
  )
);
