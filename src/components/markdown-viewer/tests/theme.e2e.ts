import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import type { ThemeModel } from "../../theme/theme-types";
import {
  TEST_INLINE_MODEL_1,
  TEST_INLINE_MODEL_2,
  TEST_MULTIPLE_MODEL,
  TEST_URL_MODEL_ARRAY,
  TEST_URL_MODEL_OBJECT
} from "../../theme/tests/utils.e2e";

const THEME_SELECTOR = "ch-markdown-viewer >>> ch-theme";
const DUMMY_VALUE = "Hello world";

describe("[ch-markdown-viewer][theme]", () => {
  let page: E2EPage;
  let markdownViewerRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-markdown-viewer></ch-markdown-viewer>`,
      failOnConsoleError: true
    });
    markdownViewerRef = await page.find("ch-markdown-viewer");
  });

  // TODO: Is this okay?
  it("should not render the ch-theme by default", async () => {
    expect(await page.find(THEME_SELECTOR)).toBeFalsy();
  });

  it("should render the ch-theme if the value is set", async () => {
    markdownViewerRef.setProperty("value", DUMMY_VALUE);
    await page.waitForChanges();

    expect(await page.find(THEME_SELECTOR)).toBeTruthy();
  });

  it("should not render the ch-theme when theme = null and the value is set", async () => {
    markdownViewerRef.setProperty("value", DUMMY_VALUE);
    markdownViewerRef.setProperty("theme", null);
    await page.waitForChanges();

    expect(await page.find(THEME_SELECTOR)).toBeFalsy();
  });

  it('should not render the ch-theme when theme = "" and the value is set', async () => {
    markdownViewerRef.setProperty("theme", "");
    markdownViewerRef.setProperty("value", DUMMY_VALUE);
    await page.waitForChanges();

    expect(await page.find(THEME_SELECTOR)).toBeFalsy();
  });

  it("should render the ch-theme when theme = [] and the value is set", async () => {
    markdownViewerRef.setProperty("value", DUMMY_VALUE);
    markdownViewerRef.setProperty("theme", []);
    await page.waitForChanges();

    expect(await page.find(THEME_SELECTOR)).toBeTruthy();
  });

  it("should render the ch-theme with avoidFlashOfUnstyledContent = false by default when the value is set", async () => {
    markdownViewerRef.setProperty("value", DUMMY_VALUE);
    await page.waitForChanges();

    expect(
      await (
        await page.find(THEME_SELECTOR)
      ).getProperty("avoidFlashOfUnstyledContent")
    ).toBe(false);
  });

  it("should set avoidFlashOfUnstyledContent = true in the ch-theme, if the markdown-viewer has avoidFlashOfUnstyledContent = true and the value is set", async () => {
    markdownViewerRef.setProperty("value", DUMMY_VALUE);
    markdownViewerRef.setProperty("avoidFlashOfUnstyledContent", true);
    await page.waitForChanges();

    expect(
      await (
        await page.find(THEME_SELECTOR)
      ).getProperty("avoidFlashOfUnstyledContent")
    ).toBe(true);
  });

  const testPropertyBind = (theme: ThemeModel) => {
    it(`should bind the \"theme\" property to the ch-theme when defined and the value is set (${JSON.stringify(
      theme
    )})`, async () => {
      markdownViewerRef.setProperty("value", DUMMY_VALUE);
      markdownViewerRef.setProperty("theme", theme);
      await page.waitForChanges();

      expect(
        await (await page.find(THEME_SELECTOR)).getProperty("model")
      ).toEqual(theme);
    });
  };

  testPropertyBind("dummy theme");
  testPropertyBind(["dummy theme", "dummy theme 2"]);
  testPropertyBind(TEST_URL_MODEL_ARRAY);
  testPropertyBind(TEST_INLINE_MODEL_1);
  testPropertyBind(TEST_INLINE_MODEL_2);
  testPropertyBind(TEST_MULTIPLE_MODEL);
  testPropertyBind(TEST_URL_MODEL_OBJECT);
});
