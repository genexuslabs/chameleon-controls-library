import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChVirtualScroller } from "../virtual-scroller.lit";
import "../virtual-scroller.lit.js";

describe("[ch-virtual-scroller][basic]", () => {
  let virtualScrollerRef: ChVirtualScroller;

  afterEach(cleanup);

  beforeEach(async () => {
    render(html`<ch-virtual-scroller></ch-virtual-scroller>`);
    virtualScrollerRef = document.querySelector("ch-virtual-scroller")!;
    await virtualScrollerRef.updateComplete;
  });

  it("should have Shadow DOM", () => {
    expect(virtualScrollerRef.shadowRoot).toBeTruthy();
  });

  it("should render a default slot", () => {
    const slot =
      virtualScrollerRef.shadowRoot!.querySelector("slot:not([name])");
    expect(slot).toBeTruthy();
  });

  // Default property values
  it("should have 'bufferAmount' default to 5", () => {
    expect(virtualScrollerRef.bufferAmount).toBe(5);
  });

  it("should have 'initialRenderViewportItems' default to 10", () => {
    expect(virtualScrollerRef.initialRenderViewportItems).toBe(10);
  });

  it("should have 'inverseLoading' default to false", () => {
    expect(virtualScrollerRef.inverseLoading).toBe(false);
  });

  it("should have 'items' default to undefined", () => {
    expect(virtualScrollerRef.items).toBeUndefined();
  });

  it("should have 'mode' default to 'virtual-scroll'", () => {
    expect(virtualScrollerRef.mode).toBe("virtual-scroll");
  });

  // Slot rendering with children
  it("should project slotted children", async () => {
    cleanup();
    render(
      html`<ch-virtual-scroller>
        <div class="test-child">Item 1</div>
        <div class="test-child">Item 2</div>
      </ch-virtual-scroller>`
    );
    virtualScrollerRef = document.querySelector("ch-virtual-scroller")!;
    await virtualScrollerRef.updateComplete;

    const children = virtualScrollerRef.querySelectorAll(".test-child");
    expect(children.length).toBe(2);
  });

  // Initial CSS state
  it("should have 'waitingForContent' default to true", () => {
    expect(virtualScrollerRef.waitingForContent).toBe(true);
  });

  it("should apply the 'ch-virtual-scroller--content-not-loaded' class initially", () => {
    expect(
      virtualScrollerRef.classList.contains(
        "ch-virtual-scroller--content-not-loaded"
      )
    ).toBe(true);
  });

  it("should not apply the 'ch-virtual-scroller--content-loaded' class initially", () => {
    expect(
      virtualScrollerRef.classList.contains(
        "ch-virtual-scroller--content-loaded"
      )
    ).toBe(false);
  });

  it("should not apply the 'ch-virtual-scroller--virtual-scroll' class initially", () => {
    expect(
      virtualScrollerRef.classList.contains(
        "ch-virtual-scroller--virtual-scroll"
      )
    ).toBe(false);
  });
});
