import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { EditType } from "../types";

const FORM_ENTRY = "edit";

const getTestDescription = (
  multiline: boolean,
  readonly: boolean,
  type?: EditType
) => {
  const readonlyCaption = readonly ? "[readonly]" : "[editable]";

  if (multiline) {
    return `[ch-edit][picture][multiline]${readonlyCaption}`;
  }

  return `[ch-edit][picture][default][type=\"${type}\"]${readonlyCaption}`;
};

const testPicture = (
  multiline: boolean,
  readonly: boolean,
  type?: EditType
) => {
  describe(getTestDescription(multiline, readonly, type), () => {
    let page: E2EPage;
    let editRef: E2EElement;

    const checkValues = async (
      value: string | undefined | null,
      pictureValue: string,
      focused: boolean,
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

      if (focused) {
        expect(pageEvaluation.inputValue).toBe(value);
      } else {
        expect(pageEvaluation.inputValue).toBe(pictureValue);
      }

      if (disabled) {
        expect(pageEvaluation.formData[FORM_ENTRY]).toBe(undefined);
      } else {
        expect(pageEvaluation.formData[FORM_ENTRY]).toBe(value);
      }
    };

    const getTemplate = (disabled: boolean, readonly: boolean) =>
      multiline
        ? `<form>
        <button>Dummy button to manage focus</button>
        <ch-edit name="${FORM_ENTRY}" multiline${disabled ? " disabled" : ""}${
            readonly ? " readonly" : ""
          }></ch-edit>
      </form>`
        : `<form>
        <button>Dummy button to manage focus</button>
        <ch-edit name="${FORM_ENTRY}" type="${type}"${
            disabled ? " disabled" : ""
          }${readonly ? " readonly" : ""}></ch-edit>
      </form>`;

    // For some reason, the function can not be serialized and set using the
    // setProperty method
    const setPictureCallback = async () => {
      await page.evaluate(() => {
        const dummyPictureCallback = (value: any, picture: string): string => {
          if (Number.isInteger(Number(value)) && picture.includes("$")) {
            return `$ ${Number(value).toLocaleString()}`;
          }
          if (value === "a") {
            return "b";
          }

          return `dummy ${value}`;
        };

        document.querySelector("ch-edit").pictureCallback =
          dummyPictureCallback;
      });

      await page.waitForChanges();
    };

    beforeEach(async () => {
      page = await newE2EPage({
        failOnConsoleError: true,
        html: getTemplate(false, false)
      });
      editRef = await page.find("ch-edit");
    });

    it("should have picture = undefined by default", async () => {
      expect(await editRef.getProperty("picture")).toBeUndefined();
    });

    it("should have pictureCallback = undefined by default", async () => {
      expect(await editRef.getProperty("pictureCallback")).toBeUndefined();
    });

    it("should not apply the picture if the picture property is not defined", async () => {
      await editRef.setProperty("value", "hello world");
      await setPictureCallback();
      await page.waitForChanges();
      await checkValues("hello world", "hello world", false, false);
    });

    it("should not apply the picture if the pictureCallback property is not defined", async () => {
      await editRef.setProperty("picture", "$ZZZ.ZZZ");
      await editRef.setProperty("value", "hello world");
      await page.waitForChanges();
      await checkValues("hello world", "hello world", false, false);
    });

    it("should apply the picture if the picture and pictureCallback properties are defined and the element is not focused", async () => {
      await editRef.setProperty("picture", "$ZZZ.ZZZ");
      await setPictureCallback();
      await editRef.setProperty("value", "hello world");
      await page.waitForChanges();

      await checkValues("hello world", "dummy hello world", false, false);
    });

    it("should not apply the picture if the element is focused", async () => {
      await editRef.setProperty("picture", "$ZZZ.ZZZ");
      await setPictureCallback();
      await editRef.setProperty("value", "hello world");
      await page.focus("ch-edit");
      await page.waitForChanges();
      await page.waitForChanges();

      await checkValues("hello world", "dummy hello world", true, false);
    });

    it("should switch between the picture and the value when the element's focus changes", async () => {
      await editRef.setProperty("picture", "$ZZZ.ZZZ");
      await setPictureCallback();
      await editRef.setProperty("value", "hello world");
      await page.waitForChanges();
      await checkValues("hello world", "dummy hello world", false, false);

      await page.focus("ch-edit");
      await page.waitForChanges();
      await checkValues("hello world", "dummy hello world", true, false);

      await page.focus("button");
      await page.waitForChanges();
      await checkValues("hello world", "dummy hello world", false, false);
    });

    it("should update the picture value when updating the value in the interface", async () => {
      await editRef.setProperty("picture", "$ZZZ.ZZZ");
      await setPictureCallback();

      await editRef.setProperty("value", "hello world");
      await page.waitForChanges();
      await checkValues("hello world", "dummy hello world", false, false);

      await editRef.setProperty("value", "123");
      await page.waitForChanges();
      await checkValues("123", "$ 123", false, false);

      await editRef.setProperty("value", "a");
      await page.waitForChanges();
      await checkValues("a", "b", false, false);
    });

    // TODO: Fix this test for the "email" and "url" types
    if (!readonly && type !== "email" && type !== "url")
      it("should update the picture value on key press when the focus is lost", async () => {
        await editRef.setProperty("picture", "$ZZZ.ZZZ");
        await setPictureCallback();
        await editRef.setProperty("value", "hello world");
        await page.focus("ch-edit");
        await page.waitForChanges();

        const inputRef = await page.find(
          multiline ? "ch-edit >>> textarea" : "ch-edit >>> input"
        );
        await inputRef.press("a");
        await inputRef.press("s");
        await inputRef.press("d");
        await page.waitForChanges();
        await checkValues(
          "hello worldasd",
          "does not matter the value",
          true,
          false
        );

        await page.focus("button");
        await page.waitForChanges();
        await checkValues(
          "hello worldasd",
          "dummy hello worldasd",
          false,
          false
        );
      });

    it("should re-render if the picture changes", async () => {
      await editRef.setProperty("picture", "ZZZ.ZZZ");
      await setPictureCallback();
      await editRef.setProperty("value", "123");
      await page.waitForChanges();
      await checkValues("123", "dummy 123", false, false);

      await editRef.setProperty("picture", "$ZZZ.ZZZ");
      await page.waitForChanges();
      await checkValues("123", "$ 123", false, false);
    });

    it.todo("should re-render if the pictureCallback changes");

    it("should remove the picture value when setting picture = undefined", async () => {
      await editRef.setProperty("picture", "ZZZ.ZZZ");
      await setPictureCallback();
      await editRef.setProperty("value", "123");
      await page.waitForChanges();
      await checkValues("123", "dummy 123", false, false);

      await editRef.setProperty("picture", undefined);
      await page.waitForChanges();
      await checkValues("123", "123", false, false);

      expect(await editRef.getProperty("picture")).toBeUndefined();
    });

    it("should remove the picture value when setting picture = null", async () => {
      await editRef.setProperty("picture", "ZZZ.ZZZ");
      await setPictureCallback();
      await editRef.setProperty("value", "123");
      await page.waitForChanges();
      await checkValues("123", "dummy 123", false, false);

      await editRef.setProperty("picture", null);
      await page.waitForChanges();
      await checkValues("123", "123", false, false);

      expect(await editRef.getProperty("picture")).toBeNull();
    });

    it("should remove the picture value when setting pictureCallback = null", async () => {
      await editRef.setProperty("picture", "ZZZ.ZZZ");
      await setPictureCallback();
      await editRef.setProperty("value", "123");
      await page.waitForChanges();
      await checkValues("123", "dummy 123", false, false);

      await editRef.setProperty("pictureCallback", null);
      await page.waitForChanges();
      await checkValues("123", "123", false, false);

      expect(await editRef.getProperty("pictureCallback")).toBeNull();
    });
  });
};

[false, true].forEach(readonly => {
  (
    [
      // "number"
      // "date",
      // "datetime-local",
      "email",
      // TODO: Remove file type in the ch-edit
      // "file",
      "password",
      "search",
      "tel",
      "text",
      // "time",
      "url"
    ] satisfies EditType[]
  ).forEach(type => testPicture(false, readonly, type));

  // testPicture(true, readonly);
});
