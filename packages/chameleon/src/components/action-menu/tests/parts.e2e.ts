import { html } from "lit";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChActionMenuRender } from "../action-menu-render.lit";
import "../action-menu-render.lit.js";
import type { ActionMenuModel } from "../types";

describe("[ch-action-menu-render][parts]", () => {
  let actionMenuRef: ChActionMenuRender;

  afterEach(cleanup);

  describe("expandable-button parts", () => {
    it("should include expandable-button and collapsed parts when not expanded", async () => {
      const model: ActionMenuModel = [
        { id: "item-1", caption: "Item 1" }
      ];
      const result = await render(
        html`<ch-action-menu-render
          .model=${model}
        ></ch-action-menu-render>`
      );
      actionMenuRef = result.container.querySelector(
        "ch-action-menu-render"
      )!;
      await actionMenuRef.updateComplete;

      const button = actionMenuRef.shadowRoot!.querySelector("button")!;
      const partAttr = button.getAttribute("part")!;

      expect(partAttr).toContain("expandable-button");
      expect(partAttr).toContain("collapsed");
      expect(partAttr).not.toContain("expanded");
    });

    it("should include expandable-button and expanded parts when expanded", async () => {
      const model: ActionMenuModel = [
        { id: "item-1", caption: "Item 1" }
      ];
      const result = await render(
        html`<ch-action-menu-render
          ?expanded=${true}
          .model=${model}
        ></ch-action-menu-render>`
      );
      actionMenuRef = result.container.querySelector(
        "ch-action-menu-render"
      )!;
      await actionMenuRef.updateComplete;

      const button = actionMenuRef.shadowRoot!.querySelector("button")!;
      const partAttr = button.getAttribute("part")!;

      expect(partAttr).toContain("expandable-button");
      expect(partAttr).toContain("expanded");
      expect(partAttr).not.toContain("collapsed");
    });

    it("should include disabled part when the component is disabled", async () => {
      const model: ActionMenuModel = [
        { id: "item-1", caption: "Item 1" }
      ];
      const result = await render(
        html`<ch-action-menu-render
          ?disabled=${true}
          .model=${model}
        ></ch-action-menu-render>`
      );
      actionMenuRef = result.container.querySelector(
        "ch-action-menu-render"
      )!;
      await actionMenuRef.updateComplete;

      const button = actionMenuRef.shadowRoot!.querySelector("button")!;
      const partAttr = button.getAttribute("part")!;

      expect(partAttr).toContain("disabled");
    });
  });

  describe("popover window part", () => {
    it("should include window part on the ch-popover element", async () => {
      const model: ActionMenuModel = [
        { id: "item-1", caption: "Item 1" }
      ];
      const result = await render(
        html`<ch-action-menu-render
          ?expanded=${true}
          .model=${model}
        ></ch-action-menu-render>`
      );
      actionMenuRef = result.container.querySelector(
        "ch-action-menu-render"
      )!;
      await actionMenuRef.updateComplete;

      const popover =
        actionMenuRef.shadowRoot!.querySelector("ch-popover")!;
      const partAttr = popover.getAttribute("part")!;

      expect(partAttr).toContain("window");
    });
  });

  describe("separator parts", () => {
    it("should include separator part on hr elements", async () => {
      const model: ActionMenuModel = [
        { id: "item-1", caption: "Item 1" },
        { id: "sep-1", type: "separator" },
        { id: "item-2", caption: "Item 2" }
      ];
      const result = await render(
        html`<ch-action-menu-render
          ?expanded=${true}
          .model=${model}
        ></ch-action-menu-render>`
      );
      actionMenuRef = result.container.querySelector(
        "ch-action-menu-render"
      )!;
      await actionMenuRef.updateComplete;

      const hr = actionMenuRef.shadowRoot!.querySelector("hr")!;
      const partAttr = hr.getAttribute("part")!;

      expect(partAttr).toContain("separator");
    });

    it("should include custom id in separator parts when provided", async () => {
      const model: ActionMenuModel = [
        { id: "my-sep", type: "separator" }
      ];
      const result = await render(
        html`<ch-action-menu-render
          ?expanded=${true}
          .model=${model}
        ></ch-action-menu-render>`
      );
      actionMenuRef = result.container.querySelector(
        "ch-action-menu-render"
      )!;
      await actionMenuRef.updateComplete;

      const hr = actionMenuRef.shadowRoot!.querySelector("hr")!;
      const partAttr = hr.getAttribute("part")!;

      expect(partAttr).toContain("my-sep");
      expect(partAttr).toContain("separator");
    });
  });

  describe("parts update on toggle", () => {
    it("should update expandable-button parts from collapsed to expanded when toggled", async () => {
      const model: ActionMenuModel = [
        { id: "item-1", caption: "Item 1" }
      ];
      const result = await render(
        html`<ch-action-menu-render
          .model=${model}
        ></ch-action-menu-render>`
      );
      actionMenuRef = result.container.querySelector(
        "ch-action-menu-render"
      )!;
      await actionMenuRef.updateComplete;

      // Verify collapsed state
      let button = actionMenuRef.shadowRoot!.querySelector("button")!;
      expect(button.getAttribute("part")).toContain("collapsed");

      // Toggle to expanded
      actionMenuRef.expanded = true;
      await actionMenuRef.updateComplete;

      button = actionMenuRef.shadowRoot!.querySelector("button")!;
      expect(button.getAttribute("part")).toContain("expanded");
      expect(button.getAttribute("part")).not.toContain("collapsed");
    });
  });
});
