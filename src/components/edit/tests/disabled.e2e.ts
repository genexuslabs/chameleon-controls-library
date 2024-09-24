import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { EditType } from "../types";

const FORM_ENTRY = "edit";
const VALUE_1 = "hello";
const VALUE_2 = "hello world";

const VALUE_DATE_1 = "1988-11-24";
const VALUE_DATE_2 = "2003-11-24";

const VALUE_DATE_TIME_1 = "1988-11-24T00:00";
const VALUE_DATE_TIME_2 = "2003-11-24T00:00";

const VALUE_TIME_1 = "00:00:00";
const VALUE_TIME_2 = "01:01:01";

const VALUE_NUMBER_1 = "1988";
const VALUE_NUMBER_2 = "2003";

const getTestDescription = (
  multiline: boolean,
  readonly: boolean,
  type?: EditType
) => {
  const readonlyCaption = readonly ? "[readonly]" : "[editable]";

  if (multiline) {
    return `[ch-edit][disabled][multiline]${readonlyCaption}`;
  }

  return `[ch-edit][disabled][default][type=\"${type}\"]${readonlyCaption}`;
};

const testDisabled = (
  multiline: boolean,
  readonly: boolean,
  type?: EditType
) => {
  const getValueByType = (valueType: 1 | 2) => {
    if (valueType === 1) {
      if (type === "date") {
        return VALUE_DATE_1;
      }
      if (type === "datetime-local") {
        return VALUE_DATE_TIME_1;
      }
      if (type === "time") {
        return VALUE_TIME_1;
      }
      if (type === "number") {
        return VALUE_NUMBER_1;
      }

      return VALUE_1;
    }

    if (type === "date") {
      return VALUE_DATE_2;
    }
    if (type === "datetime-local") {
      return VALUE_DATE_TIME_2;
    }
    if (type === "time") {
      return VALUE_TIME_2;
    }
    if (type === "number") {
      return VALUE_NUMBER_2;
    }

    return VALUE_2;
  };

  describe(getTestDescription(multiline, readonly, type), () => {
    let page: E2EPage;
    let editRef: E2EElement;

    // Utility as a WA since the "toHaveAttribute" function from puppeteer does
    // not work properly
    const checkValues = async (
      value: string | undefined,
      disabled: boolean | undefined | null
    ) => {
      expect(await editRef.getProperty("value")).toBe(value);

      const pageEvaluation = await page.evaluate(isMultiline => {
        const formElement = document.querySelector("form");
        const editDOMRef = document.querySelector("ch-edit");

        const formData = new FormData(formElement);
        return {
          formData: Object.fromEntries(formData.entries()),
          disabledEditAttr: editDOMRef.getAttribute("disabled"),
          disabledInputAttr: editDOMRef.shadowRoot
            .querySelector(isMultiline ? "textarea" : "input")
            .getAttribute("disabled")
        };
      }, multiline);

      if (disabled) {
        expect(pageEvaluation.disabledEditAttr).toBe("");
        expect(pageEvaluation.disabledInputAttr).toBe("");

        expect(pageEvaluation.formData[FORM_ENTRY]).toBe(undefined);
      } else {
        expect(pageEvaluation.disabledEditAttr).toBeNull();
        expect(pageEvaluation.disabledInputAttr).toBeNull();

        expect(pageEvaluation.formData[FORM_ENTRY]).toBe(value);
      }
    };

    const getTemplate = (disabled: boolean, readonly: boolean) =>
      (multiline
        ? `<form>
        <ch-edit name="${FORM_ENTRY}" multiline${disabled ? " disabled" : ""}${
            readonly ? " readonly" : ""
          }></ch-edit>
      </form>`
        : `<form>
        <ch-edit name="${FORM_ENTRY}" type="${type}"${
            disabled ? " disabled" : ""
          }${readonly ? " readonly" : ""}></ch-edit>
      </form>`) +
      `
      <style>
        ch-edit {
          background-color: rgb(0, 0, 255);
        }

        ch-edit[disabled] {
          background-color: rgb(255, 0, 0);
        }
      </style>`;

    beforeEach(async () => {
      page = await newE2EPage({
        failOnConsoleError: true,
        html: getTemplate(false, readonly)
      });
      editRef = await page.find("ch-edit");
    });

    it("should have disabled = false by default", async () => {
      await checkValues(undefined, false);
    });

    it('should not reflect the "disabled = undefined" property', async () => {
      await editRef.setProperty("disabled", undefined);
      await page.waitForChanges();
      await checkValues(undefined, false);
    });

    it('should not reflect the "disabled = null" property', async () => {
      await editRef.setProperty("disabled", null);
      await page.waitForChanges();
      await checkValues(undefined, false);
    });

    it('should reflect the "disabled = true" property to allow customizing the control when it\'s disabled', async () => {
      await editRef.setProperty("disabled", true);
      await page.waitForChanges();
      await checkValues(undefined, true);
    });

    it('should reflect the "disabled = true" property if it\'s set by default with true', async () => {
      await page.setContent(getTemplate(true, readonly));
      await page.waitForChanges();
      await checkValues(undefined, true);
    });

    it('should remove the "disabled" attr when switching from disabled = "true" to "false"', async () => {
      await editRef.setProperty("disabled", true);
      await page.waitForChanges();
      await checkValues(undefined, true);

      await editRef.setProperty("disabled", false);
      await page.waitForChanges();
      await checkValues(undefined, false);
    });

    it("should not submit the value if disabled", async () => {
      await editRef.setProperty("disabled", true);
      await editRef.setProperty("value", getValueByType(1));
      await page.waitForChanges();
      await checkValues(getValueByType(1), true);
    });

    it('should submit the value when switching from disabled = "true" to "false"', async () => {
      await editRef.setProperty("disabled", true);
      await editRef.setProperty("value", getValueByType(1));
      await page.waitForChanges();
      await checkValues(getValueByType(1), true);

      await editRef.setProperty("disabled", false);
      await page.waitForChanges();
      await checkValues(getValueByType(1), false);

      await editRef.setProperty("value", getValueByType(2));
      await page.waitForChanges();
      await checkValues(getValueByType(2), false);

      await editRef.setProperty("value", undefined);
      await page.waitForChanges();
      await checkValues(undefined, false);
    });

    it("should properly style the control when disabled and when it is not", async () => {
      expect((await editRef.getComputedStyle()).backgroundColor).toBe(
        "rgb(0, 0, 255)"
      );

      await editRef.setProperty("disabled", true);
      await page.waitForChanges();
      expect((await editRef.getComputedStyle()).backgroundColor).toBe(
        "rgb(255, 0, 0)"
      );

      await editRef.setProperty("disabled", false);
      await page.waitForChanges();
      expect((await editRef.getComputedStyle()).backgroundColor).toBe(
        "rgb(0, 0, 255)"
      );
    });

    it.todo("should not fire the input event if disabled");

    it.todo("should not fire the change event if disabled");

    it.todo("should not be focusable if disabled");
  });
};

[false, true].forEach(readonly => {
  (
    [
      "number",
      "date",
      "datetime-local",
      "email",
      // TODO: Remove file type in the ch-edit
      // "file",
      "password",
      "search",
      "tel",
      "text",
      "time",
      "url"
    ] satisfies EditType[]
  ).forEach(type => testDisabled(false, readonly, type));

  testDisabled(true, readonly);
});
