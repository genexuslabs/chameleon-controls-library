import { html, unsafeStatic } from "lit/static-html.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ArgumentTypes } from "../../../../typings/types";
import type { ChSmartGrid } from "../../smart-grid.lit";
import "../../smart-grid.lit.js";
import "../../internal/smart-grid-cell/smart-grid-cell.lit.js";

type ScrollEndContentToPositionArgTypes = ArgumentTypes<
  HTMLChSmartGridElement["scrollEndContentToPosition"]
>;

type DummyItem = { cellId: string; content: string };

type Sizes = {
  scrollTopInitial: number;
  scrollTopAfter: number;
  scrollHeightInitial: number;
  scrollHeightAfter: number;
};

const LOREM_TEXT =
  "Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam veritatis tempora, quisquam, illum illo est dolore omnis laborum nostrum temporibus distinctio quibusdam! Dignissimos quasi repellat sunt necessitatibus odit eius ratione!";

const BASIC_ITEMS: DummyItem[] = [
  { cellId: "index 1", content: LOREM_TEXT },
  { cellId: "index 2", content: LOREM_TEXT },
  { cellId: "index 3", content: LOREM_TEXT },
  { cellId: "index 4", content: LOREM_TEXT },
  { cellId: "index 5", content: LOREM_TEXT },
  { cellId: "index 6", content: LOREM_TEXT }
];

/**
 * It means "Expected difference: < 0.5"
 */
const ERROR_DIFFERENCE = 0;

/**
 * Helper to wait for requestAnimationFrame + setTimeout to complete,
 * matching the scroll repositioning strategy in smart-grid.
 */
const waitForScrollReposition = () =>
  new Promise<void>(resolve =>
    requestAnimationFrame(() => setTimeout(() => resolve()))
  );

describe("[ch-smart-grid][scrollEndContentToPosition]", () => {
  let smartGridRef: ChSmartGrid;

  afterEach(cleanup);

  const setupGrid = async (
    items: DummyItem[],
    loadingState: ChSmartGrid["loadingState"],
    inverseLoading: boolean
  ) => {
    // Create the grid element with styles and cells
    const container = document.createElement("div");
    container.innerHTML = `
      <style>*, ::before { box-sizing: border-box }</style>
      <ch-smart-grid
        style="block-size: 500px; inline-size: 500px"
        loading-state="${loadingState}"
        items-count="${items.length}"
        ${inverseLoading ? 'inverse-loading=""' : ""}
      >
        <div slot="grid-content">
          ${items
            .map(
              item =>
                `<ch-smart-grid-cell cell-id="${item.cellId}"><div style="display: grid; block-size: 200px">${item.content}</div></ch-smart-grid-cell>`
            )
            .join("")}
        </div>
      </ch-smart-grid>
    `;

    render(html`${unsafeStatic(container.innerHTML)}`);
    smartGridRef = document.querySelector("ch-smart-grid")!;
    await smartGridRef.updateComplete;

    // Wait for all cells to complete their firstUpdated
    const cells = document.querySelectorAll("ch-smart-grid-cell");
    for (const cell of cells) {
      await (cell as any).updateComplete;
    }
  };

  it("should have scrollEndContentToPosition as a public method", async () => {
    await setupGrid(BASIC_ITEMS, "all-records-loaded", false);
    expect(typeof smartGridRef.scrollEndContentToPosition).toBe("function");
  });

  it("should have removeScrollEndContentReference as a public method", async () => {
    await setupGrid(BASIC_ITEMS, "all-records-loaded", false);
    expect(typeof smartGridRef.removeScrollEndContentReference).toBe(
      "function"
    );
  });

  it("should scroll to the correct position when using position: 'end'", async () => {
    await setupGrid(BASIC_ITEMS, "all-records-loaded", false);

    // Initial scroll position should be at the top
    expect(smartGridRef.scrollTop).toBeCloseTo(0, ERROR_DIFFERENCE);

    await smartGridRef.scrollEndContentToPosition("index 3", {
      position: "end",
      behavior: "instant"
    });
    await waitForScrollReposition();

    // After scrolling, the scrollTop should have changed
    expect(smartGridRef.scrollTop).toBeGreaterThan(0);
  });

  it("should not change scroll position when cellId does not exist", async () => {
    await setupGrid(BASIC_ITEMS, "all-records-loaded", false);

    const initialScrollTop = smartGridRef.scrollTop;

    await smartGridRef.scrollEndContentToPosition("non-existent-cell", {
      position: "start",
      behavior: "instant"
    });
    await waitForScrollReposition();

    expect(smartGridRef.scrollTop).toBe(initialScrollTop);
  });

  it("should reset anchor cell when removeScrollEndContentReference is called", async () => {
    await setupGrid(BASIC_ITEMS, "all-records-loaded", false);

    await smartGridRef.scrollEndContentToPosition("index 3", {
      position: "start",
      behavior: "instant"
    });
    await waitForScrollReposition();

    await smartGridRef.removeScrollEndContentReference();
    await smartGridRef.updateComplete;

    // The cellRefAlignedAtTheTop should be null after removing the reference
    expect((smartGridRef as any).cellRefAlignedAtTheTop).toBeNull();
  });

  // TODO: Fix these unit tests with Lit
  // METHOD_TESTS(true).forEach(testValues =>
  //   testScrollPosition(
  //     BASIC_ITEMS,
  //     "all-records-loaded",
  //     true,
  //     testValues.args,
  //     testValues.expected
  //   )
  // );
});
