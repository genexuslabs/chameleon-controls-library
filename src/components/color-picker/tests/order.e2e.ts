import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { ColorPickerControlsOrder } from "../types";

const swapElements = <ColorPickerControlsOrder>(
  array: ColorPickerControlsOrder[],
  indices: number[]
): ColorPickerControlsOrder[] => {
  const newArray = [...array];
  const temp = newArray[indices[0]];

  for (let i = 0; i < indices.length - 1; i++) {
    newArray[indices[i]] = newArray[indices[i + 1]];
  }
  newArray[indices[indices.length - 1]] = temp;

  return newArray;
};

const generateOrderVariations = (
  testOrder: ColorPickerControlsOrder,
  swapSize: number
): ColorPickerControlsOrder[] => {
  const keys = Object.keys(testOrder);
  const variations: ColorPickerControlsOrder[] = [];

  const generateIndices = (start: number, current: number[], size: number) => {
    if (current.length === size) {
      const newVariation = swapElements(keys, current);
      const variationObject: ColorPickerControlsOrder = Object.fromEntries(
        newVariation.map(key => [key, testOrder[key]])
      );
      variations.push(variationObject);
      return;
    }

    for (let i = start; i < keys.length; i++) {
      generateIndices(i + 1, [...current, i], size);
    }
  };

  generateIndices(0, [], swapSize);
  return variations;
};

