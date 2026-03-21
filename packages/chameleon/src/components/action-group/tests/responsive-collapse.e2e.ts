import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChActionGroupRender } from "../action-group-render.lit";
import "../action-group-render.lit.js";
import type { ActionGroupModel } from "../types";

const MANY_ITEMS_MODEL: ActionGroupModel = [
  { id: "action-1", caption: "Action 1" },
  { id: "action-2", caption: "Action 2" },
  { id: "action-3", caption: "Action 3" },
  { id: "action-4", caption: "Action 4" },
  { id: "action-5", caption: "Action 5" }
];

describe("[ch-action-group-render][responsive-collapse]", () => {
  let actionGroupRef: ChActionGroupRender;

  afterEach(cleanup);

  describe("responsive-collapse mode initialization", () => {
    beforeEach(async () => {
      const model = structuredClone(MANY_ITEMS_MODEL);
      const result = await render(
        html`<ch-action-group-render
          .model=${model}
        ></ch-action-group-render>`
      );
      actionGroupRef = result.container.querySelector(
        "ch-action-group-render"
      )!;
      await actionGroupRef.updateComplete;
    });

    it("should render marker elements for IntersectionObserver tracking", () => {
      const markers =
        actionGroupRef.shadowRoot!.querySelectorAll(".marker");
      expect(markers.length).toBe(MANY_ITEMS_MODEL.length);
    });

    it("should assign sequential numeric IDs to marker elements", () => {
      const markers =
        actionGroupRef.shadowRoot!.querySelectorAll(".marker");
      markers.forEach((marker, index) => {
        expect(marker.id).toBe(index.toString());
      });
    });

    it('should apply contain: inline-size via the host attribute items-overflow-behavior="responsive-collapse"', () => {
      expect(actionGroupRef.getAttribute("items-overflow-behavior")).toBe(
        "responsive-collapse"
      );
    });
  });

  describe("non-responsive modes", () => {
    it("should not render markers in multiline mode", async () => {
      const model = structuredClone(MANY_ITEMS_MODEL);
      const result = await render(
        html`<ch-action-group-render
          items-overflow-behavior="multiline"
          .model=${model}
        ></ch-action-group-render>`
      );
      actionGroupRef = result.container.querySelector(
        "ch-action-group-render"
      )!;
      await actionGroupRef.updateComplete;

      const markers =
        actionGroupRef.shadowRoot!.querySelectorAll(".marker");
      expect(markers.length).toBe(0);
    });

    it("should not render markers in add-scroll mode", async () => {
      const model = structuredClone(MANY_ITEMS_MODEL);
      const result = await render(
        html`<ch-action-group-render
          items-overflow-behavior="add-scroll"
          .model=${model}
        ></ch-action-group-render>`
      );
      actionGroupRef = result.container.querySelector(
        "ch-action-group-render"
      )!;
      await actionGroupRef.updateComplete;

      const markers =
        actionGroupRef.shadowRoot!.querySelectorAll(".marker");
      expect(markers.length).toBe(0);
    });
  });

  describe("collapsed items model", () => {
    it("should not show the overflow action-menu when all items are visible (collapsedItems === 0)", async () => {
      const model = structuredClone(MANY_ITEMS_MODEL);
      const result = await render(
        html`<ch-action-group-render
          .model=${model}
        ></ch-action-group-render>`
      );
      actionGroupRef = result.container.querySelector(
        "ch-action-group-render"
      )!;
      await actionGroupRef.updateComplete;

      // The overflow action-menu is NOT the per-item action-menus.
      // It's the one rendered with role="listitem" at the top level for collapsed items.
      // When collapsedItems === 0, it should not be present.
      // Per-item action-menus will still be rendered as .marker children.
      const overflowMenus = actionGroupRef.shadowRoot!.querySelectorAll(
        ':scope > ch-action-menu-render:not(.marker)'
      );
      expect(overflowMenus.length).toBe(0);
    });
  });

  describe("switching overflow behavior", () => {
    it("should clean up markers when switching from responsive-collapse to multiline", async () => {
      const model = structuredClone(MANY_ITEMS_MODEL);
      const result = await render(
        html`<ch-action-group-render
          .model=${model}
        ></ch-action-group-render>`
      );
      actionGroupRef = result.container.querySelector(
        "ch-action-group-render"
      )!;
      await actionGroupRef.updateComplete;

      // Verify markers exist
      let markers =
        actionGroupRef.shadowRoot!.querySelectorAll(".marker");
      expect(markers.length).toBe(MANY_ITEMS_MODEL.length);

      // Switch to multiline
      actionGroupRef.itemsOverflowBehavior = "multiline";
      await actionGroupRef.updateComplete;

      // Markers should be gone
      markers = actionGroupRef.shadowRoot!.querySelectorAll(".marker");
      expect(markers.length).toBe(0);
    });

    it("should re-create markers when switching back to responsive-collapse", async () => {
      const model = structuredClone(MANY_ITEMS_MODEL);
      const result = await render(
        html`<ch-action-group-render
          items-overflow-behavior="multiline"
          .model=${model}
        ></ch-action-group-render>`
      );
      actionGroupRef = result.container.querySelector(
        "ch-action-group-render"
      )!;
      await actionGroupRef.updateComplete;

      // No markers initially
      let markers =
        actionGroupRef.shadowRoot!.querySelectorAll(".marker");
      expect(markers.length).toBe(0);

      // Switch to responsive-collapse
      actionGroupRef.itemsOverflowBehavior = "responsive-collapse";
      await actionGroupRef.updateComplete;

      // Markers should appear
      markers = actionGroupRef.shadowRoot!.querySelectorAll(".marker");
      expect(markers.length).toBe(MANY_ITEMS_MODEL.length);
    });
  });

  describe("slot items in responsive-collapse", () => {
    it("should render slot-type items inside marker divs in responsive-collapse mode", async () => {
      const model: ActionGroupModel = [
        { type: "slot", id: "my-slot" }
      ];
      const result = await render(
        html`<ch-action-group-render
          .model=${model}
        ></ch-action-group-render>`
      );
      actionGroupRef = result.container.querySelector(
        "ch-action-group-render"
      )!;
      await actionGroupRef.updateComplete;

      const markerDiv =
        actionGroupRef.shadowRoot!.querySelector(".marker");
      expect(markerDiv).toBeTruthy();
      expect(markerDiv!.tagName.toLowerCase()).toBe("div");

      const slot = markerDiv!.querySelector('slot[name="my-slot"]');
      expect(slot).toBeTruthy();
    });
  });
});
