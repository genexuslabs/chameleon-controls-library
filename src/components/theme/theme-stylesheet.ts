import { removeElement } from "../../common/array";

const THEMES = new Map<string, Theme>();
const BASEURL_REGEX =
  /(url\((?!\s*["']?(?:\/|https?:|data:))\s*["']?)([^'")]+)/g;

type Theme = {
  elements: HTMLChThemeElement[];
  styleSheet?: CSSStyleSheet;
};

/**
 * Event interface for when a theme is loaded.
 */
export interface ChThemeLoadedEvent {
  name: string;
}

const isEnabledTheme = (theme: Theme): boolean =>
  theme.styleSheet ? !theme.styleSheet.disabled : false;

/**
 * Initializes a theme instance within the Document or ShadowRoot to which the HTMLChThemeElement belongs.
 * If the HTMLChThemeElement indicates the source of the theme, it loads the theme.
 */
export function instanceTheme(el: HTMLChThemeElement) {
  const theme = addThemeElement(el);

  /**
   * If the theme is already loaded and enabled,
   * just attach it and mark as loaded in HTMLChThemeElement context
   */
  if (isEnabledTheme(theme)) {
    attachTheme(el, theme);
    setLoadedTheme(el);
    return;
  }

  /**
   * Otherwise, load the theme asynchronously,
   * then attach it and mark as loaded in all HTMLChThemeElement contexts
   */
  loadTheme(el, theme).then(loaded => {
    if (loaded) {
      enableTheme(theme);
      attachAllTheme(theme);
      setLoadedAllTheme(theme);
    }
  });
}

/**
 * Removes a theme element.
 * @param el The HTMLChThemeElement to remove the theme from.
 */
export function removeThemeElement(el: HTMLChThemeElement) {
  const theme = THEMES.get(el.name);
  const index = theme.elements.indexOf(el);

  if (theme && index >= 0) {
    removeElement(theme.elements, index);
  }
}

function addThemeElement(el: HTMLChThemeElement): Theme {
  const theme =
    THEMES.get(el.name) ?? THEMES.set(el.name, { elements: [] }).get(el.name);

  theme.elements.push(el);

  return theme;
}

async function loadTheme(
  el: HTMLChThemeElement,
  theme: Theme
): Promise<boolean> {
  let loaded = false;

  if (
    typeof el.href === "string" &&
    el.href.trim() !== "" &&
    !theme.elements.some(item => item !== el && item.href === el.href)
  ) {
    loaded = await appendThemeStyleSheetUrl(
      el.href,
      getThemeStyleSheet(el, theme),
      el.baseUrl
    );
  } else if (!el.innerText.match(/^\s*$/)) {
    loaded = await appendThemeStyleSheetText(
      el.innerText,
      getThemeStyleSheet(el, theme),
      el.baseUrl
    );
  }

  return loaded;
}

function getThemeStyleSheet(el: HTMLChThemeElement, theme: Theme) {
  theme.styleSheet ||= new CSSStyleSheet({
    disabled: true,
    baseURL: el.baseUrl
  });

  return theme.styleSheet;
}

function attachTheme(el: HTMLChThemeElement, theme: Theme) {
  const root = el.getRootNode();

  if (root instanceof Document || root instanceof ShadowRoot) {
    if (!root.adoptedStyleSheets.includes(theme.styleSheet)) {
      root.adoptedStyleSheets.push(theme.styleSheet);
    }
  }
}

function attachAllTheme(theme: Theme) {
  theme.elements.forEach(el => attachTheme(el, theme));
}

function enableTheme(theme: Theme) {
  theme.styleSheet.disabled = false;
}

function setLoadedTheme(el: HTMLChThemeElement) {
  el.loaded = true;
}

function setLoadedAllTheme(theme: Theme) {
  theme.elements.forEach(el => setLoadedTheme(el));
}

function appendThemeStyleSheetText(
  cssText: string,
  styleSheet: CSSStyleSheet,
  baseUrl: string
): Promise<boolean> {
  return new Promise(async resolve => {
    try {
      resolve(appendCssText(styleSheet, applyBaseUrl(baseUrl, cssText)));
    } catch (error) {
      resolve(false);
    }
  });
}

async function appendThemeStyleSheetUrl(
  url: string,
  styleSheet: CSSStyleSheet,
  baseUrl: string
): Promise<boolean> {
  return new Promise(async resolve => {
    try {
      resolve(
        appendCssText(
          styleSheet,
          applyBaseUrl(baseUrl, await requestStyleSheet(url))
        )
      );
    } catch (error) {
      resolve(false);
    }
  });
}

async function requestStyleSheet(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (response.ok) {
      return await response.text();
    }
    throw new Error("Network response was not ok.");
  } catch (error) {
    throw error;
  }
}

function appendCssText(
  themeStyleSheet: CSSStyleSheet,
  cssText: string
): Promise<boolean> {
  return new Promise(async resolve => {
    try {
      const parserStyleSheet = await new CSSStyleSheet({
        disabled: true
      }).replace(cssText);

      for (const cssRule of parserStyleSheet.cssRules) {
        themeStyleSheet.insertRule(cssRule.cssText);
      }

      resolve(true);
    } catch (error) {
      resolve(false);
    }
  });
}

function applyBaseUrl(baseUrl: string, cssText: string): string {
  if (baseUrl) {
    return cssText.replace(BASEURL_REGEX, `$1${baseUrl}$2`);
  }
  return cssText;
}
