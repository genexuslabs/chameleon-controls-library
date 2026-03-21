import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChActionMenuRender } from "../action-menu-render.lit";
import "../action-menu-render.lit.js";
import type { ActionMenuModel } from "../types";

describe("[ch-action-menu-render][events]", () => {
  let actionMenuRef: ChActionMenuRender;

  afterEach(cleanup);

  describe("expandedChange event", () => {
    let model: ActionMenuModel;

    beforeEach(async () => {
      model = [
        { id: "item-1", caption: "Item 1" },
        { id: "item-2", caption: "Item 2" }
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
    });

    it("should fire expandedChange with true when clicking the trigger button to expand", async () => {
      const handler = vi.fn();
      actionMenuRef.addEventListener("expandedChange", handler);

      const button =
        actionMenuRef.shadowRoot!.querySelector("button")!;
      button.click();
      await actionMenuRef.updateComplete;

      expect(handler).toHaveBeenCalledTimes(1);
      const event = handler.mock.calls[0][0] as CustomEvent<boolean>;
      expect(event.detail).toBe(true);
    });

    it("should fire expandedChange with false when clicking the trigger button to collapse", async () => {
      // First expand
      const button =
        actionMenuRef.shadowRoot!.querySelector("button")!;
      button.click();
      await actionMenuRef.updateComplete;

      const handler = vi.fn();
      actionMenuRef.addEventListener("expandedChange", handler);

      // Then collapse
      button.click();
      await actionMenuRef.updateComplete;

      expect(handler).toHaveBeenCalledTimes(1);
      const event = handler.mock.calls[0][0] as CustomEvent<boolean>;
      expect(event.detail).toBe(false);
    });
  });

  describe("buttonClick event", () => {
    it("should fire buttonClick when a leaf menu item is clicked", async () => {
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

      const handler = vi.fn();
      actionMenuRef.addEventListener("buttonClick", handler);

      // Click the action item's button inside the ch-action-menu shadow DOM
      const actionMenu =
        actionMenuRef.shadowRoot!.querySelector("ch-action-menu")!;
      const itemButton =
        actionMenu.shadowRoot!.querySelector("button")!;
      itemButton.click();
      await actionMenuRef.updateComplete;

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe("no events when disabled", () => {
    it("should not fire expandedChange when clicking a disabled trigger button", async () => {
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

      const handler = vi.fn();
      actionMenuRef.addEventListener("expandedChange", handler);

      const button =
        actionMenuRef.shadowRoot!.querySelector("button")!;
      button.click();
      await actionMenuRef.updateComplete;

      expect(handler).not.toHaveBeenCalled();
    });
  });
});
