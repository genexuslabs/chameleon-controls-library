import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import type { ThemeModel } from "../../theme/theme-types";
import {
  TEST_INLINE_MODEL_1,
  TEST_INLINE_MODEL_2,
  TEST_MULTIPLE_MODEL,
  TEST_URL_MODEL_ARRAY,
  TEST_URL_MODEL_OBJECT
} from "../../theme/tests/utils.e2e";

const THEME_SELECTOR = "ch-chat >>> ch-theme";

describe("[ch-chat][theme]", () => {
  let page: E2EPage;
  let chatRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-chat></ch-chat>`,
      failOnConsoleError: true
    });
    chatRef = await page.find("ch-chat");
  });

  it("should not render the ch-theme by default", async () => {
    expect(await page.find(THEME_SELECTOR)).toBeFalsy();
  });

  it("should not render the ch-theme when theme = null", async () => {
    chatRef.setProperty("theme", null);
    await page.waitForChanges();

    expect(await page.find(THEME_SELECTOR)).toBeFalsy();
  });

  it('should not render the ch-theme when theme = ""', async () => {
    chatRef.setProperty("theme", "");
    await page.waitForChanges();

    expect(await page.find(THEME_SELECTOR)).toBeFalsy();
  });

  it("should render the ch-theme when theme = []", async () => {
    chatRef.setProperty("theme", []);
    await page.waitForChanges();

    expect(await page.find(THEME_SELECTOR)).toBeTruthy();
  });

  it("should render the ch-theme with avoidFlashOfUnstyledContent = true", async () => {
    chatRef.setProperty("theme", []);
    await page.waitForChanges();

    expect(
      await (
        await page.find(THEME_SELECTOR)
      ).getProperty("avoidFlashOfUnstyledContent")
    ).toBe(true);
  });

  const testPropertyBind = (theme: ThemeModel) => {
    it(`should bind the \"theme\" property to the ch-theme when defined (${JSON.stringify(
      theme
    )})`, async () => {
      chatRef.setProperty("theme", theme);
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
