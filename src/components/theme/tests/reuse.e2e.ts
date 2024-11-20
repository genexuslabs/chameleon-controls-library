import {
  E2EElement,
  E2EPage,
  EventSpy,
  newE2EPage
} from "@stencil/core/testing";
import { ThemeModel } from "../theme-types";
import {
  checkThemeValues,
  CSS_CONTENT,
  CSS_NAME,
  CSS_URL,
  INLINE_MODEL_1,
  INLINE_MODEL_2,
  STYLE_SHEET1,
  STYLE_SHEET1_NAME,
  STYLE_SHEET2,
  STYLE_SHEET2_NAME,
  STYLESHEET_WITH_URLS,
  TIME_TO_DOWNLOAD_CSS,
  URL_MODEL,
  URL_NAME
} from "./utils.e2e";
import { delayTest } from "../../../testing/utils.e2e";

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

  const getMarkdownViewerAdoptedStyleSheets = () =>
    page.evaluate(() =>
      document
        .querySelector("ch-markdown-viewer")
        .shadowRoot.adoptedStyleSheets.map(stylesheet =>
          [...stylesheet.cssRules].map(rule => rule.cssText).join("\n")
        )
    );

  const checkValues = async (
    successModelsToCheck: string[],
    styleSheetsToCheck: string[],
    spy: 1 | 2 = 1
  ) =>
    checkThemeValues(
      page,
      spy === 1 ? themeLoaded1Spy : themeLoaded2Spy,
      successModelsToCheck,
      styleSheetsToCheck
    );

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
    await setModel(theme1Ref, INLINE_MODEL_1);
    await checkValues([STYLE_SHEET1_NAME], [STYLE_SHEET1]);

    await setModel(theme2Ref, INLINE_MODEL_2);
    await checkValues([STYLE_SHEET2_NAME], [STYLE_SHEET1, STYLE_SHEET2], 2);
  });

  it("should work with multiple ch-theme defined for the same root, even if the item have inline stylesheets", async () => {
    await setModel(theme1Ref, INLINE_MODEL_1);
    await checkValues([STYLE_SHEET1_NAME], [STYLE_SHEET1]);

    await setModel(theme2Ref, [
      { name: STYLE_SHEET2_NAME, styleSheet: STYLE_SHEET2 },
      { name: CSS_NAME, url: CSS_URL }
    ]);
    await delayTest(TIME_TO_DOWNLOAD_CSS);
    await checkValues(
      [STYLE_SHEET2_NAME, CSS_NAME],
      [STYLE_SHEET1, STYLE_SHEET2, CSS_CONTENT],
      2
    );
  });

  it("should adopt/reuse the stylesheet with URL defined by another ch-theme (same root)", async () => {
    await setModel(theme1Ref, URL_MODEL);
    await delayTest(TIME_TO_DOWNLOAD_CSS);
    await checkValues([URL_NAME], [STYLESHEET_WITH_URLS]);

    await setModel(theme2Ref, URL_NAME);
    await checkValues([URL_NAME], [STYLESHEET_WITH_URLS], 2);
  });

  it("should adopt/reuse the inline stylesheet defined by another ch-theme (same root)", async () => {
    await setModel(theme1Ref, INLINE_MODEL_1);
    await checkValues([STYLE_SHEET1_NAME], [STYLE_SHEET1]);

    await setModel(theme2Ref, STYLE_SHEET1_NAME);
    await checkValues([STYLE_SHEET1_NAME], [STYLE_SHEET1], 2);
  });

  it.skip("should adopt/reuse the stylesheet with URL defined by another ch-theme (different root)", async () => {
    await setModel(theme1Ref, URL_MODEL);

    markdownViewerRef.setProperty("theme", URL_NAME);
    await page.waitForChanges();
    expect(await getMarkdownViewerAdoptedStyleSheets()).toContainEqual(
      STYLESHEET_WITH_URLS
    );
  });

  it.skip("should adopt/reuse the inline stylesheet defined by another ch-theme (different root)", async () => {
    await setModel(theme1Ref, INLINE_MODEL_1);

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
