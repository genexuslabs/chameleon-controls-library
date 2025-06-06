import {
  E2EElement,
  E2EPage,
  EventSpy,
  newE2EPage
} from "@stencil/core/testing";
import { EditType } from "../types";

const testShowPasswordButton = (
  type: EditType,
  showPasswordButton: boolean,
  disabled: boolean,
  readonly: boolean
) => {
  describe(`[ch-edit][showPasswordButton = ${showPasswordButton}][type=\"${type}\"][disabled = ${disabled}][readonly = ${readonly}]`, () => {
    let page: E2EPage;
    let editRef: E2EElement;
    let passwordVisibilityChangeSpy: EventSpy;

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
      editRef.setProperty("showPasswordButton", showPasswordButton);
      passwordVisibilityChangeSpy = await editRef.spyOnEvent(
        "passwordVisibilityChange"
      );
      await page.waitForChanges();
    });

    const getShowPasswordButtonRef = () =>
      page.find("ch-edit >>> [part*='show-password-button']");

    // showPasswordButton displayed
    if (type === "password" && showPasswordButton) {
      it("should render the show password button", async () => {
        expect(await getShowPasswordButtonRef()).toBeTruthy();
      });

      // Disabled showPasswordButton
      if (disabled) {
        it("should not toggle the password visibility when clicking on the show password button, because it is disabled", async () => {
          await (await getShowPasswordButtonRef()).click();

          await page.waitForChanges();

          expect(await editRef.getProperty("showPassword")).toBe(false);
          expect(passwordVisibilityChangeSpy).not.toHaveReceivedEvent();
        });
      }
      // Enabled showPasswordButton
      else {
        it("should toggle the password visibility when clicking on the show password button", async () => {
          await (await getShowPasswordButtonRef()).click();
          await page.waitForChanges();

          expect(await editRef.getProperty("showPassword")).toBe(true);
          expect(passwordVisibilityChangeSpy).toHaveReceivedEventDetail(true);

          await (await getShowPasswordButtonRef()).click();
          await page.waitForChanges();

          expect(await editRef.getProperty("showPassword")).toBe(false);
          expect(passwordVisibilityChangeSpy).toHaveReceivedEventDetail(false);
        });
      }
    } else {
      it("should not render the show password button", async () => {
        expect(await getShowPasswordButtonRef()).toBeFalsy();
      });
    }

    it("should not render the show password button when multiline = true", async () => {
      editRef.setProperty("multiline", true);
      await page.waitForChanges();

      expect(await getShowPasswordButtonRef()).toBeFalsy();
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
  [false, true].forEach(showPassword =>
    [false, true].forEach(disabled =>
      [false, true].forEach(readonly =>
        testShowPasswordButton(type, showPassword, disabled, readonly)
      )
    )
  )
);
