import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-color-picker][readonly]", () => {
  describe("Readonly state propagation", () => {
    let page: E2EPage;
    let colorPickerElement: E2EElement;

    beforeEach(async () => {
      page = await newE2EPage({
        html: `<ch-color-picker readonly></ch-color-picker>`,
        failOnConsoleError: true
      });
      colorPickerElement = await page.find("ch-color-picker");

      colorPickerElement.setProperty("showHueSlider", true);
      colorPickerElement.setProperty("showAlphaSlider", true);
      colorPickerElement.setProperty("showColorFormatSelector", true);
      colorPickerElement.setProperty("showColorPreview", true);
      colorPickerElement.setProperty("showColorPalette", true);
      colorPickerElement.setProperty("colorPalette", [
        "#ff0000",
        "#00ff00",
        "#0000ff"
      ]);

      await page.waitForChanges();
    });

    it("should have readonly property set to true", async () => {
      const readonly = await colorPickerElement.getProperty("readonly");
      expect(readonly).toBe(true);
    });

    it("should pass readonly state to color field", async () => {
      const colorField = await colorPickerElement.find(
        ">>> [part='color-field']"
      );

      expect(colorField).toBeTruthy();

      const ariaReadonly = await colorField.getAttribute("aria-readonly");
      expect(ariaReadonly).toBe("true");
    });

    it("should pass readonly state to color format selector", async () => {
      const formatSelector = await colorPickerElement.find(
        ">>> [part*='color-format__combo-box']"
      );

      expect(formatSelector).toBeTruthy();

      const readonly = await formatSelector.getProperty("readonly");
      expect(readonly).toBe(true);
    });

    it("should have readonly attribute on hex input", async () => {
      const hexInput = await page.find("ch-color-picker >>> #hex-input");

      expect(hexInput).not.toBeNull();

      const readonly = await hexInput.getAttribute("readonly");
      expect(readonly).not.toBeNull();
    });

    it("should have aria-readonly attribute on hex input", async () => {
      const hexInput = await page.find("ch-color-picker >>> #hex-input");

      expect(hexInput).not.toBeNull();

      const ariaReadonly = await hexInput.getAttribute("aria-readonly");
      expect(ariaReadonly).toBe("true");
    });

    it("should have readonly attribute on alpha input", async () => {
      const alphaInput = await page.find("ch-color-picker >>> #alpha-input");

      expect(alphaInput).not.toBeNull();

      const readonly = await alphaInput.getAttribute("readonly");
      expect(readonly).not.toBeNull();
    });

    it("should have aria-readonly attribute on alpha input", async () => {
      const alphaInput = await page.find("ch-color-picker >>> #alpha-input");

      expect(alphaInput).not.toBeNull();

      const ariaReadonly = await alphaInput.getAttribute("aria-readonly");
      expect(ariaReadonly).toBe("true");
    });

    it("should have readonly property on selectedColorFormats", async () => {
      const formats = ["hex", "rgb", "hsl", "hsv"];

      for (const format of formats) {
        await colorPickerElement.setProperty("selectedColorFormat", format);
        await page.waitForChanges();

        const readonly = await colorPickerElement.getProperty("readonly");
        expect(readonly).toBe(true);
      }
    });
  });

  describe("Readonly state changes", () => {
    let page: E2EPage;
    let colorPickerElement: E2EElement;

    beforeEach(async () => {
      page = await newE2EPage({
        html: `<ch-color-picker></ch-color-picker>`,
        failOnConsoleError: true
      });
      colorPickerElement = await page.find("ch-color-picker");

      colorPickerElement.setProperty("showColorFormatSelector", true);

      await page.waitForChanges();
    });

    it("should not have aria-readonly when readonly is false", async () => {
      await colorPickerElement.setProperty("readonly", false);
      await page.waitForChanges();

      const colorField = await colorPickerElement.find(
        ">>> [part='color-field']"
      );
      const formatSelector = await colorPickerElement.find(
        ">>> [part*='color-format__combo-box']"
      );

      const colorFieldAriaReadonly = await colorField.getAttribute(
        "aria-readonly"
      );
      const formatSelectorReadonly = await formatSelector.getProperty(
        "readonly"
      );

      expect(colorFieldAriaReadonly).toBeNull();
      expect(formatSelectorReadonly).toBeFalsy();
    });

    it("should set aria-readonly when readonly is true", async () => {
      await colorPickerElement.setProperty("readonly", true);
      await page.waitForChanges();

      const colorField = await colorPickerElement.find(
        ">>> [part='color-field']"
      );
      const formatSelector = await colorPickerElement.find(
        ">>> [part*='color-format__combo-box']"
      );

      const colorFieldAriaReadonly = await colorField.getAttribute(
        "aria-readonly"
      );
      const formatSelectorReadonly = await formatSelector.getProperty(
        "readonly"
      );

      expect(colorFieldAriaReadonly).toBe("true");
      expect(formatSelectorReadonly).toBe(true);
    });

    it("should maintain readonly behavior when format changes", async () => {
      await colorPickerElement.setProperty("readonly", true);
      await page.waitForChanges();

      const readonly = await colorPickerElement.getProperty("readonly");
      expect(readonly).toBe(true);

      const hexInput = await page.find("ch-color-picker >>> #hex-input");
      expect(hexInput).not.toBeNull();

      const hexReadonly = await hexInput.getAttribute("readonly");
      expect(hexReadonly).not.toBeNull();
    });
  });

  describe("Readonly interaction prevention", () => {
    let page: E2EPage;
    let colorPickerElement: E2EElement;

    beforeEach(async () => {
      page = await newE2EPage({
        html: `<ch-color-picker readonly value="#ff0000"></ch-color-picker>`,
        failOnConsoleError: true
      });
      colorPickerElement = await page.find("ch-color-picker");
      colorPickerElement.setProperty("showColorFormatSelector", true);

      await page.waitForChanges();
    });

    it("should not emit input events when readonly", async () => {
      const inputEvent = await colorPickerElement.spyOnEvent("input");

      await colorPickerElement.setProperty("value", "#00ff00");
      await page.waitForChanges();

      expect(inputEvent).not.toHaveReceivedEvent();
    });

    it("should not emit input event when hex input is modified", async () => {
      const inputEvent = await colorPickerElement.spyOnEvent("input");
      const hexInput = await page.find("ch-color-picker >>> #hex-input");

      expect(hexInput).not.toBeNull();

      await hexInput.focus();
      await hexInput.press("Backspace");
      await hexInput.type("a");
      await page.waitForChanges();

      expect(inputEvent).not.toHaveReceivedEvent();
    });

    it("should not emit input event when alpha input is modified", async () => {
      const inputEvent = await colorPickerElement.spyOnEvent("input");
      const alphaInput = await page.find("ch-color-picker >>> #alpha-input");

      expect(alphaInput).not.toBeNull();

      await alphaInput.focus();
      await alphaInput.press("Backspace");
      await alphaInput.type("50");
      await page.waitForChanges();

      expect(inputEvent).not.toHaveReceivedEvent();
    });
  });

  describe("Readonly with form integration", () => {
    let page: E2EPage;
    let colorPickerElement: E2EElement;

    it("should be readonly in form context", async () => {
      page = await newE2EPage({
        html: `
          <form id="test-form">
            <ch-color-picker name="color" value="#ff0000" readonly></ch-color-picker>
          </form>
        `,
        failOnConsoleError: true
      });

      colorPickerElement = await page.find("ch-color-picker");
      await page.waitForChanges();

      const readonly = await colorPickerElement.getProperty("readonly");
      const value = await colorPickerElement.getProperty("value");

      expect(readonly).toBe(true);
      expect(value).toBe("#ff0000");
    });

    it("should not emit input events when readonly in form", async () => {
      page = await newE2EPage({
        html: `
          <form id="test-form">
            <ch-color-picker name="color" value="#ff0000" readonly></ch-color-picker>
          </form>
        `,
        failOnConsoleError: true
      });

      colorPickerElement = await page.find("ch-color-picker");
      await page.waitForChanges();

      const inputEvent = await colorPickerElement.spyOnEvent("input");

      await colorPickerElement.setProperty("value", "#00ff00");
      await page.waitForChanges();

      expect(inputEvent).not.toHaveReceivedEvent();
    });
  });
});
