import { E2EPage, EventSpy } from "@stencil/core/testing";
import { ChThemeLoadedEvent, ThemeModel } from "../theme-types";

export const URL_NAME = "test-urls";
export const BASE_URL = "https://example.com/";
export const TIME_TO_DOWNLOAD_CSS = 200;
export const EMPTY_ADOPTED_STYLESHEETS = [];

export const CSS_NAME = "chameleon/scrollbar";
export const CSS_URL = "showcase/scrollbar.css";
export const CSS_CONTENT = `:host(.ch-scrollable), .ch-scrollable, .scrollable {
  scrollbar-width: thin; scrollbar-color: var(--accents__primary--hover) transparent;
  &::-webkit-scrollbar { width: 8px; height: 8px; background-color: transparent; }
  &::-webkit-scrollbar-thumb { background-color: var(--accents__primary--hover); }
}`;

export const STYLE_SHEET1_NAME = "stylesheet 1";
export const STYLE_SHEET2_NAME = "stylesheet 2";
export const STYLE_SHEET1 = ".custom-rule { background-color: red; }";
export const STYLE_SHEET2 = ".custom-rule-2 { color: black; }";

export const URL_MODEL = [
  { name: URL_NAME, url: "showcase/theme-test.css" }
] as const satisfies ThemeModel;

export const INLINE_MODEL_1 = [
  { name: STYLE_SHEET1_NAME, styleSheet: STYLE_SHEET1 }
] as const satisfies ThemeModel;

export const INLINE_MODEL_2 = [
  { name: STYLE_SHEET2_NAME, styleSheet: STYLE_SHEET2 }
] as const satisfies ThemeModel;

export const MULTIPLE_MODEL = [
  { name: URL_NAME, url: "showcase/theme-test.css" },
  { name: STYLE_SHEET2_NAME, styleSheet: STYLE_SHEET2 }
] as const satisfies ThemeModel;

export const STYLESHEET_WITH_URLS = `.rule-1 { background-image: url("images/background.png"); }
.rule-2 { background-image: url("/images/background.png"); }
.rule-3 { background-image: url("../assets/images/logo.svg"); }
.rule-4 { background-image: url("./assets/images/logo.svg"); }
.rule-5 { background-image: url("logo.png"); }
.not-valid-1 { background-image: url("http://example.com/image.png"); }
.not-valid-2 { background-image: url("https://example.com/image.png"); }
.not-valid-3 { background-image: url("data:image/png;base64,..."); }
.not-valid-4 { background-image: url("file:///C:/images/background.png"); }
.not-valid-5 { background-image: url("data:image/svg+xml,<svg width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><path d=\\"M10 17.42L5 12.42L6.41 11L10 14.59L17.59 7L19 8.42L10 17.42Z\\"/></svg>"); }`;

export const STYLESHEET_WITH_TRANSFORMED_URLS = `.rule-1 { background-image: url("${BASE_URL}images/background.png"); }
.rule-2 { background-image: url("${BASE_URL}/images/background.png"); }
.rule-3 { background-image: url("${BASE_URL}../assets/images/logo.svg"); }
.rule-4 { background-image: url("${BASE_URL}./assets/images/logo.svg"); }
.rule-5 { background-image: url("${BASE_URL}logo.png"); }
.not-valid-1 { background-image: url("http://example.com/image.png"); }
.not-valid-2 { background-image: url("https://example.com/image.png"); }
.not-valid-3 { background-image: url("data:image/png;base64,..."); }
.not-valid-4 { background-image: url("file:///C:/images/background.png"); }
.not-valid-5 { background-image: url("data:image/svg+xml,<svg width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><path d=\\"M10 17.42L5 12.42L6.41 11L10 14.59L17.59 7L19 8.42L10 17.42Z\\"/></svg>"); }`;

export const getDocumentAdoptedStyleSheets = (page: E2EPage) =>
  page.evaluate(() =>
    document.adoptedStyleSheets.map(stylesheet =>
      [...stylesheet.cssRules].map(rule => rule.cssText).join("\n")
    )
  );

export const checkThemeValues = async (
  page: E2EPage,
  themeLoadedSpy: EventSpy,
  successModelsToCheck: string[],
  styleSheetsToCheck: string[]
) => {
  const adoptedStyleSheets = await getDocumentAdoptedStyleSheets(page);
  expect(adoptedStyleSheets).toEqual(styleSheetsToCheck);

  expect(themeLoadedSpy).toHaveReceivedEventTimes(1);
  expect(themeLoadedSpy).toHaveReceivedEventDetail({
    success: successModelsToCheck
  } satisfies ChThemeLoadedEvent);
};
