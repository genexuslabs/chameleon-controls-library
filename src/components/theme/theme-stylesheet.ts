import {
  Theme,
  ThemeItemModel,
  ThemeItemModelStyleSheet,
  ThemeItemModelUrl
} from "./theme-types";

const THEMES = new Map<string, Promise<Theme>>();
const PROMISE_RESOLVER = new Map<string, ThemePromiseResolver>();

const BASEURL_REGEX =
  /(url\((?!\s*["']?(?:\/|https?:|data:))\s*["']?)([^'")]+)/g;

type ThemePromiseResolver = {
  name: string;
  resolve: (value: Theme) => void;
  reject: (reason?: any) => void;
  timeout: NodeJS.Timeout;
  isLoading: boolean;
};

const createStyleSheetFromString = (
  baseUrl: string | undefined,
  cssText: string
) => new CSSStyleSheet().replace(applyBaseUrl(baseUrl, cssText));

export async function getTheme(
  themeModel: ThemeItemModel,
  timeout: number
): Promise<Theme> {
  // If it has an inlined styleSheet, directly resolve the promise
  if ((themeModel as ThemeItemModelStyleSheet).styleSheet) {
    return Promise.resolve({
      name: themeModel.name,
      styleSheet: await createStyleSheetFromString(
        themeModel.themeBaseUrl,
        (themeModel as ThemeItemModelStyleSheet).styleSheet
      )
    });
  }

  const promise =
    THEMES.get(themeModel.name) ??
    THEMES.set(
      themeModel.name,
      createThemePromise(themeModel.name, timeout)
    ).get(themeModel.name);

  // TODO: Check if this works properly with inline stylesheets
  if ((themeModel as ThemeItemModelUrl).url) {
    instanceTheme(themeModel);
  }

  return promise;
}

function createThemePromise(name: string, timeout: number): Promise<Theme> {
  return new Promise<Theme>((resolve, reject) => {
    PROMISE_RESOLVER.set(name, {
      name,
      resolve,
      reject,
      timeout: setTimeout(() => promiseTimeout(name), timeout),
      isLoading: false
    });
  });
}

function resolvePromise(resolver: ThemePromiseResolver, value: Theme) {
  disposeResolver(resolver);
  resolver.resolve(value);
}

function rejectPromise(resolver: ThemePromiseResolver, error: Error) {
  disposeResolver(resolver);
  resolver.reject(error);
}

function promiseTimeout(name: string) {
  const resolver = PROMISE_RESOLVER.get(name);
  if (resolver) {
    rejectPromise(resolver, new Error(`Theme load timeout: ${name}`));
  }
}

function disposeResolver(resolver: ThemePromiseResolver) {
  clearTimeout(resolver.timeout);
  PROMISE_RESOLVER.delete(resolver.name);
}

async function instanceTheme(themeModel: ThemeItemModelUrl) {
  const resolver = PROMISE_RESOLVER.get(themeModel.name);

  if (resolver && !resolver.isLoading) {
    resolver.isLoading = true;

    try {
      const styleSheet = await loadThemeStyleSheet(
        themeModel.url,
        themeModel.themeBaseUrl
      );
      resolvePromise(resolver, { name: themeModel.name, styleSheet });
    } catch (error) {
      rejectPromise(resolver, error);
    }
  }
}

async function loadThemeStyleSheet(
  url: string,
  baseUrl: string
): Promise<CSSStyleSheet> {
  try {
    return createStyleSheetFromString(baseUrl, await requestStyleSheet(url));
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

function applyBaseUrl(baseUrl: string | undefined, cssText: string): string {
  if (baseUrl) {
    return cssText.replace(BASEURL_REGEX, `$1${baseUrl}$2`);
  }
  return cssText;
}
