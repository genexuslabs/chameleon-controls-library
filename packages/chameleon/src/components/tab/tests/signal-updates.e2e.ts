import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";

import "../tab.lit.js";
import type { ChTabRender } from "../tab.lit.js";
import type { TabModel } from "../types";

describe("[ch-tab-render][signal-updates]", () => {
  afterEach(cleanup);

  let tabRef: ChTabRender;

  // - - - - - - - - - - - - - - - - - - - -
  //     Model changes
  // - - - - - - - - - - - - - - - - - - - -
  describe("model changes", () => {
    beforeEach(async () => {
      const model: TabModel = [
        { id: "tab-1", name: "Tab 1" },
        { id: "tab-2", name: "Tab 2" }
      ];
      const result = render(
        html`<ch-tab-render
          .model=${model}
          selected-id="tab-1"
        ></ch-tab-render>`
      );
      tabRef = result.container.querySelector("ch-tab-render")! as ChTabRender;
      await tabRef.updateComplete;
    });

    it("should update tabs when model is changed to a new array", async () => {
      tabRef.model = [
        { id: "new-1", name: "New Tab 1" },
        { id: "new-2", name: "New Tab 2" },
        { id: "new-3", name: "New Tab 3" }
      ];
      await tabRef.updateComplete;

      const tabs = tabRef.shadowRoot!.querySelectorAll('[role="tab"]');
      expect(tabs.length).toBe(3);
      expect(tabs[0].id).toBe("new-1");
      expect(tabs[1].id).toBe("new-2");
      expect(tabs[2].id).toBe("new-3");
    });

    it("should add new tabs when items are added to the model", async () => {
      tabRef.model = [
        { id: "tab-1", name: "Tab 1" },
        { id: "tab-2", name: "Tab 2" },
        { id: "tab-3", name: "Tab 3" }
      ];
      await tabRef.updateComplete;

      const tabs = tabRef.shadowRoot!.querySelectorAll('[role="tab"]');
      expect(tabs.length).toBe(3);
    });

    it("should remove tabs when items are removed from the model", async () => {
      tabRef.model = [{ id: "tab-1", name: "Tab 1" }];
      await tabRef.updateComplete;

      const tabs = tabRef.shadowRoot!.querySelectorAll('[role="tab"]');
      expect(tabs.length).toBe(1);
    });

    it("should handle model set to empty array", async () => {
      tabRef.model = [];
      await tabRef.updateComplete;

      const tabs = tabRef.shadowRoot!.querySelectorAll('[role="tab"]');
      expect(tabs.length).toBe(0);
    });

    it("should handle model set to undefined", async () => {
      tabRef.model = undefined;
      await tabRef.updateComplete;

      const tabs = tabRef.shadowRoot!.querySelectorAll('[role="tab"]');
      expect(tabs.length).toBe(0);
    });
  });

  // - - - - - - - - - - - - - - - - - - - -
  //   selectedId changes
  // - - - - - - - - - - - - - - - - - - - -
  describe("selectedId changes", () => {
    beforeEach(async () => {
      const model: TabModel = [
        { id: "tab-1", name: "Tab 1" },
        { id: "tab-2", name: "Tab 2" },
        { id: "tab-3", name: "Tab 3" }
      ];
      const result = render(
        html`<ch-tab-render
          .model=${model}
          selected-id="tab-1"
        ></ch-tab-render>`
      );
      tabRef = result.container.querySelector("ch-tab-render")! as ChTabRender;
      await tabRef.updateComplete;
    });

    it("should update the selected state when selectedId changes", async () => {
      tabRef.selectedId = "tab-2";
      await tabRef.updateComplete;

      const tab1 = tabRef.shadowRoot!.querySelector("#tab-1");
      const tab2 = tabRef.shadowRoot!.querySelector("#tab-2");

      expect(tab1!.getAttribute("aria-selected")).toBe("false");
      expect(tab2!.getAttribute("aria-selected")).toBe("true");
    });

    it("should render the newly selected panel", async () => {
      tabRef.selectedId = "tab-3";
      await tabRef.updateComplete;

      const panel3 = tabRef.shadowRoot!.querySelector("#panel-tab-3");
      expect(panel3).toBeTruthy();
      expect(panel3!.classList.contains("panel--selected")).toBe(true);
    });

    it("should mark the previously selected panel as hidden", async () => {
      tabRef.selectedId = "tab-2";
      await tabRef.updateComplete;

      const panel1 = tabRef.shadowRoot!.querySelector("#panel-tab-1");
      if (panel1) {
        expect(panel1.classList.contains("panel--hidden")).toBe(true);
      }
    });
  });

  // - - - - - - - - - - - - - - - - - - - -
  //   Property reactivity
  // - - - - - - - - - - - - - - - - - - - -
  describe("property reactivity", () => {
    beforeEach(async () => {
      const model: TabModel = [
        { id: "tab-1", name: "Tab 1" },
        { id: "tab-2", name: "Tab 2" }
      ];
      const result = render(
        html`<ch-tab-render
          .model=${model}
          selected-id="tab-1"
        ></ch-tab-render>`
      );
      tabRef = result.container.querySelector("ch-tab-render")! as ChTabRender;
      await tabRef.updateComplete;
    });

    it("should re-render when expanded changes", async () => {
      tabRef.expanded = false;
      await tabRef.updateComplete;

      const panelContainer =
        tabRef.shadowRoot!.querySelector(".panel-container");
      expect(
        panelContainer!.classList.contains("panel-container--collapsed")
      ).toBe(true);
    });

    it("should re-render when expanded is toggled back to true", async () => {
      tabRef.expanded = false;
      await tabRef.updateComplete;

      tabRef.expanded = true;
      await tabRef.updateComplete;

      const panelContainer =
        tabRef.shadowRoot!.querySelector(".panel-container");
      expect(
        panelContainer!.classList.contains("panel-container--collapsed")
      ).toBe(false);
    });

    it("should update showCaptions rendering", async () => {
      // Verify captions are initially rendered
      let textBlocks = tabRef.shadowRoot!.querySelectorAll("ch-textblock");
      expect(textBlocks.length).toBeGreaterThan(0);

      tabRef.showCaptions = false;
      await tabRef.updateComplete;

      textBlocks = tabRef.shadowRoot!.querySelectorAll("ch-textblock");
      expect(textBlocks.length).toBe(0);
    });

    it("should toggle disabled state on all tabs", async () => {
      tabRef.disabled = true;
      await tabRef.updateComplete;

      const tabs = tabRef.shadowRoot!.querySelectorAll(
        '[role="tab"]'
      ) as NodeListOf<HTMLButtonElement>;
      tabs.forEach(tab => {
        expect(tab.disabled).toBe(true);
      });

      tabRef.disabled = false;
      await tabRef.updateComplete;

      const tabsAfter = tabRef.shadowRoot!.querySelectorAll(
        '[role="tab"]'
      ) as NodeListOf<HTMLButtonElement>;
      tabsAfter.forEach(tab => {
        expect(tab.disabled).toBe(false);
      });
    });

    it("should update tab list direction when tabListPosition changes", async () => {
      tabRef.tabListPosition = "inline-start";
      await tabRef.updateComplete;

      const tabList = tabRef.shadowRoot!.querySelector(
        '[role="tablist"]'
      ) as HTMLElement;
      expect(tabList.classList.contains("tab-list--inline")).toBe(true);
      expect(tabList.classList.contains("tab-list--block")).toBe(false);
    });
  });

  // - - - - - - - - - - - - - - - - - - - -
  //   removePage method
  // - - - - - - - - - - - - - - - - - - - -
  describe("removePage method", () => {
    it("should remove a rendered page from the DOM", async () => {
      const model: TabModel = [
        { id: "tab-1", name: "Tab 1", wasRendered: true },
        { id: "tab-2", name: "Tab 2", wasRendered: true }
      ];
      const result = render(
        html`<ch-tab-render
          .model=${model}
          selected-id="tab-1"
        ></ch-tab-render>`
      );
      tabRef = result.container.querySelector("ch-tab-render")! as ChTabRender;
      await tabRef.updateComplete;

      // Verify tab-2 panel exists
      let panel2 = tabRef.shadowRoot!.querySelector("#panel-tab-2");
      expect(panel2).toBeTruthy();

      await tabRef.removePage("tab-2");
      await tabRef.updateComplete;

      panel2 = tabRef.shadowRoot!.querySelector("#panel-tab-2");
      expect(panel2).toBeNull();
    });
  });
});

