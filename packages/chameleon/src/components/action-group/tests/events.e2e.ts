import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChActionGroupRender } from "../action-group-render.lit";
import "../action-group-render.lit.js";
import type { ActionGroupModel } from "../types";

describe("[ch-action-group-render][events]", () => {
  let actionGroupRef: ChActionGroupRender;

  afterEach(cleanup);

  describe("model change triggers re-render", () => {
    beforeEach(async () => {
      const model: ActionGroupModel = [
        { id: "action-1", caption: "Action 1" }
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
    });

    it("should update rendering when model changes", async () => {
      const newModel: ActionGroupModel = [
        { id: "action-1", caption: "Action 1" },
        { id: "action-2", caption: "Action 2" },
        { id: "action-3", caption: "Action 3" }
      ];

      actionGroupRef.model = newModel;
      await actionGroupRef.updateComplete;

      const actionMenus =
        actionGroupRef.shadowRoot!.querySelectorAll(
          "ch-action-menu-render"
        );
      expect(actionMenus.length).toBe(3);
    });

    it("should render nothing when model is set to undefined", async () => {
      actionGroupRef.model = undefined;
      await actionGroupRef.updateComplete;

      const nonStyleChildren = Array.from(
        actionGroupRef.shadowRoot!.children
      ).filter(el => el.tagName !== "STYLE");
      expect(nonStyleChildren.length).toBe(0);
    });

    it("should render nothing when model is set to an empty array", async () => {
      actionGroupRef.model = [];
      await actionGroupRef.updateComplete;

      const nonStyleChildren = Array.from(
        actionGroupRef.shadowRoot!.children
      ).filter(el => el.tagName !== "STYLE");
      expect(nonStyleChildren.length).toBe(0);
    });
  });

  describe("itemsOverflowBehavior change", () => {
    it("should re-render correctly when switching overflow behavior", async () => {
      const model: ActionGroupModel = [
        { id: "action-1", caption: "Action 1" },
        { id: "action-2", caption: "Action 2" }
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

      // Should not have markers in multiline mode
      let markers =
        actionGroupRef.shadowRoot!.querySelectorAll(".marker");
      expect(markers.length).toBe(0);

      // Switch to responsive-collapse
      actionGroupRef.itemsOverflowBehavior = "responsive-collapse";
      await actionGroupRef.updateComplete;

      // Should have markers in responsive-collapse mode
      markers = actionGroupRef.shadowRoot!.querySelectorAll(".marker");
      expect(markers.length).toBe(2);
    });
  });

  describe("disabled state propagation", () => {
    it("should propagate the disabled state to action-menu-render children", async () => {
      const model: ActionGroupModel = [
        { id: "action-1", caption: "Action 1" }
      ];
      const result = await render(
        html`<ch-action-group-render
          ?disabled=${true}
          items-overflow-behavior="multiline"
          .model=${model}
        ></ch-action-group-render>`
      );
      actionGroupRef = result.container.querySelector(
        "ch-action-group-render"
      )!;
      await actionGroupRef.updateComplete;

      const actionMenu = actionGroupRef.shadowRoot!.querySelector(
        "ch-action-menu-render"
      ) as any;
      expect(actionMenu).toBeTruthy();
      expect(actionMenu.disabled).toBe(true);
    });
  });
});
