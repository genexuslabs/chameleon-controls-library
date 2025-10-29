import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { describe } from "node:test";
import {
  testDefaultCssProperties,
  testDefaultProperties
} from "../../../testing/utils.e2e";

const defaultOrder = {
  colorField: 1,
  colorPreview: 2,
  hueSlider: 3,
  alphaSlider: 4,
  colorFormatSelector: 5,
  colorPalette: 6
};

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
    colorPaletteButton: `Selected color {{SELECTED_COLOR}}`,
    currentColorPreview: `Current color: {{SELECTED_COLOR}}`
  },
  text: {
    colorFieldLabel: "",
    colorPaletteSection: "Color Palette",
    colorFormatSelector: "Color Format",
    currentColorPreviewLabel: "Color Preview",
    hueChannelLabel: "Hue",
    alphaChannelLabel: "Alpha",
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

testDefaultProperties("ch-color-picker", {
  disabled: false,
  readonly: false,
  accessibleName: undefined,
  value: "#000000",
  alphaSliderStep: 1,
  colorFieldStep: 1,
  hueSliderStep: 1,
  colorPalette: [],
  order: defaultOrder,
  showAlphaSlider: false,
  showColorFormatSelector: false,
  showColorPalette: false,
  showColorPreview: false,
  showHueSlider: false,
  translations: defaultTranslations
});

testDefaultCssProperties("ch-color-picker", {
  display: "grid"
});

describe("[ch-color-picker][basic]", () => {
  let page: E2EPage;
  let colorFieldElement: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-color-picker></ch-color-picker>`,
      failOnConsoleError: true
    });
    colorFieldElement = await page.find("ch-color-picker");
  });

  it("should have Shadow DOM", () =>
    expect(colorFieldElement.shadowRoot).toBeTruthy());
});
