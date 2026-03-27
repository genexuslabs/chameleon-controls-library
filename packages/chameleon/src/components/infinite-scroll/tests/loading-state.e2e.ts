import { html } from "lit";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChInfiniteScroll } from "../infinite-scroll.lit";
import "../infinite-scroll.lit.js";

describe("[ch-infinite-scroll][loading-state]", () => {
  let infiniteScrollRef: ChInfiniteScroll;

  afterEach(cleanup);

  describe("loading class", () => {
    it('should apply the "loading" class when loadingState is "loading"', async () => {
      render(
        html`<ch-infinite-scroll loading-state="loading"></ch-infinite-scroll>`
      );
      infiniteScrollRef = document.querySelector("ch-infinite-scroll")!;
      await infiniteScrollRef.updateComplete;

      expect(infiniteScrollRef.classList.contains("loading")).toBe(true);
    });

    it('should not apply the "loading" class when loadingState is "more-data-to-fetch"', async () => {
      render(
        html`<ch-infinite-scroll
          loading-state="more-data-to-fetch"
        ></ch-infinite-scroll>`
      );
      infiniteScrollRef = document.querySelector("ch-infinite-scroll")!;
      await infiniteScrollRef.updateComplete;

      expect(infiniteScrollRef.classList.contains("loading")).toBe(false);
    });

    it('should not apply the "loading" class when loadingState is "all-records-loaded"', async () => {
      render(
        html`<ch-infinite-scroll
          loading-state="all-records-loaded"
        ></ch-infinite-scroll>`
      );
      infiniteScrollRef = document.querySelector("ch-infinite-scroll")!;
      await infiniteScrollRef.updateComplete;

      expect(infiniteScrollRef.classList.contains("loading")).toBe(false);
    });
  });

  describe("slot visibility", () => {
    it('should render a slot when loadingState transitions to "loading"', async () => {
      render(
        html`<ch-infinite-scroll
          loading-state="more-data-to-fetch"
        ></ch-infinite-scroll>`
      );
      infiniteScrollRef = document.querySelector("ch-infinite-scroll")!;
      await infiniteScrollRef.updateComplete;

      // Initially no slot
      expect(infiniteScrollRef.shadowRoot!.querySelector("slot")).toBeNull();

      // Transition to loading
      infiniteScrollRef.loadingState = "loading";
      await infiniteScrollRef.updateComplete;

      expect(infiniteScrollRef.shadowRoot!.querySelector("slot")).toBeTruthy();
    });

    it('should remove the slot when loadingState transitions from "loading" to "more-data-to-fetch"', async () => {
      render(
        html`<ch-infinite-scroll
          loading-state="loading"
        ></ch-infinite-scroll>`
      );
      infiniteScrollRef = document.querySelector("ch-infinite-scroll")!;
      await infiniteScrollRef.updateComplete;

      // Initially has slot
      expect(infiniteScrollRef.shadowRoot!.querySelector("slot")).toBeTruthy();

      // Transition away from loading
      infiniteScrollRef.loadingState = "more-data-to-fetch";
      await infiniteScrollRef.updateComplete;

      expect(infiniteScrollRef.shadowRoot!.querySelector("slot")).toBeNull();
    });

    it('should remove the slot when loadingState transitions from "loading" to "all-records-loaded"', async () => {
      render(
        html`<ch-infinite-scroll
          loading-state="loading"
        ></ch-infinite-scroll>`
      );
      infiniteScrollRef = document.querySelector("ch-infinite-scroll")!;
      await infiniteScrollRef.updateComplete;

      // Initially has slot
      expect(infiniteScrollRef.shadowRoot!.querySelector("slot")).toBeTruthy();

      // Transition to all-records-loaded
      infiniteScrollRef.loadingState = "all-records-loaded";
      await infiniteScrollRef.updateComplete;

      expect(infiniteScrollRef.shadowRoot!.querySelector("slot")).toBeNull();
    });
  });

  describe("loading class transitions", () => {
    it('should add the "loading" class when loadingState changes to "loading"', async () => {
      render(
        html`<ch-infinite-scroll
          loading-state="more-data-to-fetch"
        ></ch-infinite-scroll>`
      );
      infiniteScrollRef = document.querySelector("ch-infinite-scroll")!;
      await infiniteScrollRef.updateComplete;

      expect(infiniteScrollRef.classList.contains("loading")).toBe(false);

      infiniteScrollRef.loadingState = "loading";
      await infiniteScrollRef.updateComplete;

      expect(infiniteScrollRef.classList.contains("loading")).toBe(true);
    });

    it('should remove the "loading" class when loadingState changes from "loading"', async () => {
      render(
        html`<ch-infinite-scroll
          loading-state="loading"
        ></ch-infinite-scroll>`
      );
      infiniteScrollRef = document.querySelector("ch-infinite-scroll")!;
      await infiniteScrollRef.updateComplete;

      expect(infiniteScrollRef.classList.contains("loading")).toBe(true);

      infiniteScrollRef.loadingState = "more-data-to-fetch";
      await infiniteScrollRef.updateComplete;

      expect(infiniteScrollRef.classList.contains("loading")).toBe(false);
    });
  });
});
