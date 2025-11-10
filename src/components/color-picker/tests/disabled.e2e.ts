import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-color-picker][disabled]", () => {
  describe("Disabled state propagation", () => {
    let page: E2EPage;
    let colorPickerElement: E2EElement;

    beforeEach(async () => {
      page = await newE2EPage({
        html: `<ch-color-picker disabled></ch-color-picker>`,
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

    it("should have disabled property set to true", async () => {
      const disabled = await colorPickerElement.getProperty("disabled");
      expect(disabled).toBe(true);
    });

    it("should pass disabled state to color field", async () => {
      const colorField = await colorPickerElement.find(
        ">>> [part*='color-field']"
      );

      expect(colorField).toBeTruthy();

      const ariaDisabled = await colorField.getAttribute("aria-disabled");
      expect(ariaDisabled).toBe("true");
    });

    it("should pass disabled state to hue slider", async () => {
      const hueSlider = await colorPickerElement.find(
        ">>> [part*='hue__slider']"
      );

      expect(hueSlider).toBeTruthy();

      const disabled = await hueSlider.getProperty("disabled");
      expect(disabled).toBe(true);
    });

    it("should pass disabled state to alpha slider", async () => {
      const alphaSlider = await colorPickerElement.find(
        ">>> [part*='alpha__slider']"
      );

      expect(alphaSlider).toBeTruthy();

      const disabled = await colorPickerElement.getProperty("disabled");
      expect(disabled).toBe(true);
    });

    it("should pass disabled state to color format selector", async () => {
      const formatSelector = await colorPickerElement.find(
        ">>> [part*='color-format__combo-box']"
      );

      expect(formatSelector).toBeTruthy();

      const disabled = await formatSelector.getProperty("disabled");
      expect(disabled).toBe(true);
    });

    it("should disable color palette buttons", async () => {
      const paletteButtons = await colorPickerElement.findAll(
        ">>> [part*='color-palette__button']"
      );

      expect(paletteButtons.length).toBe(3);

      for (const button of paletteButtons) {
        const disabled = await button.getProperty("disabled");
        expect(disabled).toBe(true);
      }
    });

    it("should have disabled attribute on hex input", async () => {
      const hexInput = await page.find("ch-color-picker >>> #hex-input");

      expect(hexInput).not.toBeNull();

      const disabled = await hexInput.getAttribute("disabled");
      expect(disabled).not.toBeNull();
    });

    it("should have aria-disabled attribute on hex input", async () => {
      const hexInput = await page.find("ch-color-picker >>> #hex-input");

      expect(hexInput).not.toBeNull();

      const ariaDisabled = await hexInput.getAttribute("aria-disabled");
      expect(ariaDisabled).toBe("true");
    });

    it("should have disabled attribute on alpha input", async () => {
      const alphaInput = await page.find("ch-color-picker >>> #alpha-input");

      expect(alphaInput).not.toBeNull();

      const disabled = await alphaInput.getAttribute("disabled");
      expect(disabled).not.toBeNull();
    });

    it("should have aria-disabled attribute on alpha input", async () => {
      const alphaInput = await page.find("ch-color-picker >>> #alpha-input");

      expect(alphaInput).not.toBeNull();

      const ariaDisabled = await alphaInput.getAttribute("aria-disabled");
      expect(ariaDisabled).toBe("true");
    });
  });

  describe("Disabled state changes", () => {
    let page: E2EPage;
    let colorPickerElement: E2EElement;

    beforeEach(async () => {
      page = await newE2EPage({
        html: `<ch-color-picker></ch-color-picker>`,
        failOnConsoleError: true
      });
      colorPickerElement = await page.find("ch-color-picker");

      colorPickerElement.setProperty("showHueSlider", true);
      colorPickerElement.setProperty("showAlphaSlider", true);
      colorPickerElement.setProperty("showColorFormatSelector", true);
      colorPickerElement.setProperty("showColorPalette", true);
      colorPickerElement.setProperty("colorPalette", ["#ff0000", "#00ff00"]);

      await page.waitForChanges();
    });

    it("should enable all controls when disabled is set to false", async () => {
      await colorPickerElement.setProperty("disabled", false);
      await page.waitForChanges();

      const colorField = await colorPickerElement.find(
        ">>> [part*='color-field']"
      );
      const hueSlider = await colorPickerElement.find(
        ">>> [part*='hue__slider']"
      );
      const formatSelector = await colorPickerElement.find(
        ">>> [part*='color-format__combo-box']"
      );
      const paletteButtons = await colorPickerElement.findAll(
        ">>> [part*='color-palette__button']"
      );

      const colorFieldDisabled = await colorField.getProperty("disabled");
      const hueSliderDisabled = await hueSlider.getProperty("disabled");
      const formatSelectorDisabled = await formatSelector.getProperty(
        "disabled"
      );

      expect(colorFieldDisabled).toBeFalsy();
      expect(hueSliderDisabled).toBeFalsy();
      expect(formatSelectorDisabled).toBeFalsy();

      for (const button of paletteButtons) {
        const buttonDisabled = await button.getProperty("disabled");
        expect(buttonDisabled).toBe(false);
      }
    });

    it("should disable all controls when disabled is set to true", async () => {
      await colorPickerElement.setProperty("disabled", true);
      await page.waitForChanges();

      const colorField = await colorPickerElement.find(
        ">>> [part*='color-field']"
      );
      const hueSlider = await colorPickerElement.find(
        ">>> [part*='hue__slider']"
      );
      const formatSelector = await colorPickerElement.find(
        ">>> [part*='color-format__combo-box']"
      );
      const paletteButtons = await colorPickerElement.findAll(
        ">>> [part*='color-palette__button']"
      );

      const colorFieldDisabled = await colorField.getProperty("disabled");
      const hueSliderDisabled = await hueSlider.getProperty("disabled");
      const formatSelectorDisabled = await formatSelector.getProperty(
        "disabled"
      );

      expect(colorFieldDisabled).toBe(true);
      expect(hueSliderDisabled).toBe(true);
      expect(formatSelectorDisabled).toBe(true);

      for (const button of paletteButtons) {
        const buttonDisabled = await button.getProperty("disabled");
        expect(buttonDisabled).toBe(true);
      }
    });

    it("should maintain disabled behavior when format changes", async () => {
      await colorPickerElement.setProperty("disabled", true);
      await page.waitForChanges();

      const disabled = await colorPickerElement.getProperty("disabled");
      expect(disabled).toBe(true);

      const hexInput = await page.find("ch-color-picker >>> #hex-input");
      expect(hexInput).not.toBeNull();

      const hexDisabled = await hexInput.getAttribute("disabled");
      expect(hexDisabled).not.toBeNull();
    });
  });

  describe("Disabled interaction prevention", () => {
    let page: E2EPage;
    let colorPickerElement: E2EElement;

    beforeEach(async () => {
      page = await newE2EPage({
        html: `<ch-color-picker disabled value="#ff0000"></ch-color-picker>`,
        failOnConsoleError: true
      });
      colorPickerElement = await page.find("ch-color-picker");

      colorPickerElement.setProperty("showColorFormatSelector", true);
      colorPickerElement.setProperty("showColorPalette", true);
      colorPickerElement.setProperty("colorPalette", ["#00ff00", "#0000ff"]);

      await page.waitForChanges();
    });

    it("should not emit input events when disabled", async () => {
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

    it("should maintain disabled state of palette buttons", async () => {
      const paletteButtons = await colorPickerElement.findAll(
        ">>> [part*='color-palette__button']"
      );

      expect(paletteButtons.length).toBeGreaterThan(0);

      for (const button of paletteButtons) {
        const disabled = await button.getProperty("disabled");
        expect(disabled).toBe(true);
      }

      const value = await colorPickerElement.getProperty("value");
      expect(value).toBe("#ff0000");
    });
  });

  describe("Disabled with form integration", () => {
    let page: E2EPage;
    let colorPickerElement: E2EElement;

    it("should be disabled in form context", async () => {
      page = await newE2EPage({
        html: `
          <form id="test-form">
            <ch-color-picker name="color" value="#ff0000" disabled></ch-color-picker>
          </form>
        `,
        failOnConsoleError: true
      });

      colorPickerElement = await page.find("ch-color-picker");
      await page.waitForChanges();

      const disabled = await colorPickerElement.getProperty("disabled");
      const value = await colorPickerElement.getProperty("value");

      expect(disabled).toBe(true);
      expect(value).toBe("#ff0000");
    });

    it("should not emit input events when disabled in form", async () => {
      page = await newE2EPage({
        html: `
          <form id="test-form">
            <ch-color-picker name="color" value="#ff0000" disabled></ch-color-picker>
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

  describe("disabled propagation to all input types", () => {
    let page: E2EPage;
    let colorPickerElement: E2EElement;

    beforeEach(async () => {
      page = await newE2EPage({
        html: `<ch-color-picker disabled value="#ff0000"></ch-color-picker>`,
        failOnConsoleError: true
      });
      colorPickerElement = await page.find("ch-color-picker");

      colorPickerElement.setProperty("showColorFormatSelector", true);

      await page.waitForChanges();
    });

    it("should have disabled property on selectedColorFormats", async () => {
      const formats = ["hex", "rgb", "hsl", "hsv"];

      for (const format of formats) {
        await colorPickerElement.setProperty("selectedColorFormat", format);
        await page.waitForChanges();

        const disabled = await colorPickerElement.getProperty("disabled");
        expect(disabled).toBe(true);
      }
    });
  });
});
