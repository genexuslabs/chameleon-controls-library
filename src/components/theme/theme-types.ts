export type ThemeModel = string | string[] | ThemeItemModel | ThemeItemModel[];

export type ThemeItemModel = {
  name: string;
  url?: string;
  themeBaseUrl?: string;
  attachStyleSheet?: boolean;
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
