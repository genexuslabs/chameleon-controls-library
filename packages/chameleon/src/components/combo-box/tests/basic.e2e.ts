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

describe("[ch-combo-box-render][basic]", () => {
  let comboBoxRef: ChComboBoxRender;

  afterEach(cleanup);

  describe("shadow DOM", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-combo-box-render></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;
    });

    it("should have a shadow root", () => {
      expect(comboBoxRef.shadowRoot).toBeTruthy();
    });
  });

  describe("form association", () => {
    it("should be form-associated via ElementInternals", async () => {
      const result = await render(
        html`<form>
          <ch-combo-box-render name="test-combo"></ch-combo-box-render>
        </form>`
      );
      const formEl = result.container.querySelector("form")!;
      comboBoxRef = formEl.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      // The component should participate in the form
      expect(comboBoxRef.name).toBe("test-combo");
    });
  });

  describe("default properties", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-combo-box-render></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;
    });

    it('the "disabled" property should be false by default', () => {
      expect(comboBoxRef.disabled).toBe(false);
    });

    it('the "model" property should be an empty array by default', () => {
      expect(comboBoxRef.model).toEqual([]);
    });

    it('the "suggest" property should be false by default', () => {
      expect(comboBoxRef.suggest).toBe(false);
    });

    it('the "suggestDebounce" property should be 250 by default', () => {
      expect(comboBoxRef.suggestDebounce).toBe(250);
    });

    it('the "multiple" property should be false by default', () => {
      expect(comboBoxRef.multiple).toBe(false);
    });

    it('the "readonly" property should be false by default', () => {
      expect(comboBoxRef.readonly).toBe(false);
    });

    it('the "resizable" property should be false by default', () => {
      expect(comboBoxRef.resizable).toBe(false);
    });

    it('the "popoverInlineAlign" property should be "inside-start" by default', () => {
      expect(comboBoxRef.popoverInlineAlign).toBe("inside-start");
    });

    it('the "value" property should be undefined by default', () => {
      expect(comboBoxRef.value).toBeUndefined();
    });

    it('the "getImagePathCallback" property should be undefined by default', () => {
      expect(comboBoxRef.getImagePathCallback).toBeUndefined();
    });
  });

  describe("model rendering", () => {
    it("should render the invisible-text span with the placeholder when no model is set", async () => {
      const result = await render(
        html`<ch-combo-box-render
          placeholder="Select..."
        ></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      const invisibleText =
        comboBoxRef.shadowRoot!.querySelector(".invisible-text");
      expect(invisibleText).toBeTruthy();
      expect(invisibleText!.textContent!.trim()).toBe("Select...");
    });

    it("should render an input element inside the combobox div", async () => {
      const result = await render(
        html`<ch-combo-box-render .model=${SIMPLE_MODEL}></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      const input = comboBoxRef.shadowRoot!.querySelector("input");
      expect(input).toBeTruthy();
    });

    it("should render a combobox role on the input container", async () => {
      const result = await render(
        html`<ch-combo-box-render .model=${SIMPLE_MODEL}></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      const comboboxDiv =
        comboBoxRef.shadowRoot!.querySelector('[role="combobox"]');
      expect(comboboxDiv).toBeTruthy();
    });
  });

  describe("disabled state", () => {
    it("should disable the input when the component is disabled", async () => {
      const result = await render(
        html`<ch-combo-box-render
          ?disabled=${true}
          .model=${SIMPLE_MODEL}
        ></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      const input = comboBoxRef.shadowRoot!.querySelector(
        "input"
      ) as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it("should add ch-disabled class when disabled", async () => {
      const result = await render(
        html`<ch-combo-box-render
          ?disabled=${true}
          .model=${SIMPLE_MODEL}
        ></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      expect(comboBoxRef.classList.contains("ch-disabled")).toBe(true);
    });
  });

  describe("value display", () => {
    it("should display the caption of the selected value in the input", async () => {
      const result = await render(
        html`<ch-combo-box-render
          .model=${SIMPLE_MODEL}
          value="b"
        ></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      const input = comboBoxRef.shadowRoot!.querySelector(
        "input"
      ) as HTMLInputElement;
      expect(input.value).toBe("Option B");
    });

    it("should display the placeholder when no value is set", async () => {
      const result = await render(
        html`<ch-combo-box-render
          .model=${SIMPLE_MODEL}
          placeholder="Choose..."
        ></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      const input = comboBoxRef.shadowRoot!.querySelector(
        "input"
      ) as HTMLInputElement;
      expect(input.placeholder).toBe("Choose...");
    });
  });
});

