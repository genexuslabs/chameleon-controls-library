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

describe("[ch-tab-render][basic]", () => {
  afterEach(cleanup);

  let tabRef: ChTabRender;

  beforeEach(async () => {
    const result = render(html`<ch-tab-render></ch-tab-render>`);
    tabRef = result.container.querySelector("ch-tab-render")! as ChTabRender;
    await tabRef.updateComplete;
  });

  it("should have Shadow DOM", () => {
    expect(tabRef.shadowRoot).toBeTruthy();
  });

  // - - - - - - - - - - - - - - - - - - - -
  //           Default property values
  // - - - - - - - - - - - - - - - - - - - -
  it('the "accessibleName" property should be undefined by default', () => {
    expect(tabRef.accessibleName).toBeUndefined();
  });

  it('the "closeButton" property should be false by default', () => {
    expect(tabRef.closeButton).toBe(false);
  });

  it('the "closeButtonAccessibleName" property should be "Close" by default', () => {
    expect(tabRef.closeButtonAccessibleName).toBe("Close");
  });

  it('the "contain" property should be "none" by default', () => {
    expect(tabRef.contain).toBe("none");
  });

  it('the "disabled" property should be false by default', () => {
    expect(tabRef.disabled).toBe(false);
  });

  it('the "dragOutside" property should be false by default', () => {
    expect(tabRef.dragOutside).toBe(false);
  });

  it('the "expanded" property should be true by default', () => {
    expect(tabRef.expanded).toBe(true);
  });

  it('the "model" property should be undefined by default', () => {
    expect(tabRef.model).toBeUndefined();
  });

  it('the "overflow" property should be "visible" by default', () => {
    expect(tabRef.overflow).toBe("visible");
  });

  it('the "selectedId" property should be undefined by default', () => {
    expect(tabRef.selectedId).toBeUndefined();
  });

  it('the "showCaptions" property should be true by default', () => {
    expect(tabRef.showCaptions).toBe(true);
  });

  it('the "showTabListEnd" property should be false by default', () => {
    expect(tabRef.showTabListEnd).toBe(false);
  });

  it('the "showTabListStart" property should be false by default', () => {
    expect(tabRef.showTabListStart).toBe(false);
  });

  it('the "sortable" property should be false by default', () => {
    expect(tabRef.sortable).toBe(false);
  });

  it('the "tabButtonHidden" property should be false by default', () => {
    expect(tabRef.tabButtonHidden).toBe(false);
  });

  it('the "tabListPosition" property should be "block-start" by default', () => {
    expect(tabRef.tabListPosition).toBe("block-start");
  });

  // - - - - - - - - - - - - - - - - - - - -
  //         Rendering with model
  // - - - - - - - - - - - - - - - - - - - -
  it("should render nothing when model is undefined", () => {
    const tabButtons = tabRef.shadowRoot!.querySelectorAll('[role="tab"]');
    expect(tabButtons.length).toBe(0);
  });

  it("should render nothing when model is empty", async () => {
    tabRef.model = [];
    await tabRef.updateComplete;

    const tabButtons = tabRef.shadowRoot!.querySelectorAll('[role="tab"]');
    expect(tabButtons.length).toBe(0);
  });

  it("should render tab buttons when model is provided", async () => {
    tabRef.model = SIMPLE_MODEL;
    tabRef.selectedId = "tab-1";
    await tabRef.updateComplete;

    const tabButtons = tabRef.shadowRoot!.querySelectorAll('[role="tab"]');
    expect(tabButtons.length).toBe(3);
  });

  it("should render a tablist role element", async () => {
    tabRef.model = SIMPLE_MODEL;
    tabRef.selectedId = "tab-1";
    await tabRef.updateComplete;

    const tabList = tabRef.shadowRoot!.querySelector('[role="tablist"]');
    expect(tabList).toBeTruthy();
  });

  it("should render tab panels for rendered pages", async () => {
    tabRef.model = [
      { id: "tab-1", name: "Tab 1", wasRendered: true },
      { id: "tab-2", name: "Tab 2" },
      { id: "tab-3", name: "Tab 3" }
    ];
    tabRef.selectedId = "tab-1";
    await tabRef.updateComplete;

    const tabPanels = tabRef.shadowRoot!.querySelectorAll('[role="tabpanel"]');
    expect(tabPanels.length).toBeGreaterThanOrEqual(1);
  });

  it("should set host class based on tabListPosition", async () => {
    tabRef.model = SIMPLE_MODEL;
    tabRef.selectedId = "tab-1";
    await tabRef.updateComplete;

    expect(tabRef.classList.contains("ch-tab--block-start")).toBe(true);
  });

  it("should update host class when tabListPosition changes", async () => {
    tabRef.model = SIMPLE_MODEL;
    tabRef.selectedId = "tab-1";
    tabRef.tabListPosition = "inline-end";
    await tabRef.updateComplete;

    expect(tabRef.classList.contains("ch-tab--inline-end")).toBe(true);
  });

  it("should not render tab buttons when tabButtonHidden is true", async () => {
    tabRef.model = SIMPLE_MODEL;
    tabRef.selectedId = "tab-1";
    tabRef.tabButtonHidden = true;
    await tabRef.updateComplete;

    const tabList = tabRef.shadowRoot!.querySelector('[role="tablist"]');
    expect(tabList).toBeNull();
  });

  it("should render tab-list-start slot when showTabListStart is true", async () => {
    tabRef.model = SIMPLE_MODEL;
    tabRef.selectedId = "tab-1";
    tabRef.showTabListStart = true;
    await tabRef.updateComplete;

    const slot = tabRef.shadowRoot!.querySelector(
      'slot[name="tab-list-start"]'
    );
    expect(slot).toBeTruthy();
  });

  it("should render tab-list-end slot when showTabListEnd is true", async () => {
    tabRef.model = SIMPLE_MODEL;
    tabRef.selectedId = "tab-1";
    tabRef.showTabListEnd = true;
    await tabRef.updateComplete;

    const slot = tabRef.shadowRoot!.querySelector('slot[name="tab-list-end"]');
    expect(slot).toBeTruthy();
  });
});

