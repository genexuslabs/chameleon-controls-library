import { codeToHast } from "shiki/core";
import { highlighter } from "./highlighter";
import { languageAliases } from "./language-aliases";
import { resolveThemeName } from "./theme-loader";

/**
 * This is a special getHast implementation, that only works in the server and
 * it assumes that all languages and themes were previously downloaded.
 */
export const getHastInServer = (
  code: string,
  language: string,
  theme: string
) =>
  codeToHast(highlighter, code, {
    lang: languageAliases[language as keyof typeof languageAliases] ?? language,
    theme: resolveThemeName(theme)
  });
