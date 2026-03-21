import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChAccordionRender } from "../accordion.lit";
import "../accordion.lit.js";
import type {
  AccordionItemExpandedChangeEvent,
  AccordionModel
} from "../types";

describe("[ch-accordion-render][events]", () => {
  let accordionRef: ChAccordionRender;
  let model: AccordionModel;

  afterEach(cleanup);

  describe("expandedChange event on toggle", () => {
    beforeEach(async () => {
      model = [
        { id: "item-1", caption: "Item 1", expanded: false },
        { id: "item-2", caption: "Item 2", expanded: false }
      ];
      const result = await render(
        html`<ch-accordion-render .model=${model}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;
    });

    it("should fire expandedChange with { id, expanded: true } when expanding an item", async () => {
      const handler = vi.fn();
      accordionRef.addEventListener("expandedChange", handler);

      const button = accordionRef.shadowRoot!.querySelector(
        "#item-1"
      ) as HTMLButtonElement;
      button.click();
      await accordionRef.updateComplete;

      expect(handler).toHaveBeenCalledTimes(1);

      const event = handler.mock
        .calls[0][0] as CustomEvent<AccordionItemExpandedChangeEvent>;
      expect(event.detail).toEqual({ id: "item-1", expanded: true });
    });

    it("should fire expandedChange with { id, expanded: false } when collapsing an item", async () => {
      // First expand
      const button = accordionRef.shadowRoot!.querySelector(
        "#item-1"
      ) as HTMLButtonElement;
      button.click();
      await accordionRef.updateComplete;

      const handler = vi.fn();
      accordionRef.addEventListener("expandedChange", handler);

      // Then collapse
      button.click();
      await accordionRef.updateComplete;

      expect(handler).toHaveBeenCalledTimes(1);
      const event = handler.mock
        .calls[0][0] as CustomEvent<AccordionItemExpandedChangeEvent>;
      expect(event.detail).toEqual({ id: "item-1", expanded: false });
    });
  });

  describe("expandedChange in singleItemExpanded mode", () => {
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

    it("should fire expandedChange for the auto-collapsed item and the newly expanded item", async () => {
      const handler = vi.fn();
      accordionRef.addEventListener("expandedChange", handler);

      const button2 = accordionRef.shadowRoot!.querySelector(
        "#item-2"
      ) as HTMLButtonElement;
      button2.click();
      await accordionRef.updateComplete;

      // Should fire twice: once for auto-collapse of item-1, once for expand of item-2
      expect(handler).toHaveBeenCalledTimes(2);

      const collapseEvent = handler.mock
        .calls[0][0] as CustomEvent<AccordionItemExpandedChangeEvent>;
      expect(collapseEvent.detail).toEqual({
        id: "item-1",
        expanded: false
      });

      const expandEvent = handler.mock
        .calls[1][0] as CustomEvent<AccordionItemExpandedChangeEvent>;
      expect(expandEvent.detail).toEqual({
        id: "item-2",
        expanded: true
      });
    });

    it("should fire expandedChange events when switching to singleItemExpanded with multiple expanded items", async () => {
      // Start fresh with multiple expanded
      cleanup();
      const multiModel: AccordionModel = [
        { id: "item-1", caption: "Item 1", expanded: true },
        { id: "item-2", caption: "Item 2", expanded: true },
        { id: "item-3", caption: "Item 3", expanded: true }
      ];
      const result = await render(
        html`<ch-accordion-render .model=${multiModel}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const handler = vi.fn();
      accordionRef.addEventListener("expandedChange", handler);

      // Enable singleItemExpanded
      accordionRef.singleItemExpanded = true;
      await accordionRef.updateComplete;

      // Should fire for items 1 and 2 (collapsed), leaving item 3 expanded
      expect(handler).toHaveBeenCalledTimes(2);
      expect(
        (
          handler.mock
            .calls[0][0] as CustomEvent<AccordionItemExpandedChangeEvent>
        ).detail
      ).toEqual({ id: "item-1", expanded: false });
      expect(
        (
          handler.mock
            .calls[1][0] as CustomEvent<AccordionItemExpandedChangeEvent>
        ).detail
      ).toEqual({ id: "item-2", expanded: false });
    });
  });

  describe("no event for disabled items", () => {
    it("should not fire expandedChange when clicking a disabled item", async () => {
      model = [
        { id: "item-1", caption: "Item 1", expanded: false, disabled: true }
      ];
      const result = await render(
        html`<ch-accordion-render .model=${model}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const handler = vi.fn();
      accordionRef.addEventListener("expandedChange", handler);

      const button = accordionRef.shadowRoot!.querySelector(
        "#item-1"
      ) as HTMLButtonElement;
      button.click();
      await accordionRef.updateComplete;

      expect(handler).not.toHaveBeenCalled();
    });
  });
});

