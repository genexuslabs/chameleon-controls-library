import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChAccordionRender } from "../accordion.lit";
import "../accordion.lit.js";
import type { AccordionModel } from "../types";

describe("[ch-accordion-render][lazy-rendering]", () => {
  let accordionRef: ChAccordionRender;
  let model: AccordionModel;

  afterEach(cleanup);

  describe("renderedItems Set lazy logic", () => {
    beforeEach(async () => {
      model = [
        { id: "item-1", caption: "Item 1", expanded: false },
        { id: "item-2", caption: "Item 2", expanded: false },
        { id: "item-3", caption: "Item 3", expanded: false }
      ];
      const result = await render(
        html`<ch-accordion-render .model=${model}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;
    });

    it("should not render the sub-section content for items that have never been expanded", () => {
      const subSections =
        accordionRef.shadowRoot!.querySelectorAll(".sub-section");
      expect(subSections.length).toBe(0);
    });

    it("should render the sub-section content when an item is expanded for the first time", async () => {
      const button = accordionRef.shadowRoot!.querySelector(
        "#item-1"
      ) as HTMLButtonElement;
      button.click();
      await accordionRef.updateComplete;

      const subSections =
        accordionRef.shadowRoot!.querySelectorAll(".sub-section");
      expect(subSections.length).toBe(1);

      const slot = subSections[0].querySelector("slot");
      expect(slot!.getAttribute("name")).toBe("item-1");
    });

    it("should keep the sub-section in the DOM after the item is collapsed (lazy-once behavior)", async () => {
      // Expand item-1
      const button = accordionRef.shadowRoot!.querySelector(
        "#item-1"
      ) as HTMLButtonElement;
      button.click();
      await accordionRef.updateComplete;

      // Collapse item-1
      button.click();
      await accordionRef.updateComplete;

      // The sub-section should still be in the DOM because it was rendered once
      const subSections =
        accordionRef.shadowRoot!.querySelectorAll(".sub-section");
      expect(subSections.length).toBe(1);
    });

    it("should lazily render multiple items independently", async () => {
      // Expand item-1
      const button1 = accordionRef.shadowRoot!.querySelector(
        "#item-1"
      ) as HTMLButtonElement;
      button1.click();
      await accordionRef.updateComplete;

      // Expand item-3
      const button3 = accordionRef.shadowRoot!.querySelector(
        "#item-3"
      ) as HTMLButtonElement;
      button3.click();
      await accordionRef.updateComplete;

      // Both should have sub-sections, but not item-2
      const subSections =
        accordionRef.shadowRoot!.querySelectorAll(".sub-section");
      expect(subSections.length).toBe(2);

      const slotNames = Array.from(subSections).map(ss =>
        ss.querySelector("slot")!.getAttribute("name")
      );
      expect(slotNames).toContain("item-1");
      expect(slotNames).toContain("item-3");
      expect(slotNames).not.toContain("item-2");
    });
  });

  describe("initially expanded items", () => {
    it("should render the sub-section for items that start expanded in the model", async () => {
      const expandedModel: AccordionModel = [
        { id: "item-1", caption: "Item 1", expanded: true },
        { id: "item-2", caption: "Item 2", expanded: false }
      ];
      const result = await render(
        html`<ch-accordion-render
          .model=${expandedModel}
        ></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const subSections =
        accordionRef.shadowRoot!.querySelectorAll(".sub-section");
      expect(subSections.length).toBe(1);
      expect(subSections[0].querySelector("slot")!.getAttribute("name")).toBe(
        "item-1"
      );
    });
  });

  describe("model replacement clears lazy state", () => {
    it("should clear the rendered state when the model is replaced", async () => {
      // Expand item-1 to add it to renderedItems
      const button = accordionRef.shadowRoot!.querySelector(
        "#item-1"
      ) as HTMLButtonElement;
      button.click();
      await accordionRef.updateComplete;

      let subSections =
        accordionRef.shadowRoot!.querySelectorAll(".sub-section");
      expect(subSections.length).toBe(1);

      // Replace the entire model
      const newModel: AccordionModel = [
        { id: "new-1", caption: "New 1", expanded: false },
        { id: "new-2", caption: "New 2", expanded: false }
      ];
      accordionRef.model = newModel;
      await accordionRef.updateComplete;

      // No sub-sections should be rendered since nothing is expanded
      subSections = accordionRef.shadowRoot!.querySelectorAll(".sub-section");
      expect(subSections.length).toBe(0);
    });
  });
});

