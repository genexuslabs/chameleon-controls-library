import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-color-field][keyboard]", () => {
  let page: E2EPage;
  let colorFieldElement: E2EElement;
  let canvasElement: E2EElement;
  let markerElement: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-color-field value="#808080"></ch-color-field>`,
      failOnConsoleError: true
    });
    colorFieldElement = await page.find("ch-color-field");
    canvasElement = await page.find("ch-color-field >>> canvas");
    markerElement = await page.find("ch-color-field >>> .marker");
    await page.waitForChanges();
  });

  describe("arrow key navigation", () => {
    it("should move marker right with ArrowRight key", async () => {
      const inputEvent = await colorFieldElement.spyOnEvent("input");
      const initialStyles = await markerElement.getComputedStyle();
      const initialLeft = initialStyles.left;

      await canvasElement.focus();
      await page.keyboard.press("ArrowRight");
      await page.waitForChanges();

      const newStyles = await markerElement.getComputedStyle();
      const newLeft = newStyles.left;

      expect(parseFloat(newLeft)).toBeGreaterThan(parseFloat(initialLeft));
      expect(inputEvent).toHaveReceivedEvent();
    });

    it("should move marker left with ArrowLeft key", async () => {
      const inputEvent = await colorFieldElement.spyOnEvent("input");

      await canvasElement.focus();
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.waitForChanges();

      const initialStyles = await markerElement.getComputedStyle();
      const initialLeft = initialStyles.left;
      // Clear previous events
      inputEvent.events.length = 0;

      await page.keyboard.press("ArrowLeft");
      await page.waitForChanges();

      const newStyles = await markerElement.getComputedStyle();
      const newLeft = newStyles.left;

      expect(parseFloat(newLeft)).toBeLessThan(parseFloat(initialLeft));
      expect(inputEvent).toHaveReceivedEvent();
    });

    it("should move marker down with ArrowDown key", async () => {
      const inputEvent = await colorFieldElement.spyOnEvent("input");
      const initialStyles = await markerElement.getComputedStyle();
      const initialTop = initialStyles.top;

      await canvasElement.focus();
      await page.keyboard.press("ArrowDown");
      await page.waitForChanges();

      const newStyles = await markerElement.getComputedStyle();
      const newTop = newStyles.top;

      expect(parseFloat(newTop)).toBeGreaterThan(parseFloat(initialTop));
      expect(inputEvent).toHaveReceivedEvent();
    });

    it("should move marker up with ArrowUp key", async () => {
      const inputEvent = await colorFieldElement.spyOnEvent("input");

      await canvasElement.focus();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      await page.waitForChanges();

      const initialStyles = await markerElement.getComputedStyle();
      const initialTop = initialStyles.top;
      // Clear previous events
      inputEvent.events.length = 0;

      await page.keyboard.press("ArrowUp");
      await page.waitForChanges();

      const newStyles = await markerElement.getComputedStyle();
      const newTop = newStyles.top;

      expect(parseFloat(newTop)).toBeLessThan(parseFloat(initialTop));
      expect(inputEvent).toHaveReceivedEvent();
    });
  });

  describe("step property", () => {
    it("should move by step amount", async () => {
      await colorFieldElement.setProperty("step", 10);
      await page.waitForChanges();

      const initialStyles = await markerElement.getComputedStyle();
      const initialLeft = initialStyles.left;

      await canvasElement.focus();
      await page.keyboard.press("ArrowRight");
      await page.waitForChanges();

      const newStyles = await markerElement.getComputedStyle();
      const newLeft = newStyles.left;
      const difference = parseFloat(newLeft) - parseFloat(initialLeft);

      // Should move by approximately 10 pixels
      expect(Math.abs(difference)).toBeCloseTo(10, 0);
    });

    it("should use default step of 1 when not specified", async () => {
      const initialStyles = await markerElement.getComputedStyle();
      const initialLeft = initialStyles.left;

      await canvasElement.focus();
      await page.keyboard.press("ArrowRight");
      await page.waitForChanges();

      const newStyles = await markerElement.getComputedStyle();
      const newLeft = newStyles.left;
      const difference = parseFloat(newLeft) - parseFloat(initialLeft);

      // Should move by approximately 1 pixel
      expect(Math.abs(difference)).toBeCloseTo(1, 0);
    });
  });

  describe("boundary constraints", () => {
    let smallPage: E2EPage;
    let smallCanvas: E2EElement;
    let smallMarker: E2EElement;

    beforeEach(async () => {
      smallPage = await newE2EPage({
        html: `
          <div style="width: 100px; height: 100px;">
            <ch-color-field step="20" value="#808080"></ch-color-field>
          </div>
        `,
        failOnConsoleError: true
      });
      smallCanvas = await smallPage.find("ch-color-field >>> canvas");
      smallMarker = await smallPage.find("ch-color-field >>> .marker");
      await smallPage.waitForChanges();
    });

    it("should not move beyond left boundary", async () => {
      await smallCanvas.focus();

      // Move to far left
      for (let i = 0; i < 10; i++) {
        await smallPage.keyboard.press("ArrowLeft");
      }
      await smallPage.waitForChanges();

      const styles = await smallMarker.getComputedStyle();
      const leftPosition = styles.left;

      await smallPage.keyboard.press("ArrowLeft");
      await smallPage.waitForChanges();

      const newStyles = await smallMarker.getComputedStyle();
      const newLeftPosition = newStyles.left;

      // Position should not change
      expect(newLeftPosition).toBe(leftPosition);
      expect(parseFloat(leftPosition)).toBe(0);
    });

    it("should not move beyond top boundary", async () => {
      await smallCanvas.focus();

      // Move to top
      for (let i = 0; i < 10; i++) {
        await smallPage.keyboard.press("ArrowUp");
      }
      await smallPage.waitForChanges();

      const styles = await smallMarker.getComputedStyle();
      const topPosition = styles.top;

      await smallPage.keyboard.press("ArrowUp");
      await smallPage.waitForChanges();

      const newStyles = await smallMarker.getComputedStyle();
      const newTopPosition = newStyles.top;

      // Position should not change
      expect(newTopPosition).toBe(topPosition);
      expect(parseFloat(topPosition)).toBe(0);
    });

    it("should not move beyond right boundary", async () => {
      await smallCanvas.focus();

      // Move to far right
      for (let i = 0; i < 10; i++) {
        await smallPage.keyboard.press("ArrowRight");
      }
      await smallPage.waitForChanges();

      const styles = await smallMarker.getComputedStyle();
      const rightPosition = styles.left;

      await smallPage.keyboard.press("ArrowRight");
      await smallPage.waitForChanges();

      const newStyles = await smallMarker.getComputedStyle();
      const newRightPosition = newStyles.left;

      // Position should not change
      expect(newRightPosition).toBe(rightPosition);
    });

    it("should not move beyond bottom boundary", async () => {
      await smallCanvas.focus();

      // Move to bottom
      for (let i = 0; i < 10; i++) {
        await smallPage.keyboard.press("ArrowDown");
      }
      await smallPage.waitForChanges();

      const styles = await smallMarker.getComputedStyle();
      const bottomPosition = styles.top;

      await smallPage.keyboard.press("ArrowDown");
      await smallPage.waitForChanges();

      const newStyles = await smallMarker.getComputedStyle();
      const newBottomPosition = newStyles.top;

      // Position should not change
      expect(newBottomPosition).toBe(bottomPosition);
    });
  });

  describe("non-arrow keys", () => {
    it("should not respond to other keys", async () => {
      const inputEvent = await colorFieldElement.spyOnEvent("input");
      const initialStyles = await markerElement.getComputedStyle();
      const initialLeft = initialStyles.left;
      const initialTop = initialStyles.top;

      await canvasElement.focus();
      await page.keyboard.press("Enter");
      await page.keyboard.press("Space");
      await page.keyboard.press("a");
      await page.keyboard.press("1");
      await page.waitForChanges();

      const newStyles = await markerElement.getComputedStyle();
      const newLeft = newStyles.left;
      const newTop = newStyles.top;

      expect(newLeft).toBe(initialLeft);
      expect(newTop).toBe(initialTop);
      expect(inputEvent).not.toHaveReceivedEvent();
    });
  });
});
