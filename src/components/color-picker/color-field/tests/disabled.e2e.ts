import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-color-field][disabled]", () => {
  let page: E2EPage;
  let colorFieldElement: E2EElement;

  describe("when disabled", () => {
    beforeEach(async () => {
      page = await newE2EPage({
        html: `<ch-color-field disabled value="#ff0000"></ch-color-field>`,
        failOnConsoleError: true
      });
      colorFieldElement = await page.find("ch-color-field");
      await page.waitForChanges();
    });

    it("should not emit input event on click", async () => {
      const inputEvent = await colorFieldElement.spyOnEvent("input");
      const canvas = await page.find("ch-color-field >>> canvas");

      await canvas.click();
      await page.waitForChanges();

      expect(inputEvent).not.toHaveReceivedEvent();
    });

    it("should not respond to keyboard navigation", async () => {
      const inputEvent = await colorFieldElement.spyOnEvent("input");
      const canvas = await page.find("ch-color-field >>> canvas");

      await canvas.focus();
      await page.keyboard.press("ArrowRight");
      await page.waitForChanges();

      expect(inputEvent).not.toHaveReceivedEvent();
    });

    it("should have aria-disabled attribute", async () => {
      const canvas = await page.find("ch-color-field >>> canvas");
      const ariaDisabled = await canvas.getAttribute("aria-disabled");

      expect(ariaDisabled).toBe("true");
    });

    it("should have tabindex -1", async () => {
      const canvas = await page.find("ch-color-field >>> canvas");
      const tabindex = await canvas.getAttribute("tabindex");

      expect(tabindex).toBe("-1");
    });
  });

  describe("when readonly", () => {
    beforeEach(async () => {
      page = await newE2EPage({
        html: `<ch-color-field readonly value="#00ff00"></ch-color-field>`,
        failOnConsoleError: true
      });
      colorFieldElement = await page.find("ch-color-field");
      await page.waitForChanges();
    });

    it("should not emit input event on click", async () => {
      const inputEvent = await colorFieldElement.spyOnEvent("input");
      const canvas = await page.find("ch-color-field >>> canvas");

      await canvas.click();
      await page.waitForChanges();

      expect(inputEvent).not.toHaveReceivedEvent();
    });

    it("should not respond to keyboard navigation", async () => {
      const inputEvent = await colorFieldElement.spyOnEvent("input");
      const canvas = await page.find("ch-color-field >>> canvas");

      await canvas.focus();
      await page.keyboard.press("ArrowDown");
      await page.waitForChanges();

      expect(inputEvent).not.toHaveReceivedEvent();
    });

    it("should have aria-readonly attribute", async () => {
      const canvas = await page.find("ch-color-field >>> canvas");
      const ariaReadonly = await canvas.getAttribute("aria-readonly");

      expect(ariaReadonly).toBe("true");
    });

    it("should have tabindex -1", async () => {
      const canvas = await page.find("ch-color-field >>> canvas");
      const tabindex = await canvas.getAttribute("tabindex");

      expect(tabindex).toBe("-1");
    });
  });

  describe("when enabling/disabling dynamically", () => {
    beforeEach(async () => {
      page = await newE2EPage({
        html: `<ch-color-field value="#0000ff"></ch-color-field>`,
        failOnConsoleError: true
      });
      colorFieldElement = await page.find("ch-color-field");
      await page.waitForChanges();
    });

    it("should update interactivity when disabled state changes", async () => {
      const inputEvent = await colorFieldElement.spyOnEvent("input");
      const canvas = await page.find("ch-color-field >>> canvas");

      await canvas.click();
      await page.waitForChanges();
      expect(inputEvent).toHaveReceivedEvent();

      // Clear events on input
      inputEvent.events.length = 0;

      await colorFieldElement.setProperty("disabled", true);
      await page.waitForChanges();

      await canvas.click();
      await page.waitForChanges();
      expect(inputEvent).not.toHaveReceivedEvent();

      await colorFieldElement.setProperty("disabled", false);
      await page.waitForChanges();

      await canvas.click();
      await page.waitForChanges();
      expect(inputEvent).toHaveReceivedEvent();
    });
  });
});
