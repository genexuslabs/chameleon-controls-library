import {
  E2EElement,
  E2EPage,
  EventSpy,
  newE2EPage
} from "@stencil/core/testing";
import { checkThemeValues, TIME_TO_DOWNLOAD_CSS } from "./utils.e2e";
import { ThemeModel } from "../theme-types";
import { delayTest } from "../../../testing/utils.e2e";

const BASE_URL = "https://example.com/";

const STYLESHEET_WITH_URLS = `.rule-1 { background-image: url("images/background.png"); }
.rule-2 { background-image: url("/images/background.png"); }
.rule-3 { background-image: url("../assets/images/logo.svg"); }
.rule-4 { background-image: url("./assets/images/logo.svg"); }
.rule-5 { background-image: url("logo.png"); }
.not-valid-1 { background-image: url("http://example.com/image.png"); }
.not-valid-2 { background-image: url("https://example.com/image.png"); }
.not-valid-3 { background-image: url("data:image/png;base64,..."); }
.not-valid-4 { background-image: url("file:///C:/images/background.png"); }
.not-valid-5 { background-image: url("data:image/svg+xml,<svg width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><path d=\\"M10 17.42L5 12.42L6.41 11L10 14.59L17.59 7L19 8.42L10 17.42Z\\"/></svg>"); }`;

const STYLESHEET_WITH_TRANSFORMED_URLS = `.rule-1 { background-image: url("${BASE_URL}images/background.png"); }
.rule-2 { background-image: url("${BASE_URL}/images/background.png"); }
.rule-3 { background-image: url("${BASE_URL}../assets/images/logo.svg"); }
.rule-4 { background-image: url("${BASE_URL}./assets/images/logo.svg"); }
.rule-5 { background-image: url("${BASE_URL}logo.png"); }
.not-valid-1 { background-image: url("http://example.com/image.png"); }
.not-valid-2 { background-image: url("https://example.com/image.png"); }
.not-valid-3 { background-image: url("data:image/png;base64,..."); }
.not-valid-4 { background-image: url("file:///C:/images/background.png"); }
.not-valid-5 { background-image: url("data:image/svg+xml,<svg width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><path d=\\"M10 17.42L5 12.42L6.41 11L10 14.59L17.59 7L19 8.42L10 17.42Z\\"/></svg>"); }`;

describe("[ch-theme][baseUrl]", () => {
  let page: E2EPage;
  let themeRef: E2EElement;
  let themeLoadedSpy: EventSpy;

  const setModel = async (themeRef: E2EElement, model: ThemeModel) => {
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

  it("should not transform the URLs if the base themeBaseUrl is not set (stylesheet downloaded with an URL)", async () => {
    await setModel(themeRef, [
      { name: "test-urls", url: "showcase/theme-test.css" }
    ]);
    await delayTest(TIME_TO_DOWNLOAD_CSS);

    checkValues(["test-urls"], [STYLESHEET_WITH_URLS]);
  });

  it("should not transform the URLs if the base themeBaseUrl is not set (inline stylesheet)", async () => {
    await setModel(themeRef, [
      { name: "test-urls", styleSheet: STYLESHEET_WITH_URLS }
    ]);

    checkValues(["test-urls"], [STYLESHEET_WITH_URLS]);
  });

  // TODO: Fix the function (applyBaseUrl) used for this
  it.skip("should add the baseUrl if the themeBaseUrl property is set (stylesheet downloaded with an URL)", async () => {
    await setModel(themeRef, [
      {
        name: "test-urls",
        url: "showcase/theme-test.css",
        themeBaseUrl: BASE_URL
      }
    ]);
    await delayTest(TIME_TO_DOWNLOAD_CSS);

    checkValues(["test-urls"], [STYLESHEET_WITH_TRANSFORMED_URLS]);
  });

  // TODO: Fix the function (applyBaseUrl) used for this
  it.skip("should add the baseUrl if the themeBaseUrl property is set (inline stylesheet)", async () => {
    await setModel(themeRef, [
      {
        name: "test-urls",
        styleSheet: STYLESHEET_WITH_URLS,
        themeBaseUrl: BASE_URL
      }
    ]);

    checkValues(["test-urls"], [STYLESHEET_WITH_TRANSFORMED_URLS]);
  });
});
