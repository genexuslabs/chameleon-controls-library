import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChComboBoxRender } from "../combo-box.lit";
import "../combo-box.lit.js";
import type { ComboBoxModel } from "../types";

const SIMPLE_MODEL: ComboBoxModel = [
  { caption: "Option A", value: "a" },
  { caption: "Option B", value: "b" },
  { caption: "Option C", value: "c" }
];

describe("[ch-combo-box-render][events]", () => {
  let comboBoxRef: ChComboBoxRender;

  afterEach(cleanup);

  describe("input event", () => {
    beforeEach(async () => {
      const model = structuredClone(SIMPLE_MODEL);
      const result = await render(
        html`<ch-combo-box-render .model=${model}></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;
    });

    it("should fire input event when a leaf item is clicked", async () => {
      const handler = vi.fn();
      comboBoxRef.addEventListener("input", handler);

      // Expand
      (comboBoxRef as any).expanded = true;
      await comboBoxRef.updateComplete;

      // Click the first item
      const firstItem = comboBoxRef.shadowRoot!.querySelector(
        'button[role="option"]'
      ) as HTMLButtonElement;
      expect(firstItem).toBeTruthy();
      firstItem.click();
      await comboBoxRef.updateComplete;

      expect(handler).toHaveBeenCalledTimes(1);
      const event = handler.mock.calls[0][0] as CustomEvent<string>;
      expect(event.detail).toBe("a");
    });
  });

  describe("change event", () => {
    beforeEach(async () => {
      const model = structuredClone(SIMPLE_MODEL);
      const result = await render(
        html`<ch-combo-box-render .model=${model}></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;
    });

    it("should fire change event when a leaf item is clicked", async () => {
      const handler = vi.fn();
      comboBoxRef.addEventListener("change", handler);

      // Expand
      (comboBoxRef as any).expanded = true;
      await comboBoxRef.updateComplete;

      // Click the second item
      const items = comboBoxRef.shadowRoot!.querySelectorAll(
        'button[role="option"]'
      );
      expect(items.length).toBeGreaterThan(1);
      (items[1] as HTMLButtonElement).click();
      await comboBoxRef.updateComplete;

      expect(handler).toHaveBeenCalledTimes(1);
      const event = handler.mock.calls[0][0] as CustomEvent<string>;
      expect(event.detail).toBe("b");
    });
  });

  describe("no events when disabled", () => {
    it("should not fire input or change events when the component is disabled", async () => {
      const model = structuredClone(SIMPLE_MODEL);
      const result = await render(
        html`<ch-combo-box-render
          ?disabled=${true}
          .model=${model}
        ></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      const inputHandler = vi.fn();
      const changeHandler = vi.fn();
      comboBoxRef.addEventListener("input", inputHandler);
      comboBoxRef.addEventListener("change", changeHandler);

      // Try to expand (should not work since it's disabled)
      (comboBoxRef as any).expanded = true;
      await comboBoxRef.updateComplete;

      // The popover should not render because comboBoxIsInteractive is false
      const popover = comboBoxRef.shadowRoot!.querySelector("ch-popover");
      expect(popover).toBeNull();

      expect(inputHandler).not.toHaveBeenCalled();
      expect(changeHandler).not.toHaveBeenCalled();
    });
  });

  describe("suggest mode input event", () => {
    it("should fire input event when typing in suggest mode with zero debounce", async () => {
      const model = structuredClone(SIMPLE_MODEL);
      const result = await render(
        html`<ch-combo-box-render
          ?suggest=${true}
          suggest-debounce="0"
          .model=${model}
        ></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      const handler = vi.fn();
      comboBoxRef.addEventListener("input", handler);

      // Get the input and simulate typing
      const input = comboBoxRef.shadowRoot!.querySelector(
        "input"
      ) as HTMLInputElement;
      input.value = "Opt";
      input.dispatchEvent(new InputEvent("input", { bubbles: true }));
      await comboBoxRef.updateComplete;

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});

