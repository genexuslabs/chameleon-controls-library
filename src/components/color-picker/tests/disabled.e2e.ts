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

      const ariaDisabled = await hueSlider.getAttribute("aria-disabled");
      expect(ariaDisabled).toBe("true");
    });

    it("should pass disabled state to color format selector", async () => {
      const formatSelector = await colorPickerElement.find(
        ">>> [part*='color-format__combo-box']"
      );

      expect(formatSelector).toBeTruthy();

      const ariaDisabled = await formatSelector.getAttribute("aria-disabled");
      expect(ariaDisabled).toBe("true");
    });

    it("should disable color palette buttons", async () => {
      const paletteButtons = await colorPickerElement.findAll(
        ">>> [part*='color-palette__button']"
      );

      expect(paletteButtons.length).toBe(3);

      for (const button of paletteButtons) {
        const disabled = await button.getProperty("disabled");
        const ariaDisabled = await button.getAttribute("aria-disabled");

        expect(disabled).toBe(true);
        expect(ariaDisabled).toBe("true");
      }
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
      const alphaSlider = await colorPickerElement.find(
        ">>> [part*='alpha__slider']"
      );
      const formatSelector = await colorPickerElement.find(
        ">>> [part*='color-format__combo-box']"
      );
      const paletteButtons = await colorPickerElement.findAll(
        ">>> [part*='color-palette__button']"
      );

      const colorFieldAriaDisabled = await colorField.getAttribute(
        "aria-disabled"
      );
      const hueSliderAriaDisabled = await hueSlider.getAttribute(
        "aria-disabled"
      );
      const formatSelectorAriaDisabled = await formatSelector.getAttribute(
        "aria-disabled"
      );

      expect(colorFieldAriaDisabled).toBeNull();
      expect(hueSliderAriaDisabled).toBeNull();
      expect(formatSelectorAriaDisabled).toBeNull();
      expect(alphaSlider).toBeTruthy();

      for (const button of paletteButtons) {
        const buttonDisabled = await button.getProperty("disabled");
        const buttonAriaDisabled = await button.getAttribute("aria-disabled");
        expect(buttonDisabled).toBe(false);
        expect(buttonAriaDisabled).toBeNull();
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
      const alphaSlider = await colorPickerElement.find(
        ">>> [part*='alpha__slider']"
      );
      const formatSelector = await colorPickerElement.find(
        ">>> [part*='color-format__combo-box']"
      );
      const paletteButtons = await colorPickerElement.findAll(
        ">>> [part*='color-palette__button']"
      );

      const colorFieldAriaDisabled = await colorField.getAttribute(
        "aria-disabled"
      );
      const hueSliderAriaDisabled = await hueSlider.getAttribute(
        "aria-disabled"
      );
      const formatSelectorAriaDisabled = await formatSelector.getAttribute(
        "aria-disabled"
      );

      expect(colorFieldAriaDisabled).toBe("true");
      expect(hueSliderAriaDisabled).toBe("true");
      expect(formatSelectorAriaDisabled).toBe("true");
      expect(alphaSlider).toBeTruthy();

      for (const button of paletteButtons) {
        const buttonDisabled = await button.getProperty("disabled");
        const buttonAriaDisabled = await button.getAttribute("aria-disabled");
        expect(buttonDisabled).toBe(true);
        expect(buttonAriaDisabled).toBe("true");
      }
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

    it("should not respond to palette button clicks when disabled", async () => {
      const inputEvent = await colorPickerElement.spyOnEvent("input");
      const paletteButtons = await colorPickerElement.findAll(
        ">>> [part*='color-palette__button']"
      );

      expect(paletteButtons.length).toBeGreaterThan(0);

      await paletteButtons[0].click();
      await page.waitForChanges();

      expect(inputEvent).not.toHaveReceivedEvent();

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
});
