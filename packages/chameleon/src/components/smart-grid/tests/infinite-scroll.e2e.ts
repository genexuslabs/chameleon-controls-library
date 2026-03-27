import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChSmartGrid } from "../smart-grid.lit";
import "../smart-grid.lit.js";
// Ensure ch-infinite-scroll is defined
import "../../infinite-scroll/infinite-scroll.lit.js";

import type { SmartGridDataState } from "../../infinite-scroll/types";

const LOADING_STATE_VALUES: SmartGridDataState[] = [
  "loading",
  "more-data-to-fetch",
  "all-records-loaded"
];

const POSITIVE_ITEM_COUNT_VALUES = [1, 10];
const NON_POSITIVE_ITEM_COUNT_VALUES = [0, -1, -10];

describe("[ch-smart-grid][infinite scroll]", () => {
  let smartGridRef: ChSmartGrid;

  afterEach(cleanup);

  beforeEach(async () => {
    render(
      html`<ch-smart-grid
        ><div slot="grid-content"></div
      ></ch-smart-grid>`
    );
    smartGridRef = document.querySelector("ch-smart-grid")!;
    await smartGridRef.updateComplete;
  });

  it("should only render the initial loading placeholder slot by default", () => {
    const slot = smartGridRef.shadowRoot!.querySelector(
      'slot[name="grid-initial-loading-placeholder"]'
    );
    expect(slot).toBeTruthy();

    const infiniteScroll =
      smartGridRef.shadowRoot!.querySelector("ch-infinite-scroll");
    expect(infiniteScroll).toBeNull();
  });

  // When loadingState is "initial", only the initial loading placeholder should be shown
  // regardless of other property values
  for (const itemsCount of [0, 1, 10]) {
    for (const dataProvider of [false, true]) {
      for (const inverseLoading of [false, true]) {
        it(`[itemsCount=${itemsCount}][dataProvider=${dataProvider}][inverseLoading=${inverseLoading}] should only render initial loading placeholder when loadingState is "initial"`, async () => {
          smartGridRef.itemsCount = itemsCount;
          smartGridRef.dataProvider = dataProvider;
          smartGridRef.inverseLoading = inverseLoading;
          await smartGridRef.updateComplete;

          const slot = smartGridRef.shadowRoot!.querySelector(
            'slot[name="grid-initial-loading-placeholder"]'
          );
          expect(slot).toBeTruthy();

          const contentSlot = smartGridRef.shadowRoot!.querySelector(
            'slot[name="grid-content"]'
          );
          expect(contentSlot).toBeNull();
        });
      }
    }
  }

  // When there are no records and loadingState !== "initial", should render empty slot
  for (const itemsCount of NON_POSITIVE_ITEM_COUNT_VALUES) {
    for (const loadingState of LOADING_STATE_VALUES) {
      for (const dataProvider of [false, true]) {
        for (const inverseLoading of [false, true]) {
          it(`[itemsCount=${itemsCount}][loadingState="${loadingState}"][dataProvider=${dataProvider}][inverseLoading=${inverseLoading}] should render grid-content-empty slot when no records`, async () => {
            smartGridRef.itemsCount = itemsCount;
            smartGridRef.loadingState = loadingState;
            smartGridRef.dataProvider = dataProvider;
            smartGridRef.inverseLoading = inverseLoading;
            await smartGridRef.updateComplete;

            const emptySlot = smartGridRef.shadowRoot!.querySelector(
              'slot[name="grid-content-empty"]'
            );
            expect(emptySlot).toBeTruthy();
          });
        }
      }
    }
  }

  // When there are records and no dataProvider/inverseLoading, only render the content slot
  for (const itemsCount of POSITIVE_ITEM_COUNT_VALUES) {
    for (const loadingState of LOADING_STATE_VALUES) {
      it(`[itemsCount=${itemsCount}][loadingState="${loadingState}"] should render only grid-content slot when no dataProvider and no inverseLoading`, async () => {
        smartGridRef.itemsCount = itemsCount;
        smartGridRef.loadingState = loadingState;
        smartGridRef.dataProvider = false;
        smartGridRef.inverseLoading = false;
        await smartGridRef.updateComplete;

        const contentSlot = smartGridRef.shadowRoot!.querySelector(
          'slot[name="grid-content"]'
        );
        expect(contentSlot).toBeTruthy();

        const infiniteScroll =
          smartGridRef.shadowRoot!.querySelector("ch-infinite-scroll");
        expect(infiniteScroll).toBeNull();
      });
    }
  }

  // When inverseLoading is true and there are records, ch-infinite-scroll should be at the top
  for (const itemsCount of POSITIVE_ITEM_COUNT_VALUES) {
    for (const loadingState of LOADING_STATE_VALUES) {
      for (const dataProvider of [false, true]) {
        it(`[itemsCount=${itemsCount}][loadingState="${loadingState}"][dataProvider=${dataProvider}] should render ch-infinite-scroll before content slot when inverseLoading`, async () => {
          smartGridRef.itemsCount = itemsCount;
          smartGridRef.loadingState = loadingState;
          smartGridRef.dataProvider = dataProvider;
          smartGridRef.inverseLoading = true;
          await smartGridRef.updateComplete;

          const infiniteScroll =
            smartGridRef.shadowRoot!.querySelector("ch-infinite-scroll");
          expect(infiniteScroll).toBeTruthy();

          const contentSlot = smartGridRef.shadowRoot!.querySelector(
            'slot[name="grid-content"]'
          );
          expect(contentSlot).toBeTruthy();

          // Verify ch-infinite-scroll comes before the content slot in DOM order
          const children = Array.from(smartGridRef.shadowRoot!.children);
          const infiniteScrollIndex = children.indexOf(infiniteScroll!);
          const contentSlotIndex = children.indexOf(contentSlot!);
          expect(infiniteScrollIndex).toBeLessThan(contentSlotIndex);
        });
      }
    }
  }

  // When dataProvider is true, inverseLoading is false, and there are records,
  // ch-infinite-scroll should be at the bottom
  for (const itemsCount of POSITIVE_ITEM_COUNT_VALUES) {
    for (const loadingState of LOADING_STATE_VALUES) {
      it(`[itemsCount=${itemsCount}][loadingState="${loadingState}"] should render ch-infinite-scroll after content slot when dataProvider and no inverseLoading`, async () => {
        smartGridRef.itemsCount = itemsCount;
        smartGridRef.loadingState = loadingState;
        smartGridRef.dataProvider = true;
        smartGridRef.inverseLoading = false;
        await smartGridRef.updateComplete;

        const infiniteScroll =
          smartGridRef.shadowRoot!.querySelector("ch-infinite-scroll");
        expect(infiniteScroll).toBeTruthy();

        const contentSlot = smartGridRef.shadowRoot!.querySelector(
          'slot[name="grid-content"]'
        );
        expect(contentSlot).toBeTruthy();

        // Verify content slot comes before ch-infinite-scroll in DOM order
        const children = Array.from(smartGridRef.shadowRoot!.children);
        const infiniteScrollIndex = children.indexOf(infiniteScroll!);
        const contentSlotIndex = children.indexOf(contentSlot!);
        expect(contentSlotIndex).toBeLessThan(infiniteScrollIndex);
      });
    }
  }

  // Check dataProvider property binding on ch-infinite-scroll
  for (const itemsCount of POSITIVE_ITEM_COUNT_VALUES) {
    for (const loadingState of LOADING_STATE_VALUES) {
      for (const dataProvider of [false, true]) {
        for (const inverseLoading of [false, true]) {
          // Only run when ch-infinite-scroll is rendered
          if (dataProvider || inverseLoading) {
            it(`[itemsCount=${itemsCount}][loadingState="${loadingState}"][dataProvider=${dataProvider}][inverseLoading=${inverseLoading}] should properly bind the dataProvider property in ch-infinite-scroll`, async () => {
              smartGridRef.itemsCount = itemsCount;
              smartGridRef.loadingState = loadingState;
              smartGridRef.dataProvider = dataProvider;
              smartGridRef.inverseLoading = inverseLoading;
              await smartGridRef.updateComplete;

              const infiniteScroll =
                smartGridRef.shadowRoot!.querySelector("ch-infinite-scroll");
              expect(infiniteScroll).toBeTruthy();
              expect((infiniteScroll as any).dataProvider).toBe(
                // When inverseLoading, the dataProvider binding passes the actual value;
                // when only dataProvider (bottom position), it's always true
                inverseLoading ? dataProvider : true
              );
            });
          }
        }
      }
    }
  }

  // TODO: Add more unit tests to check more property binding combinations
});
