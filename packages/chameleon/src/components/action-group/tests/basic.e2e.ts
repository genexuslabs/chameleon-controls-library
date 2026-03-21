import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChActionGroupRender } from "../action-group-render.lit";
import "../action-group-render.lit.js";
import type { ActionGroupModel } from "../types";

const SIMPLE_MODEL: ActionGroupModel = [
  { id: "action-1", caption: "Action 1" },
  { id: "action-2", caption: "Action 2" },
  { id: "action-3", caption: "Action 3" }
];

describe("[ch-action-group-render][basic]", () => {
  let actionGroupRef: ChActionGroupRender;

  afterEach(cleanup);

  describe("shadow DOM", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-action-group-render></ch-action-group-render>`
      );
      actionGroupRef = result.container.querySelector(
        "ch-action-group-render"
      )!;
      await actionGroupRef.updateComplete;
    });

    it("should have a shadow root", () => {
      expect(actionGroupRef.shadowRoot).toBeTruthy();
    });
  });

  describe("default properties", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-action-group-render></ch-action-group-render>`
      );
      actionGroupRef = result.container.querySelector(
        "ch-action-group-render"
      )!;
      await actionGroupRef.updateComplete;
    });

    it('the "disabled" property should be false by default', () => {
      expect(actionGroupRef.disabled).toBe(false);
    });

    it('the "itemsOverflowBehavior" property should be "responsive-collapse" by default', () => {
      expect(actionGroupRef.itemsOverflowBehavior).toBe(
        "responsive-collapse"
      );
    });

    it('the "model" property should be undefined by default', () => {
      expect(actionGroupRef.model).toBeUndefined();
    });

    it('the "moreActionsAccessibleName" property should be "Show more actions" by default', () => {
      expect(actionGroupRef.moreActionsAccessibleName).toBe(
        "Show more actions"
      );
    });

    it('the "moreActionsBlockAlign" property should be "outside-end" by default', () => {
      expect(actionGroupRef.moreActionsBlockAlign).toBe("outside-end");
    });

    it('the "moreActionsCaption" property should be undefined by default', () => {
      expect(actionGroupRef.moreActionsCaption).toBeUndefined();
    });

    it('the "moreActionsInlineAlign" property should be "inside-start" by default', () => {
      expect(actionGroupRef.moreActionsInlineAlign).toBe("inside-start");
    });

    it('the "getImagePathCallback" property should be undefined by default', () => {
      expect(actionGroupRef.getImagePathCallback).toBeUndefined();
    });

    it('the "useGxRender" property should be false by default', () => {
      expect(actionGroupRef.useGxRender).toBe(false);
    });
  });

  describe("empty model rendering", () => {
    it("should render nothing when model is not set", async () => {
      const result = await render(
        html`<ch-action-group-render></ch-action-group-render>`
      );
      actionGroupRef = result.container.querySelector(
        "ch-action-group-render"
      )!;
      await actionGroupRef.updateComplete;

      const children = actionGroupRef.shadowRoot!.children;
      // Should have no meaningful content (only style elements from shadow DOM)
      const nonStyleChildren = Array.from(children).filter(
        el => el.tagName !== "STYLE"
      );
      expect(nonStyleChildren.length).toBe(0);
    });

    it("should render nothing when model is undefined", async () => {
      const result = await render(
        html`<ch-action-group-render
          .model=${undefined}
        ></ch-action-group-render>`
      );
      actionGroupRef = result.container.querySelector(
        "ch-action-group-render"
      )!;
      await actionGroupRef.updateComplete;

      const nonStyleChildren = Array.from(
        actionGroupRef.shadowRoot!.children
      ).filter(el => el.tagName !== "STYLE");
      expect(nonStyleChildren.length).toBe(0);
    });

    it("should render nothing when model is an empty array", async () => {
      const result = await render(
        html`<ch-action-group-render
          .model=${[]}
        ></ch-action-group-render>`
      );
      actionGroupRef = result.container.querySelector(
        "ch-action-group-render"
      )!;
      await actionGroupRef.updateComplete;

      const nonStyleChildren = Array.from(
        actionGroupRef.shadowRoot!.children
      ).filter(el => el.tagName !== "STYLE");
      expect(nonStyleChildren.length).toBe(0);
    });
  });

  describe("model rendering", () => {
    beforeEach(async () => {
      const model = structuredClone(SIMPLE_MODEL);
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

    it('should set role="list" on the host element', () => {
      expect(actionGroupRef.getAttribute("role")).toBe("list");
    });

    it("should render marker elements for each item in responsive-collapse mode", () => {
      const markers =
        actionGroupRef.shadowRoot!.querySelectorAll(".marker");
      expect(markers.length).toBe(SIMPLE_MODEL.length);
    });
  });

  describe("separator rendering", () => {
    it("should render an hr element for separator items", async () => {
      const model: ActionGroupModel = [
        { id: "action-1", caption: "Action 1" },
        { type: "separator", id: "sep-1" },
        { id: "action-2", caption: "Action 2" }
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

      const separators = actionGroupRef.shadowRoot!.querySelectorAll("hr");
      expect(separators.length).toBe(1);
    });
  });

  describe("slot rendering", () => {
    it("should render slot elements for slot-type items when not in responsive-collapse mode", async () => {
      const model: ActionGroupModel = [
        { type: "slot", id: "custom-slot-1" }
      ];
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

      const slot = actionGroupRef.shadowRoot!.querySelector(
        'slot[name="custom-slot-1"]'
      );
      expect(slot).toBeTruthy();
    });
  });
});
