import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";

import "../tab.lit.js";
import type { ChTabRender } from "../tab.lit.js";
import type { TabModel } from "../types";

const SIMPLE_MODEL: TabModel = [
  { id: "tab-1", name: "Tab 1" },
  { id: "tab-2", name: "Tab 2" },
  { id: "tab-3", name: "Tab 3" }
];

const MODEL_WITH_DISABLED: TabModel = [
  { id: "tab-1", name: "Tab 1" },
  { id: "tab-2", name: "Tab 2", disabled: true },
  { id: "tab-3", name: "Tab 3" }
];

/**
 * Helper to dispatch a keyboard event inside the shadow DOM on a tab button.
 */
function pressKey(button: HTMLButtonElement, code: string, key: string): void {
  button.dispatchEvent(
    new KeyboardEvent("keydown", { code, key, bubbles: true, composed: true })
  );
}

describe("[ch-tab-render][keyboard-navigation]", () => {
  afterEach(cleanup);

  let tabRef: ChTabRender;

  beforeEach(async () => {
    const result = render(
      html`<ch-tab-render
        .model=${SIMPLE_MODEL}
        selected-id="tab-1"
      ></ch-tab-render>`
    );
    tabRef = result.container.querySelector("ch-tab-render")! as ChTabRender;
    await tabRef.updateComplete;
  });

  // - - - - - - - - - - - - - - - - - - - -
  //   Block direction (block-start / block-end)
  // - - - - - - - - - - - - - - - - - - - -
  describe("block direction (default: block-start)", () => {
    it("ArrowRight should move focus to the next tab", async () => {
      const tab1 = tabRef.shadowRoot!.querySelector(
        "#tab-1"
      ) as HTMLButtonElement;
      tab1.focus();

      pressKey(tab1, "ArrowRight", "ArrowRight");
      await tabRef.updateComplete;

      // The second tab should now be selected
      expect(tabRef.selectedId).toBe("tab-2");
    });

    it("ArrowLeft should move focus to the previous tab", async () => {
      tabRef.selectedId = "tab-2";
      await tabRef.updateComplete;

      const tab2 = tabRef.shadowRoot!.querySelector(
        "#tab-2"
      ) as HTMLButtonElement;
      tab2.focus();

      pressKey(tab2, "ArrowLeft", "ArrowLeft");
      await tabRef.updateComplete;

      expect(tabRef.selectedId).toBe("tab-1");
    });

    it("ArrowRight on the last tab should wrap to the first tab", async () => {
      tabRef.selectedId = "tab-3";
      await tabRef.updateComplete;

      const tab3 = tabRef.shadowRoot!.querySelector(
        "#tab-3"
      ) as HTMLButtonElement;
      tab3.focus();

      pressKey(tab3, "ArrowRight", "ArrowRight");
      await tabRef.updateComplete;

      expect(tabRef.selectedId).toBe("tab-1");
    });

    it("ArrowLeft on the first tab should wrap to the last tab", async () => {
      const tab1 = tabRef.shadowRoot!.querySelector(
        "#tab-1"
      ) as HTMLButtonElement;
      tab1.focus();

      pressKey(tab1, "ArrowLeft", "ArrowLeft");
      await tabRef.updateComplete;

      expect(tabRef.selectedId).toBe("tab-3");
    });

    it("ArrowUp and ArrowDown should NOT navigate in block direction", async () => {
      const tab1 = tabRef.shadowRoot!.querySelector(
        "#tab-1"
      ) as HTMLButtonElement;
      tab1.focus();

      pressKey(tab1, "ArrowDown", "ArrowDown");
      await tabRef.updateComplete;

      // Should still be on tab-1 since ArrowDown is a no-op in block mode
      expect(tabRef.selectedId).toBe("tab-1");
    });
  });

  // - - - - - - - - - - - - - - - - - - - -
  //   Inline direction (inline-start / inline-end)
  // - - - - - - - - - - - - - - - - - - - -
  describe("inline direction (inline-start)", () => {
    beforeEach(async () => {
      tabRef.tabListPosition = "inline-start";
      await tabRef.updateComplete;
    });

    it("ArrowDown should move focus to the next tab", async () => {
      const tab1 = tabRef.shadowRoot!.querySelector(
        "#tab-1"
      ) as HTMLButtonElement;
      tab1.focus();

      pressKey(tab1, "ArrowDown", "ArrowDown");
      await tabRef.updateComplete;

      expect(tabRef.selectedId).toBe("tab-2");
    });

    it("ArrowUp should move focus to the previous tab", async () => {
      tabRef.selectedId = "tab-2";
      await tabRef.updateComplete;

      const tab2 = tabRef.shadowRoot!.querySelector(
        "#tab-2"
      ) as HTMLButtonElement;
      tab2.focus();

      pressKey(tab2, "ArrowUp", "ArrowUp");
      await tabRef.updateComplete;

      expect(tabRef.selectedId).toBe("tab-1");
    });

    it("ArrowRight and ArrowLeft should NOT navigate in inline direction", async () => {
      const tab1 = tabRef.shadowRoot!.querySelector(
        "#tab-1"
      ) as HTMLButtonElement;
      tab1.focus();

      pressKey(tab1, "ArrowRight", "ArrowRight");
      await tabRef.updateComplete;

      // Should still be on tab-1
      expect(tabRef.selectedId).toBe("tab-1");
    });
  });

  // - - - - - - - - - - - - - - - - - - - -
  //   Home and End keys
  // - - - - - - - - - - - - - - - - - - - -
  describe("Home and End keys", () => {
    it("Home should move focus to the first tab", async () => {
      tabRef.selectedId = "tab-3";
      await tabRef.updateComplete;

      const tab3 = tabRef.shadowRoot!.querySelector(
        "#tab-3"
      ) as HTMLButtonElement;
      tab3.focus();

      pressKey(tab3, "Home", "Home");
      await tabRef.updateComplete;

      expect(tabRef.selectedId).toBe("tab-1");
    });

    it("End should move focus to the last tab", async () => {
      const tab1 = tabRef.shadowRoot!.querySelector(
        "#tab-1"
      ) as HTMLButtonElement;
      tab1.focus();

      pressKey(tab1, "End", "End");
      await tabRef.updateComplete;

      expect(tabRef.selectedId).toBe("tab-3");
    });
  });

  // - - - - - - - - - - - - - - - - - - - -
  //   Disabled tab skipping
  // - - - - - - - - - - - - - - - - - - - -
  describe("disabled tab skipping", () => {
    it("should skip disabled tabs when navigating with ArrowRight", async () => {
      tabRef.model = MODEL_WITH_DISABLED;
      tabRef.selectedId = "tab-1";
      await tabRef.updateComplete;

      const tab1 = tabRef.shadowRoot!.querySelector(
        "#tab-1"
      ) as HTMLButtonElement;
      tab1.focus();

      pressKey(tab1, "ArrowRight", "ArrowRight");
      await tabRef.updateComplete;

      // Should skip tab-2 (disabled) and go to tab-3
      expect(tabRef.selectedId).toBe("tab-3");
    });
  });

  // - - - - - - - - - - - - - - - - - - - -
  //   No keyboard navigation with < 2 enabled
  // - - - - - - - - - - - - - - - - - - - -
  describe("single enabled tab", () => {
    it("should not add keydown handler when there is only one enabled tab", async () => {
      const singleModel: TabModel = [
        { id: "tab-1", name: "Tab 1" },
        { id: "tab-2", name: "Tab 2", disabled: true }
      ];
      tabRef.model = singleModel;
      tabRef.selectedId = "tab-1";
      await tabRef.updateComplete;

      const tab1 = tabRef.shadowRoot!.querySelector(
        "#tab-1"
      ) as HTMLButtonElement;
      tab1.focus();

      // ArrowRight should have no effect
      pressKey(tab1, "ArrowRight", "ArrowRight");
      await tabRef.updateComplete;

      expect(tabRef.selectedId).toBe("tab-1");
    });
  });
});

