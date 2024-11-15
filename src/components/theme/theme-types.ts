export type ThemeModel = string | string[] | ThemeItemModel | ThemeItemModel[];

export type ThemeItemBaseModel = {
  name: string;
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
