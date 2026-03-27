import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChInfiniteScroll } from "../infinite-scroll.lit";
import "../infinite-scroll.lit.js";

describe("[ch-infinite-scroll][basic]", () => {
  let infiniteScrollRef: ChInfiniteScroll;

  afterEach(cleanup);

  describe("shadow DOM", () => {
    beforeEach(async () => {
      render(html`<ch-infinite-scroll></ch-infinite-scroll>`);
      infiniteScrollRef = document.querySelector("ch-infinite-scroll")!;
      await infiniteScrollRef.updateComplete;
    });

    it("should have a shadow root", () => {
      expect(infiniteScrollRef.shadowRoot).toBeTruthy();
    });
  });

  describe("default properties", () => {
    beforeEach(async () => {
      render(html`<ch-infinite-scroll></ch-infinite-scroll>`);
      infiniteScrollRef = document.querySelector("ch-infinite-scroll")!;
      await infiniteScrollRef.updateComplete;
    });

    it('the "autoScroll" property should be "at-scroll-end" by default', () => {
      expect(infiniteScrollRef.autoScroll).toBe("at-scroll-end");
    });

    it('the "dataProvider" property should be false by default', () => {
      expect(infiniteScrollRef.dataProvider).toBe(false);
    });

    it('the "disabled" property should be false by default', () => {
      expect(infiniteScrollRef.disabled).toBe(false);
    });

    it('the "infiniteThresholdReachedCallback" property should be undefined by default', () => {
      expect(infiniteScrollRef.infiniteThresholdReachedCallback).toBeUndefined();
    });

    it('the "loadingState" property should be undefined by default', () => {
      expect(infiniteScrollRef.loadingState).toBeUndefined();
    });

    it('the "position" property should be "bottom" by default', () => {
      expect(infiniteScrollRef.position).toBe("bottom");
    });

    it('the "threshold" property should be "150px" by default', () => {
      expect(infiniteScrollRef.threshold).toBe("150px");
    });
  });

  describe("rendering", () => {
    it("should not render slot content when loadingState is not 'loading'", async () => {
      render(
        html`<ch-infinite-scroll loading-state="more-data-to-fetch">
          <span>Loading...</span>
        </ch-infinite-scroll>`
      );
      infiniteScrollRef = document.querySelector("ch-infinite-scroll")!;
      await infiniteScrollRef.updateComplete;

      const slot = infiniteScrollRef.shadowRoot!.querySelector("slot");
      expect(slot).toBeNull();
    });

    it("should render a default slot when loadingState is 'loading'", async () => {
      render(
        html`<ch-infinite-scroll loading-state="loading">
          <span>Loading...</span>
        </ch-infinite-scroll>`
      );
      infiniteScrollRef = document.querySelector("ch-infinite-scroll")!;
      await infiniteScrollRef.updateComplete;

      const slot = infiniteScrollRef.shadowRoot!.querySelector("slot");
      expect(slot).toBeTruthy();
    });
  });
});
