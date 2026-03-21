import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChActionMenuRender } from "../action-menu-render.lit";
import "../action-menu-render.lit.js";
import type { ActionMenuModel } from "../types";

const SIMPLE_MODEL: ActionMenuModel = [
  { id: "item-1", caption: "Item 1" },
  { id: "item-2", caption: "Item 2" },
  { id: "item-3", caption: "Item 3" }
];

const NESTED_MODEL: ActionMenuModel = [
  {
    id: "item-1",
    caption: "Item 1",
    items: [
      { id: "sub-1", caption: "Sub 1" },
      { id: "sub-2", caption: "Sub 2" }
    ]
  },
  { id: "item-2", caption: "Item 2" }
];

describe("[ch-action-menu-render][basic]", () => {
  let actionMenuRef: ChActionMenuRender;

  afterEach(cleanup);

  describe("shadow DOM", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-action-menu-render></ch-action-menu-render>`
      );
      actionMenuRef = result.container.querySelector(
        "ch-action-menu-render"
      )!;
      await actionMenuRef.updateComplete;
    });

    it("should have a shadow root", () => {
      expect(actionMenuRef.shadowRoot).toBeTruthy();
    });
  });

  describe("default properties", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-action-menu-render></ch-action-menu-render>`
      );
      actionMenuRef = result.container.querySelector(
        "ch-action-menu-render"
      )!;
      await actionMenuRef.updateComplete;
    });

    it('the "buttonAccessibleName" property should be undefined by default', () => {
      expect(actionMenuRef.buttonAccessibleName).toBeUndefined();
    });

    it('the "blockAlign" property should be "outside-end" by default', () => {
      expect(actionMenuRef.blockAlign).toBe("outside-end");
    });

    it('the "disabled" property should be false by default', () => {
      expect(actionMenuRef.disabled).toBe(false);
    });

    it('the "expanded" property should be false by default', () => {
      expect(actionMenuRef.expanded).toBe(false);
    });

    it('the "inlineAlign" property should be "center" by default', () => {
      expect(actionMenuRef.inlineAlign).toBe("center");
    });

    it('the "model" property should be undefined by default', () => {
      expect(actionMenuRef.model).toBeUndefined();
    });

    it('the "positionTry" property should be "none" by default', () => {
      expect(actionMenuRef.positionTry).toBe("none");
    });

    it('the "useGxRender" property should be false by default', () => {
      expect(actionMenuRef.useGxRender).toBe(false);
    });
  });

  describe("trigger button rendering", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-action-menu-render
          .model=${structuredClone(SIMPLE_MODEL)}
        ></ch-action-menu-render>`
      );
      actionMenuRef = result.container.querySelector(
        "ch-action-menu-render"
      )!;
      await actionMenuRef.updateComplete;
    });

    it("should render a trigger button in the shadow root", () => {
      const button =
        actionMenuRef.shadowRoot!.querySelector("button");
      expect(button).toBeTruthy();
    });

    it('should render the trigger button with type="button"', () => {
      const button = actionMenuRef.shadowRoot!.querySelector("button")!;
      expect(button.type).toBe("button");
    });

    it("should contain a default slot for button content", () => {
      const slot = actionMenuRef.shadowRoot!.querySelector("button slot");
      expect(slot).toBeTruthy();
    });
  });

  describe("popover rendering when expanded", () => {
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

    it("should render a ch-popover when expanded", () => {
      const popover =
        actionMenuRef.shadowRoot!.querySelector("ch-popover");
      expect(popover).toBeTruthy();
    });

    it("should render ch-action-menu items for each model entry", () => {
      const items =
        actionMenuRef.shadowRoot!.querySelectorAll("ch-action-menu");
      expect(items.length).toBe(3);
    });
  });

  describe("popover not rendered when collapsed", () => {
    it("should not render ch-popover when not expanded", async () => {
      const result = await render(
        html`<ch-action-menu-render
          .model=${structuredClone(SIMPLE_MODEL)}
        ></ch-action-menu-render>`
      );
      actionMenuRef = result.container.querySelector(
        "ch-action-menu-render"
      )!;
      await actionMenuRef.updateComplete;

      const popover =
        actionMenuRef.shadowRoot!.querySelector("ch-popover");
      expect(popover).toBeNull();
    });
  });

  describe("separator rendering", () => {
    it("should render an <hr> element for separator items", async () => {
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

      const hr = actionMenuRef.shadowRoot!.querySelector(
        "ch-popover hr"
      );
      expect(hr).toBeTruthy();
    });
  });

  describe("slot rendering", () => {
    it("should render a named slot for slot-type items", async () => {
      const model: ActionMenuModel = [
        { id: "item-1", caption: "Item 1" },
        { id: "custom-slot", type: "slot" }
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

      const slot = actionMenuRef.shadowRoot!.querySelector(
        'ch-popover slot[name="custom-slot"]'
      );
      expect(slot).toBeTruthy();
    });
  });

  describe("disabled state", () => {
    it("should disable the trigger button when the component is disabled", async () => {
      const result = await render(
        html`<ch-action-menu-render
          ?disabled=${true}
          .model=${structuredClone(SIMPLE_MODEL)}
        ></ch-action-menu-render>`
      );
      actionMenuRef = result.container.querySelector(
        "ch-action-menu-render"
      )!;
      await actionMenuRef.updateComplete;

      const button = actionMenuRef.shadowRoot!.querySelector("button")!;
      expect(button.disabled).toBe(true);
    });
  });
});
