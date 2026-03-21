import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChComboBoxRender } from "../combo-box.lit";
import "../combo-box.lit.js";
import type { ComboBoxModel } from "../types";

const SIMPLE_MODEL: ComboBoxModel = [
  { caption: "Option A", value: "a" },
  { caption: "Option B", value: "b" },
  { caption: "Option C", value: "c" }
];

const MODEL_WITH_DISABLED: ComboBoxModel = [
  { caption: "Option A", value: "a" },
  { caption: "Option B", value: "b", disabled: true },
  { caption: "Option C", value: "c" }
];

const sendKeyDown = (
  element: HTMLElement,
  code: string,
  key: string = code
) => {
  element.dispatchEvent(
    new KeyboardEvent("keydown", {
      code,
      key,
      bubbles: true,
      composed: true,
      cancelable: true
    })
  );
};

describe("[ch-combo-box-render][keyboard-navigation]", () => {
  let comboBoxRef: ChComboBoxRender;

  afterEach(cleanup);

  describe("ArrowDown key", () => {
    beforeEach(async () => {
      const model = structuredClone(SIMPLE_MODEL);
      const result = await render(
        html`<ch-combo-box-render .model=${model}></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;
    });

    it("should open the combo-box when ArrowDown is pressed and it is collapsed", async () => {
      sendKeyDown(comboBoxRef, "ArrowDown");
      await comboBoxRef.updateComplete;

      expect((comboBoxRef as any).expanded).toBe(true);
    });

    it("should navigate to the next item when the combo-box is expanded", async () => {
      // Open and select first item
      (comboBoxRef as any).expanded = true;
      comboBoxRef.value = "a";
      await comboBoxRef.updateComplete;

      sendKeyDown(comboBoxRef, "ArrowDown");
      await comboBoxRef.updateComplete;

      // activeDescendant should now be Option B
      expect((comboBoxRef as any).activeDescendant?.value).toBe("b");
    });
  });

  describe("ArrowUp key", () => {
    beforeEach(async () => {
      const model = structuredClone(SIMPLE_MODEL);
      const result = await render(
        html`<ch-combo-box-render .model=${model}></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;
    });

    it("should open the combo-box when ArrowUp is pressed and it is collapsed", async () => {
      sendKeyDown(comboBoxRef, "ArrowUp");
      await comboBoxRef.updateComplete;

      expect((comboBoxRef as any).expanded).toBe(true);
    });

    it("should navigate to the previous item when the combo-box is expanded", async () => {
      // Open and select second item
      (comboBoxRef as any).expanded = true;
      comboBoxRef.value = "b";
      await comboBoxRef.updateComplete;

      sendKeyDown(comboBoxRef, "ArrowUp");
      await comboBoxRef.updateComplete;

      // activeDescendant should now be Option A
      expect((comboBoxRef as any).activeDescendant?.value).toBe("a");
    });
  });

  describe("Enter key", () => {
    beforeEach(async () => {
      const model = structuredClone(SIMPLE_MODEL);
      const result = await render(
        html`<ch-combo-box-render .model=${model}></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;
    });

    it("should toggle the combo-box open when Enter is pressed", async () => {
      sendKeyDown(comboBoxRef, "Enter");
      await comboBoxRef.updateComplete;

      expect((comboBoxRef as any).expanded).toBe(true);
    });

    it("should close the combo-box and confirm selection when Enter is pressed while expanded", async () => {
      // Open and select an item
      (comboBoxRef as any).expanded = true;
      comboBoxRef.value = "b";
      await comboBoxRef.updateComplete;

      sendKeyDown(comboBoxRef, "Enter");
      await comboBoxRef.updateComplete;

      expect((comboBoxRef as any).expanded).toBe(false);
    });
  });

  describe("NumpadEnter key", () => {
    it("should toggle the combo-box just like Enter", async () => {
      const model = structuredClone(SIMPLE_MODEL);
      const result = await render(
        html`<ch-combo-box-render .model=${model}></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      sendKeyDown(comboBoxRef, "NumpadEnter");
      await comboBoxRef.updateComplete;

      expect((comboBoxRef as any).expanded).toBe(true);
    });
  });

  describe("Space key", () => {
    it("should open the combo-box when Space is pressed (non-suggest mode)", async () => {
      const model = structuredClone(SIMPLE_MODEL);
      const result = await render(
        html`<ch-combo-box-render .model=${model}></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      sendKeyDown(comboBoxRef, "Space", " ");
      await comboBoxRef.updateComplete;

      expect((comboBoxRef as any).expanded).toBe(true);
    });
  });

  describe("Tab key", () => {
    it("should close the combo-box and confirm the selection when Tab is pressed while expanded", async () => {
      const model = structuredClone(SIMPLE_MODEL);
      const result = await render(
        html`<ch-combo-box-render
          .model=${model}
          value="a"
        ></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      (comboBoxRef as any).expanded = true;
      await comboBoxRef.updateComplete;

      sendKeyDown(comboBoxRef, "Tab");
      await comboBoxRef.updateComplete;

      expect((comboBoxRef as any).expanded).toBe(false);
    });
  });

  describe("Escape key (via popover close)", () => {
    it("should close the combo-box when the popover fires popoverClosed", async () => {
      const model = structuredClone(SIMPLE_MODEL);
      const result = await render(
        html`<ch-combo-box-render .model=${model}></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      (comboBoxRef as any).expanded = true;
      await comboBoxRef.updateComplete;

      // Simulate popover close event
      const popover = comboBoxRef.shadowRoot!.querySelector("ch-popover");
      expect(popover).toBeTruthy();

      popover!.dispatchEvent(
        new CustomEvent("popoverClosed", {
          detail: { reason: "escape" },
          bubbles: true,
          composed: true
        })
      );
      await comboBoxRef.updateComplete;

      expect((comboBoxRef as any).expanded).toBe(false);
    });
  });

  describe("Home and End keys", () => {
    it("should navigate to the first item when Home is pressed", async () => {
      const model = structuredClone(SIMPLE_MODEL);
      const result = await render(
        html`<ch-combo-box-render
          .model=${model}
          value="c"
        ></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      (comboBoxRef as any).expanded = true;
      await comboBoxRef.updateComplete;

      sendKeyDown(comboBoxRef, "Home");
      await comboBoxRef.updateComplete;

      expect((comboBoxRef as any).activeDescendant?.value).toBe("a");
    });

    it("should navigate to the last item when End is pressed", async () => {
      const model = structuredClone(SIMPLE_MODEL);
      const result = await render(
        html`<ch-combo-box-render
          .model=${model}
          value="a"
        ></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      (comboBoxRef as any).expanded = true;
      await comboBoxRef.updateComplete;

      sendKeyDown(comboBoxRef, "End");
      await comboBoxRef.updateComplete;

      expect((comboBoxRef as any).activeDescendant?.value).toBe("c");
    });
  });

  describe("keyboard skips disabled items", () => {
    it("should skip disabled items when navigating with ArrowDown", async () => {
      const model = structuredClone(MODEL_WITH_DISABLED);
      const result = await render(
        html`<ch-combo-box-render
          .model=${model}
          value="a"
        ></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      (comboBoxRef as any).expanded = true;
      await comboBoxRef.updateComplete;

      sendKeyDown(comboBoxRef, "ArrowDown");
      await comboBoxRef.updateComplete;

      // Should skip disabled "Option B" and land on "Option C"
      expect((comboBoxRef as any).activeDescendant?.value).toBe("c");
    });
  });
});

