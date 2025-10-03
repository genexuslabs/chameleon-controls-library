import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

const CUSTOM_LABEL = "Custom color selector";
const CUSTOM_DESCRIPTION = "Custom 2D color picker";

const defaultAccessibleName = "Color field";
const defaultAccessibleRoleDescription = "2D color field";

const customAccessibleName = CUSTOM_LABEL;
const customAccessibleRoleDescription = CUSTOM_DESCRIPTION;

describe("[ch-color-field][accessibility]", () => {
  describe("ARIA attributes", () => {
    let page: E2EPage;
    let colorFieldElementRef: E2EElement;

    beforeEach(async () => {
      page = await newE2EPage({
        html: `<ch-color-field></ch-color-field>`,
        failOnConsoleError: true
      });
      colorFieldElementRef = await page.find("ch-color-field");
      await page.waitForChanges();
    });

    it("should have default aria-label and aria-roledescription", async () => {
      const ariaLabel = await colorFieldElementRef.getAttribute("aria-label");
      const ariaRoleDescription = await colorFieldElementRef.getAttribute(
        "aria-roledescription"
      );

      expect(ariaLabel).toBe(defaultAccessibleName);
      expect(ariaRoleDescription).toBe(defaultAccessibleRoleDescription);
    });

    it("should apply custom translations for aria attributes", async () => {
      await colorFieldElementRef.setProperty(
        "accessibleName",
        customAccessibleName
      );
      await colorFieldElementRef.setProperty(
        "accessibleRoleDescription",
        customAccessibleRoleDescription
      );
      await page.waitForChanges();
      colorFieldElementRef = await page.find("ch-color-field");

      const ariaLabel = await colorFieldElementRef.getAttribute("aria-label");
      const ariaRoleDescription = await colorFieldElementRef.getAttribute(
        "aria-roledescription"
      );

      expect(ariaLabel).toBe(CUSTOM_LABEL);
      expect(ariaRoleDescription).toBe(CUSTOM_DESCRIPTION);
    });

    it("should have role='application' on host", async () => {
      const role = await colorFieldElementRef.getAttribute("role");

      expect(role).toBe("application");
    });

    it("should have aria-hidden='true' on canvas", async () => {
      const canvas = await page.find("ch-color-field >>> canvas");
      const ariaHidden = await canvas.getAttribute("aria-hidden");

      expect(ariaHidden).toBe("true");
    });
  });

  describe("Interactive states", () => {
    let page: E2EPage;
    let colorFieldElementRef: E2EElement;

    beforeEach(async () => {
      page = await newE2EPage({
        html: `<ch-color-field></ch-color-field>`,
        failOnConsoleError: true
      });
      colorFieldElementRef = await page.find("ch-color-field");
      await page.waitForChanges();
    });

    it("should have tabindex='0' when interactive", async () => {
      const tabindex = await colorFieldElementRef.getAttribute("tabindex");
      expect(tabindex).toBe("0");
    });

    it("should not have tabindex when disabled", async () => {
      await colorFieldElementRef.setProperty("disabled", true);
      await page.waitForChanges();
      colorFieldElementRef = await page.find("ch-color-field");

      const tabindex = await colorFieldElementRef.getAttribute("tabindex");
      const ariaDisabled = await colorFieldElementRef.getAttribute(
        "aria-disabled"
      );

      expect(tabindex).toBeNull();
      expect(ariaDisabled).toBe("true");
    });

    it("should have tabindex='0' when readonly", async () => {
      await colorFieldElementRef.setProperty("readonly", true);
      await page.waitForChanges();
      colorFieldElementRef = await page.find("ch-color-field");

      const tabindex = await colorFieldElementRef.getAttribute("tabindex");
      const ariaReadonly = await colorFieldElementRef.getAttribute(
        "aria-readonly"
      );

      expect(tabindex).toBe("0");
      expect(ariaReadonly).toBe("true");
    });

    it("should not have aria-disabled when enabled", async () => {
      const ariaDisabled = await colorFieldElementRef.getAttribute(
        "aria-disabled"
      );
      expect(ariaDisabled).toBeNull();
    });

    it("should not have aria-readonly when not readonly", async () => {
      const ariaReadonly = await colorFieldElementRef.getAttribute(
        "aria-readonly"
      );
      expect(ariaReadonly).toBeNull();
    });
  });

  describe("Keyboard navigation", () => {
    let page: E2EPage;
    let colorFieldElementRef: E2EElement;

    beforeEach(async () => {
      page = await newE2EPage({
        html: `<ch-color-field value="#ff0000"></ch-color-field>`,
        failOnConsoleError: true
      });
      colorFieldElementRef = await page.find("ch-color-field");
      await page.waitForChanges();
    });

    it("should be focusable with keyboard", async () => {
      await colorFieldElementRef.focus();
      await page.waitForChanges();

      const tabindex = await colorFieldElementRef.getAttribute("tabindex");
      expect(tabindex).toBe("0");
    });

    it("should not be focusable when disabled", async () => {
      await colorFieldElementRef.setProperty("disabled", true);
      await page.waitForChanges();
      colorFieldElementRef = await page.find("ch-color-field >>> canvas");

      const tabindex = await colorFieldElementRef.getAttribute("tabindex");
      expect(tabindex).toBeNull();
    });

    it("should respond to keyboard events", async () => {
      const inputEvent = await colorFieldElementRef.spyOnEvent("input");

      await colorFieldElementRef.focus();
      await page.waitForChanges();

      await page.keyboard.press("ArrowRight");
      await page.waitForChanges();

      expect(inputEvent).toHaveReceivedEvent();
    });
  });

  describe("Form association", () => {
    let page: E2EPage;

    it("should be associated with the form", async () => {
      page = await newE2EPage({
        html: `
          <form id="test-form">
            <ch-color-field name="color" value="#ff0000"></ch-color-field>
          </form>
        `,
        failOnConsoleError: true
      });

      await page.waitForChanges();

      const colorFieldElementRef = await page.find("ch-color-field");
      const value = await colorFieldElementRef.getProperty("value");

      expect(value).toBe("#ff0000");
    });

    it("should update form value when color changes", async () => {
      page = await newE2EPage({
        html: `
          <form id="test-form">
            <ch-color-field name="color" value="#ff0000"></ch-color-field>
          </form>
        `,
        failOnConsoleError: true
      });

      const colorFieldElementRef = await page.find("ch-color-field");
      const canvasElement = await page.find("ch-color-field >>> canvas");

      await canvasElement.click();
      await page.waitForChanges();

      const newValue = await colorFieldElementRef.getProperty("value");
      expect(newValue).not.toBe("#ff0000");
    });
  });

  describe("External label association", () => {
    let page: E2EPage;

    it("should work with external label using for attribute", async () => {
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      page = await newE2EPage({
        html: `
          <label for="color-picker">Choose a color:</label>
          <ch-color-field id="color-picker"></ch-color-field>
        `,
        failOnConsoleError: true
      });

      await page.waitForChanges();

      const labelElement = await page.find("label");
      const colorFieldElementRef = await page.find("ch-color-field");

      // Verify the label is properly associated
      const labelFor = await labelElement.getAttribute("for");
      const colorFieldId = await colorFieldElementRef.getAttribute("id");

      expect(labelFor).toBe(colorFieldId);
      expect(colorFieldId).toBe("color-picker");
      consoleSpy.mockRestore();
    });
  });

  describe("Color format preservation", () => {
    let page: E2EPage;
    let colorFieldElementRef: E2EElement;

    it("should maintain aria attributes when value changes", async () => {
      page = await newE2EPage({
        html: `<ch-color-field value="#ff0000"></ch-color-field>`,
        failOnConsoleError: true
      });

      colorFieldElementRef = await page.find("ch-color-field");
      const canvasElement = await page.find("ch-color-field >>> canvas");

      const initialAriaLabel = await colorFieldElementRef.getAttribute(
        "aria-label"
      );
      const initialRole = await colorFieldElementRef.getAttribute("role");

      await canvasElement.click();
      await page.waitForChanges();

      const finalAriaLabel = await colorFieldElementRef.getAttribute(
        "aria-label"
      );
      const finalRole = await colorFieldElementRef.getAttribute("role");

      expect(finalAriaLabel).toBe(initialAriaLabel);
      expect(finalRole).toBe(initialRole);
    });
  });
});
