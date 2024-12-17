import {
  E2EElement,
  E2EPage,
  EventSpy,
  newE2EPage
} from "@stencil/core/testing";
import {
  checkThemeValues,
  EMPTY_ADOPTED_STYLESHEETS,
  getDocumentAdoptedStyleSheets,
  INLINE_MODEL_2,
  MULTIPLE_MODEL,
  STYLE_SHEET2,
  STYLE_SHEET2_NAME,
  STYLESHEET_WITH_URLS,
  TIME_TO_DOWNLOAD_CSS,
  URL_MODEL,
  URL_NAME
} from "./utils.e2e";
import { ThemeModel } from "../theme-types";
import { delayTest } from "../../../testing/utils.e2e";

describe("[ch-theme][attachStyleSheets]", () => {
  let page: E2EPage;
  let themeRef: E2EElement;
  let themeLoadedSpy: EventSpy;

  const setModel = async (model: ThemeModel) => {
    themeRef.setProperty("model", model);
    await page.waitForChanges();
  };

  const checkValues = async (
    successModelsToCheck: string[],
    styleSheetsToCheck: string[]
  ) =>
    checkThemeValues(
      page,
      themeLoadedSpy,
      successModelsToCheck,
      styleSheetsToCheck
    );

  beforeEach(async () => {
    page = await newE2EPage({ html: `<ch-theme></ch-theme>` });
    themeRef = await page.find("ch-theme");
    themeLoadedSpy = await themeRef.spyOnEvent("themeLoaded");
  });

  it("should attach the stylesheet by default (stylesheet by URL)", async () => {
    await setModel(URL_MODEL);
    await delayTest(TIME_TO_DOWNLOAD_CSS);

    await checkValues([URL_NAME], [STYLESHEET_WITH_URLS]);
  });

  it("should attach the stylesheet by default (inline stylesheet)", async () => {
    await setModel(INLINE_MODEL_2);

    await checkValues([STYLE_SHEET2_NAME], [STYLE_SHEET2]);
  });

  it("should attach multiple stylesheets by default", async () => {
    await setModel(MULTIPLE_MODEL);
    await delayTest(TIME_TO_DOWNLOAD_CSS);

    await checkValues(
      [URL_NAME, STYLE_SHEET2_NAME],
      [STYLESHEET_WITH_URLS, STYLE_SHEET2]
    );
  });

  it('should not attach the stylesheet if "attachStyleSheets === false" (stylesheet by URL)', async () => {
    themeRef.setProperty("attachStyleSheets", false);
    await setModel(URL_MODEL);
    await delayTest(TIME_TO_DOWNLOAD_CSS);

    await checkValues([URL_NAME], EMPTY_ADOPTED_STYLESHEETS);
  });

  it('should not attach the stylesheet if "attachStyleSheets === false" (inline stylesheet)', async () => {
    themeRef.setProperty("attachStyleSheets", false);
    await setModel(INLINE_MODEL_2);

    await checkValues([STYLE_SHEET2_NAME], EMPTY_ADOPTED_STYLESHEETS);
  });

  it('should not attach multiple stylesheets if "attachStyleSheets === false"', async () => {
    themeRef.setProperty("attachStyleSheets", false);
    await setModel(MULTIPLE_MODEL);
    await delayTest(TIME_TO_DOWNLOAD_CSS);

    await checkValues([URL_NAME, STYLE_SHEET2_NAME], EMPTY_ADOPTED_STYLESHEETS);
  });

  const testReactiveTrueFalse = (
    model: ThemeModel,
    description: string,
    delay = false
  ) => {
    it(`attachStyleSheets should be reactive: true -> false ${description}`, async () => {
      await setModel(model);
      if (delay) {
        await delayTest(TIME_TO_DOWNLOAD_CSS);
      }

      themeRef.setProperty("attachStyleSheets", false);
      await page.waitForChanges();
      expect(await getDocumentAdoptedStyleSheets(page)).toEqual(
        EMPTY_ADOPTED_STYLESHEETS
      );
    });
  };
  testReactiveTrueFalse(URL_MODEL, "(stylesheet by URL)", true);
  testReactiveTrueFalse(INLINE_MODEL_2, "(inline stylesheet)");
  testReactiveTrueFalse(MULTIPLE_MODEL, "(multiple stylesheets)", true);

  const testReactiveFalseTrue = (
    model: ThemeModel,
    description: string,
    successModelsToCheck: string[],
    styleSheetsToCheck: string[],
    delay = false
  ) => {
    it(`attachStyleSheets should be reactive: false -> true ${description}`, async () => {
      themeRef.setProperty("attachStyleSheets", false);
      await setModel(model);
      if (delay) {
        await delayTest(TIME_TO_DOWNLOAD_CSS);
      }

      themeRef.setProperty("attachStyleSheets", true);
      await page.waitForChanges();
      await checkValues(successModelsToCheck, styleSheetsToCheck);
    });
  };
  testReactiveFalseTrue(
    URL_MODEL,
    "(stylesheet by URL)",
    [URL_NAME],
    [STYLESHEET_WITH_URLS],
    true
  );
  testReactiveFalseTrue(
    INLINE_MODEL_2,
    "(inline stylesheet)",
    [STYLE_SHEET2_NAME],
    [STYLE_SHEET2]
  );
  testReactiveFalseTrue(
    MULTIPLE_MODEL,
    "(multiple stylesheets)",
    [URL_NAME, STYLE_SHEET2_NAME],
    [STYLESHEET_WITH_URLS, STYLE_SHEET2],
    true
  );
});
