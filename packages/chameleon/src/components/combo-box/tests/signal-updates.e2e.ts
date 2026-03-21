import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { GxImageMultiState } from "../../../typings/multi-state-images";
import type { ChComboBoxRender } from "../combo-box.lit";
import "../combo-box.lit.js";
import type { ComboBoxImagePathCallback, ComboBoxModel } from "../types";

const MODEL_WITH_IMAGES: ComboBoxModel = [
  {
    caption: "Option A",
    value: "a",
    startImgSrc: "icon-a.svg",
    startImgType: "mask"
  },
  {
    caption: "Option B",
    value: "b",
    startImgSrc: "icon-b.svg"
  },
  { caption: "Option C", value: "c" }
];

const SIMPLE_MODEL: ComboBoxModel = [
  { caption: "Option A", value: "a" },
  { caption: "Option B", value: "b" }
];

describe("[ch-combo-box-render][signal-updates]", () => {
  let comboBoxRef: ChComboBoxRender;

  afterEach(cleanup);

  describe("getImagePathCallback changes", () => {
    it("should use the provided getImagePathCallback when computing images", async () => {
      const callback: ComboBoxImagePathCallback = (
        item,
        direction
      ): GxImageMultiState | undefined => ({
        base: `resolved-${direction === "start" ? item.startImgSrc : item.endImgSrc}`
      });

      const model = structuredClone(MODEL_WITH_IMAGES);
      const result = await render(
        html`<ch-combo-box-render
          .getImagePathCallback=${callback}
          .model=${model}
          value="a"
        ></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      // The component should use the callback internally for computing images
      expect(comboBoxRef.getImagePathCallback).toBe(callback);
    });

    it("should update when getImagePathCallback is changed", async () => {
      const callback1: ComboBoxImagePathCallback = (
        item,
        direction
      ): GxImageMultiState => ({
        base: `v1-${direction === "start" ? item.startImgSrc : item.endImgSrc}`
      });

      const model = structuredClone(MODEL_WITH_IMAGES);
      const result = await render(
        html`<ch-combo-box-render
          .getImagePathCallback=${callback1}
          .model=${model}
          value="a"
        ></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      const callback2: ComboBoxImagePathCallback = (
        item,
        direction
      ): GxImageMultiState => ({
        base: `v2-${direction === "start" ? item.startImgSrc : item.endImgSrc}`
      });

      comboBoxRef.getImagePathCallback = callback2;
      await comboBoxRef.updateComplete;

      expect(comboBoxRef.getImagePathCallback).toBe(callback2);
    });
  });

  describe("model changes trigger re-render", () => {
    beforeEach(async () => {
      const model = structuredClone(SIMPLE_MODEL);
      const result = await render(
        html`<ch-combo-box-render .model=${model}></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;
    });

    it("should re-render items when model changes while expanded", async () => {
      (comboBoxRef as any).expanded = true;
      await comboBoxRef.updateComplete;

      let items = comboBoxRef.shadowRoot!.querySelectorAll(
        'button[role="option"]'
      );
      expect(items.length).toBe(2);

      // Update the model with more items
      const newModel: ComboBoxModel = [
        { caption: "Option A", value: "a" },
        { caption: "Option B", value: "b" },
        { caption: "Option D", value: "d" },
        { caption: "Option E", value: "e" }
      ];
      comboBoxRef.model = newModel;
      await comboBoxRef.updateComplete;

      items = comboBoxRef.shadowRoot!.querySelectorAll('button[role="option"]');
      expect(items.length).toBe(4);
    });
  });

  describe("value changes via property", () => {
    it("should update the displayed caption when value changes", async () => {
      const model = structuredClone(SIMPLE_MODEL);
      const result = await render(
        html`<ch-combo-box-render
          .model=${model}
          value="a"
        ></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      let input = comboBoxRef.shadowRoot!.querySelector(
        "input"
      ) as HTMLInputElement;
      expect(input.value).toBe("Option A");

      comboBoxRef.value = "b";
      await comboBoxRef.updateComplete;

      input = comboBoxRef.shadowRoot!.querySelector(
        "input"
      ) as HTMLInputElement;
      expect(input.value).toBe("Option B");
    });
  });

  describe("suggest mode filter updates", () => {
    it("should filter items when suggest mode is active and value changes", async () => {
      const model: ComboBoxModel = [
        { caption: "Apple", value: "apple" },
        { caption: "Banana", value: "banana" },
        { caption: "Avocado", value: "avocado" }
      ];
      const result = await render(
        html`<ch-combo-box-render
          ?suggest=${true}
          suggest-debounce="0"
          .model=${model}
        ></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      // Set value to filter
      comboBoxRef.value = "A";
      (comboBoxRef as any).expanded = true;
      await comboBoxRef.updateComplete;

      // Items containing "A" should be displayed (Apple and Avocado)
      const visibleItems = comboBoxRef.shadowRoot!.querySelectorAll(
        'button[role="option"]'
      );
      // Only "Apple" and "Avocado" should be rendered (Banana is filtered out)
      expect(visibleItems.length).toBe(2);
    });
  });
});

