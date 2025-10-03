import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-color-field][mouse]", () => {
  let page: E2EPage;
  let colorFieldElement: E2EElement;
  let canvasElement: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-color-field value="#ff0000"></ch-color-field>`,
      failOnConsoleError: true
    });
    colorFieldElement = await page.find("ch-color-field");
    canvasElement = await page.find("ch-color-field >>> canvas");
    await page.waitForChanges();
  });

  describe("click interaction", () => {
    it("should emit input event on canvas click", async () => {
      const inputEvent = await colorFieldElement.spyOnEvent("input");

      await canvasElement.click();
      await page.waitForChanges();

      expect(inputEvent).toHaveReceivedEvent();
    });

    it("should update value on canvas click", async () => {
      const initialValue = await colorFieldElement.getProperty("value");

      await canvasElement.click();
      await page.waitForChanges();

      const newValue = await colorFieldElement.getProperty("value");
      expect(newValue).not.toBe(initialValue);
    });

    it("should emit ColorVariants object in input event", async () => {
      const inputEvent = await colorFieldElement.spyOnEvent("input");

      await canvasElement.click();
      await page.waitForChanges();

      expect(inputEvent).toHaveReceivedEvent();

      const eventDetail = inputEvent.events[0].detail;

      expect(eventDetail).toHaveProperty("rgb");
      expect(eventDetail).toHaveProperty("rgba");
      expect(eventDetail).toHaveProperty("hex");
      expect(eventDetail).toHaveProperty("hsl");
      expect(eventDetail).toHaveProperty("hsla");
      expect(eventDetail).toHaveProperty("hsv");
    });
  });

  describe("drag interaction", () => {
    it("should update color while dragging", async () => {
      const inputEvent = await colorFieldElement.spyOnEvent("input");

      // Simulate drag
      await page.mouse.move(100, 100);
      await canvasElement.hover();
      await page.mouse.down();
      await page.mouse.move(150, 150);
      await page.mouse.up();
      await page.waitForChanges();

      expect(inputEvent).toHaveReceivedEvent();
    });

    it("should only emit one input event after drag ends", async () => {
      const inputEvent = await colorFieldElement.spyOnEvent("input");

      // Simulate drag
      await page.mouse.move(100, 100);
      await canvasElement.hover();
      await page.mouse.down();
      await page.mouse.move(120, 120);
      await page.mouse.move(140, 140);
      await page.mouse.move(160, 160);
      await page.mouse.up();
      await page.waitForChanges();

      expect(inputEvent).toHaveReceivedEventTimes(1);
    });

    it("should update marker position during drag", async () => {
      const marker = await page.find("ch-color-field >>> .marker");
      const initialLeft = await marker.getComputedStyle("left");
      const initialTop = await marker.getComputedStyle("top");

      // Simulate drag
      await page.mouse.move(100, 100);
      await canvasElement.hover();
      await page.mouse.down();
      await page.mouse.move(200, 200);
      await page.mouse.up();
      await page.waitForChanges();

      const newLeft = await marker.getComputedStyle("left");
      const newTop = await marker.getComputedStyle("top");

      expect(newLeft).not.toBe(initialLeft);
      expect(newTop).not.toBe(initialTop);
    });
  });

  describe("focus interaction", () => {
    it("should maintain focus after color selection", async () => {
      await canvasElement.focus();
      await canvasElement.click();
      await page.waitForChanges();

      const tabindex = await colorFieldElement.getAttribute("tabindex");
      expect(tabindex).toBe("0");
    });
  });
});
