import { html } from "lit";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChActionGroupRender } from "../action-group-render.lit";
import "../action-group-render.lit.js";
import type { ActionGroupModel } from "../types";

describe("[ch-action-group-render][parts]", () => {
  let actionGroupRef: ChActionGroupRender;

  afterEach(cleanup);

  describe("separator parts", () => {
    it("should include the separator part on hr elements", async () => {
      const model: ActionGroupModel = [
        { type: "separator", id: "sep-1" }
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

      const hr = actionGroupRef.shadowRoot!.querySelector("hr")!;
      const partAttr = hr.getAttribute("part")!;

      expect(partAttr).toContain("separator");
      expect(partAttr).toContain("vertical");
    });

    it("should include the item id in the separator part when defined", async () => {
      const model: ActionGroupModel = [
        { type: "separator", id: "my-sep" }
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

      const hr = actionGroupRef.shadowRoot!.querySelector("hr")!;
      const partAttr = hr.getAttribute("part")!;

      expect(partAttr).toContain("my-sep");
    });

    it("should include custom parts on separator items when defined", async () => {
      const model: ActionGroupModel = [
        { type: "separator", id: "sep-1", parts: "custom-part" }
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

      const hr = actionGroupRef.shadowRoot!.querySelector("hr")!;
      const partAttr = hr.getAttribute("part")!;

      expect(partAttr).toContain("custom-part");
    });
  });

  describe("action-menu exportparts", () => {
    it("should forward exportparts to ch-action-menu-render elements", async () => {
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

      const actionMenu = actionGroupRef.shadowRoot!.querySelector(
        "ch-action-menu-render"
      );
      expect(actionMenu).toBeTruthy();
      expect(actionMenu!.getAttribute("exportparts")).toBeTruthy();
    });
  });
});
