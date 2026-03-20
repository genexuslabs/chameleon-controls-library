import { codeToHast } from "shiki/core";
import { highlighter } from "./highlighter";
import { loadCodeLanguage } from "./language-loader";
import { loadCodeTheme } from "./theme-loader";

export const getHast = async (
  code: string,
  language: string,
  theme: string
) => {
  const [actualLanguage, actualTheme] = await Promise.all([
    loadCodeLanguage(highlighter, language),
    loadCodeTheme(highlighter, theme)
  ]);

  return codeToHast(highlighter, code, {
    lang: actualLanguage,
    theme: actualTheme
  });
};
