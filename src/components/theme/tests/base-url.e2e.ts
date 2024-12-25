import {
  E2EElement,
  E2EPage,
  EventSpy,
  newE2EPage
} from "@stencil/core/testing";
import {
  BASE_URL,
  checkThemeValues,
  STYLESHEET_WITH_TRANSFORMED_URLS,
  STYLESHEET_WITH_URLS,
  TIME_TO_DOWNLOAD_CSS
} from "./utils.e2e";
import { ThemeModel } from "../theme-types";
import { delayTest } from "../../../testing/utils.e2e";

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

  it("should not transform the URLs if the themeBaseUrl is not set (stylesheet downloaded with an URL)", async () => {
    await setModel(themeRef, [
      { name: "test-urls", url: "showcase/theme-test.css" }
    ]);
    await delayTest(TIME_TO_DOWNLOAD_CSS);

    checkValues(["test-urls"], [STYLESHEET_WITH_URLS]);
  });

  it("should not transform the URLs if the themeBaseUrl is not set (inline stylesheet)", async () => {
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
