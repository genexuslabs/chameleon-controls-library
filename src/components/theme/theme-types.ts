export type ThemeModel = string | string[] | ThemeItemModel | ThemeItemModel[];

export type ThemeItemModel = {
  name: string;
  href?: string;
  baseUrl?: string;
};

export type Theme = {
  name: string;
  styleSheet: CSSStyleSheet;
};

/**
 * Event interface for when a theme is loaded.
 */
export interface ChThemeLoadedEvent {
  name: string;
}
