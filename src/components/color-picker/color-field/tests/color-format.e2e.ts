import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-color-field][color-formats]", () => {
  let page: E2EPage;
  let colorFieldElement: E2EElement;
  let canvasElement: E2EElement;

  describe("hex format", () => {
    beforeEach(async () => {
      page = await newE2EPage({
        html: `<ch-color-field value="#ff0000"></ch-color-field>`,
        failOnConsoleError: true
      });
      colorFieldElement = await page.find("ch-color-field");
      canvasElement = await page.find("ch-color-field >>> canvas");
      await page.waitForChanges();
    });

    it("should accept 3-digit hex", async () => {
      await colorFieldElement.setProperty("value", "#f00");
      await page.waitForChanges();

      const value = await colorFieldElement.getProperty("value");
      expect(value).toBe("#f00");
    });

    it("should accept 6-digit hex", async () => {
      await colorFieldElement.setProperty("value", "#00ff00");
      await page.waitForChanges();

      const value = await colorFieldElement.getProperty("value");
      expect(value).toBe("#00ff00");
    });

    it("should accept 8-digit hex with alpha", async () => {
      await colorFieldElement.setProperty("value", "#0000ff80");
      await page.waitForChanges();

      const value = await colorFieldElement.getProperty("value");
      expect(value).toBe("#0000ff80");
    });

    it("should maintain hex format after interaction", async () => {
      await canvasElement.click();
      await page.waitForChanges();

      const newValue = await colorFieldElement.getProperty("value");
      expect(newValue).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe("rgb format", () => {
    beforeEach(async () => {
      page = await newE2EPage({
        html: `<ch-color-field value="rgb(255, 0, 0)"></ch-color-field>`,
        failOnConsoleError: true
      });
      colorFieldElement = await page.find("ch-color-field");
      canvasElement = await page.find("ch-color-field >>> canvas");
      await page.waitForChanges();
    });

    it("should accept rgb format", async () => {
      const value = await colorFieldElement.getProperty("value");
      expect(value).toBe("rgb(255, 0, 0)");
    });

    it("should accept rgb without spaces", async () => {
      await colorFieldElement.setProperty("value", "rgb(0,255,0)");
      await page.waitForChanges();

      const value = await colorFieldElement.getProperty("value");
      expect(value).toBe("rgb(0,255,0)");
    });

    it("should maintain rgb format after interaction", async () => {
      await canvasElement.click();
      await page.waitForChanges();

      const newValue = await colorFieldElement.getProperty("value");
      expect(newValue).toMatch(/^rgb\(/);
    });
  });

  describe("rgba format", () => {
    beforeEach(async () => {
      page = await newE2EPage({
        html: `<ch-color-field value="rgba(255, 0, 0, 0.5)"></ch-color-field>`,
        failOnConsoleError: true
      });
      colorFieldElement = await page.find("ch-color-field");
      canvasElement = await page.find("ch-color-field >>> canvas");
      await page.waitForChanges();
    });

    it("should accept rgba format", async () => {
      const value = await colorFieldElement.getProperty("value");
      expect(value).toBe("rgba(255, 0, 0, 0.5)");
    });

    it("should accept rgba with alpha 0", async () => {
      await colorFieldElement.setProperty("value", "rgba(0, 0, 255, 0)");
      await page.waitForChanges();

      const value = await colorFieldElement.getProperty("value");
      expect(value).toBe("rgba(0, 0, 255, 0)");
    });

    it("should accept rgba with alpha 1", async () => {
      await colorFieldElement.setProperty("value", "rgba(0, 255, 0, 1)");
      await page.waitForChanges();

      const value = await colorFieldElement.getProperty("value");
      expect(value).toBe("rgba(0, 255, 0, 1)");
    });

    it("should maintain rgba format after interaction", async () => {
      await canvasElement.click();
      await page.waitForChanges();

      const newValue = await colorFieldElement.getProperty("value");
      expect(newValue).toMatch(/^rgba\(/);
    });
  });

  describe("hsl format", () => {
    beforeEach(async () => {
      page = await newE2EPage({
        html: `<ch-color-field value="hsl(0, 100%, 50%)"></ch-color-field>`,
        failOnConsoleError: true
      });
      colorFieldElement = await page.find("ch-color-field");
      canvasElement = await page.find("ch-color-field >>> canvas");
      await page.waitForChanges();
    });

    it("should accept hsl format", async () => {
      const value = await colorFieldElement.getProperty("value");
      expect(value).toBe("hsl(0, 100%, 50%)");
    });

    it("should accept hsl with different hue values", async () => {
      await colorFieldElement.setProperty("value", "hsl(120, 100%, 50%)");
      await page.waitForChanges();
      expect(await colorFieldElement.getProperty("value")).toBe(
        "hsl(120, 100%, 50%)"
      );

      await colorFieldElement.setProperty("value", "hsl(240, 100%, 50%)");
      await page.waitForChanges();
      expect(await colorFieldElement.getProperty("value")).toBe(
        "hsl(240, 100%, 50%)"
      );
    });

    it("should maintain hsl format after interaction", async () => {
      await canvasElement.click();
      await page.waitForChanges();

      const newValue = await colorFieldElement.getProperty("value");
      expect(newValue).toMatch(/^hsl\(/);
    });
  });

  describe("hsla format", () => {
    beforeEach(async () => {
      page = await newE2EPage({
        html: `<ch-color-field value="hsla(0, 100%, 50%, 0.5)"></ch-color-field>`,
        failOnConsoleError: true
      });
      colorFieldElement = await page.find("ch-color-field");
      canvasElement = await page.find("ch-color-field >>> canvas");
      await page.waitForChanges();
    });

    it("should accept hsla format", async () => {
      const value = await colorFieldElement.getProperty("value");
      expect(value).toBe("hsla(0, 100%, 50%, 0.5)");
    });

    it("should maintain hsla format after interaction", async () => {
      await canvasElement.click();
      await page.waitForChanges();

      const newValue = await colorFieldElement.getProperty("value");
      expect(newValue).toMatch(/^hsla\(/);
    });
  });

  describe("format preservation", () => {
    it("should preserve format when changing colors", async () => {
      // RGB
      page = await newE2EPage({
        html: `<ch-color-field value="rgb(100, 100, 100)"></ch-color-field>`,
        failOnConsoleError: true
      });
      colorFieldElement = await page.find("ch-color-field");
      canvasElement = await page.find("ch-color-field >>> canvas");

      await canvasElement.focus();
      await page.keyboard.press("ArrowRight");
      await page.waitForChanges();

      let value = await colorFieldElement.getProperty("value");
      expect(value).toMatch(/^rgb\(/);

      // HSL
      await colorFieldElement.setProperty("value", "hsl(180, 50%, 50%)");
      await page.waitForChanges();

      await page.keyboard.press("ArrowDown");
      await page.waitForChanges();

      value = await colorFieldElement.getProperty("value");
      expect(value).toMatch(/^hsl\(/);
    });
  });

  describe("invalid formats", () => {
    beforeEach(async () => {
      page = await newE2EPage({
        html: `<ch-color-field></ch-color-field>`,
        failOnConsoleError: false
      });
      colorFieldElement = await page.find("ch-color-field");
      await page.waitForChanges();
    });

    it("should handle invalid color gracefully", async () => {
      await colorFieldElement.setProperty("value", "not-a-color");
      await page.waitForChanges();

      const marker = await page.find("ch-color-field >>> .marker");
      expect(marker).toBeTruthy();
    });

    it("should maintain previous value when empty string is set", async () => {
      await colorFieldElement.setProperty("value", "#ff0000");
      await page.waitForChanges();
      expect(await colorFieldElement.getProperty("value")).toBe("#ff0000");

      await colorFieldElement.setProperty("value", "");
      await page.waitForChanges();

      const value = await colorFieldElement.getProperty("value");
      expect(value).toBe("#ff0000");
    });

    it("should maintain previous value when invalid color is set", async () => {
      await colorFieldElement.setProperty("value", "rgb(255, 0, 0)");
      await page.waitForChanges();
      expect(await colorFieldElement.getProperty("value")).toBe(
        "rgb(255, 0, 0)"
      );

      await colorFieldElement.setProperty("value", "not-a-color");
      await page.waitForChanges();

      const value = await colorFieldElement.getProperty("value");
      expect(value).toBe("rgb(255, 0, 0)");
    });
  });
});
