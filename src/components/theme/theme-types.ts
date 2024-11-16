export type ThemeModel = string | string[] | ThemeItemModel | ThemeItemModel[];

export type ThemeItemBaseModel = {
  name: string;

  /**
   * Specifies a base URL to set on each URL of the downloaded stylesheet.
   * This is useful when the stylesheet contains relative URLs that need to be
   * transformed into absolute URLs, but the base resolution is only known at
   * runtime.
   *
   * @example
   * const baseUrl = "https://example.com/"
   * const stylesheet = "background-image: url(images/background.png);"
   *
   * result: "background-image: url(https://example.com/images/background.png);"
   */
  themeBaseUrl?: string;
  attachStyleSheet?: boolean;
};

export type ThemeItemModel = ThemeItemModelUrl | ThemeItemModelStyleSheet;

export type ThemeItemModelUrl = ThemeItemBaseModel & {
  url?: string;
};

export type ThemeItemModelStyleSheet = ThemeItemBaseModel & {
  styleSheet: string;
};

export type Theme = {
  name: string;
  styleSheet: CSSStyleSheet;
};

/**
 * Event interface for when a theme is loaded.
 */
export interface ChThemeLoadedEvent {
  success: string[];
}
