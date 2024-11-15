import {
  E2EElement,
  E2EPage,
  EventSpy,
  newE2EPage
} from "@stencil/core/testing";
import { ChThemeLoadedEvent, ThemeModel } from "../theme-types";
import {
  CSS_CONTENT,
  CSS_NAME,
  CSS_URL,
  STYLE_SHEET1,
  STYLE_SHEET1_NAME,
  STYLE_SHEET2,
  STYLE_SHEET2_NAME
} from "./utils.e2e";

describe("[ch-theme][reuse]", () => {
  let page: E2EPage;
  let markdownViewerRef: E2EElement;
  let theme1Ref: E2EElement;
  let theme2Ref: E2EElement;
  let themeLoaded1Spy: EventSpy;
  let themeLoaded2Spy: EventSpy;

  const setModel = async (themeRef: E2EElement, model: ThemeModel) => {
    themeRef.setProperty("model", model);
    await page.waitForChanges();
  };

  const getDocumentAdoptedStyleSheets = () =>
    page.evaluate(() =>
      document.adoptedStyleSheets.map(sheet => sheet.cssRules[0].cssText)
    );

  const getMarkdownViewerAdoptedStyleSheets = () =>
    page.evaluate(() =>
      document
        .querySelector("ch-markdown-viewer")
        .shadowRoot.adoptedStyleSheets.map(sheet => sheet.cssRules[0].cssText)
    );

  const checkValues = async (
    successModelsToCheck: string[],
    styleSheetsToCheck: string[],
    spy: 1 | 2 = 1
  ) => {
    const adoptedStyleSheets = await getDocumentAdoptedStyleSheets();
    expect(adoptedStyleSheets).toEqual(styleSheetsToCheck);

    if (spy === 1) {
      expect(themeLoaded1Spy).toHaveReceivedEventTimes(1);
      expect(themeLoaded1Spy).toHaveReceivedEventDetail({
        success: successModelsToCheck
      } satisfies ChThemeLoadedEvent);
    } else {
      expect(themeLoaded2Spy).toHaveReceivedEventTimes(1);
      expect(themeLoaded2Spy).toHaveReceivedEventDetail({
        success: successModelsToCheck
      } satisfies ChThemeLoadedEvent);
    }
  };

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-theme id="theme-a"></ch-theme>
      <ch-theme id="theme-b"></ch-theme>
      <ch-markdown-viewer theme=""></ch-markdown-viewer>`
    });
    markdownViewerRef = await page.find("ch-markdown-viewer");
    theme1Ref = await page.find("[id='theme-a']");
    theme2Ref = await page.find("[id='theme-b']");
    themeLoaded1Spy = await theme1Ref.spyOnEvent("themeLoaded");
    themeLoaded2Spy = await theme2Ref.spyOnEvent("themeLoaded");
  });

  it("should work with multiple ch-theme defined for the same root", async () => {
    await setModel(theme1Ref, [
      { name: STYLE_SHEET1_NAME, styleSheet: STYLE_SHEET1 }
    ]);
    await checkValues([STYLE_SHEET1_NAME], [STYLE_SHEET1]);

    await setModel(theme2Ref, [
      { name: STYLE_SHEET2_NAME, styleSheet: STYLE_SHEET2 }
    ]);
    await checkValues([STYLE_SHEET2_NAME], [STYLE_SHEET1, STYLE_SHEET2], 2);
  });

  it("should work with multiple ch-theme defined for the same root, even if the item have inline stylesheets", async () => {
    await setModel(theme1Ref, [
      { name: STYLE_SHEET1_NAME, styleSheet: STYLE_SHEET1 }
    ]);
    await checkValues([STYLE_SHEET1_NAME], [STYLE_SHEET1]);

    await setModel(theme2Ref, [
      { name: STYLE_SHEET2_NAME, styleSheet: STYLE_SHEET2 },
      { name: CSS_NAME, url: CSS_URL }
    ]);
    await checkValues(
      [STYLE_SHEET2_NAME, CSS_NAME],
      [STYLE_SHEET1, STYLE_SHEET2, CSS_CONTENT],
      2
    );
  });

  it.skip("should adopt/reuse the stylesheet defined by another ch-theme (same root)", async () => {
    await setModel(theme2Ref, [
      { name: STYLE_SHEET1_NAME, styleSheet: STYLE_SHEET1 }
    ]);
    await checkValues([STYLE_SHEET1_NAME], [STYLE_SHEET1]);

    await setModel(theme2Ref, STYLE_SHEET1_NAME);
    await checkValues([STYLE_SHEET1_NAME], [STYLE_SHEET1], 2);
  });

  it.skip("should adopt/reuse the stylesheet defined by another ch-theme (different root)", async () => {
    await setModel(theme1Ref, [
      { name: STYLE_SHEET1_NAME, styleSheet: STYLE_SHEET1 }
    ]);

    markdownViewerRef.setProperty("theme", STYLE_SHEET1_NAME);
    await page.waitForChanges();
    expect(await getMarkdownViewerAdoptedStyleSheets()).toContainEqual(
      STYLE_SHEET1
    );
  });

  it.skip("should not duplicate the stylesheet adoption when another ch-theme loads the same CSS", async () => {
    // TODO: Add implementation
  });
});
