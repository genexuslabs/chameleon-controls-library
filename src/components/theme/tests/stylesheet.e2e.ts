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

describe("[ch-theme][stylesheet]", () => {
  let page: E2EPage;
  let themeRef: E2EElement;
  let themeLoadedSpy: EventSpy;

  const getAdoptedStyleSheets = () =>
    page.evaluate(() =>
      document.adoptedStyleSheets.map(sheet => sheet.cssRules[0].cssText)
    );

  const checkValues = async (
    successModelsToCheck: string[],
    styleSheetsToCheck: string[]
  ) => {
    const adoptedStyleSheets = await getAdoptedStyleSheets();

    // It contains the style of the inline stylesheet
    expect(adoptedStyleSheets).toEqual(styleSheetsToCheck);

    expect(themeLoadedSpy).toHaveReceivedEventTimes(1);
    expect(themeLoadedSpy).toHaveReceivedEventDetail({
      success: successModelsToCheck
    } satisfies ChThemeLoadedEvent);
  };

  beforeEach(async () => {
    page = await newE2EPage({ html: `<ch-theme></ch-theme>` });
    themeRef = await page.find("ch-theme");
    themeLoadedSpy = await themeRef.spyOnEvent("themeLoaded");
  });

  it("should support the stylesheet property", async () => {
    themeRef.setProperty("model", {
      name: STYLE_SHEET1_NAME,
      styleSheet: STYLE_SHEET1
    } satisfies ThemeModel);
    await page.waitForChanges();

    await checkValues([STYLE_SHEET1_NAME], [STYLE_SHEET1]);
  });

  it("should support multiple stylesheets loaded at the root", async () => {
    themeRef.setProperty("model", [
      { name: STYLE_SHEET1_NAME, styleSheet: STYLE_SHEET1 },
      { name: STYLE_SHEET2_NAME, styleSheet: STYLE_SHEET2 }
    ] satisfies ThemeModel);
    await page.waitForChanges();

    await checkValues(
      [STYLE_SHEET1_NAME, STYLE_SHEET2_NAME],
      [STYLE_SHEET1, STYLE_SHEET2]
    );
  });

  it("should support loading stylesheet and URLs at the same time", async () => {
    themeRef.setProperty("model", [
      { name: STYLE_SHEET1_NAME, styleSheet: STYLE_SHEET1 },
      { name: STYLE_SHEET2_NAME, styleSheet: STYLE_SHEET2 },
      { name: CSS_NAME, url: CSS_URL }
    ] satisfies ThemeModel);
    await page.waitForChanges();

    await checkValues(
      [STYLE_SHEET1_NAME, STYLE_SHEET2_NAME, CSS_NAME],
      [STYLE_SHEET1, STYLE_SHEET2, CSS_CONTENT]
    );
  });
});
