import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";

import "../tab.lit.js";
import type { ChTabRender } from "../tab.lit.js";
import type { TabModel } from "../types";

describe("[ch-tab-render][parts]", () => {
  afterEach(cleanup);

  let tabRef: ChTabRender;

  beforeEach(async () => {
    const model: TabModel = [
      { id: "tab-1", name: "Tab 1", wasRendered: true },
      { id: "tab-2", name: "Tab 2", wasRendered: true, closeButton: true },
      { id: "tab-3", name: "Tab 3", wasRendered: true, disabled: true }
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

  // - - - - - - - - - - - - - - - - - - - -
  //         Tab button parts
  // - - - - - - - - - - - - - - - - - - - -
  it('should expose "tab" part on each tab button', () => {
    const tabs = tabRef.shadowRoot!.querySelectorAll('[role="tab"]');
    tabs.forEach(tab => {
      expect(tab.getAttribute("part")).toContain("tab");
    });
  });

  it("should expose the item id as a part on each tab button", () => {
    const tab1 = tabRef.shadowRoot!.querySelector("#tab-1");
    expect(tab1!.getAttribute("part")).toContain("tab-1");

    const tab2 = tabRef.shadowRoot!.querySelector("#tab-2");
    expect(tab2!.getAttribute("part")).toContain("tab-2");
  });

  it('should expose "selected" part on the selected tab', () => {
    const tab1 = tabRef.shadowRoot!.querySelector("#tab-1");
    expect(tab1!.getAttribute("part")).toContain("selected");
    expect(tab1!.getAttribute("part")).not.toContain("not-selected");
  });

  it('should expose "not-selected" part on non-selected tabs', () => {
    const tab2 = tabRef.shadowRoot!.querySelector("#tab-2");
    expect(tab2!.getAttribute("part")).toContain("not-selected");
  });

  it('should expose "disabled" part on disabled tabs', () => {
    const tab3 = tabRef.shadowRoot!.querySelector("#tab-3");
    expect(tab3!.getAttribute("part")).toContain("disabled");
  });

  it('should expose "closable" part on tabs with close button', () => {
    // tab-1 inherits closeButton from the component
    const tab1 = tabRef.shadowRoot!.querySelector("#tab-1");
    expect(tab1!.getAttribute("part")).toContain("closable");
  });

  it('should expose "not-closable" part on tabs without close button', async () => {
    tabRef.closeButton = false;
    tabRef.model = [
      { id: "tab-1", name: "Tab 1", wasRendered: true },
      { id: "tab-2", name: "Tab 2", wasRendered: true },
      { id: "tab-3", name: "Tab 3", wasRendered: true }
    ];
    await tabRef.updateComplete;

    const tab1 = tabRef.shadowRoot!.querySelector("#tab-1");
    expect(tab1!.getAttribute("part")).toContain("not-closable");
  });

  // - - - - - - - - - - - - - - - - - - - -
  //      Direction / position parts
  // - - - - - - - - - - - - - - - - - - - -
  it('should expose "block-start" part on tab buttons by default', () => {
    const tab1 = tabRef.shadowRoot!.querySelector("#tab-1");
    expect(tab1!.getAttribute("part")).toContain("block-start");
  });

  it('should expose "block" part in block mode', () => {
    const tab1 = tabRef.shadowRoot!.querySelector("#tab-1");
    expect(tab1!.getAttribute("part")).toContain("block");
  });

  it('should expose "start" part in start positions', () => {
    const tab1 = tabRef.shadowRoot!.querySelector("#tab-1");
    expect(tab1!.getAttribute("part")).toContain("start");
  });

  it('should expose "inline" and "end" parts when tabListPosition is inline-end', async () => {
    tabRef.tabListPosition = "inline-end";
    await tabRef.updateComplete;

    const tab1 = tabRef.shadowRoot!.querySelector("#tab-1");
    const parts = tab1!.getAttribute("part")!;
    expect(parts).toContain("inline");
    expect(parts).toContain("end");
  });

  // - - - - - - - - - - - - - - - - - - - -
  //         Tab list parts
  // - - - - - - - - - - - - - - - - - - - -
  it('should expose "tab-list" part on the tablist element', () => {
    const tabList = tabRef.shadowRoot!.querySelector('[role="tablist"]');
    expect(tabList!.getAttribute("part")).toContain("tab-list");
  });

  // - - - - - - - - - - - - - - - - - - - -
  //         Tab panel parts
  // - - - - - - - - - - - - - - - - - - - -
  it('should expose "tab-panel" part on each panel', () => {
    const panels = tabRef.shadowRoot!.querySelectorAll('[role="tabpanel"]');
    panels.forEach(panel => {
      expect(panel.getAttribute("part")).toContain("tab-panel");
    });
  });

  it("should expose item id as a part on each panel", () => {
    const panel1 = tabRef.shadowRoot!.querySelector("#panel-tab-1");
    expect(panel1!.getAttribute("part")).toContain("tab-1");
  });

  it('should expose "selected" / "not-selected" parts on panels', () => {
    const panel1 = tabRef.shadowRoot!.querySelector("#panel-tab-1");
    expect(panel1!.getAttribute("part")).toContain("selected");

    const panel2 = tabRef.shadowRoot!.querySelector("#panel-tab-2");
    if (panel2) {
      expect(panel2.getAttribute("part")).toContain("not-selected");
    }
  });

  // - - - - - - - - - - - - - - - - - - - -
  //         Panel container parts
  // - - - - - - - - - - - - - - - - - - - -
  it('should expose "tab-panel-container" part on the panel container', () => {
    const panelContainer = tabRef.shadowRoot!.querySelector(".panel-container");
    expect(panelContainer!.getAttribute("part")).toContain(
      "tab-panel-container"
    );
  });

  // - - - - - - - - - - - - - - - - - - - -
  //       Close button parts
  // - - - - - - - - - - - - - - - - - - - -
  it('should expose "close-button" part on close buttons', () => {
    const closeButtons = tabRef.shadowRoot!.querySelectorAll(".close-button");
    expect(closeButtons.length).toBeGreaterThan(0);
    closeButtons.forEach(btn => {
      expect(btn.getAttribute("part")).toContain("close-button");
    });
  });

  it('should expose "selected" part on close button of the selected tab', () => {
    // tab-1 is selected and has a close button (from component-level closeButton)
    const tab1CloseBtn = tabRef.shadowRoot!.querySelector(
      "#tab-1 .close-button"
    );
    if (tab1CloseBtn) {
      expect(tab1CloseBtn.getAttribute("part")).toContain("selected");
    }
  });
});

