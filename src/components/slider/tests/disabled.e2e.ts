import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

const FORM_ENTRY = "slider";

describe("[ch-slider][disabled]", () => {
  let page: E2EPage;
  let sliderRef: E2EElement;

  // Utility as a WA since the "toHaveAttribute" function from puppeteer does
  // not work properly
  const checkValues = async (
    value: number | undefined,
    disabled: boolean | undefined | null
  ) => {
    expect(await sliderRef.getProperty("value")).toBe(value);

    const pageEvaluation = await page.evaluate(() => {
      const formElement = document.querySelector("form");
      const sliderDOMRef = document.querySelector("ch-slider");

      const formData = new FormData(formElement);
      return {
        formData: Object.fromEntries(formData.entries()),
        disabledSliderAttr: sliderDOMRef.getAttribute("disabled"),
        disabledInputAttr: sliderDOMRef.shadowRoot
          .querySelector("input")
          .getAttribute("disabled"),
        pointerEventsStyle: getComputedStyle(sliderDOMRef).pointerEvents
      };
    });

    if (disabled) {
      expect(pageEvaluation.disabledSliderAttr).toBe("");
      expect(pageEvaluation.disabledInputAttr).toBe("");

      expect(pageEvaluation.formData[FORM_ENTRY]).toBe(undefined);

      expect(pageEvaluation.pointerEventsStyle).toBe("none");
    } else {
      expect(pageEvaluation.disabledSliderAttr).toBeNull();
      expect(pageEvaluation.disabledInputAttr).toBeNull();

      expect(pageEvaluation.formData[FORM_ENTRY]).toBe(value.toString()); // TODO: Should this be a string???

      expect(pageEvaluation.pointerEventsStyle).toBe("auto");
    }
  };

  const getTemplate = (disabled: boolean) =>
    `<form>
        <ch-slider name="${FORM_ENTRY}" ${
      disabled ? " disabled" : ""
    }></ch-slider>
      </form>` +
    `
      <style>
        ch-slider {
          background-color: rgb(0, 0, 255);
        }

        ch-slider[disabled] {
          background-color: rgb(255, 0, 0);
        }
      </style>`;

  beforeEach(async () => {
    page = await newE2EPage({
      failOnConsoleError: true,
      html: getTemplate(false)
    });
    sliderRef = await page.find("ch-slider");
  });

  it("should have disabled = false by default", async () => {
    await checkValues(0, false);
  });

  it('should not reflect the "disabled = undefined" property', async () => {
    await sliderRef.setProperty("disabled", undefined);
    await page.waitForChanges();
    await checkValues(0, false);
  });

  it('should not reflect the "disabled = null" property', async () => {
    await sliderRef.setProperty("disabled", null);
    await page.waitForChanges();
    await checkValues(0, false);
  });

  it('should reflect the "disabled = true" property to allow customizing the control when it\'s disabled', async () => {
    await sliderRef.setProperty("disabled", true);
    await page.waitForChanges();
    await checkValues(0, true);
  });

  it('should reflect the "disabled = true" property if it\'s set by default with true', async () => {
    await page.setContent(getTemplate(true));
    await page.waitForChanges();
    await checkValues(0, true);
  });

  it('should remove the "disabled" attr when switching from disabled = "true" to "false"', async () => {
    await sliderRef.setProperty("disabled", true);
    await page.waitForChanges();
    await checkValues(0, true);

    await sliderRef.setProperty("disabled", false);
    await page.waitForChanges();
    await checkValues(0, false);
  });

  it("should not submit the value if disabled", async () => {
    await sliderRef.setProperty("disabled", true);
    await sliderRef.setProperty("value", 4);
    await page.waitForChanges();
    await checkValues(4, true);
  });

  it('should submit the value when switching from disabled = "true" to "false"', async () => {
    await sliderRef.setProperty("disabled", true);
    await sliderRef.setProperty("value", 4);
    await page.waitForChanges();
    await checkValues(4, true);

    await sliderRef.setProperty("disabled", false);
    await page.waitForChanges();
    await checkValues(4, false);

    await sliderRef.setProperty("value", 2);
    await page.waitForChanges();
    await checkValues(2, false);

    await sliderRef.setProperty("value", 0);
    await page.waitForChanges();
    await checkValues(0, false); // TODO: Check if the value should be undefined or not
  });

  it("should properly style the control when disabled and when it is not", async () => {
    expect((await sliderRef.getComputedStyle()).backgroundColor).toBe(
      "rgb(0, 0, 255)"
    );

    await sliderRef.setProperty("disabled", true);
    await page.waitForChanges();
    expect((await sliderRef.getComputedStyle()).backgroundColor).toBe(
      "rgb(255, 0, 0)"
    );

    await sliderRef.setProperty("disabled", false);
    await page.waitForChanges();
    expect((await sliderRef.getComputedStyle()).backgroundColor).toBe(
      "rgb(0, 0, 255)"
    );
  });

  it.todo("should not fire the input event if disabled");

  it.todo("should not fire the change event if disabled");

  it.todo("should not be focusable if disabled");
});
