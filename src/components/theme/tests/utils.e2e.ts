import { E2EPage, EventSpy } from "@stencil/core/testing";
import { ChThemeLoadedEvent } from "../theme-types";

export const TIME_TO_DOWNLOAD_CSS = 200;

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
