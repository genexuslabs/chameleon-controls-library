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

describe("[ch-tab-render][accessibility]", () => {
  afterEach(cleanup);

  let tabRef: ChTabRender;

  beforeEach(async () => {
    const result = render(
      html`<ch-tab-render
        .model=${[
          { id: "tab-1", name: "Tab 1", wasRendered: true },
          { id: "tab-2", name: "Tab 2", wasRendered: true },
          { id: "tab-3", name: "Tab 3", wasRendered: true }
        ] satisfies TabModel}
        selected-id="tab-1"
      ></ch-tab-render>`
    );
    tabRef = result.container.querySelector("ch-tab-render")! as ChTabRender;
    await tabRef.updateComplete;
  });

  // - - - - - - - - - - - - - - - - - - - -
  //            ARIA roles
  // - - - - - - - - - - - - - - - - - - - -
  it('should have a container with role="tablist"', () => {
    const tabList = tabRef.shadowRoot!.querySelector('[role="tablist"]');
    expect(tabList).toBeTruthy();
  });

  it('should render each tab button with role="tab"', () => {
    const tabs = tabRef.shadowRoot!.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(3);
  });

  it('should render each panel with role="tabpanel"', () => {
    const panels = tabRef.shadowRoot!.querySelectorAll('[role="tabpanel"]');
    expect(panels.length).toBe(3);
  });

  // - - - - - - - - - - - - - - - - - - - -
  //       aria-controls / aria-labelledby
  // - - - - - - - - - - - - - - - - - - - -
  it("should set aria-controls on each tab referencing the corresponding panel", () => {
    const tab1 = tabRef.shadowRoot!.querySelector("#tab-1");
    expect(tab1!.getAttribute("aria-controls")).toBe("panel-tab-1");

    const tab2 = tabRef.shadowRoot!.querySelector("#tab-2");
    expect(tab2!.getAttribute("aria-controls")).toBe("panel-tab-2");
  });

  it("should set aria-labelledby on each panel referencing the corresponding tab", () => {
    const panel1 = tabRef.shadowRoot!.querySelector("#panel-tab-1");
    expect(panel1!.getAttribute("aria-labelledby")).toBe("tab-1");

    const panel2 = tabRef.shadowRoot!.querySelector("#panel-tab-2");
    expect(panel2!.getAttribute("aria-labelledby")).toBe("tab-2");
  });

  // - - - - - - - - - - - - - - - - - - - -
  //           aria-selected
  // - - - - - - - - - - - - - - - - - - - -
  it('should set aria-selected="true" on the selected tab', () => {
    const selectedTab = tabRef.shadowRoot!.querySelector("#tab-1");
    expect(selectedTab!.getAttribute("aria-selected")).toBe("true");
  });

  it('should set aria-selected="false" on non-selected tabs', () => {
    const tab2 = tabRef.shadowRoot!.querySelector("#tab-2");
    expect(tab2!.getAttribute("aria-selected")).toBe("false");

    const tab3 = tabRef.shadowRoot!.querySelector("#tab-3");
    expect(tab3!.getAttribute("aria-selected")).toBe("false");
  });

  // - - - - - - - - - - - - - - - - - - - -
  //         Accessible name
  // - - - - - - - - - - - - - - - - - - - -
  it("should apply accessible-name to the tablist's aria-label", async () => {
    tabRef.accessibleName = "Main navigation tabs";
    await tabRef.updateComplete;

    const tabList = tabRef.shadowRoot!.querySelector('[role="tablist"]');
    expect(tabList!.getAttribute("aria-label")).toBe("Main navigation tabs");
  });

  it("should not set aria-label on the tablist when accessibleName is undefined", () => {
    const tabList = tabRef.shadowRoot!.querySelector('[role="tablist"]');
    expect(tabList!.hasAttribute("aria-label")).toBe(false);
  });

  // - - - - - - - - - - - - - - - - - - - -
  //   Item-level accessible name
  // - - - - - - - - - - - - - - - - - - - -
  it("should use item.accessibleName as aria-label on the tab button", async () => {
    tabRef.model = [
      { id: "tab-1", name: "Tab 1", accessibleName: "First tab" },
      { id: "tab-2", name: "Tab 2" },
      { id: "tab-3", name: "Tab 3" }
    ];
    await tabRef.updateComplete;

    const tab1 = tabRef.shadowRoot!.querySelector("#tab-1");
    expect(tab1!.getAttribute("aria-label")).toBe("First tab");
  });

  it("should use item.name as aria-label when showCaptions is false", async () => {
    tabRef.showCaptions = false;
    await tabRef.updateComplete;

    const tab1 = tabRef.shadowRoot!.querySelector("#tab-1");
    expect(tab1!.getAttribute("aria-label")).toBe("Tab 1");
  });

  // - - - - - - - - - - - - - - - - - - - -
  //      Panels without tab buttons
  // - - - - - - - - - - - - - - - - - - - -
  it("should not set role=tabpanel when tabButtonHidden is true", async () => {
    tabRef.tabButtonHidden = true;
    await tabRef.updateComplete;

    const panels = tabRef.shadowRoot!.querySelectorAll('[role="tabpanel"]');
    expect(panels.length).toBe(0);
  });

  it("should not set aria-labelledby when tabButtonHidden is true", async () => {
    tabRef.tabButtonHidden = true;
    await tabRef.updateComplete;

    const panelWithLabel =
      tabRef.shadowRoot!.querySelector("[aria-labelledby]");
    expect(panelWithLabel).toBeNull();
  });

  // - - - - - - - - - - - - - - - - - - - -
  //       Disabled state
  // - - - - - - - - - - - - - - - - - - - -
  it("should disable individual tab buttons when item.disabled is true", async () => {
    tabRef.model = [
      { id: "tab-1", name: "Tab 1", disabled: true },
      { id: "tab-2", name: "Tab 2" },
      { id: "tab-3", name: "Tab 3" }
    ];
    await tabRef.updateComplete;

    const tab1 = tabRef.shadowRoot!.querySelector(
      "#tab-1"
    ) as HTMLButtonElement;
    expect(tab1.disabled).toBe(true);
  });

  it("should disable all tab buttons when the component-level disabled is true", async () => {
    tabRef.disabled = true;
    await tabRef.updateComplete;

    const tabs = tabRef.shadowRoot!.querySelectorAll(
      '[role="tab"]'
    ) as NodeListOf<HTMLButtonElement>;
    tabs.forEach(tab => {
      expect(tab.disabled).toBe(true);
    });
  });
});

