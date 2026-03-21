import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChAccordionRender } from "../accordion.lit";
import "../accordion.lit.js";
import type { AccordionModel } from "../types";

const SIMPLE_MODEL: AccordionModel = [
  { id: "item-1", caption: "Item 1", expanded: false },
  { id: "item-2", caption: "Item 2", expanded: true },
  { id: "item-3", caption: "Item 3", expanded: false }
];

describe("[ch-accordion-render][basic]", () => {
  let accordionRef: ChAccordionRender;

  afterEach(cleanup);

  describe("shadow DOM", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-accordion-render></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;
    });

    it("should have a shadow root", () => {
      expect(accordionRef.shadowRoot).toBeTruthy();
    });
  });

  describe("default properties", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-accordion-render></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;
    });

    it('the "disabled" property should be false by default', () => {
      expect(accordionRef.disabled).toBe(false);
    });

    it('the "expandableButtonPosition" property should be "end" by default', () => {
      expect(accordionRef.expandableButtonPosition).toBe("end");
    });

    it('the "getImagePathCallback" property should be undefined by default', () => {
      expect(accordionRef.getImagePathCallback).toBeUndefined();
    });

    it('the "model" property should be undefined by default', () => {
      expect(accordionRef.model).toBeUndefined();
    });

    it('the "singleItemExpanded" property should be false by default', () => {
      expect(accordionRef.singleItemExpanded).toBe(false);
    });
  });

  describe("empty model rendering", () => {
    it("should render nothing when model is not set", async () => {
      const result = await render(
        html`<ch-accordion-render></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const panels = accordionRef.shadowRoot!.querySelectorAll(".panel");
      expect(panels.length).toBe(0);
    });

    it("should render nothing when model is undefined", async () => {
      const result = await render(
        html`<ch-accordion-render .model=${undefined}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const panels = accordionRef.shadowRoot!.querySelectorAll(".panel");
      expect(panels.length).toBe(0);
    });

    it("should render nothing when model is null", async () => {
      const result = await render(
        html`<ch-accordion-render .model=${null as any}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const panels = accordionRef.shadowRoot!.querySelectorAll(".panel");
      expect(panels.length).toBe(0);
    });

    it("should render zero panels for an empty array model", async () => {
      const result = await render(
        html`<ch-accordion-render .model=${[]}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const panels = accordionRef.shadowRoot!.querySelectorAll(".panel");
      expect(panels.length).toBe(0);
    });
  });

  describe("model rendering", () => {
    beforeEach(async () => {
      const model = structuredClone(SIMPLE_MODEL);
      const result = await render(
        html`<ch-accordion-render .model=${model}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;
    });

    it("should render 3 panels for a 3-item model", () => {
      const panels = accordionRef.shadowRoot!.querySelectorAll(".panel");
      expect(panels.length).toBe(3);
    });

    it("should render button headers with item captions", () => {
      const buttons = accordionRef.shadowRoot!.querySelectorAll("button");
      expect(buttons[0].textContent!.trim()).toBe("Item 1");
      expect(buttons[1].textContent!.trim()).toBe("Item 2");
      expect(buttons[2].textContent!.trim()).toBe("Item 3");
    });

    it("should render a section element for each panel", () => {
      const sections = accordionRef.shadowRoot!.querySelectorAll("section");
      expect(sections.length).toBe(3);
    });

    it("should render slot elements inside sections for expanded items", () => {
      const slots =
        accordionRef.shadowRoot!.querySelectorAll(".sub-section slot");
      // Only the expanded item (item-2) should have a rendered slot
      expect(slots.length).toBe(1);
      expect(slots[0].getAttribute("name")).toBe("item-2");
    });

    it("should apply header--expand-button-end class by default", () => {
      const button = accordionRef.shadowRoot!.querySelector("button")!;
      expect(button.classList.contains("header--expand-button-end")).toBe(true);
    });
  });

  describe("expandable button position", () => {
    it('should apply header--expand-button-start class when expandableButtonPosition is "start"', async () => {
      const model = structuredClone(SIMPLE_MODEL);
      const result = await render(
        html`<ch-accordion-render
          expandable-button-position="start"
          .model=${model}
        ></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const button = accordionRef.shadowRoot!.querySelector("button")!;
      expect(button.classList.contains("header--expand-button-start")).toBe(
        true
      );
    });
  });

  describe("header slot", () => {
    it("should render a named slot inside the header button when headerSlotId is defined", async () => {
      const model: AccordionModel = [
        {
          id: "item-1",
          caption: "Item 1",
          expanded: true,
          headerSlotId: "custom-header-1"
        }
      ];
      const result = await render(
        html`<ch-accordion-render .model=${model}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const headerSlot = accordionRef.shadowRoot!.querySelector(
        'button slot[name="custom-header-1"]'
      );
      expect(headerSlot).toBeTruthy();
    });
  });

  describe("disabled state", () => {
    it("should set the disabled attribute on header buttons when item is disabled", async () => {
      const model: AccordionModel = [
        { id: "item-1", caption: "Item 1", expanded: false, disabled: true }
      ];
      const result = await render(
        html`<ch-accordion-render .model=${model}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const button = accordionRef.shadowRoot!.querySelector("button")!;
      expect(button.disabled).toBe(true);
    });

    it("should set the disabled attribute on header buttons when the component is globally disabled", async () => {
      const model: AccordionModel = [
        { id: "item-1", caption: "Item 1", expanded: false }
      ];
      const result = await render(
        html`<ch-accordion-render
          ?disabled=${true}
          .model=${model}
        ></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const button = accordionRef.shadowRoot!.querySelector("button")!;
      expect(button.disabled).toBe(true);
    });
  });
});

