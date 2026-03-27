import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChSmartGrid } from "../smart-grid.lit";
import "../smart-grid.lit.js";

describe("[ch-smart-grid][basic]", () => {
  let smartGridRef: ChSmartGrid;

  afterEach(cleanup);

  beforeEach(async () => {
    render(html`<ch-smart-grid></ch-smart-grid>`);
    smartGridRef = document.querySelector("ch-smart-grid")!;
    await smartGridRef.updateComplete;
  });

  it("should have Shadow DOM", () => {
    expect(smartGridRef.shadowRoot).toBeTruthy();
  });

  // Default property values
  it("should have 'accessibleName' default to undefined", () => {
    expect(smartGridRef.accessibleName).toBeUndefined();
  });

  it("should have 'autoGrow' default to false", () => {
    expect(smartGridRef.autoGrow).toBe(false);
  });

  it("should have 'autoScroll' default to 'at-scroll-end'", () => {
    expect(smartGridRef.autoScroll).toBe("at-scroll-end");
  });

  it("should have 'dataProvider' default to false", () => {
    expect(smartGridRef.dataProvider).toBe(false);
  });

  it("should have 'inverseLoading' default to false", () => {
    expect(smartGridRef.inverseLoading).toBe(false);
  });

  it("should have 'itemsCount' default to undefined", () => {
    expect(smartGridRef.itemsCount).toBeUndefined();
  });

  it("should have 'loadingState' default to 'initial'", () => {
    expect(smartGridRef.loadingState).toBe("initial");
  });

  it("should have 'threshold' default to '10px'", () => {
    expect(smartGridRef.threshold).toBe("10px");
  });

  // Default CSS properties
  it("should have 'display' default to 'grid'", () => {
    const computedStyle = getComputedStyle(smartGridRef);
    expect(computedStyle.display).toBe("grid");
  });

  // Slot rendering
  it("should render the initial loading placeholder slot when loadingState is 'initial'", () => {
    const slot = smartGridRef.shadowRoot!.querySelector(
      'slot[name="grid-initial-loading-placeholder"]'
    );
    expect(slot).toBeTruthy();
  });

  it("should not render infinite-scroll in initial state", () => {
    const infiniteScroll =
      smartGridRef.shadowRoot!.querySelector("ch-infinite-scroll");
    expect(infiniteScroll).toBeNull();
  });
});
