import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChAccordionRender } from "../accordion.lit";
import "../accordion.lit.js";
import type { AccordionModel } from "../types";

describe("[ch-accordion-render][accessibility]", () => {
  let accordionRef: ChAccordionRender;

  afterEach(cleanup);

  describe("aria-expanded", () => {
    beforeEach(async () => {
      const model: AccordionModel = [
        { id: "item-1", caption: "Item 1", expanded: false },
        { id: "item-2", caption: "Item 2", expanded: true }
      ];
      const result = await render(
        html`<ch-accordion-render .model=${model}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;
    });

    it('should set aria-expanded="false" on collapsed item headers', () => {
      const button1 = accordionRef.shadowRoot!.querySelector(
        "#item-1"
      ) as HTMLButtonElement;
      expect(button1.getAttribute("aria-expanded")).toBe("false");
    });

    it('should set aria-expanded="true" on expanded item headers', () => {
      const button2 = accordionRef.shadowRoot!.querySelector(
        "#item-2"
      ) as HTMLButtonElement;
      expect(button2.getAttribute("aria-expanded")).toBe("true");
    });

    it("should toggle aria-expanded when an item is expanded or collapsed", async () => {
      const button1 = accordionRef.shadowRoot!.querySelector(
        "#item-1"
      ) as HTMLButtonElement;

      // Expand
      button1.click();
      await accordionRef.updateComplete;
      expect(button1.getAttribute("aria-expanded")).toBe("true");

      // Collapse
      button1.click();
      await accordionRef.updateComplete;
      expect(button1.getAttribute("aria-expanded")).toBe("false");
    });
  });

  describe("aria-controls", () => {
    it("should link the header button to its corresponding section via aria-controls", async () => {
      const model: AccordionModel = [
        { id: "item-1", caption: "Item 1", expanded: true },
        { id: "item-2", caption: "Item 2", expanded: false }
      ];
      const result = await render(
        html`<ch-accordion-render .model=${model}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const button1 = accordionRef.shadowRoot!.querySelector(
        "#item-1"
      ) as HTMLButtonElement;
      const button2 = accordionRef.shadowRoot!.querySelector(
        "#item-2"
      ) as HTMLButtonElement;

      // First item button should point to section-0
      expect(button1.getAttribute("aria-controls")).toBe("section-0");
      // Second item button should point to section-1
      expect(button2.getAttribute("aria-controls")).toBe("section-1");

      // The sections should have corresponding ids
      const section0 = accordionRef.shadowRoot!.querySelector("#section-0");
      const section1 = accordionRef.shadowRoot!.querySelector("#section-1");
      expect(section0).toBeTruthy();
      expect(section1).toBeTruthy();
    });
  });

  describe("aria-labelledby and aria-label on sections", () => {
    it("should set aria-labelledby on sections referencing the header button id when no accessibleName is provided", async () => {
      const model: AccordionModel = [
        { id: "item-1", caption: "Item 1", expanded: true }
      ];
      const result = await render(
        html`<ch-accordion-render .model=${model}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const section = accordionRef.shadowRoot!.querySelector("section")!;
      expect(section.getAttribute("aria-labelledby")).toBe("item-1");
      expect(section.hasAttribute("aria-label")).toBe(false);
    });

    it("should set aria-label on sections when accessibleName is provided instead of aria-labelledby", async () => {
      const model: AccordionModel = [
        {
          id: "item-1",
          caption: "Item 1",
          expanded: true,
          accessibleName: "Accessible panel name"
        }
      ];
      const result = await render(
        html`<ch-accordion-render .model=${model}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const section = accordionRef.shadowRoot!.querySelector("section")!;
      expect(section.getAttribute("aria-label")).toBe("Accessible panel name");
      expect(section.hasAttribute("aria-labelledby")).toBe(false);
    });
  });

  describe("aria-label on header buttons", () => {
    it("should set aria-label on the header button when accessibleName is provided", async () => {
      const model: AccordionModel = [
        {
          id: "item-1",
          caption: "Item 1",
          expanded: false,
          accessibleName: "Toggle FAQ"
        }
      ];
      const result = await render(
        html`<ch-accordion-render .model=${model}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const button = accordionRef.shadowRoot!.querySelector(
        "#item-1"
      ) as HTMLButtonElement;
      expect(button.getAttribute("aria-label")).toBe("Toggle FAQ");
    });

    it("should not set aria-label on the header button when no accessibleName is provided", async () => {
      const model: AccordionModel = [
        { id: "item-1", caption: "Item 1", expanded: false }
      ];
      const result = await render(
        html`<ch-accordion-render .model=${model}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const button = accordionRef.shadowRoot!.querySelector(
        "#item-1"
      ) as HTMLButtonElement;
      expect(button.hasAttribute("aria-label")).toBe(false);
    });
  });

  describe("button type attribute", () => {
    it('should render header buttons with type="button" to prevent form submission', async () => {
      const model: AccordionModel = [
        { id: "item-1", caption: "Item 1", expanded: false }
      ];
      const result = await render(
        html`<ch-accordion-render .model=${model}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const button = accordionRef.shadowRoot!.querySelector(
        "#item-1"
      ) as HTMLButtonElement;
      expect(button.type).toBe("button");
    });
  });
});

