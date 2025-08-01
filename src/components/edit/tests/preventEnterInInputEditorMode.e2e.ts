import {
  E2EElement,
  E2EPage,
  EventSpy,
  newE2EPage
} from "@stencil/core/testing";

const testPreventEnterInInputEditorMode = (
  multiline: boolean,
  type?: HTMLChEditElement["type"]
) =>
  describe("[ch-edit][preventEnterInInputEditorMode]", () => {
    describe(multiline ? "[multiline]" : `[type="${type}"]`, () => {
      let page: E2EPage;
      let editRef: E2EElement;
      let keyDownEventSpy: EventSpy;

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
        keyDownEventSpy = await editRef.spyOnEvent("keydown");
      });

      const pressEnter = async () => {
        const inputRef = await page.find(
          "ch-edit >>> input, ch-edit >>> textarea"
        );

        await inputRef.press("Enter");
        await page.waitForChanges();
      };

      const dispatchCompositionStart = async () => {
        await page.evaluate(() => {
          document
            .querySelector("ch-edit")
            .shadowRoot.querySelector("input,textarea")
            .dispatchEvent(
              new CompositionEvent("compositionstart", {
                bubbles: true,
                cancelable: true,
                composed: true,
                data: "test",
                view: window
              })
            );
        });
        await page.waitForChanges();
      };

      const dispatchCompositionEnd = async () => {
        await page.evaluate(() => {
          document
            .querySelector("ch-edit")
            .shadowRoot.querySelector("input,textarea")
            .dispatchEvent(
              new CompositionEvent("compositionend", {
                bubbles: true,
                cancelable: true,
                composed: true,
                data: "test",
                view: window
              })
            );
        });
        await page.waitForChanges();
      };

      it("should not prevent the Enter key by default", async () => {
        await pressEnter();

        expect(keyDownEventSpy).toHaveReceivedEventTimes(1);
      });

      it("should not prevent the Enter key even if preventEnterInInputEditorMode but the user did not enter in IME (compositionstart event)", async () => {
        editRef.setProperty("preventEnterInInputEditorMode", true);
        await page.waitForChanges();
        await pressEnter();

        expect(keyDownEventSpy).toHaveReceivedEventTimes(1);
      });

      it("should not prevent the Enter key if the compositionstart event is fired but preventEnterInInputEditorMode is not set", async () => {
        await dispatchCompositionStart();
        await pressEnter();

        expect(keyDownEventSpy).toHaveReceivedEventTimes(1);
      });

      it("should prevent the Enter key if it is pressed after the compositionstart event when preventEnterInInputEditorMode is set", async () => {
        editRef.setProperty("preventEnterInInputEditorMode", true);
        await page.waitForChanges();
        await dispatchCompositionStart();
        await pressEnter();

        expect(keyDownEventSpy).toHaveReceivedEventTimes(0);
      });

      it("should prevent the Enter key if it is pressed between the compositionstart and compositionend events when preventEnterInInputEditorMode is set", async () => {
        editRef.setProperty("preventEnterInInputEditorMode", true);
        await page.waitForChanges();
        await dispatchCompositionStart();
        await pressEnter();
        await dispatchCompositionEnd();

        expect(keyDownEventSpy).toHaveReceivedEventTimes(0);
      });

      it("should not prevent the Enter key if the Enter is pressed after compositionend when preventEnterInInputEditorMode is set", async () => {
        editRef.setProperty("preventEnterInInputEditorMode", true);
        await page.waitForChanges();
        await dispatchCompositionStart();
        await dispatchCompositionEnd();
        await pressEnter();

        expect(keyDownEventSpy).toHaveReceivedEventTimes(1);
      });

      it("should prevent any enters before the compositionend when preventEnterInInputEditorMode is set", async () => {
        editRef.setProperty("preventEnterInInputEditorMode", true);
        await page.waitForChanges();
        await dispatchCompositionStart();
        await pressEnter();
        await pressEnter();
        await pressEnter();
        await dispatchCompositionEnd();
        await pressEnter();
        await pressEnter();

        expect(keyDownEventSpy).toHaveReceivedEventTimes(2);
      });

      it.todo(
        "should not trigger the form submit event when pressing the Enter key with preventEnterInInputEditorMode set and the IME is active"
      );
    });
  });

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
  ] satisfies HTMLChEditElement["type"][]
).forEach(type => testPreventEnterInInputEditorMode(false, type));

testPreventEnterInInputEditorMode(true);
