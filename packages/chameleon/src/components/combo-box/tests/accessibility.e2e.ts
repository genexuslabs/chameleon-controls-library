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

describe("[ch-combo-box-render][accessibility]", () => {
  let comboBoxRef: ChComboBoxRender;

  afterEach(cleanup);

  describe("combobox role", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-combo-box-render
          accessible-name="Test combo"
          .model=${SIMPLE_MODEL}
        ></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;
    });

    it("should render an element with role='combobox'", () => {
      const combobox =
        comboBoxRef.shadowRoot!.querySelector('[role="combobox"]');
      expect(combobox).toBeTruthy();
    });

    it("should set aria-label from the accessibleName property", () => {
      const combobox =
        comboBoxRef.shadowRoot!.querySelector('[role="combobox"]');
      expect(combobox!.getAttribute("aria-label")).toBe("Test combo");
    });

    it("should set aria-expanded to 'false' when the popover is collapsed", () => {
      const input = comboBoxRef.shadowRoot!.querySelector("input");
      expect(input!.getAttribute("aria-expanded")).toBe("false");
    });

    it("should set aria-expanded to 'true' when the popover is expanded", async () => {
      (comboBoxRef as any).expanded = true;
      await comboBoxRef.updateComplete;

      const input = comboBoxRef.shadowRoot!.querySelector("input");
      expect(input!.getAttribute("aria-expanded")).toBe("true");
    });

    it("should set aria-haspopup='true' on the input", () => {
      const input = comboBoxRef.shadowRoot!.querySelector("input");
      expect(input!.getAttribute("aria-haspopup")).toBe("true");
    });

    it("should set aria-controls='popover' on the input", () => {
      const input = comboBoxRef.shadowRoot!.querySelector("input");
      expect(input!.getAttribute("aria-controls")).toBe("popover");
    });
  });

  describe("listbox role", () => {
    it("should render the popover with role='listbox' when expanded", async () => {
      const result = await render(
        html`<ch-combo-box-render .model=${SIMPLE_MODEL}></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      (comboBoxRef as any).expanded = true;
      await comboBoxRef.updateComplete;

      const listbox = comboBoxRef.shadowRoot!.querySelector('[role="listbox"]');
      expect(listbox).toBeTruthy();
    });
  });

  describe("option roles", () => {
    it("should render items with role='option' when expanded", async () => {
      const result = await render(
        html`<ch-combo-box-render .model=${SIMPLE_MODEL}></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      (comboBoxRef as any).expanded = true;
      await comboBoxRef.updateComplete;

      const options =
        comboBoxRef.shadowRoot!.querySelectorAll('[role="option"]');
      expect(options.length).toBe(3);
    });

    it("should set aria-selected='true' on the selected option", async () => {
      const result = await render(
        html`<ch-combo-box-render
          .model=${SIMPLE_MODEL}
          value="b"
        ></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      (comboBoxRef as any).expanded = true;
      await comboBoxRef.updateComplete;

      const selectedOption = comboBoxRef.shadowRoot!.querySelector(
        '[role="option"][aria-selected="true"]'
      );
      expect(selectedOption).toBeTruthy();
      expect(selectedOption!.textContent!.trim()).toBe("Option B");
    });

    it("should set aria-selected='false' on non-selected options", async () => {
      const result = await render(
        html`<ch-combo-box-render
          .model=${SIMPLE_MODEL}
          value="a"
        ></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      (comboBoxRef as any).expanded = true;
      await comboBoxRef.updateComplete;

      const nonSelectedOptions = comboBoxRef.shadowRoot!.querySelectorAll(
        '[role="option"][aria-selected="false"]'
      );
      expect(nonSelectedOptions.length).toBe(2);
    });
  });

  describe("group roles", () => {
    it("should render group containers with role='group'", async () => {
      const model: ComboBoxModel = [
        {
          caption: "Group",
          value: "grp",
          expandable: true,
          expanded: true,
          items: [{ caption: "Child", value: "child" }]
        }
      ];
      const result = await render(
        html`<ch-combo-box-render .model=${model}></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      (comboBoxRef as any).expanded = true;
      await comboBoxRef.updateComplete;

      const groups = comboBoxRef.shadowRoot!.querySelectorAll('[role="group"]');
      expect(groups.length).toBe(1);
    });

    it("should set aria-expanded on expandable groups", async () => {
      const model: ComboBoxModel = [
        {
          caption: "Group",
          value: "grp",
          expandable: true,
          expanded: true,
          items: [{ caption: "Child", value: "child" }]
        }
      ];
      const result = await render(
        html`<ch-combo-box-render .model=${model}></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      (comboBoxRef as any).expanded = true;
      await comboBoxRef.updateComplete;

      const group = comboBoxRef.shadowRoot!.querySelector('[role="group"]');
      expect(group!.getAttribute("aria-expanded")).toBe("true");
    });
  });

  describe("tabindex", () => {
    it("should set tabindex='0' on the combobox div when not in suggest mode and not disabled", async () => {
      const result = await render(
        html`<ch-combo-box-render .model=${SIMPLE_MODEL}></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      const combobox =
        comboBoxRef.shadowRoot!.querySelector('[role="combobox"]');
      expect(combobox!.getAttribute("tabindex")).toBe("0");
    });

    it("should not set tabindex on the combobox div when disabled", async () => {
      const result = await render(
        html`<ch-combo-box-render
          ?disabled=${true}
          .model=${SIMPLE_MODEL}
        ></ch-combo-box-render>`
      );
      comboBoxRef = result.container.querySelector("ch-combo-box-render")!;
      await comboBoxRef.updateComplete;

      const combobox =
        comboBoxRef.shadowRoot!.querySelector('[role="combobox"]');
      // When disabled, disableTextSelection is false, so tabindex should not be set
      expect(combobox!.hasAttribute("tabindex")).toBe(false);
    });
  });
});

