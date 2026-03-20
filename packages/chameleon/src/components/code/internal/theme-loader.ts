import type { ShikiInternal } from "shiki/core";
import { DEFAULT_CODE_THEME } from "../constants";
import { themeImplementationMapping } from "./theme-implementation-mapping";

const CHAMELEON_THEME_NAME = "chameleon-theme";

// "chameleon-theme" is pre-loaded in highlighter.ts
const themeWasLoaded = new Set<string>([CHAMELEON_THEME_NAME]);

/**
 * "chameleon-theme-dark" and "chameleon-theme-light" both resolve to the same
 * CSS variables Shiki theme. The visual difference comes from CSS
 * (`:host` vs `:host([theme="chameleon-theme-light"])`).
 */
export const resolveThemeName = (theme: string): string => {
  if (theme === "chameleon-theme-dark" || theme === "chameleon-theme-light") {
    return CHAMELEON_THEME_NAME;
  }
  return theme;
};

export const loadCodeTheme = async (
  highlighter: ShikiInternal,
  theme: string
): Promise<string> => {
  const actualTheme = resolveThemeName(theme);

  // Cached theme
  if (themeWasLoaded.has(actualTheme)) {
    return actualTheme;
  }

  const themeMapping = themeImplementationMapping[actualTheme];

  // Theme doesn't exist
  if (!themeMapping) {
    console.warn(
      `The theme "${theme}" is not implemented in the \`ch-code\` component. Falling back to "${DEFAULT_CODE_THEME}".`
    );
    return CHAMELEON_THEME_NAME;
  }

  // Load the theme and cache it
  await highlighter.loadTheme(themeMapping());
  themeWasLoaded.add(actualTheme);
  return actualTheme;
};
