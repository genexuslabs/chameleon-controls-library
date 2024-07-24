import { getTheme } from "../components/theme/theme-stylesheet";

export const CHAMELEON_THEMES = {
  SCROLLBAR: "chameleon/scrollbar"
};

const CHAMELEON_COMMON_THEMES = [CHAMELEON_THEMES.SCROLLBAR];
const CHAMELEON_THEMES_TIMEOUT = 10000;

export function adoptCommonThemes(adoptedStyleSheets: CSSStyleSheet[]) {
  CHAMELEON_COMMON_THEMES.forEach(name => {
    getTheme({ name }, CHAMELEON_THEMES_TIMEOUT)
      .then(theme => {
        adoptedStyleSheets.push(theme.styleSheet);
      })
      .catch(() => {});
  });
  console.log("adoptCommonThemes");
}
