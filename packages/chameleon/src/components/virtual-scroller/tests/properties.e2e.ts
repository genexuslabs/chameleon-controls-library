import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChVirtualScroller } from "../virtual-scroller.lit";
import "../virtual-scroller.lit.js";

describe("[ch-virtual-scroller][properties]", () => {
  let virtualScrollerRef: ChVirtualScroller;

  afterEach(cleanup);

  beforeEach(async () => {
    render(html`<ch-virtual-scroller></ch-virtual-scroller>`);
    virtualScrollerRef = document.querySelector("ch-virtual-scroller")!;
    await virtualScrollerRef.updateComplete;
  });

  it("should accept 'bufferAmount' as a number property", async () => {
    (virtualScrollerRef as any).bufferAmount = 10;
    await virtualScrollerRef.updateComplete;
    expect(virtualScrollerRef.bufferAmount).toBe(10);
  });

  it("should accept 'initialRenderViewportItems' as a number property", async () => {
    (virtualScrollerRef as any).initialRenderViewportItems = 20;
    await virtualScrollerRef.updateComplete;
    expect(virtualScrollerRef.initialRenderViewportItems).toBe(20);
  });

  it("should accept 'inverseLoading' as a boolean property", async () => {
    (virtualScrollerRef as any).inverseLoading = true;
    await virtualScrollerRef.updateComplete;
    expect(virtualScrollerRef.inverseLoading).toBe(true);
  });

  it("should accept 'mode' as a string property with value 'lazy-render'", async () => {
    (virtualScrollerRef as any).mode = "lazy-render";
    await virtualScrollerRef.updateComplete;
    expect(virtualScrollerRef.mode).toBe("lazy-render");
  });

  it("should accept 'mode' as a string property with value 'virtual-scroll'", async () => {
    (virtualScrollerRef as any).mode = "lazy-render";
    await virtualScrollerRef.updateComplete;
    (virtualScrollerRef as any).mode = "virtual-scroll";
    await virtualScrollerRef.updateComplete;
    expect(virtualScrollerRef.mode).toBe("virtual-scroll");
  });

  it("should accept 'itemsCount' as a number property", async () => {
    (virtualScrollerRef as any).itemsCount = 50;
    await virtualScrollerRef.updateComplete;
    expect(virtualScrollerRef.itemsCount).toBe(50);
  });

  // Attribute reflection
  it("should reflect 'buffer-amount' attribute to 'bufferAmount' property", async () => {
    virtualScrollerRef.setAttribute("buffer-amount", "15");
    await virtualScrollerRef.updateComplete;
    expect(virtualScrollerRef.bufferAmount).toBe(15);
  });

  it("should reflect 'initial-render-viewport-items' attribute", async () => {
    virtualScrollerRef.setAttribute("initial-render-viewport-items", "25");
    await virtualScrollerRef.updateComplete;
    expect(virtualScrollerRef.initialRenderViewportItems).toBe(25);
  });

  it("should reflect 'inverse-loading' boolean attribute", async () => {
    virtualScrollerRef.setAttribute("inverse-loading", "");
    await virtualScrollerRef.updateComplete;
    expect(virtualScrollerRef.inverseLoading).toBe(true);
  });

  it("should reflect 'mode' attribute", async () => {
    virtualScrollerRef.setAttribute("mode", "lazy-render");
    await virtualScrollerRef.updateComplete;
    expect(virtualScrollerRef.mode).toBe("lazy-render");
  });

  // Public method existence
  it("should expose 'addItems' as a public method", () => {
    expect(typeof virtualScrollerRef.addItems).toBe("function");
  });
});
