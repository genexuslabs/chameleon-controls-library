import type { ShikiInternal } from "shiki/core";
import { DEFAULT_CODE_LANGUAGE } from "../constants";
import { languageAliases } from "./language-aliases";
import { languageImplementationMapping } from "./language-implementation-mapping";

const languageWasLoaded = new Set([DEFAULT_CODE_LANGUAGE, "plaintext"]);

export const loadCodeLanguage = async (
  highlighter: ShikiInternal,
  language: string
): Promise<string> => {
  const actualLanguage =
    languageAliases[language as keyof typeof languageAliases] ?? language;

  // Cached language
  if (languageWasLoaded.has(actualLanguage)) {
    return actualLanguage;
  }
  const languageMapping = languageImplementationMapping[actualLanguage];

  // Language doesn't exists
  if (!languageMapping) {
    console.warn(
      // TODO: Explain how to implement the language
      `The language "${language}" it is not implemented in the \`ch-code\` component.`
    );
    return DEFAULT_CODE_LANGUAGE;
  }

  // Load the language and cache it
  await highlighter.loadLanguage(languageMapping());
  languageWasLoaded.add(actualLanguage);
  return actualLanguage;
};