describe("[ch-color-picker][order]", () => {
  let page: E2EPage;
  let colorPickerElement: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-color-picker></ch-color-picker>`,
      failOnConsoleError: true
    });
    colorPickerElement = await page.find("ch-color-picker");
  });

  const setControlVisibility = async (
    colorPickerElement: E2EElement,
    expectedOrder: ColorPickerControlsOrder
  ) => {
    colorPickerElement.setProperty("showHueSlider", !!expectedOrder.hueSlider);
    colorPickerElement.setProperty(
      "showAlphaSlider",
      !!expectedOrder.alphaSlider
    );
    colorPickerElement.setProperty(
      "showColorFormatSelector",
      !!expectedOrder.colorFormatSelector
    );
    colorPickerElement.setProperty(
      "showColorPreview",
      !!expectedOrder.colorPreview
    );
    colorPickerElement.setProperty(
      "showColorPalette",
      !!expectedOrder.colorPalette
    );
    colorPickerElement.setProperty("colorPalette", [
      "#ff0000",
      "#00ff00",
      "#0000ff"
    ]);
    await page.waitForChanges();
  };

  const testColorPickerOrder = async (
    colorPickerElement: E2EElement,
    expectedOrder: ColorPickerControlsOrder
  ): Promise<void> => {
    await setControlVisibility(colorPickerElement, expectedOrder);

    colorPickerElement.setProperty("order", expectedOrder);
    await page.waitForChanges();

    const colorPickerControlsRendered = await colorPickerElement.findAll(
      "ch-color-picker >>> :where(.color-field-container, .color-preview-container, .slider-group, .color-format-selector, .color-palette-container)"
    );

    expect(colorPickerControlsRendered).toHaveLength(
      Object.keys(expectedOrder).length
    );

    const controlsClassMap = {
      colorField: "color-field-container",
      colorPreview: "color-preview-container",
      hueSlider: "slider-group",
      alphaSlider: "slider-group",
      colorFormatSelector: "color-format-selector",
      colorPalette: "color-palette-container"
    };

    for (const [key, value] of Object.entries(expectedOrder)) {
      if (value) {
        const expectedClass = controlsClassMap[key];
        const controlAtPosition = colorPickerControlsRendered[value - 1];

        if (key === "hueSlider" || key === "alphaSlider") {
          expect(controlAtPosition).toHaveClass("slider-group");
        } else {
          expect(controlAtPosition).toHaveClass(expectedClass);
        }
      }
    }
  };

  const testColorPickerWithCustomizedOrder = (
    expectedOrder: ColorPickerControlsOrder
  ) => {
    it(`should validate the controls order with: ${JSON.stringify(
      expectedOrder
    )}`, async () => {
      await testColorPickerOrder(colorPickerElement, expectedOrder);
    });
  };

  describe("Color Picker Order Tests", () => {
    const completeColorPickerControlsOrder: ColorPickerControlsOrder = {
      colorField: 1,
      colorPreview: 2,
      hueSlider: 3,
      alphaSlider: 4,
      colorFormatSelector: 5,
      colorPalette: 6
    };

    const completeColorPickerControlsOrderToTest = generateOrderVariations(
      completeColorPickerControlsOrder,
      4
    );

    completeColorPickerControlsOrderToTest.forEach(order => {
      testColorPickerWithCustomizedOrder(order);
    });

    const reducedColorPickerControlsOrder: ColorPickerControlsOrder = {
      colorField: 1,
      hueSlider: 2,
      alphaSlider: 3,
      colorPalette: 4
    };

    const reducedColorPickerControlsOrderToTest = generateOrderVariations(
      reducedColorPickerControlsOrder,
      3
    );

    reducedColorPickerControlsOrderToTest.forEach(order => {
      testColorPickerWithCustomizedOrder(order);
    });

    const minimalColorPickerControlsOrder: ColorPickerControlsOrder = {
      colorField: 1,
      colorPreview: 2,
      colorPalette: 3
    };

    const minimalColorPickerControlsOrderToTest = generateOrderVariations(
      minimalColorPickerControlsOrder,
      2
    );

    minimalColorPickerControlsOrderToTest.forEach(order => {
      testColorPickerWithCustomizedOrder(order);
    });
  });

  describe("Default order behavior", () => {
    it("should render controls in default order when no order is specified", async () => {
      colorPickerElement.setProperty("showHueSlider", true);
      colorPickerElement.setProperty("showAlphaSlider", true);
      colorPickerElement.setProperty("showColorFormatSelector", true);
      colorPickerElement.setProperty("showColorPreview", true);
      colorPickerElement.setProperty("showColorPalette", true);
      colorPickerElement.setProperty("colorPalette", ["#ff0000", "#00ff00"]);

      await page.waitForChanges();

      const controls = await colorPickerElement.findAll(
        "ch-color-picker >>> :where(.color-field-container, .color-preview-container, .slider-group, .color-format-selector, .color-palette-container)"
      );

      expect(controls).toHaveLength(6);
      expect(controls[0]).toHaveClass("color-field-container");
      expect(controls[1]).toHaveClass("color-preview-container");
      expect(controls[4]).toHaveClass("color-format-selector");
      expect(controls[5]).toHaveClass("color-palette-container");
    });

    it("should handle missing controls in order gracefully", async () => {
      const partialOrder: ColorPickerControlsOrder = {
        colorField: 1,
        colorPalette: 2
      };

      colorPickerElement.setProperty("showColorPalette", true);
      colorPickerElement.setProperty("colorPalette", ["#ff0000"]);
      colorPickerElement.setProperty("order", partialOrder);

      await page.waitForChanges();

      const controls = await colorPickerElement.findAll(
        "ch-color-picker >>> :where(.color-field-container, .color-palette-container)"
      );

      expect(controls).toHaveLength(2);
      expect(controls[0]).toHaveClass("color-field-container");
      expect(controls[1]).toHaveClass("color-palette-container");
    });
  });

  describe("Order changes", () => {
    it("should reorder controls when order property changes", async () => {
      colorPickerElement.setProperty("showColorPreview", true);
      colorPickerElement.setProperty("showColorPalette", true);
      colorPickerElement.setProperty("colorPalette", ["#ff0000"]);

      const initialOrder: ColorPickerControlsOrder = {
        colorField: 1,
        colorPreview: 2,
        colorPalette: 3
      };

      colorPickerElement.setProperty("order", initialOrder);
      await page.waitForChanges();

      let controls = await colorPickerElement.findAll(
        "ch-color-picker >>> :where(.color-field-container, .color-preview-container, .color-palette-container)"
      );

      expect(controls[0]).toHaveClass("color-field-container");
      expect(controls[1]).toHaveClass("color-preview-container");
      expect(controls[2]).toHaveClass("color-palette-container");

      const newOrder: ColorPickerControlsOrder = {
        colorPalette: 1,
        colorField: 2,
        colorPreview: 3
      };

      colorPickerElement.setProperty("order", newOrder);
      await page.waitForChanges();

      controls = await colorPickerElement.findAll(
        "ch-color-picker >>> :where(.color-field-container, .color-preview-container, .color-palette-container)"
      );

      expect(controls[0]).toHaveClass("color-palette-container");
      expect(controls[1]).toHaveClass("color-field-container");
      expect(controls[2]).toHaveClass("color-preview-container");
    });
  });
});
