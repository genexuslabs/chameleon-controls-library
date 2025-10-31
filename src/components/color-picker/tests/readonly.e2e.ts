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
        ">>> [part*='color-field']"
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

      const ariaReadonly = await formatSelector.getAttribute("aria-readonly");
      expect(ariaReadonly).toBe("true");
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
        ">>> [part*='color-field']"
      );
      const formatSelector = await colorPickerElement.find(
        ">>> [part*='color-format__combo-box']"
      );

      const colorFieldAriaReadonly = await colorField.getAttribute(
        "aria-readonly"
      );
      const formatSelectorAriaReadonly = await formatSelector.getAttribute(
        "aria-readonly"
      );

      expect(colorFieldAriaReadonly).toBeNull();
      expect(formatSelectorAriaReadonly).toBeNull();
    });

    it("should set aria-readonly when readonly is true", async () => {
      await colorPickerElement.setProperty("readonly", true);
      await page.waitForChanges();

      const colorField = await colorPickerElement.find(
        ">>> [part*='color-field']"
      );
      const formatSelector = await colorPickerElement.find(
        ">>> [part*='color-format__combo-box']"
      );

      const colorFieldAriaReadonly = await colorField.getAttribute(
        "aria-readonly"
      );
      const formatSelectorAriaReadonly = await formatSelector.getAttribute(
        "aria-readonly"
      );

      expect(colorFieldAriaReadonly).toBe("true");
      expect(formatSelectorAriaReadonly).toBe("true");
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
      await page.waitForChanges();
    });

    it("should not emit input events when readonly", async () => {
      const inputEvent = await colorPickerElement.spyOnEvent("input");

      await colorPickerElement.setProperty("value", "#00ff00");
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
