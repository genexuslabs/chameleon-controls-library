import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChVirtualScroller } from "../virtual-scroller.lit";
import "../virtual-scroller.lit.js";

describe("[ch-virtual-scroller][accessibility]", () => {
  let virtualScrollerRef: ChVirtualScroller;

  afterEach(cleanup);

  beforeEach(async () => {
    render(html`<ch-virtual-scroller></ch-virtual-scroller>`);
    virtualScrollerRef = document.querySelector("ch-virtual-scroller")!;
    await virtualScrollerRef.updateComplete;
  });

  // The virtual scroller is a structural component — it should not have
  // explicit ARIA roles since semantics are handled by the parent ch-smart-grid
  it("should not have an explicit ARIA role", () => {
    expect(virtualScrollerRef.getAttribute("role")).toBeNull();
  });

  it("should not have an aria-label attribute", () => {
    expect(virtualScrollerRef.getAttribute("aria-label")).toBeNull();
  });

  it("should not have an aria-live attribute", () => {
    expect(virtualScrollerRef.getAttribute("aria-live")).toBeNull();
  });

  // CSS-driven visibility: initial load hides content with opacity: 0
  it("should have opacity: 0 when 'waitingForContent' is true (initial state)", () => {
    // The 'ch-virtual-scroller--content-not-loaded' class sets opacity: 0
    expect(
      virtualScrollerRef.classList.contains(
        "ch-virtual-scroller--content-not-loaded"
      )
    ).toBe(true);
  });

  // Pointer events disabled during loading to prevent interaction
  it("should have 'pointer-events: none' CSS class applied when waiting for content", () => {
    // The 'ch-virtual-scroller--content-not-loaded' class also sets pointer-events: none
    // Verifying the class is applied, which enforces the CSS rule
    expect(
      virtualScrollerRef.classList.contains(
        "ch-virtual-scroller--content-not-loaded"
      )
    ).toBe(true);
  });
});
