import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChAccordionRender } from "../accordion.lit";
import "../accordion.lit.js";
import type { AccordionModel } from "../types";

describe("[ch-accordion-render][expand-collapse]", () => {
  let accordionRef: ChAccordionRender;
  let model: AccordionModel;

  afterEach(cleanup);

  describe("toggle on click", () => {
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

    it("should expand a collapsed item when its header button is clicked", async () => {
      const button = accordionRef.shadowRoot!.querySelector(
        "#item-1"
      ) as HTMLButtonElement;
      button.click();
      await accordionRef.updateComplete;

      expect(model[0].expanded).toBe(true);
      expect(button.getAttribute("aria-expanded")).toBe("true");
    });

    it("should collapse an expanded item when its header button is clicked", async () => {
      // First expand
      const button = accordionRef.shadowRoot!.querySelector(
        "#item-1"
      ) as HTMLButtonElement;
      button.click();
      await accordionRef.updateComplete;

      expect(model[0].expanded).toBe(true);

      // Then collapse
      button.click();
      await accordionRef.updateComplete;

      expect(model[0].expanded).toBe(false);
      expect(button.getAttribute("aria-expanded")).toBe("false");
    });

    it("should allow multiple items to be expanded simultaneously when singleItemExpanded is false", async () => {
      const button1 = accordionRef.shadowRoot!.querySelector(
        "#item-1"
      ) as HTMLButtonElement;
      const button2 = accordionRef.shadowRoot!.querySelector(
        "#item-2"
      ) as HTMLButtonElement;

      button1.click();
      await accordionRef.updateComplete;

      button2.click();
      await accordionRef.updateComplete;

      expect(model[0].expanded).toBe(true);
      expect(model[1].expanded).toBe(true);
    });

    it("should not expand a disabled item when clicked", async () => {
      model[0].disabled = true;
      accordionRef.model = [...model];
      await accordionRef.updateComplete;

      const button = accordionRef.shadowRoot!.querySelector(
        "#item-1"
      ) as HTMLButtonElement;
      button.click();
      await accordionRef.updateComplete;

      expect(model[0].expanded).toBe(false);
    });

    it("should add the panel--expanded class to the panel div when expanded", async () => {
      const button = accordionRef.shadowRoot!.querySelector(
        "#item-1"
      ) as HTMLButtonElement;
      button.click();
      await accordionRef.updateComplete;

      const panel = button.closest(".panel")!;
      expect(panel.classList.contains("panel--expanded")).toBe(true);
    });

    it("should remove the section--hidden class from the section when expanded", async () => {
      const button = accordionRef.shadowRoot!.querySelector(
        "#item-1"
      ) as HTMLButtonElement;
      const section = button.closest(".panel")!.querySelector("section")!;

      expect(section.classList.contains("section--hidden")).toBe(true);

      button.click();
      await accordionRef.updateComplete;

      expect(section.classList.contains("section--hidden")).toBe(false);
    });
  });

  describe("singleItemExpanded mode", () => {
    beforeEach(async () => {
      model = [
        { id: "item-1", caption: "Item 1", expanded: true },
        { id: "item-2", caption: "Item 2", expanded: false },
        { id: "item-3", caption: "Item 3", expanded: false }
      ];
      const result = await render(
        html`<ch-accordion-render
          ?single-item-expanded=${true}
          .model=${model}
        ></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;
    });

    it("should collapse the previously expanded item when a new item is expanded", async () => {
      const button2 = accordionRef.shadowRoot!.querySelector(
        "#item-2"
      ) as HTMLButtonElement;
      button2.click();
      await accordionRef.updateComplete;

      expect(model[0].expanded).toBe(false);
      expect(model[1].expanded).toBe(true);
    });

    it("should allow collapsing the only expanded item", async () => {
      const button1 = accordionRef.shadowRoot!.querySelector(
        "#item-1"
      ) as HTMLButtonElement;
      button1.click();
      await accordionRef.updateComplete;

      expect(model[0].expanded).toBe(false);
    });

    it("should close all items except the last when switching to singleItemExpanded with multiple expanded", async () => {
      // Start with singleItemExpanded off
      const multiModel: AccordionModel = [
        { id: "item-1", caption: "Item 1", expanded: true },
        { id: "item-2", caption: "Item 2", expanded: true },
        { id: "item-3", caption: "Item 3", expanded: true }
      ];

      cleanup();
      const result = await render(
        html`<ch-accordion-render .model=${multiModel}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      // Now enable singleItemExpanded
      accordionRef.singleItemExpanded = true;
      await accordionRef.updateComplete;

      // Only the last expanded item should remain open
      expect(multiModel[0].expanded).toBe(false);
      expect(multiModel[1].expanded).toBe(false);
      expect(multiModel[2].expanded).toBe(true);
    });
  });
});

