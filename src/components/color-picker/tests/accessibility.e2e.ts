import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { SELECTED_COLOR } from "../constants";
import { ColorPickerTranslations } from "../translations";

const defaultTranslations: ColorPickerTranslations = {
  accessibleName: {
    lightnessChannelInput: "Lightness",
    hueChannelInput: "Hue",
    saturationChannelInput: "Saturation",
    valueChannelInput: "Value",
    alphaChannelInput: "",
    redChannelInput: "Red",
    greenChannelInput: "Green",
    blueChannelInput: "Blue",
    hexadecimalInput: "Hexadecimal color",
    colorFormatOptions: "Color format options",
    colorFieldControl: "",
    colorFieldDescription: "2d color field",
    hueSliderControl: "",
    alphaSliderControl: "",
    colorPaletteButton: `Selected color ${SELECTED_COLOR}`,
    currentColorPreview: `Current color: ${SELECTED_COLOR}`
  },
  text: {
    colorFieldLabel: "",
    colorPaletteSection: "Color Palette",
    colorFormatSelector: "Color Format",
    currentColorPreviewText: "Color Preview",
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

const runAccessibilityLabelTests = (
  description: string,
  controlSelector: string,
  controlId: string,
  accessibleNameKey: string,
  textLabelKey: string,
  expectedAriaLabel: string,
  expectedLabelText: string
) => {
  describe(`${description}`, () => {
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

      await page.waitForChanges();
    });

    it(`should render visible label when text.${textLabelKey} is defined`, async () => {
      const translationWithVisibleLabel = {
        ...defaultTranslations,
        text: {
          ...defaultTranslations.text,
          [textLabelKey]: expectedLabelText
        },
        accessibleName: {
          ...defaultTranslations.accessibleName,
          [accessibleNameKey]: ""
        }
      };

      await colorPickerElement.setProperty(
        "translations",
        translationWithVisibleLabel
      );
      await page.waitForChanges();

      const labelRef = await page.find(
        `ch-color-picker >>> label[for='${controlId}']`
      );
      const controlRef = await page.find(
        `ch-color-picker >>> ${controlSelector}`
      );

      expect(controlRef).toBeTruthy();
      expect(labelRef).toBeTruthy();
      expect(labelRef.textContent).toBe(expectedLabelText);
      expect(labelRef).toHaveAttribute("for");
      expect(labelRef).toEqualAttribute("for", controlId);

      if (controlSelector.includes("part*=")) {
        const accessibleName = await controlRef.getProperty("accessibleName");
        expect(accessibleName).toBeUndefined();
      }
    });

    it(`should render control with accessible name when accessibleName.${accessibleNameKey} is defined`, async () => {
      const translationWithAriaLabel = {
        ...defaultTranslations,
        text: {
          ...defaultTranslations.text,
          [textLabelKey]: ""
        },
        accessibleName: {
          ...defaultTranslations.accessibleName,
          [accessibleNameKey]: expectedAriaLabel
        }
      };

      await colorPickerElement.setProperty(
        "translations",
        translationWithAriaLabel
      );
      await page.waitForChanges();

      const labelRef = await page.find(
        `ch-color-picker >>> label[for='${controlId}']`
      );
      const controlRef = await page.find(
        `ch-color-picker >>> ${controlSelector}`
      );

      expect(labelRef).toBeNull();
      expect(controlRef).toBeTruthy();

      if (controlSelector.includes("part*=")) {
        const accessibleName = await controlRef.getProperty("accessibleName");
        expect(accessibleName).toBe(expectedAriaLabel);
      }
    });

    it(`should not render visible label when both are empty`, async () => {
      const translationWithoutLabelAndAriaLabelData = {
        ...defaultTranslations,
        text: {
          ...defaultTranslations.text,
          [textLabelKey]: ""
        },
        accessibleName: {
          ...defaultTranslations.accessibleName,
          [accessibleNameKey]: ""
        }
      };

      await colorPickerElement.setProperty(
        "translations",
        translationWithoutLabelAndAriaLabelData
      );
      await page.waitForChanges();

      const labelRef = await page.find(
        `ch-color-picker >>> label[for='${controlId}']`
      );
      const controlRef = await page.find(
        `ch-color-picker >>> ${controlSelector}`
      );

      expect(labelRef).toBeNull();
      expect(controlRef).toBeTruthy();

      if (controlSelector.includes("part*=")) {
        const accessibleName = await controlRef.getProperty("accessibleName");
        expect(accessibleName).toBe("");
      }
    });

    it("should render visible label and skip accessible name when both have same data", async () => {
      const translationWithSameLabelText = {
        ...defaultTranslations,
        text: {
          ...defaultTranslations.text,
          [textLabelKey]: expectedLabelText
        },
        accessibleName: {
          ...defaultTranslations.accessibleName,
          [accessibleNameKey]: expectedLabelText
        }
      };

      await colorPickerElement.setProperty(
        "translations",
        translationWithSameLabelText
      );
      await page.waitForChanges();

      const labelRef = await page.find(
        `ch-color-picker >>> label[for='${controlId}']`
      );
      const controlRef = await page.find(
        `ch-color-picker >>> ${controlSelector}`
      );

      expect(controlRef).toBeTruthy();
      expect(labelRef).toBeTruthy();
      expect(labelRef.textContent).toBe(expectedLabelText);

      if (controlSelector.includes("part*=")) {
        const accessibleName = await controlRef.getProperty("accessibleName");
        expect(accessibleName).toBeUndefined();
      }
    });
  });
};

