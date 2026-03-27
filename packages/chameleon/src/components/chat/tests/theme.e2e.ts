import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ThemeModel } from "../../theme/theme-types";
import type { ChChat } from "../chat.lit";
import "../chat.lit.js";

const THEME_SELECTOR = "ch-theme";

describe("[ch-chat][theme]", () => {
  let chatRef: ChChat;

  afterEach(cleanup);

  beforeEach(async () => {
    render(html`<ch-chat></ch-chat>`);
    chatRef = document.querySelector("ch-chat")!;
    await chatRef.updateComplete;
  });

  it("should not render the ch-theme by default", () => {
    expect(chatRef.shadowRoot!.querySelector(THEME_SELECTOR)).toBeNull();
  });

  it("should not render the ch-theme when theme = null", async () => {
    chatRef.theme = null as any;
    await chatRef.updateComplete;

    expect(chatRef.shadowRoot!.querySelector(THEME_SELECTOR)).toBeNull();
  });

  it('should not render the ch-theme when theme = ""', async () => {
    chatRef.theme = "" as any;
    await chatRef.updateComplete;

    expect(chatRef.shadowRoot!.querySelector(THEME_SELECTOR)).toBeNull();
  });

  it("should render the ch-theme when theme = []", async () => {
    chatRef.theme = [];
    await chatRef.updateComplete;

    expect(chatRef.shadowRoot!.querySelector(THEME_SELECTOR)).toBeTruthy();
  });

  it("should render the ch-theme with avoidFlashOfUnstyledContent = true", async () => {
    chatRef.theme = [];
    await chatRef.updateComplete;

    const themeEl = chatRef.shadowRoot!.querySelector(
      THEME_SELECTOR
    ) as HTMLChThemeElement;
    expect(themeEl.avoidFlashOfUnstyledContent).toBe(true);
  });

  const testPropertyBind = (theme: ThemeModel) => {
    it(`should bind the "theme" property to the ch-theme when defined (${JSON.stringify(
      theme
    )})`, async () => {
      chatRef.theme = theme;
      await chatRef.updateComplete;

      const themeEl = chatRef.shadowRoot!.querySelector(
        THEME_SELECTOR
      ) as HTMLChThemeElement;
      expect(themeEl.model).toEqual(theme);
    });
  };

  testPropertyBind("dummy theme");
  testPropertyBind(["dummy theme", "dummy theme 2"]);
});
