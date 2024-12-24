const ESCAPE_SPECIAL_CHARS_REGEX = /[.*+?^${}()|[\]\\]/g;
const GLOBAL_SEARCH_NO_CASE_SENSITIVE = "gi";

const escapeSpecialCharacters = (str: string) =>
  str.replace(ESCAPE_SPECIAL_CHARS_REGEX, "\\$&");

/**
 * Highlights the character(s) that match(es) the filter value.
 * @param text String to find the filter value on
 * @param filter Filter value
 */
export const highlightCharacters = (
  text: string,
  filter: string
): TextBlockHighlightedCharacters => {
  const escapedFilter = escapeSpecialCharacters(filter);

  const regexToMatchCharacters = new RegExp(
    `(${escapedFilter})`,
    GLOBAL_SEARCH_NO_CASE_SENSITIVE
  );

  // Split the text into parts based on the regex
  const parts = text.split(regexToMatchCharacters);

  // Map the parts to know which one must be highlighted
  return parts.map(text => ({
    text,
    highlight: regexToMatchCharacters.test(text)
  }));
};

export type TextBlockHighlightedCharacters = {
  text: string;
  highlight: boolean;
}[];
