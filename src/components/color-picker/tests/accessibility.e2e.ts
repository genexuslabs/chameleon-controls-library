import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

const defaultTranslations = {
  accessibleName: {
    lightnessChannelInput: "Lightness",
    hueChannelInput: "Hue",
    saturationChannelInput: "Saturation",
    valueChannelInput: "Value",
    alphaChannelInput: "Alpha",
    redChannelInput: "Red",
    greenChannelInput: "Green",
    blueChannelInput: "Blue",
    hexadecimalInput: "Hexadecimal color",
    colorFormatOptions: "Color format options",
    colorFieldControl: "Color field",
    colorFieldDescription: "2d color field",
    hueSliderControl: "Hue Slider",
    alphaSliderControl: "Alpha Slider",
    colorPaletteButton: "Selected color ${SELECTED_COLOR}",
    currentColorPreview: "Current color: ${SELECTED_COLOR}"
  },
  text: {
    colorFieldLabel: "",
    colorPaletteSection: "Color Palette",
    colorFormatSelector: "Color Format",
    currentColorPreviewLabel: "Color Preview",
    hueChannelLabel: "",
    alphaChannelLabel: "",
    hexadecimalFormat: "HEX",
    rgbColorFormat: "RGB",
    hslColorFormat: "HSL",
    hsvColorFormat: "HSV",
    redChannelInputLabel: "R",
    greenChannelInputLabel: "G",
    blueChannelInputLabel: "B",
    hueChannelInputLabel: "H",
    saturationChannelInputLabel: "S",
    lightnessChannelInputLabel: "L",
    valueChannelInputLabel: "V"
  }
};

const customTranslations = {
  accessibleName: {
    lightnessChannelInput: "Lightness",
    hueChannelInput: "Hue",
    saturationChannelInput: "Saturation",
    valueChannelInput: "Value",
    alphaChannelInput: "Alpha",
    redChannelInput: "Red",
    greenChannelInput: "Green",
    blueChannelInput: "Blue",
    hexadecimalInput: "Hexadecimal color",
    colorFormatOptions: "Custom format options",
    colorFieldControl: "Custom color field",
    colorFieldDescription: "2d color field",
    hueSliderControl: "Custom hue slider",
    alphaSliderControl: "Custom alpha slider",
    colorPaletteButton: "Custom palette color ${SELECTED_COLOR}",
    currentColorPreview: "Custom color preview: ${SELECTED_COLOR}"
  },
  text: {
    colorFieldLabel: "",
    colorPaletteSection: "Color Palette",
    colorFormatSelector: "Color Format",
    currentColorPreviewLabel: "Color Preview",
    hueChannelLabel: "",
    alphaChannelLabel: "",
    hexadecimalFormat: "HEX",
    rgbColorFormat: "RGB",
    hslColorFormat: "HSL",
    hsvColorFormat: "HSV",
    redChannelInputLabel: "R",
    greenChannelInputLabel: "G",
    blueChannelInputLabel: "B",
    hueChannelInputLabel: "H",
    saturationChannelInputLabel: "S",
    lightnessChannelInputLabel: "L",
    valueChannelInputLabel: "V"
  }
};

