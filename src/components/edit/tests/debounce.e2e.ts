import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { EditType } from "../types";
import { delayTest } from "../../../testing/utils.e2e";

// Increase/adjust these values if CI tests fail
const NO_DEBOUNCE_THRESHOLD_TIME = 140;
const DEBOUNCE_VALUE = 180;
const WAIT_FOR_DEBOUNCE_VALUE = DEBOUNCE_VALUE + 30;

const getTestDescription = (multiline: boolean, type?: EditType) => {
  if (multiline) {
    return "[ch-edit][debounce][multiline]";
  }

  return `[ch-edit][debounce][default][type=\"${type}\"]`;
};

const testWithDebounce = (multiline: boolean, type?: EditType) => {
  describe(getTestDescription(multiline, type), () => {
    let page: E2EPage;
    let editRef: E2EElement;
    let inputRef: E2EElement;

    const checkValues = async (value: string | undefined) => {
      expect(await editRef.getProperty("value")).toBe(value);

      const formValues = await page.evaluate(() => {
        const formElement = document.querySelector("form") as HTMLFormElement;
        const formData = new FormData(formElement);
        return Object.fromEntries(formData.entries());
      });

      expect(formValues.edit).toBe(value);
    };

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
      inputRef = await page.find(
        multiline ? "ch-edit >>> textarea" : "ch-edit >>> input"
      );
    });

    it("should have debounce = 0 by default", async () => {
      expect(await editRef.getProperty("debounce")).toBe(0);
    });

    it("should not debounce by default (one character)", async () => {
      const inputEvent = await editRef.spyOnEvent("input");
      const startTime = performance.now();
      await inputRef.press("h");
      await page.waitForChanges();
      expect(inputEvent).toHaveReceivedEvent();
      const elapsedTime = performance.now() - startTime;

      expect(elapsedTime).toBeLessThan(NO_DEBOUNCE_THRESHOLD_TIME);
      await checkValues("h");
    });

    it("should not debounce by default (more than one character)", async () => {
      const inputEvent = await editRef.spyOnEvent("input");
      const startTime = performance.now();
      await inputRef.press("h");
      await inputRef.press("e");
      await inputRef.press("l");
      await inputRef.press("l");
      await inputRef.press("o");
      await page.waitForChanges();
      expect(inputEvent).toHaveReceivedEvent();
      const elapsedTime = performance.now() - startTime;

      expect(elapsedTime).toBeLessThan(NO_DEBOUNCE_THRESHOLD_TIME);
      await checkValues("hello");
    });

    it("should not debounce if debounce = 0 (one character)", async () => {
      editRef.setProperty("debounce", 0);
      await page.waitForChanges();

      const inputEvent = await editRef.spyOnEvent("input");
      const startTime = performance.now();
      await inputRef.press("h");
      await page.waitForChanges();
      expect(inputEvent).toHaveReceivedEvent();
      const elapsedTime = performance.now() - startTime;

      expect(elapsedTime).toBeLessThan(NO_DEBOUNCE_THRESHOLD_TIME);
      await checkValues("h");
    });

    it("should not debounce if debounce = 0 (more than one character)", async () => {
      editRef.setProperty("debounce", 0);
      await page.waitForChanges();

      const inputEvent = await editRef.spyOnEvent("input");
      const startTime = performance.now();
      await inputRef.press("h");
      await inputRef.press("e");
      await inputRef.press("l");
      await inputRef.press("l");
      await inputRef.press("o");
      await page.waitForChanges();
      expect(inputEvent).toHaveReceivedEvent();
      const elapsedTime = performance.now() - startTime;

      expect(elapsedTime).toBeLessThan(NO_DEBOUNCE_THRESHOLD_TIME);
      await checkValues("hello");
    });

    it("should debounce when setting a debounce > 0 (one character)", async () => {
      editRef.setProperty("debounce", DEBOUNCE_VALUE);
      await page.waitForChanges();

      const inputEvent = editRef.waitForEvent("input");
      const startTime = performance.now();
      await inputRef.press("h");
      await page.waitForChanges();

      await inputEvent;
      const elapsedTime = performance.now() - startTime;

      expect(inputEvent).toBeTruthy();
      expect(elapsedTime).not.toBeLessThan(NO_DEBOUNCE_THRESHOLD_TIME);
      expect(elapsedTime).toBeLessThan(
        NO_DEBOUNCE_THRESHOLD_TIME + DEBOUNCE_VALUE
      );
      await checkValues("h");
    });

    it("should debounce when typing characters with delay greater than the debounce", async () => {
      editRef.setProperty("debounce", DEBOUNCE_VALUE);
      await page.waitForChanges();

      const inputEvent = await editRef.spyOnEvent("input");
      await inputRef.press("h");
      await delayTest(WAIT_FOR_DEBOUNCE_VALUE);
      expect(inputEvent).toHaveReceivedEventTimes(1);

      await inputRef.press("e");
      await delayTest(WAIT_FOR_DEBOUNCE_VALUE);
      expect(inputEvent).toHaveReceivedEventTimes(2);

      await inputRef.press("l");
      await delayTest(WAIT_FOR_DEBOUNCE_VALUE);
      expect(inputEvent).toHaveReceivedEventTimes(3);

      await inputRef.press("l");
      await delayTest(WAIT_FOR_DEBOUNCE_VALUE);
      expect(inputEvent).toHaveReceivedEventTimes(4);

      await inputRef.press("o");
      await delayTest(WAIT_FOR_DEBOUNCE_VALUE);
      expect(inputEvent).toHaveReceivedEventTimes(5);

      await checkValues("hello");
    });

    it("should debounce when typing characters with delay greater than the debounce and some others not", async () => {
      editRef.setProperty("debounce", DEBOUNCE_VALUE);
      await page.waitForChanges();

      const inputEvent = await editRef.spyOnEvent("input");
      await inputRef.press("h");
      expect(inputEvent).not.toHaveReceivedEvent();

      await inputRef.press("e");
      await delayTest(WAIT_FOR_DEBOUNCE_VALUE);
      expect(inputEvent).toHaveReceivedEventTimes(1);

      await inputRef.press("l");
      expect(inputEvent).toHaveReceivedEventTimes(1);

      await inputRef.press("l");
      await delayTest(WAIT_FOR_DEBOUNCE_VALUE);
      expect(inputEvent).toHaveReceivedEventTimes(2);

      await inputRef.press("o");
      expect(inputEvent).toHaveReceivedEventTimes(2);
      await delayTest(WAIT_FOR_DEBOUNCE_VALUE);
      expect(inputEvent).toHaveReceivedEventTimes(3);

      await checkValues("hello");
    });

    it("should emit one event when the debounce is set and each character is written with a delay less than the debounce value", async () => {
      editRef.setProperty("debounce", DEBOUNCE_VALUE);
      await page.waitForChanges();

      const inputEvent = await editRef.spyOnEvent("input");
      await inputRef.press("h");
      await delayTest(DEBOUNCE_VALUE / 6);
      expect(inputEvent).not.toHaveReceivedEvent();

      await inputRef.press("e");
      await delayTest(DEBOUNCE_VALUE / 6);
      expect(inputEvent).not.toHaveReceivedEvent();

      await inputRef.press("l");
      await delayTest(DEBOUNCE_VALUE / 6);
      expect(inputEvent).not.toHaveReceivedEvent();

      await inputRef.press("l");
      await delayTest(DEBOUNCE_VALUE / 6);
      expect(inputEvent).not.toHaveReceivedEvent();

      await inputRef.press("o");
      await delayTest(DEBOUNCE_VALUE / 6);
      expect(inputEvent).not.toHaveReceivedEvent();
      await delayTest(DEBOUNCE_VALUE);
      expect(inputEvent).toHaveReceivedEvent();

      await checkValues("hello");
    });

    it("should not debounce the form value update if the value is set in the interface, even if debounce > 0", async () => {
      editRef.setProperty("debounce", DEBOUNCE_VALUE);
      await page.waitForChanges();

      editRef.setProperty("value", "hello world");
      const startTime = performance.now();
      await page.waitForChanges();
      const elapsedTime = performance.now() - startTime;

      expect(elapsedTime).toBeLessThan(DEBOUNCE_VALUE);
      await checkValues("hello world");
    });

    it("should not debounce the change event", async () => {
      editRef.setProperty("debounce", DEBOUNCE_VALUE);
      await page.waitForChanges();

      const inputEvent = await editRef.spyOnEvent("input");
      const changeEvent = await editRef.spyOnEvent("change");
      await inputRef.press("h");
      await inputRef.press("e");
      await inputRef.press("l");
      await inputRef.press("l");
      await inputRef.press("o");
      await page.focus("button");
      await page.waitForChanges();

      expect(inputEvent).not.toHaveReceivedEvent();
      expect(changeEvent).toHaveReceivedEvent();
      await delayTest(WAIT_FOR_DEBOUNCE_VALUE);
      expect(inputEvent).toHaveReceivedEvent();

      await checkValues("hello");
    });
  });
};

// TODO: Complete the test suite for all types
(
  [
    // "number",
    // "date",
    // "datetime-local",
    // "email",
    // "file",
    "password",
    "search",
    // "tel",
    "text"
    // "time",
    // "url"
  ] satisfies EditType[]
).forEach(type => testWithDebounce(false, type));

testWithDebounce(true);
