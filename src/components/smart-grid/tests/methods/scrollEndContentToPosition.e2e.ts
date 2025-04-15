import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { ArgumentTypes } from "../../../../common/types";

type ScrollEndContentToPositionArgTypes = ArgumentTypes<
  HTMLChSmartGridElement["scrollEndContentToPosition"]
>;

type DummyItem = { cellId: string; content: string };

const LOREM = `<div style="display: grid; block-size: 200px">Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam veritatis tempora, quisquam, illum illo est dolore omnis laborum nostrum temporibus distinctio quibusdam! Dignissimos quasi repellat sunt necessitatibus odit eius ratione!</div>`;

const BASIC_ITEMS: DummyItem[] = [
  { cellId: "index 1", content: LOREM },
  { cellId: "index 2", content: LOREM },
  { cellId: "index 3", content: LOREM },
  { cellId: "index 4", content: LOREM },
  { cellId: "index 5", content: LOREM },
  { cellId: "index 6", content: LOREM }
];

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
    loadingState: HTMLChSmartGridElement["loadingState"]
  ) => {
    await page.setContent(
      `<ch-smart-grid style="block-size: 500px; inline-size: 300px" loading-state="${loadingState}">
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
    page.evaluate(() => document.querySelector("ch-smart-grid").scrollTop);

  const testScrollPosition = (
    items: DummyItem[],
    loadingState: HTMLChSmartGridElement["loadingState"],
    scrollEndContentToPositionArgs: ScrollEndContentToPositionArgTypes,
    scrollPosition: { initial: number; expected: number }
  ) =>
    it(`should correctly position the scroll when using ${JSON.stringify(
      scrollEndContentToPositionArgs
    )}`, async () => {
      await setContent(items, loadingState);

      expect(await getScrollPosition()).toBe(scrollPosition.initial);

      await smartGridRef.callMethod(
        "scrollEndContentToPosition" satisfies keyof HTMLChSmartGridElement,
        ...scrollEndContentToPositionArgs
      );

      await page.waitForChanges();
      await page.waitForChanges();
      await page.waitForChanges();

      expect(await getScrollPosition()).toBe(scrollPosition.expected);
    });

  testScrollPosition(
    BASIC_ITEMS,
    "all-records-loaded",
    ["index 4", { position: "start", behavior: "instant" }],
    { initial: 0, expected: 800 }
  );
});
