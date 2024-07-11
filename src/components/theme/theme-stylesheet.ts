import { Theme, ThemeItemModel } from "./theme-types";

const THEMES = new Map<string, Promise<Theme>>();
const PROMISE_RESOLVER = new Map<string, ThemePromiseResolver>();

const BASEURL_REGEX =
  /(url\((?!\s*["']?(?:\/|https?:|data:))\s*["']?)([^'")]+)/g;

type ThemePromiseResolver = {
  resolve: (value: Theme) => void;
  reject: (reason?: any) => void;
};

export async function getTheme(
  themeModel: ThemeItemModel,
  timeout: number
): Promise<Theme> {
  const promise =
    THEMES.get(themeModel.name) ??
    THEMES.set(themeModel.name, createThemePromise(themeModel.name)).get(
      themeModel.name
    );

  if (themeModel.url) {
    instanceTheme(themeModel, PROMISE_RESOLVER.get(themeModel.name));
  } else {
    setThemeLoadTimeout(themeModel.name, timeout);
  }

  return promise;
}

function createThemePromise(name: string): Promise<Theme> {
  return new Promise<Theme>((resolve, reject) => {
    PROMISE_RESOLVER.set(name, { resolve, reject });
  });
}

async function instanceTheme(
  themeModel: ThemeItemModel,
  resolver: ThemePromiseResolver
) {
  try {
    const styleSheet = await loadThemeStyleSheet(
      themeModel.url,
      themeModel.themeBaseUrl
    );
    resolver.resolve({ name: themeModel.name, styleSheet });
  } catch (error) {
    resolver.reject(error);
  }
}

function setThemeLoadTimeout(name: string, timeout: number) {
  setTimeout(() => {
    const resolver = PROMISE_RESOLVER.get(name);
    if (resolver) {
      resolver.reject(
        new Error(
          `Theme load timeout: ${name} was not loaded within ${timeout}ms`
        )
      );
      PROMISE_RESOLVER.delete(name);
      THEMES.delete(name);
    }
  }, timeout);
}

async function loadThemeStyleSheet(
  url: string,
  baseUrl: string
): Promise<CSSStyleSheet> {
  try {
    return new CSSStyleSheet().replace(
      applyBaseUrl(baseUrl, await requestStyleSheet(url))
    );
  } catch (error) {
    throw new Error(`Failed to load theme stylesheet: ${error}`);
  }
}

async function requestStyleSheet(url: string): Promise<string> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    throw new Error(`Failed to fetch stylesheet: ${error.message}`);
  }
}

function applyBaseUrl(baseUrl: string, cssText: string): string {
  if (baseUrl) {
    return cssText.replace(BASEURL_REGEX, `$1${baseUrl}$2`);
  }
  return cssText;
}
