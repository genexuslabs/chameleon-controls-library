import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { ThemeModel } from "../theme-types";
import { CSS_SCROLLBAR_MODEL } from "./utils.e2e";

const LOADING_ATTRIBUTE = "data-ch-theme-loading";

const STYLE_TO_HIDE_ROOT_NODE =
  `<style>:host,:has(>ch-theme[${LOADING_ATTRIBUTE}]){visibility:hidden !important}</style>`;

describe("[ch-theme][style]", () => {
  let page: E2EPage;
  let themeRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({ html: `<ch-theme></ch-theme>` });
    themeRef = await page.find("ch-theme");
  });

  const avoidFlashEnabledTest = (
    model: undefined | null | ThemeModel,
    additionalDescription: string
  ) => {
    it(`should hide the root node if avoidFlashOfUnstyledContent is set, ${additionalDescription}`, async () => {
      themeRef.setProperty("model", model);
      await page.waitForChanges();

      // TODO: For some reason, we have to query the reference again to have
      // the updated innerHTML...
      themeRef = await page.find("ch-theme");

      expect(themeRef.innerHTML).toBe(STYLE_TO_HIDE_ROOT_NODE);
    });
  };
  avoidFlashEnabledTest(undefined, "model = undefined");
  avoidFlashEnabledTest(null, "model = null");
  avoidFlashEnabledTest([], "model = []");
  avoidFlashEnabledTest("", 'model = ""');
  avoidFlashEnabledTest("dummy", 'model = "dummy"');

  const avoidFlashDisabledTest = (
    model: undefined | null | ThemeModel,
    additionalDescription: string
  ) => {
    it(`should NOT hide the root node if avoidFlashOfUnstyledContent is false, ${additionalDescription}`, async () => {
      themeRef.setProperty("model", model);
      themeRef.setProperty("avoidFlashOfUnstyledContent", false);
      await page.waitForChanges();

      // TODO: For some reason, we have to query the reference again to have
      // the updated innerHTML...
      themeRef = await page.find("ch-theme");

      expect(themeRef.innerHTML).toBe("");
    });
  };
  avoidFlashDisabledTest(undefined, "model = undefined");
  avoidFlashDisabledTest(null, "model = null");
  avoidFlashDisabledTest([], "model = []");
  avoidFlashDisabledTest("", 'model = ""');
  avoidFlashDisabledTest("dummy", 'model = "dummy"');

  it(`should have the "${LOADING_ATTRIBUTE}" attribute before themes are loaded`, async () => {
    expect(themeRef.getAttribute(LOADING_ATTRIBUTE)).toEqual("");
  });

  it(`should remove the "${LOADING_ATTRIBUTE}" attribute after themes are loaded`, async () => {
    const themeLoadedEvent = themeRef.waitForEvent("themeLoaded");

    themeRef.setProperty("model", CSS_SCROLLBAR_MODEL);
    await page.waitForChanges();
    await themeLoadedEvent;

    themeRef = await page.find("ch-theme");
    expect(themeRef.getAttribute(LOADING_ATTRIBUTE)).toBeNull();
  });

  it("should remove the FOUC style after themes are loaded", async () => {
    const themeLoadedEvent = themeRef.waitForEvent("themeLoaded");

    themeRef.setProperty("model", CSS_SCROLLBAR_MODEL);
    await page.waitForChanges();
    await themeLoadedEvent;

    themeRef = await page.find("ch-theme");
    expect(themeRef.innerHTML).toBe("");
  });
});