describe("[ch-color-picker][accessibility]", () => {
  describe("ARIA attributes", () => {
    let page: E2EPage;
    let colorPickerElement: E2EElement;

    beforeEach(async () => {
      page = await newE2EPage({
        html: `<ch-color-picker></ch-color-picker>`,
        failOnConsoleError: true
      });
      colorPickerElement = await page.find("ch-color-picker");
      await page.waitForChanges();
    });

    it("should have aria-label when accessibleName is provided", async () => {
      await colorPickerElement.setProperty(
        "accessibleName",
        "Custom color picker"
      );
      await page.waitForChanges();

      const elementWithAriaLabel = await page.find(
        'ch-color-picker[aria-label="Custom color picker"]'
      );
      expect(elementWithAriaLabel).toBeTruthy();
    });

    it("should not have aria-label when accessibleName is not provided", async () => {
      const elementWithAriaLabel = await page.find(
        "ch-color-picker[aria-label]"
      );
      expect(elementWithAriaLabel).toBeNull();
    });

    it("should update aria-label when accessibleName changes", async () => {
      await colorPickerElement.setProperty("accessibleName", "First label");
      await page.waitForChanges();

      let elementWithAriaLabel = await page.find(
        'ch-color-picker[aria-label="First label"]'
      );
      expect(elementWithAriaLabel).toBeTruthy();

      await colorPickerElement.setProperty("accessibleName", "Second label");
      await page.waitForChanges();

      elementWithAriaLabel = await page.find(
        'ch-color-picker[aria-label="Second label"]'
      );
      expect(elementWithAriaLabel).toBeTruthy();
    });
  });

  describe("Controls accessibility", () => {
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
      colorPickerElement.setProperty("showColorPreview", true);
      colorPickerElement.setProperty("showColorPalette", true);
      colorPickerElement.setProperty("colorPalette", [
        "#ff0000",
        "#00ff00",
        "#0000ff"
      ]);
      colorPickerElement.setProperty("translations", defaultTranslations);

      await page.waitForChanges();
    });

    it("should pass correct accessible names to color field", async () => {
      const colorField = await colorPickerElement.find(
        ">>> [part*='color-field']"
      );

      expect(colorField).toBeTruthy();

      const accessibleName = await colorField.getProperty("accessibleName");
      const role = await colorField.getAttribute("role");

      expect(accessibleName).toBe("Color field");
      expect(role).toBe("application");
    });

    it("should pass correct accessible names to hue slider", async () => {
      const hueSlider = await colorPickerElement.find(
        ">>> [part*='hue__slider']"
      );

      expect(hueSlider).toBeTruthy();

      const accessibleName = await hueSlider.getProperty("accessibleName");
      expect(accessibleName).toBe("Hue Slider");
    });

    it("should pass correct accessible names to alpha slider", async () => {
      const alphaSlider = await colorPickerElement.find(
        ">>> [part*='alpha__slider']"
      );

      expect(alphaSlider).toBeTruthy();

      const accessibleName = await alphaSlider.getProperty("accessibleName");
      expect(accessibleName).toBe("Alpha Slider");
    });

    it("should pass correct accessible names to color format selector", async () => {
      const formatSelector = await colorPickerElement.find(
        ">>> [part*='color-format__combo-box']"
      );

      expect(formatSelector).toBeTruthy();

      const accessibleName = await formatSelector.getProperty("accessibleName");
      expect(accessibleName).toBe("Color format options");
    });

    it("should have proper labels for color preview", async () => {
      const colorPreview = await colorPickerElement.find(
        ">>> [part='color-preview']"
      );

      expect(colorPreview).toBeTruthy();

      const ariaLabel = await colorPreview.getAttribute("aria-label");
      const role = await colorPreview.getAttribute("role");

      expect(ariaLabel).toContain("Current color:");
      expect(role).toBe("img");
    });

    it("should have proper labels for color palette buttons", async () => {
      const paletteButtons = await colorPickerElement.findAll(
        ">>> [part*='color-palette__button']"
      );

      expect(paletteButtons.length).toBe(3);

      for (const button of paletteButtons) {
        const ariaLabel = await button.getAttribute("aria-label");
        expect(ariaLabel).toContain("Selected color");
      }
    });

    it("should have proper group labeling for color palette", async () => {
      const paletteGrid = await colorPickerElement.find(
        ">>> [part*='color-palette-grid']"
      );

      expect(paletteGrid).toBeTruthy();

      const role = await paletteGrid.getAttribute("role");
      const ariaLabelledBy = await paletteGrid.getAttribute("aria-labelledby");

      expect(role).toBe("group");
      expect(ariaLabelledBy).toBe("color-palette-label");
    });
  });

  describe("Form integration", () => {
    let page: E2EPage;
    let colorPickerElement: E2EElement;

    it("should be associated with form", async () => {
      page = await newE2EPage({
        html: `
          <form id="test-form">
            <ch-color-picker name="color" value="#ff0000"></ch-color-picker>
          </form>
        `,
        failOnConsoleError: true
      });

      colorPickerElement = await page.find("ch-color-picker");
      await page.waitForChanges();

      const value = await colorPickerElement.getProperty("value");
      expect(value).toBe("#ff0000");
    });
  });

  describe("Custom translations accessibility", () => {
    let page: E2EPage;
    let colorPickerElement: E2EElement;

    it("should pass custom accessible names from translations to child components", async () => {
      page = await newE2EPage({
        html: `<ch-color-picker></ch-color-picker>`,
        failOnConsoleError: true
      });

      colorPickerElement = await page.find("ch-color-picker");

      colorPickerElement.setProperty("showHueSlider", true);
      colorPickerElement.setProperty("showAlphaSlider", true);
      colorPickerElement.setProperty("showColorFormatSelector", true);
      colorPickerElement.setProperty("showColorPreview", true);
      colorPickerElement.setProperty("showColorPalette", true);
      colorPickerElement.setProperty("colorPalette", ["#ff0000"]);
      colorPickerElement.setProperty("translations", customTranslations);

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

      expect(colorField).toBeTruthy();
      expect(hueSlider).toBeTruthy();
      expect(alphaSlider).toBeTruthy();
      expect(formatSelector).toBeTruthy();

      const colorFieldAccessibleName = await colorField.getProperty(
        "accessibleName"
      );
      const hueSliderAccessibleName = await hueSlider.getProperty(
        "accessibleName"
      );
      const alphaSliderAccessibleName = await alphaSlider.getProperty(
        "accessibleName"
      );
      const formatSelectorAccessibleName = await formatSelector.getProperty(
        "accessibleName"
      );

      expect(colorFieldAccessibleName).toBe("Custom color field");
      expect(hueSliderAccessibleName).toBe("Custom hue slider");
      expect(alphaSliderAccessibleName).toBe("Custom alpha slider");
      expect(formatSelectorAccessibleName).toBe("Custom format options");
    });
  });
});
