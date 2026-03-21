import { html } from "lit";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChAccordionRender } from "../accordion.lit";
import "../accordion.lit.js";
import type { AccordionModel } from "../types";

describe("[ch-accordion-render][parts]", () => {
  let accordionRef: ChAccordionRender;

  afterEach(cleanup);

  describe("panel parts", () => {
    it("should include item id, panel, and collapsed in the panel part when collapsed", async () => {
      const model: AccordionModel = [
        { id: "item-1", caption: "Item 1", expanded: false }
      ];
      const result = await render(
        html`<ch-accordion-render .model=${model}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const panel = accordionRef.shadowRoot!.querySelector(".panel")!;
      const partAttr = panel.getAttribute("part")!;

      expect(partAttr).toContain("item-1");
      expect(partAttr).toContain("panel");
      expect(partAttr).toContain("collapsed");
      expect(partAttr).not.toContain("expanded");
      expect(partAttr).not.toContain("disabled");
    });

    it("should include item id, panel, and expanded in the panel part when expanded", async () => {
      const model: AccordionModel = [
        { id: "item-1", caption: "Item 1", expanded: true }
      ];
      const result = await render(
        html`<ch-accordion-render .model=${model}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const panel = accordionRef.shadowRoot!.querySelector(".panel")!;
      const partAttr = panel.getAttribute("part")!;

      expect(partAttr).toContain("item-1");
      expect(partAttr).toContain("panel");
      expect(partAttr).toContain("expanded");
      expect(partAttr).not.toContain("collapsed");
    });

    it("should include disabled in the panel part when the item is disabled", async () => {
      const model: AccordionModel = [
        { id: "item-1", caption: "Item 1", expanded: false, disabled: true }
      ];
      const result = await render(
        html`<ch-accordion-render .model=${model}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const panel = accordionRef.shadowRoot!.querySelector(".panel")!;
      const partAttr = panel.getAttribute("part")!;

      expect(partAttr).toContain("disabled");
    });
  });

  describe("header parts", () => {
    it("should include item id, header, and collapsed in the header part when collapsed", async () => {
      const model: AccordionModel = [
        { id: "item-1", caption: "Item 1", expanded: false }
      ];
      const result = await render(
        html`<ch-accordion-render .model=${model}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const button = accordionRef.shadowRoot!.querySelector("button")!;
      const partAttr = button.getAttribute("part")!;

      expect(partAttr).toContain("item-1");
      expect(partAttr).toContain("header");
      expect(partAttr).toContain("collapsed");
      expect(partAttr).not.toContain("expanded");
    });

    it("should include item id, header, and expanded in the header part when expanded", async () => {
      const model: AccordionModel = [
        { id: "item-1", caption: "Item 1", expanded: true }
      ];
      const result = await render(
        html`<ch-accordion-render .model=${model}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const button = accordionRef.shadowRoot!.querySelector("button")!;
      const partAttr = button.getAttribute("part")!;

      expect(partAttr).toContain("item-1");
      expect(partAttr).toContain("header");
      expect(partAttr).toContain("expanded");
      expect(partAttr).not.toContain("collapsed");
    });

    it("should include headerSlotId in the header part when defined", async () => {
      const model: AccordionModel = [
        {
          id: "item-1",
          caption: "Item 1",
          expanded: false,
          headerSlotId: "my-header-slot"
        }
      ];
      const result = await render(
        html`<ch-accordion-render .model=${model}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const button = accordionRef.shadowRoot!.querySelector("button")!;
      const partAttr = button.getAttribute("part")!;

      expect(partAttr).toContain("my-header-slot");
    });

    it("should include disabled in the header part when the item is disabled", async () => {
      const model: AccordionModel = [
        { id: "item-1", caption: "Item 1", expanded: false, disabled: true }
      ];
      const result = await render(
        html`<ch-accordion-render .model=${model}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const button = accordionRef.shadowRoot!.querySelector("button")!;
      const partAttr = button.getAttribute("part")!;

      expect(partAttr).toContain("disabled");
    });
  });

  describe("section parts", () => {
    it("should include item id, section, and expanded in the section part when expanded", async () => {
      const model: AccordionModel = [
        { id: "item-1", caption: "Item 1", expanded: true }
      ];
      const result = await render(
        html`<ch-accordion-render .model=${model}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const subSection =
        accordionRef.shadowRoot!.querySelector(".sub-section")!;
      const partAttr = subSection.getAttribute("part")!;

      expect(partAttr).toContain("item-1");
      expect(partAttr).toContain("section");
      expect(partAttr).toContain("expanded");
      expect(partAttr).not.toContain("collapsed");
    });

    it("should include disabled in the section part when the item is disabled and expanded", async () => {
      const model: AccordionModel = [
        { id: "item-1", caption: "Item 1", expanded: true, disabled: true }
      ];
      const result = await render(
        html`<ch-accordion-render .model=${model}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const subSection =
        accordionRef.shadowRoot!.querySelector(".sub-section")!;
      const partAttr = subSection.getAttribute("part")!;

      expect(partAttr).toContain("disabled");
    });
  });

  describe("parts update on toggle", () => {
    it("should update parts from collapsed to expanded when an item is toggled", async () => {
      const model: AccordionModel = [
        { id: "item-1", caption: "Item 1", expanded: false }
      ];
      const result = await render(
        html`<ch-accordion-render .model=${model}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      // Check collapsed state parts
      let panel = accordionRef.shadowRoot!.querySelector(".panel")!;
      expect(panel.getAttribute("part")).toContain("collapsed");

      // Toggle
      const button = accordionRef.shadowRoot!.querySelector(
        "#item-1"
      ) as HTMLButtonElement;
      button.click();
      await accordionRef.updateComplete;

      // Check expanded state parts
      panel = accordionRef.shadowRoot!.querySelector(".panel")!;
      expect(panel.getAttribute("part")).toContain("expanded");
      expect(panel.getAttribute("part")).not.toContain("collapsed");
    });
  });
});

