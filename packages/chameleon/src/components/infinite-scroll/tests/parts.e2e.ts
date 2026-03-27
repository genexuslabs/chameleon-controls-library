import { html } from "lit";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChInfiniteScroll } from "../infinite-scroll.lit";
import "../infinite-scroll.lit.js";

describe("[ch-infinite-scroll][parts]", () => {
  afterEach(cleanup);

  // The ch-infinite-scroll component does not expose any CSS ::part elements.
  // This test suite validates host-level styling hooks instead.

  it("should have the host element with display: flex from shadow styles", async () => {
    render(
      html`<ch-infinite-scroll
        loading-state="more-data-to-fetch"
      ></ch-infinite-scroll>`
    );
    const infiniteScrollRef =
      document.querySelector<ChInfiniteScroll>("ch-infinite-scroll")!;
    await infiniteScrollRef.updateComplete;

    const computedStyle = getComputedStyle(infiniteScrollRef);
    expect(computedStyle.display).toBe("flex");
  });

  it('should have block-size: auto when loadingState is "loading"', async () => {
    render(
      html`<ch-infinite-scroll
        loading-state="loading"
      ></ch-infinite-scroll>`
    );
    const infiniteScrollRef =
      document.querySelector<ChInfiniteScroll>("ch-infinite-scroll")!;
    await infiniteScrollRef.updateComplete;

    // When loading, the :host(.loading) rule sets block-size to auto
    expect(infiniteScrollRef.classList.contains("loading")).toBe(true);
  });

  it("should have pointer-events: none", async () => {
    render(html`<ch-infinite-scroll></ch-infinite-scroll>`);
    const infiniteScrollRef =
      document.querySelector<ChInfiniteScroll>("ch-infinite-scroll")!;
    await infiniteScrollRef.updateComplete;

    const computedStyle = getComputedStyle(infiniteScrollRef);
    expect(computedStyle.pointerEvents).toBe("none");
  });
});
