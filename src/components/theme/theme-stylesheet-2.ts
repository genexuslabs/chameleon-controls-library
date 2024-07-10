import { Theme, ThemeItemModel } from "./theme-types";

const THEMES = new Map<string, Promise<Theme>>();
const PROMISE_RESOLVER = new Map<string, ThemePromiseResolver>();

const BASEURL_REGEX =
  /(url\((?!\s*["']?(?:\/|https?:|data:))\s*["']?)([^'")]+)/g;

type ThemePromiseResolver = {
  resolve: (value: Theme) => void;
  reject: (reason?: any) => void;
};

export async function getTheme(themeModel: ThemeItemModel): Promise<Theme> {
  const promise =
    THEMES.get(themeModel.name) ??
    THEMES.set(themeModel.name, createThemePromise(themeModel.name)).get(
      themeModel.name
    );

  if (themeModel.href) {
    instanceTheme(themeModel, PROMISE_RESOLVER.get(themeModel.name));
  }

  return promise;
}

function createThemePromise(name: string): Promise<Theme> {
  return new Promise<Theme>((resolve, reject) => {
    PROMISE_RESOLVER.set(name, { resolve, reject });
  });
}

function instanceTheme(
  themeModel: ThemeItemModel,
  resolver: ThemePromiseResolver
) {
  loadThemeStyleSheet(themeModel.href, themeModel.baseUrl).then(styleSheet => {
    resolver.resolve({ name: themeModel.name, styleSheet });
  });
}

async function loadThemeStyleSheet(
  url: string,
  baseUrl: string
): Promise<CSSStyleSheet> {
  return new Promise<CSSStyleSheet>(async resolve => {
    const styleSheet = new CSSStyleSheet();
    styleSheet.replace(applyBaseUrl(baseUrl, await requestStyleSheet(url)));
    resolve(styleSheet);
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

function applyBaseUrl(baseUrl: string, cssText: string): string {
  if (baseUrl) {
    return cssText.replace(BASEURL_REGEX, `$1${baseUrl}$2`);
  }
  return cssText;
}
