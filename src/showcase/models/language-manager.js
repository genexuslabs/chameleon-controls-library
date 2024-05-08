const LANGUAGE_MANAGER_LANGUAGE_KEY = "chameleon-language";

export const getLanguageDirection = () =>
  localStorage.getItem(LANGUAGE_MANAGER_LANGUAGE_KEY);

export const getLanguageDirectionInBrowser = () => document.documentElement.dir;

export function storeLanguageDirection(languageDirection) {
  localStorage.setItem(LANGUAGE_MANAGER_LANGUAGE_KEY, languageDirection);
}

export function setLanguageDirectionInBrowser(languageDirection) {
  document.documentElement.dir = languageDirection;
}

// Initialize language direction
const languageDirection = getLanguageDirection();

if (languageDirection) {
  setLanguageDirectionInBrowser(languageDirection);
} else {
  const preferenceLanguageDirection = getLanguageDirectionInBrowser();

  storeLanguageDirection(preferenceLanguageDirection);
  setLanguageDirectionInBrowser(preferenceLanguageDirection);
}
