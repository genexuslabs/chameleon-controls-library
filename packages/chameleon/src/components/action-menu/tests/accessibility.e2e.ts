import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChActionMenuRender } from "../action-menu-render.lit";
import "../action-menu-render.lit.js";
import type { ActionMenuModel } from "../types";

const SIMPLE_MODEL: ActionMenuModel = [
  { id: "item-1", caption: "Item 1" },
  { id: "item-2", caption: "Item 2" }
];

describe("[ch-action-menu-render][accessibility]", () => {
  let actionMenuRef: ChActionMenuRender;

  afterEach(cleanup);

  describe("aria-expanded on trigger button", () => {
    it('should set aria-expanded="false" when collapsed', async () => {
      const result = await render(
        html`<ch-action-menu-render
          .model=${structuredClone(SIMPLE_MODEL)}
        ></ch-action-menu-render>`
      );
      actionMenuRef = result.container.querySelector(
        "ch-action-menu-render"
      )!;
      await actionMenuRef.updateComplete;

      const button = actionMenuRef.shadowRoot!.querySelector("button")!;
      expect(button.getAttribute("aria-expanded")).toBe("false");
    });

    it('should set aria-expanded="true" when expanded', async () => {
      const result = await render(
        html`<ch-action-menu-render
          ?expanded=${true}
          .model=${structuredClone(SIMPLE_MODEL)}
        ></ch-action-menu-render>`
      );
      actionMenuRef = result.container.querySelector(
        "ch-action-menu-render"
      )!;
      await actionMenuRef.updateComplete;

      const button = actionMenuRef.shadowRoot!.querySelector("button")!;
      expect(button.getAttribute("aria-expanded")).toBe("true");
    });

    it("should toggle aria-expanded when the menu is opened and closed", async () => {
      const result = await render(
        html`<ch-action-menu-render
          .model=${structuredClone(SIMPLE_MODEL)}
        ></ch-action-menu-render>`
      );
      actionMenuRef = result.container.querySelector(
        "ch-action-menu-render"
      )!;
      await actionMenuRef.updateComplete;

      const button = actionMenuRef.shadowRoot!.querySelector("button")!;
      expect(button.getAttribute("aria-expanded")).toBe("false");

      // Open
      actionMenuRef.expanded = true;
      await actionMenuRef.updateComplete;
      expect(button.getAttribute("aria-expanded")).toBe("true");

      // Close
      actionMenuRef.expanded = false;
      await actionMenuRef.updateComplete;
      expect(button.getAttribute("aria-expanded")).toBe("false");
    });
  });

  describe("aria-haspopup on trigger button", () => {
    it('should set aria-haspopup="true" on the trigger button', async () => {
      const result = await render(
        html`<ch-action-menu-render
          .model=${structuredClone(SIMPLE_MODEL)}
        ></ch-action-menu-render>`
      );
      actionMenuRef = result.container.querySelector(
        "ch-action-menu-render"
      )!;
      await actionMenuRef.updateComplete;

      const button = actionMenuRef.shadowRoot!.querySelector("button")!;
      expect(button.getAttribute("aria-haspopup")).toBe("true");
    });
  });

  describe("aria-controls on trigger button", () => {
    it("should set aria-controls pointing to the popover window id", async () => {
      const result = await render(
        html`<ch-action-menu-render
          .model=${structuredClone(SIMPLE_MODEL)}
        ></ch-action-menu-render>`
      );
      actionMenuRef = result.container.querySelector(
        "ch-action-menu-render"
      )!;
      await actionMenuRef.updateComplete;

      const button = actionMenuRef.shadowRoot!.querySelector("button")!;
      expect(button.getAttribute("aria-controls")).toBe("window");
    });
  });

  describe("aria-label on trigger button", () => {
    it("should set aria-label when buttonAccessibleName is provided", async () => {
      const result = await render(
        html`<ch-action-menu-render
          button-accessible-name="Menu"
          .model=${structuredClone(SIMPLE_MODEL)}
        ></ch-action-menu-render>`
      );
      actionMenuRef = result.container.querySelector(
        "ch-action-menu-render"
      )!;
      await actionMenuRef.updateComplete;

      const button = actionMenuRef.shadowRoot!.querySelector("button")!;
      expect(button.getAttribute("aria-label")).toBe("Menu");
    });

    it("should not set aria-label when buttonAccessibleName is not provided", async () => {
      const result = await render(
        html`<ch-action-menu-render
          .model=${structuredClone(SIMPLE_MODEL)}
        ></ch-action-menu-render>`
      );
      actionMenuRef = result.container.querySelector(
        "ch-action-menu-render"
      )!;
      await actionMenuRef.updateComplete;

      const button = actionMenuRef.shadowRoot!.querySelector("button")!;
      expect(button.hasAttribute("aria-label")).toBe(false);
    });
  });

  describe("role on popover", () => {
    it('should set role="list" on the ch-popover when expanded', async () => {
      const result = await render(
        html`<ch-action-menu-render
          ?expanded=${true}
          .model=${structuredClone(SIMPLE_MODEL)}
        ></ch-action-menu-render>`
      );
      actionMenuRef = result.container.querySelector(
        "ch-action-menu-render"
      )!;
      await actionMenuRef.updateComplete;

      const popover =
        actionMenuRef.shadowRoot!.querySelector("ch-popover")!;
      expect(popover.getAttribute("role")).toBe("list");
    });
  });

  describe("role on action menu items", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-action-menu-render
          ?expanded=${true}
          .model=${structuredClone(SIMPLE_MODEL)}
        ></ch-action-menu-render>`
      );
      actionMenuRef = result.container.querySelector(
        "ch-action-menu-render"
      )!;
      await actionMenuRef.updateComplete;
    });

    it('should set role="listitem" on ch-action-menu elements', () => {
      const items = actionMenuRef.shadowRoot!.querySelectorAll(
        "ch-action-menu"
      );
      items.forEach(item => {
        expect(item.getAttribute("role")).toBe("listitem");
      });
    });
  });

  describe("button type attribute", () => {
    it('should render the trigger button with type="button"', async () => {
      const result = await render(
        html`<ch-action-menu-render
          .model=${structuredClone(SIMPLE_MODEL)}
        ></ch-action-menu-render>`
      );
      actionMenuRef = result.container.querySelector(
        "ch-action-menu-render"
      )!;
      await actionMenuRef.updateComplete;

      const button = actionMenuRef.shadowRoot!.querySelector("button")!;
      expect(button.type).toBe("button");
    });
  });
});
