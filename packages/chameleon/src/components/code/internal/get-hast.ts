import { codeToHast } from "shiki/core";
import { loadCodeLanguage } from "./language-loader";
import { highlighter } from "./highlighter";

export const getHast = async (code: string, language: string) => {
  const actualLanguage = await loadCodeLanguage(highlighter, language);

  return codeToHast(highlighter, code, {
    lang: actualLanguage,
    theme: "chameleon-theme"
  });
};
