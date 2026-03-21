import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "vitest-browser-lit";

import "../tab.lit.js";
import type { ChTabRender } from "../tab.lit.js";
import type { TabModel } from "../types";

describe("[ch-tab-render][close-button]", () => {
  afterEach(cleanup);

  let tabRef: ChTabRender;

  // - - - - - - - - - - - - - - - - - - - -
  //      Component-level close button
  // - - - - - - - - - - - - - - - - - - - -
  describe("component-level closeButton", () => {
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
          close-button
        ></ch-tab-render>`
      );
      tabRef = result.container.querySelector("ch-tab-render")! as ChTabRender;
      await tabRef.updateComplete;
    });

    it("should render close buttons on all tabs", () => {
      const closeButtons = tabRef.shadowRoot!.querySelectorAll(".close-button");
      expect(closeButtons.length).toBe(3);
    });

    it("close buttons should have the accessible name", () => {
      const closeButtons = tabRef.shadowRoot!.querySelectorAll(".close-button");
      closeButtons.forEach(btn => {
        expect(btn.getAttribute("aria-label")).toBe("Close");
      });
    });

    it("should use custom closeButtonAccessibleName", async () => {
      tabRef.closeButtonAccessibleName = "Remove tab";
      await tabRef.updateComplete;

      const closeBtn = tabRef.shadowRoot!.querySelector(".close-button");
      expect(closeBtn!.getAttribute("aria-label")).toBe("Remove tab");
    });

    it("should fire itemClose when close button is clicked", async () => {
      const eventSpy = vi.fn();
      tabRef.addEventListener("itemClose", eventSpy);

      const closeBtn = tabRef.shadowRoot!.querySelector(
        "#tab-2 .close-button"
      ) as HTMLButtonElement;
      closeBtn.click();
      await tabRef.updateComplete;

      expect(eventSpy).toHaveBeenCalledOnce();
      const detail = eventSpy.mock.calls[0][0].detail;
      expect(detail.itemId).toBe("tab-2");
      expect(detail.itemIndex).toBe(1);
    });

    it("should not change the selected tab when close button is clicked", async () => {
      const closeBtn = tabRef.shadowRoot!.querySelector(
        "#tab-2 .close-button"
      ) as HTMLButtonElement;
      closeBtn.click();
      await tabRef.updateComplete;

      expect(tabRef.selectedId).toBe("tab-1");
    });
  });

  // - - - - - - - - - - - - - - - - - - - -
  //       Item-level close button
  // - - - - - - - - - - - - - - - - - - - -
  describe("item-level closeButton", () => {
    beforeEach(async () => {
      const model: TabModel = [
        { id: "tab-1", name: "Tab 1", closeButton: true },
        { id: "tab-2", name: "Tab 2", closeButton: false },
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

    it("should render close button only on items that have closeButton=true", () => {
      const tab1Close = tabRef.shadowRoot!.querySelector(
        "#tab-1 .close-button"
      );
      expect(tab1Close).toBeTruthy();

      const tab2Close = tabRef.shadowRoot!.querySelector(
        "#tab-2 .close-button"
      );
      expect(tab2Close).toBeNull();

      // tab-3 uses the component default (false)
      const tab3Close = tabRef.shadowRoot!.querySelector(
        "#tab-3 .close-button"
      );
      expect(tab3Close).toBeNull();
    });

    it("item-level closeButton=false should override component-level closeButton=true", async () => {
      tabRef.closeButton = true;
      await tabRef.updateComplete;

      const tab2Close = tabRef.shadowRoot!.querySelector(
        "#tab-2 .close-button"
      );
      // Item-level false overrides component-level true
      expect(tab2Close).toBeNull();
    });
  });

  // - - - - - - - - - - - - - - - - - - - -
  //     Close button on disabled tabs
  // - - - - - - - - - - - - - - - - - - - -
  describe("close button on disabled tabs", () => {
    it("close button should be disabled when the tab is disabled", async () => {
      const model: TabModel = [
        { id: "tab-1", name: "Tab 1", closeButton: true, disabled: true },
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

      const closeBtn = tabRef.shadowRoot!.querySelector(
        "#tab-1 .close-button"
      ) as HTMLButtonElement;
      expect(closeBtn.disabled).toBe(true);
    });
  });

  // - - - - - - - - - - - - - - - - - - - -
  //     No close button = no event
  // - - - - - - - - - - - - - - - - - - - -
  describe("no close button configured", () => {
    it("clicking a tab without close button should not fire itemClose", async () => {
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

      const eventSpy = vi.fn();
      tabRef.addEventListener("itemClose", eventSpy);

      const tab2 = tabRef.shadowRoot!.querySelector(
        "#tab-2"
      ) as HTMLButtonElement;
      tab2.click();
      await tabRef.updateComplete;

      expect(eventSpy).not.toHaveBeenCalled();
    });
  });
});

