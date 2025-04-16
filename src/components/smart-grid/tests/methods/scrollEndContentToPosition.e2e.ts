import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { ArgumentTypes } from "../../../../common/types";

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

const LOREM = `<div style="display: grid; block-size: 200px">Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam veritatis tempora, quisquam, illum illo est dolore omnis laborum nostrum temporibus distinctio quibusdam! Dignissimos quasi repellat sunt necessitatibus odit eius ratione!</div>`;

const BASIC_ITEMS: DummyItem[] = [
  { cellId: "index 1", content: LOREM },
  { cellId: "index 2", content: LOREM },
  { cellId: "index 3", content: LOREM },
  { cellId: "index 4", content: LOREM },
  { cellId: "index 5", content: LOREM },
  { cellId: "index 6", content: LOREM }
];

const INITIAL_SCROLL_TOP_NO_INVERSE_LOADING = 0;
const INITIAL_SCROLL_TOP_INVERSE_LOADING = 902;

const METHOD_TESTS: (inverseLoading: boolean) => {
  args: ScrollEndContentToPositionArgTypes;
  expected: Sizes;
}[] = inverseLoading => [
  {
    args: ["index 1", { position: "start", behavior: "instant" }],
    expected: {
      scrollTopInitial: inverseLoading
        ? INITIAL_SCROLL_TOP_INVERSE_LOADING
        : INITIAL_SCROLL_TOP_NO_INVERSE_LOADING,
      scrollHeightInitial: 1398,
      scrollTopAfter: 0,
      scrollHeightAfter: 1398
    }
  },
  {
    args: ["index 1", { position: "end", behavior: "instant" }],
    expected: {
      scrollTopInitial: inverseLoading
        ? INITIAL_SCROLL_TOP_INVERSE_LOADING
        : INITIAL_SCROLL_TOP_NO_INVERSE_LOADING,
      scrollHeightInitial: 1398,
      scrollTopAfter: 0,
      scrollHeightAfter: 1398
    }
  },
  {
    args: ["index 2", { position: "start", behavior: "instant" }],
    expected: {
      scrollTopInitial: inverseLoading
        ? INITIAL_SCROLL_TOP_INVERSE_LOADING
        : INITIAL_SCROLL_TOP_NO_INVERSE_LOADING,
      scrollHeightInitial: 1398,
      scrollTopAfter: 236,
      scrollHeightAfter: 1398
    }
  },
  {
    args: ["index 2", { position: "end", behavior: "instant" }],
    expected: {
      scrollTopInitial: inverseLoading
        ? INITIAL_SCROLL_TOP_INVERSE_LOADING
        : INITIAL_SCROLL_TOP_NO_INVERSE_LOADING,
      scrollHeightInitial: 1398,
      scrollTopAfter: 236,
      scrollHeightAfter: 1398
    }
  },
  {
    args: ["index 3", { position: "start", behavior: "instant" }],
    expected: {
      scrollTopInitial: inverseLoading
        ? INITIAL_SCROLL_TOP_INVERSE_LOADING
        : INITIAL_SCROLL_TOP_NO_INVERSE_LOADING,
      scrollHeightInitial: 1398,
      scrollTopAfter: 472,
      scrollHeightAfter: 1398
    }
  },
  {
    args: ["index 3", { position: "end", behavior: "instant" }],
    expected: {
      scrollTopInitial: inverseLoading
        ? INITIAL_SCROLL_TOP_INVERSE_LOADING
        : INITIAL_SCROLL_TOP_NO_INVERSE_LOADING,
      scrollHeightInitial: 1398,
      scrollTopAfter: 472,
      scrollHeightAfter: 1398
    }
  },
  {
    args: ["index 4", { position: "start", behavior: "instant" }],
    expected: {
      scrollTopInitial: inverseLoading
        ? INITIAL_SCROLL_TOP_INVERSE_LOADING
        : INITIAL_SCROLL_TOP_NO_INVERSE_LOADING,
      scrollHeightInitial: 1398,
      scrollTopAfter: 708,
      scrollHeightAfter: 1398
    }
  },
  {
    args: ["index 4", { position: "end", behavior: "instant" }],
    expected: {
      scrollTopInitial: inverseLoading
        ? INITIAL_SCROLL_TOP_INVERSE_LOADING
        : INITIAL_SCROLL_TOP_NO_INVERSE_LOADING,
      scrollHeightInitial: 1398,
      scrollTopAfter: 708,
      scrollHeightAfter: 1398
    }
  },
  {
    args: ["index 5", { position: "start", behavior: "instant" }],
    expected: {
      scrollTopInitial: inverseLoading
        ? INITIAL_SCROLL_TOP_INVERSE_LOADING
        : INITIAL_SCROLL_TOP_NO_INVERSE_LOADING,
      scrollHeightInitial: 1398,
      scrollTopAfter: 944,
      scrollHeightAfter: 1447
    }
  },
  {
    args: ["index 5", { position: "end", behavior: "instant" }],
    expected: {
      scrollTopInitial: inverseLoading
        ? INITIAL_SCROLL_TOP_INVERSE_LOADING
        : INITIAL_SCROLL_TOP_NO_INVERSE_LOADING,
      scrollHeightInitial: 1398,
      scrollTopAfter: 898,
      scrollHeightAfter: 1398
    }
  },
  {
    args: ["index 6", { position: "start", behavior: "instant" }],
    expected: {
      scrollTopInitial: inverseLoading
        ? INITIAL_SCROLL_TOP_INVERSE_LOADING
        : INITIAL_SCROLL_TOP_NO_INVERSE_LOADING,
      scrollHeightInitial: 1398,
      scrollTopAfter: 1180,
      scrollHeightAfter: 1684
    }
  },
  {
    args: ["index 6", { position: "end", behavior: "instant" }],
    expected: {
      scrollTopInitial: inverseLoading
        ? INITIAL_SCROLL_TOP_INVERSE_LOADING
        : INITIAL_SCROLL_TOP_NO_INVERSE_LOADING,
      scrollHeightInitial: 1398,
      scrollTopAfter: 898,
      scrollHeightAfter: 1398
    }
  }
];

