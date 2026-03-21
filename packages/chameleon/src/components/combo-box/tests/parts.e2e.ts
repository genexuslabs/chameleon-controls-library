import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChComboBoxRender } from "../combo-box.lit";
import "../combo-box.lit.js";
import type { ComboBoxModel } from "../types";

const MODEL_WITH_GROUPS: ComboBoxModel = [
  {
    caption: "Group 1",
    value: "group-1",
    expandable: true,
    expanded: true,
    items: [
      { caption: "Item 1-A", value: "1a" },
      { caption: "Item 1-B", value: "1b" }
    ]
  },
  { caption: "Item 2", value: "2" }
];

const SIMPLE_MODEL: ComboBoxModel = [
  { caption: "Option A", value: "a" },
  { caption: "Option B", value: "b" },
  { caption: "Option C", value: "c" }
];

describe("[ch-combo-box-render][parts]", () => {
  let comboBoxRef: ChComboBoxRender;

  afterEach(cleanup);

  describe("host parts", () => {
    it("should include the placeholder part when no value is selected", async () => {
      const result = await render(
        html`<ch-combo-box-render .model=${SIMPLE_MODEL}></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      const partAttr = comboBoxRef.getAttribute("part");
      expect(partAttr).toContain("ch-combo-box-render--placeholder");
    });

    it("should include the selected value in the host part when a value is set", async () => {
      const result = await render(
        html`<ch-combo-box-render
          .model=${SIMPLE_MODEL}
          value="a"
        ></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      const partAttr = comboBoxRef.getAttribute("part");
      expect(partAttr).toContain("a");
    });

    it("should include custom hostParts in the host part attribute", async () => {
      const result = await render(
        html`<ch-combo-box-render
          .model=${SIMPLE_MODEL}
          .hostParts=${"custom-part"}
        ></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      const partAttr = comboBoxRef.getAttribute("part");
      expect(partAttr).toContain("custom-part");
    });
  });

  describe("popover parts", () => {
    beforeEach(async () => {
      const model = structuredClone(MODEL_WITH_GROUPS);
      const result = await render(
        html`<ch-combo-box-render
          .model=${model}
          value="1a"
        ></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      // Expand the combo-box programmatically
      (comboBoxRef as any).expanded = true;
      await comboBoxRef.updateComplete;
    });

    it("should set part='window' on the popover element", () => {
      const popover = comboBoxRef.shadowRoot!.querySelector("ch-popover");
      expect(popover).toBeTruthy();
      expect(popover!.getAttribute("part")).toBe("window");
    });

    it("should set group part on group containers", () => {
      const groups = comboBoxRef.shadowRoot!.querySelectorAll('[role="group"]');
      expect(groups.length).toBeGreaterThan(0);

      const firstGroup = groups[0];
      const partAttr = firstGroup.getAttribute("part");
      expect(partAttr).toContain("group");
    });

    it("should set item part on leaf items", () => {
      const items = comboBoxRef.shadowRoot!.querySelectorAll(
        'button[role="option"]'
      );
      expect(items.length).toBeGreaterThan(0);

      const partAttr = items[0].getAttribute("part");
      expect(partAttr).toContain("item");
    });

    it("should set selected part on the currently selected item", () => {
      const selectedItem = comboBoxRef.shadowRoot!.querySelector(
        'button[role="option"][aria-selected="true"]'
      );
      expect(selectedItem).toBeTruthy();

      const partAttr = selectedItem!.getAttribute("part");
      expect(partAttr).toContain("selected");
    });

    it("should set nested part on items inside a group", () => {
      const nestedItems = comboBoxRef.shadowRoot!.querySelectorAll(
        '.group__content button[role="option"]'
      );
      expect(nestedItems.length).toBeGreaterThan(0);

      const partAttr = nestedItems[0].getAttribute("part");
      expect(partAttr).toContain("nested");
    });
  });

  describe("disabled parts", () => {
    it("should include disabled part on disabled items when expanded", async () => {
      const model: ComboBoxModel = [
        { caption: "Disabled Item", value: "dis", disabled: true },
        { caption: "Normal Item", value: "norm" }
      ];
      const result = await render(
        html`<ch-combo-box-render .model=${model}></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      // Expand the combo-box
      (comboBoxRef as any).expanded = true;
      await comboBoxRef.updateComplete;

      const disabledButton = comboBoxRef.shadowRoot!.querySelector(
        'button[role="option"][disabled]'
      );
      expect(disabledButton).toBeTruthy();

      const partAttr = disabledButton!.getAttribute("part");
      expect(partAttr).toContain("disabled");
    });
  });
});

