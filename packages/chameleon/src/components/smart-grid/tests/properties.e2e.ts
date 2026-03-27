import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChSmartGrid } from "../smart-grid.lit";
import "../smart-grid.lit.js";

describe("[ch-smart-grid][properties]", () => {
  let smartGridRef: ChSmartGrid;

  afterEach(cleanup);

  beforeEach(async () => {
    render(html`<ch-smart-grid></ch-smart-grid>`);
    smartGridRef = document.querySelector("ch-smart-grid")!;
    await smartGridRef.updateComplete;
  });

  // autoGrow controls the SCROLLABLE_CLASS
  it("should apply 'ch-scrollable' class when autoGrow is false", () => {
    expect(smartGridRef.classList.contains("ch-scrollable")).toBe(true);
  });

  it("should not have 'ch-scrollable' class when autoGrow is true", async () => {
    smartGridRef.autoGrow = true;
    await smartGridRef.updateComplete;

    expect(smartGridRef.classList.contains("ch-scrollable")).toBe(false);
  });

  // inverseLoading class
  it("should apply 'ch-smart-grid--inverse-loading' class when inverseLoading is true and has records", async () => {
    smartGridRef.inverseLoading = true;
    smartGridRef.itemsCount = 5;
    smartGridRef.loadingState = "more-data-to-fetch";
    await smartGridRef.updateComplete;

    expect(
      smartGridRef.classList.contains("ch-smart-grid--inverse-loading")
    ).toBe(true);
  });

  it("should not apply 'ch-smart-grid--inverse-loading' class when there are no records", async () => {
    smartGridRef.inverseLoading = true;
    smartGridRef.itemsCount = 0;
    smartGridRef.loadingState = "more-data-to-fetch";
    await smartGridRef.updateComplete;

    expect(
      smartGridRef.classList.contains("ch-smart-grid--inverse-loading")
    ).toBe(false);
  });

  // dataProvider class
  it("should apply 'ch-smart-grid--data-provider' class when dataProvider is true, has records, and no inverseLoading", async () => {
    smartGridRef.dataProvider = true;
    smartGridRef.itemsCount = 5;
    smartGridRef.inverseLoading = false;
    smartGridRef.loadingState = "more-data-to-fetch";
    await smartGridRef.updateComplete;

    expect(
      smartGridRef.classList.contains("ch-smart-grid--data-provider")
    ).toBe(true);
  });

  it("should not apply 'ch-smart-grid--data-provider' class when inverseLoading is true", async () => {
    smartGridRef.dataProvider = true;
    smartGridRef.itemsCount = 5;
    smartGridRef.inverseLoading = true;
    smartGridRef.loadingState = "more-data-to-fetch";
    await smartGridRef.updateComplete;

    expect(
      smartGridRef.classList.contains("ch-smart-grid--data-provider")
    ).toBe(false);
  });

  // loadingState changes
  it("should switch from initial loading placeholder to content slot when loadingState changes", async () => {
    // Initially in "initial" state
    let initialSlot = smartGridRef.shadowRoot!.querySelector(
      'slot[name="grid-initial-loading-placeholder"]'
    );
    expect(initialSlot).toBeTruthy();

    // Change to loaded state with items
    smartGridRef.loadingState = "more-data-to-fetch";
    smartGridRef.itemsCount = 5;
    await smartGridRef.updateComplete;

    initialSlot = smartGridRef.shadowRoot!.querySelector(
      'slot[name="grid-initial-loading-placeholder"]'
    );
    expect(initialSlot).toBeNull();

    const contentSlot = smartGridRef.shadowRoot!.querySelector(
      'slot[name="grid-content"]'
    );
    expect(contentSlot).toBeTruthy();
  });

  it("should render grid-content-empty slot when loadingState is not initial and itemsCount is 0", async () => {
    smartGridRef.loadingState = "more-data-to-fetch";
    smartGridRef.itemsCount = 0;
    await smartGridRef.updateComplete;

    const emptySlot = smartGridRef.shadowRoot!.querySelector(
      'slot[name="grid-content-empty"]'
    );
    expect(emptySlot).toBeTruthy();
  });

  // threshold property
  it("should pass threshold to ch-infinite-scroll when rendered", async () => {
    smartGridRef.loadingState = "more-data-to-fetch";
    smartGridRef.itemsCount = 5;
    smartGridRef.dataProvider = true;
    smartGridRef.threshold = "20%";
    await smartGridRef.updateComplete;

    const infiniteScroll =
      smartGridRef.shadowRoot!.querySelector("ch-infinite-scroll");
    expect(infiniteScroll).toBeTruthy();
    expect((infiniteScroll as any).threshold).toBe("20%");
  });
});
