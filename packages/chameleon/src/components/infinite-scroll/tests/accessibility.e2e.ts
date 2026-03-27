import { html } from "lit";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChInfiniteScroll } from "../infinite-scroll.lit";
import "../infinite-scroll.lit.js";

describe("[ch-infinite-scroll][accessibility]", () => {
  afterEach(cleanup);

  it('should set aria-hidden to "true"', async () => {
    render(html`<ch-infinite-scroll></ch-infinite-scroll>`);
    const infiniteScrollRef =
      document.querySelector<ChInfiniteScroll>("ch-infinite-scroll")!;
    await infiniteScrollRef.updateComplete;

    expect(infiniteScrollRef.ariaHidden).toBe("true");
  });

  it('should maintain aria-hidden as "true" when loadingState is "loading"', async () => {
    render(
      html`<ch-infinite-scroll
        loading-state="loading"
      ></ch-infinite-scroll>`
    );
    const infiniteScrollRef =
      document.querySelector<ChInfiniteScroll>("ch-infinite-scroll")!;
    await infiniteScrollRef.updateComplete;

    expect(infiniteScrollRef.ariaHidden).toBe("true");
  });

  it('should maintain aria-hidden as "true" when loadingState transitions', async () => {
    render(
      html`<ch-infinite-scroll
        loading-state="more-data-to-fetch"
      ></ch-infinite-scroll>`
    );
    const infiniteScrollRef =
      document.querySelector<ChInfiniteScroll>("ch-infinite-scroll")!;
    await infiniteScrollRef.updateComplete;

    expect(infiniteScrollRef.ariaHidden).toBe("true");

    // Transition to loading
    infiniteScrollRef.loadingState = "loading";
    await infiniteScrollRef.updateComplete;

    expect(infiniteScrollRef.ariaHidden).toBe("true");

    // Transition to all-records-loaded
    infiniteScrollRef.loadingState = "all-records-loaded";
    await infiniteScrollRef.updateComplete;

    expect(infiniteScrollRef.ariaHidden).toBe("true");
  });

  it("should not have any interactive role since it is a passive element", async () => {
    render(html`<ch-infinite-scroll></ch-infinite-scroll>`);
    const infiniteScrollRef =
      document.querySelector<ChInfiniteScroll>("ch-infinite-scroll")!;
    await infiniteScrollRef.updateComplete;

    // The component should not expose any interactive ARIA role
    expect(infiniteScrollRef.getAttribute("role")).toBeNull();
  });

  it("should not be focusable since it is hidden from assistive technologies", async () => {
    render(html`<ch-infinite-scroll></ch-infinite-scroll>`);
    const infiniteScrollRef =
      document.querySelector<ChInfiniteScroll>("ch-infinite-scroll")!;
    await infiniteScrollRef.updateComplete;

    // The component should not have a tabindex
    expect(infiniteScrollRef.getAttribute("tabindex")).toBeNull();
  });
});
