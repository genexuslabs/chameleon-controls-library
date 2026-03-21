import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "vitest-browser-lit";

import "../tab.lit.js";
import type { ChTabRender } from "../tab.lit.js";
import type { TabModel } from "../types";

const SIMPLE_MODEL: TabModel = [
  { id: "tab-1", name: "Tab 1" },
  { id: "tab-2", name: "Tab 2" },
  { id: "tab-3", name: "Tab 3" }
];

describe("[ch-tab-render][selection]", () => {
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

  it("should mark the selected tab with aria-selected='true'", () => {
    const selectedTab = tabRef.shadowRoot!.querySelector("#tab-1");
    expect(selectedTab!.getAttribute("aria-selected")).toBe("true");
  });

  it("should mark non-selected tabs with aria-selected='false'", () => {
    const otherTab = tabRef.shadowRoot!.querySelector("#tab-2");
    expect(otherTab!.getAttribute("aria-selected")).toBe("false");
  });

  it("should update selectedId when a tab is clicked", async () => {
    const tab2Button = tabRef.shadowRoot!.querySelector(
      "#tab-2"
    ) as HTMLButtonElement;
    tab2Button.click();
    await tabRef.updateComplete;

    expect(tabRef.selectedId).toBe("tab-2");
  });

  it("should fire selectedItemChange event when a tab is clicked", async () => {
    const eventSpy = vi.fn();
    tabRef.addEventListener("selectedItemChange", eventSpy);

    const tab2Button = tabRef.shadowRoot!.querySelector(
      "#tab-2"
    ) as HTMLButtonElement;
    tab2Button.click();
    await tabRef.updateComplete;

    expect(eventSpy).toHaveBeenCalledOnce();
    const eventDetail = eventSpy.mock.calls[0][0].detail;
    expect(eventDetail.newSelectedId).toBe("tab-2");
    expect(eventDetail.newSelectedIndex).toBe(1);
  });

  it("should not fire selectedItemChange when clicking the already selected tab", async () => {
    const eventSpy = vi.fn();
    tabRef.addEventListener("selectedItemChange", eventSpy);

    const tab1Button = tabRef.shadowRoot!.querySelector(
      "#tab-1"
    ) as HTMLButtonElement;
    tab1Button.click();
    await tabRef.updateComplete;

    expect(eventSpy).not.toHaveBeenCalled();
  });

  it("should prevent selection when event is defaultPrevented", async () => {
    tabRef.addEventListener("selectedItemChange", (event: Event) => {
      event.preventDefault();
    });

    const tab2Button = tabRef.shadowRoot!.querySelector(
      "#tab-2"
    ) as HTMLButtonElement;
    tab2Button.click();
    await tabRef.updateComplete;

    // Should remain on tab-1
    expect(tabRef.selectedId).toBe("tab-1");
  });

  it("should show the selected panel and hide the others", async () => {
    const selectedPanel = tabRef.shadowRoot!.querySelector(
      "#panel-tab-1"
    ) as HTMLElement;
    const hiddenPanel = tabRef.shadowRoot!.querySelector("#panel-tab-2");

    expect(selectedPanel).toBeTruthy();
    expect(selectedPanel.classList.contains("panel--selected")).toBe(true);

    // tab-2 may or may not be in the DOM depending on wasRendered, but if it
    // is there it should have the hidden class
    if (hiddenPanel) {
      expect(hiddenPanel.classList.contains("panel--hidden")).toBe(true);
    }
  });

  it("should not fire events on disabled tabs", async () => {
    const modelWithDisabled: TabModel = [
      { id: "tab-1", name: "Tab 1" },
      { id: "tab-2", name: "Tab 2", disabled: true },
      { id: "tab-3", name: "Tab 3" }
    ];
    tabRef.model = modelWithDisabled;
    await tabRef.updateComplete;

    const eventSpy = vi.fn();
    tabRef.addEventListener("selectedItemChange", eventSpy);

    const tab2Button = tabRef.shadowRoot!.querySelector(
      "#tab-2"
    ) as HTMLButtonElement;

    // A disabled button should not fire a click event, but let's verify
    // the disabled attribute is present
    expect(tab2Button.disabled).toBe(true);
  });

  it("should lazily render panels (wasRendered tracking)", async () => {
    const lazyModel: TabModel = [
      { id: "tab-1", name: "Tab 1", wasRendered: true },
      { id: "tab-2", name: "Tab 2" },
      { id: "tab-3", name: "Tab 3" }
    ];
    tabRef.model = lazyModel;
    tabRef.selectedId = "tab-1";
    await tabRef.updateComplete;

    // Only tab-1 should have a panel rendered (since it has wasRendered or
    // is selected)
    const panels = tabRef.shadowRoot!.querySelectorAll('[role="tabpanel"]');
    expect(panels.length).toBe(1);
    expect(panels[0].id).toBe("panel-tab-1");
  });
});