/**
 * It means "Expected difference: < 0.5"
 */
const ERROR_DIFFERENCE = 0;

describe("[ch-smart-grid][scrollEndContentToPosition]", () => {
  let page: E2EPage;
  let smartGridRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: ``,
      failOnConsoleError: true
    });
  });

  const setContent = async (
    items: DummyItem[],
    loadingState: HTMLChSmartGridElement["loadingState"],
    inverseLoading: boolean
  ) => {
    await page.setContent(
      `<style>*, ::before { box-sizing: border-box } </style>
      <ch-smart-grid style="block-size: 500px; inline-size: 500px" loading-state="${loadingState}" items-count="${
        items.length
      }"${inverseLoading ? " inverse-loading" : ""}>
        <div slot="grid-content">
          ${items.map(
            item =>
              `<ch-smart-grid-cell cell-id="${item.cellId}">${item.content}></ch-smart-grid-cell>`
          )}
        </div>
      </ch-smart-grid>`
    );

    smartGridRef = await page.find("ch-smart-grid");
    await page.waitForChanges();
  };

  const getScrollPosition = () =>
    page.evaluate(() => {
      const smartGrid = document.querySelector("ch-smart-grid");
      return {
        scrollTop: smartGrid.scrollTop,
        scrollHeight: smartGrid.scrollHeight
      };
    });

  const testScrollPosition = (
    items: DummyItem[],
    loadingState: HTMLChSmartGridElement["loadingState"],
    inverseLoading: boolean,
    scrollEndContentToPositionArgs: ScrollEndContentToPositionArgTypes,
    expectedSizes: Sizes
  ) =>
    it(`[loadingState = "${loadingState}"][inverseLoading = ${inverseLoading}] should correctly position the scroll when using ${JSON.stringify(
      scrollEndContentToPositionArgs
    )}`, async () => {
      await setContent(items, loadingState, inverseLoading);

      const initialSizes = await getScrollPosition();
      expect(initialSizes.scrollTop).toBeCloseTo(
        expectedSizes.scrollTopInitial,
        ERROR_DIFFERENCE
      );
      expect(initialSizes.scrollHeight).toBeCloseTo(
        expectedSizes.scrollHeightInitial,
        ERROR_DIFFERENCE
      );

      await smartGridRef.callMethod(
        "scrollEndContentToPosition" satisfies keyof HTMLChSmartGridElement,
        ...scrollEndContentToPositionArgs
      );
      await page.waitForChanges();

      const afterSizes = await getScrollPosition();
      expect(afterSizes.scrollTop).toBeCloseTo(
        expectedSizes.scrollTopAfter,
        ERROR_DIFFERENCE
      );
      expect(afterSizes.scrollHeight).toBeCloseTo(
        expectedSizes.scrollHeightAfter,
        ERROR_DIFFERENCE
      );
    });

  METHOD_TESTS(false).forEach(testValues =>
    testScrollPosition(
      BASIC_ITEMS,
      "all-records-loaded",
      false,
      testValues.args,
      testValues.expected
    )
  );

  // TODO: Fix these unit tests
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
