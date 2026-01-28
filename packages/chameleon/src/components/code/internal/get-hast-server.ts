import { codeToHast } from "shiki/core";
import { highlighter } from "./highlighter";
import { languageAliases } from "./language-aliases";

/**
 * This is a special getHast implementation, that only works in the server and
 * it assumes that all languages were previously downloaded.
 */
export const getHastInServer = (code: string, language: string) =>
  codeToHast(highlighter, code, {
    lang: languageAliases[language as keyof typeof languageAliases] ?? language,
    theme: "chameleon-theme"
  });
