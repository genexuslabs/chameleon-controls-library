const THEME_MANAGER_THEME_KEY = "gx-eai-theme";

export const getTheme = () => localStorage.getItem(THEME_MANAGER_THEME_KEY);

export const getThemePreferences = () =>
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

export function storeTheme(theme) {
  localStorage.setItem(THEME_MANAGER_THEME_KEY, theme);
}

export function setThemeInBrowser(theme) {
  // Remove previous theme
  document.documentElement.classList.remove("light", "dark");

  // Set new theme
  document.documentElement.classList.add(theme);
}

// Initialize theme
const theme = getTheme();

if (theme) {
  setThemeInBrowser(theme);
} else {
  const preferenceTheme = getThemePreferences();

  storeTheme(preferenceTheme);
  setThemeInBrowser(preferenceTheme);
}
