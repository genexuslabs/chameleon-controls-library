import { removeElement } from "../../common/array";

const THEMES = new Map<string, Theme>();

type Theme = {
  elements: HTMLChThemeElement[];
  styleSheet: CSSStyleSheet;
};

/**
 * Event interface for when a theme is loaded.
 */
export interface ChThemeLoadedEvent {
  name: string;
}

const isEnableTheme = (theme: Theme): boolean => !theme.styleSheet.disabled;

/**
 * Initializes a theme instance within the Document or ShadowRoot to which the HTMLChThemeElement belongs.
 * If the HTMLChThemeElement indicates the source of the theme, it loads the theme.
 */
export function instanceTheme(el: HTMLChThemeElement) {
  const theme = addTheme(el);

  /**
   * Loads the theme asynchronously if the HTMLChThemeElement has a URL or inline CSS text.
   * If the source is a URL, skips loading if the URL has already been loaded by another HTMLChThemeElement.
   */
  loadTheme(el, theme).then(loaded => {
    if (loaded) {
      enableTheme(theme);
      attachTheme(el, theme);
      setLoadedAllTheme(theme);
    }
  });

  /**
   * Add the theme to the Document or ShadowRoot.
   * If the theme is enabled, set a flag indicating it's been loaded.
   * The theme is initially added in a disabled state if it hasn't loaded
   * by another HTMLChThemeElement or if current instance is pending the loadTheme execution.
   */
  attachTheme(el, theme);
  if (isEnableTheme(theme)) {
    setLoadedTheme(el);
  }
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

function addTheme(el: HTMLChThemeElement): Theme {
  let theme: Theme;

  if (THEMES.has(el.name)) {
    theme = THEMES.get(el.name);
  } else {
    theme = {
      elements: [],
      styleSheet: new CSSStyleSheet({ disabled: true })
    };
    THEMES.set(el.name, theme);
  }
  THEMES.get(el.name).elements.push(el);

  return theme;
}

async function loadTheme(
  el: HTMLChThemeElement,
  theme: Theme
): Promise<boolean> {
  let load = false;

  if (typeof el.href === "string" && el.href.trim() !== "") {
    load = await appendThemeStyleSheetUrl(el, theme);
  } else if (!el.innerText.match(/^\s*$/)) {
    load = await appendThemeStyleSheetText(el, theme);
  }

  return load;
}

function attachTheme(el: HTMLChThemeElement, theme: Theme) {
  const root = el.getRootNode();

  if (root instanceof Document || root instanceof ShadowRoot) {
    if (!root.adoptedStyleSheets.includes(theme.styleSheet)) {
      root.adoptedStyleSheets.push(theme.styleSheet);
    }
  }
}

function enableTheme(theme: Theme) {
  theme.styleSheet.disabled = false;
}

function setLoadedTheme(el: HTMLChThemeElement) {
  el.loaded = true;
}

function setLoadedAllTheme(theme: Theme) {
  theme.elements.forEach(el => (el.loaded = true));
}

function appendThemeStyleSheetText(
  el: HTMLChThemeElement,
  theme: Theme
): Promise<boolean> {
  return new Promise(async resolve => {
    try {
      resolve(appendCssText(theme.styleSheet, el.innerText));
    } catch (error) {
      resolve(false);
    }
  });
}

async function appendThemeStyleSheetUrl(
  el: HTMLChThemeElement,
  theme: Theme
): Promise<boolean> {
  return new Promise(async resolve => {
    if (theme.elements.some(item => item !== el && item.href === el.href)) {
      resolve(false);
      return;
    }

    try {
      resolve(
        appendCssText(theme.styleSheet, await requestStyleSheet(el.href))
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