runAccessibilityLabelTests(
  "[ch-color-picker][accessibility] - Color Field Control",
  "[part='color-field']",
  "color-field",
  "colorFieldControl",
  "colorFieldLabel",
  "Custom Color Field",
  "Color Field Label"
);

runAccessibilityLabelTests(
  "[ch-color-picker][accessibility] - Hue Slider Control",
  "[part*='hue__slider']",
  "hue-slider",
  "hueSliderControl",
  "hueChannelLabel",
  "Custom Hue Slider",
  "Hue Slider Label"
);

runAccessibilityLabelTests(
  "[ch-color-picker][accessibility] - Alpha Slider Control",
  "[part*='alpha__slider']",
  "alpha-slider",
  "alphaSliderControl",
  "alphaChannelLabel",
  "Custom Alpha Slider",
  "Alpha Slider Label"
);

describe("[ch-color-picker][accessibility] - Alpha Input Control", () => {
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

  it("should render visible label when text.alphaChannelLabel is defined", async () => {
    const translationWithVisibleLabel = {
      ...defaultTranslations,
      text: {
        ...defaultTranslations.text,
        alphaChannelLabel: "Alpha Input Label"
      },
      accessibleName: {
        ...defaultTranslations.accessibleName,
        alphaChannelInput: ""
      }
    };

    await colorPickerElement.setProperty(
      "translations",
      translationWithVisibleLabel
    );
    await page.waitForChanges();

    const labelRef = await page.find(
      "ch-color-picker >>> label[for='alpha-input']"
    );
    const controlRef = await page.find("ch-color-picker >>> #alpha-input");

    expect(controlRef).toBeTruthy();
    expect(labelRef).toBeTruthy();
    expect(labelRef.textContent).toBe("Alpha Input Label");
    expect(labelRef).toHaveAttribute("for");
    expect(labelRef).toEqualAttribute("for", "alpha-input");

    expect(controlRef).not.toHaveAttribute("aria-label");
  });

  it("should render control with aria-label when accessibleName.alphaChannelInput is defined", async () => {
    const translationWithAriaLabel = {
      ...defaultTranslations,
      text: {
        ...defaultTranslations.text,
        alphaChannelLabel: ""
      },
      accessibleName: {
        ...defaultTranslations.accessibleName,
        alphaChannelInput: "Custom Alpha Input"
      }
    };

    await colorPickerElement.setProperty(
      "translations",
      translationWithAriaLabel
    );
    await page.waitForChanges();

    const labelRef = await page.find(
      "ch-color-picker >>> label[for='alpha-input']"
    );
    const controlRef = await page.find("ch-color-picker >>> #alpha-input");

    expect(labelRef).toBeNull();
    expect(controlRef).toBeTruthy();

    expect(controlRef).toHaveAttribute("aria-label");
    expect(controlRef).toEqualAttribute("aria-label", "Custom Alpha Input");
  });

  it("should not render visible label when both are empty", async () => {
    const translationWithoutLabelAndAriaLabelData = {
      ...defaultTranslations,
      text: {
        ...defaultTranslations.text,
        alphaChannelLabel: ""
      },
      accessibleName: {
        ...defaultTranslations.accessibleName,
        alphaChannelInput: ""
      }
    };

    await colorPickerElement.setProperty(
      "translations",
      translationWithoutLabelAndAriaLabelData
    );
    await page.waitForChanges();

    const labelRef = await page.find(
      "ch-color-picker >>> label[for='alpha-input']"
    );
    const controlRef = await page.find("ch-color-picker >>> #alpha-input");
    const accessibleName = await controlRef.getProperty("accessibleName");

    expect(labelRef).toBeNull();
    expect(controlRef).toBeTruthy();
    expect(accessibleName).toBeUndefined();
  });

  it("should render visible label and skip aria-label when both have same data", async () => {
    const translationWithSameLabelText = {
      ...defaultTranslations,
      text: {
        ...defaultTranslations.text,
        alphaChannelLabel: "Alpha Input Label"
      },
      accessibleName: {
        ...defaultTranslations.accessibleName,
        alphaChannelInput: "Alpha Input Label"
      }
    };

    await colorPickerElement.setProperty(
      "translations",
      translationWithSameLabelText
    );
    await page.waitForChanges();

    const labelRef = await page.find(
      "ch-color-picker >>> label[for='alpha-input']"
    );
    const controlRef = await page.find("ch-color-picker >>> #alpha-input");

    expect(controlRef).toBeTruthy();
    expect(labelRef).toBeTruthy();
    expect(labelRef.textContent).toBe("Alpha Input Label");
    expect(controlRef).not.toHaveAttribute("aria-label");
  });
});

describe("[ch-color-picker][accessibility] - Basic ARIA attributes", () => {
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
    const elementWithAriaLabel = await page.find("ch-color-picker[aria-label]");
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

describe("[ch-color-picker][accessibility] - Static controls", () => {
  let page: E2EPage;
  let colorPickerElement: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-color-picker></ch-color-picker>`,
      failOnConsoleError: true
    });
    colorPickerElement = await page.find("ch-color-picker");

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

describe("[ch-color-picker][accessibility] - Form integration", () => {
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
