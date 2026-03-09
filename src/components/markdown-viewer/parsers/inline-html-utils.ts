import type { Paragraph } from "mdast";

/**
 * Scans the phrasing children of a paragraph in a single pass and returns
 * their concatenated string value when every child is either a plain `text`
 * node or an inline `html` node **and** at least one `html` node is present.
 *
 * Returns `null` in any of the following cases:
 * - No inline html nodes are found (plain-text paragraph → normal rendering).
 * - At least one child requires full tree rendering (strong, em, link, …).
 *
 * ## Why this is needed
 * When a markdown paragraph contains inline HTML tags (e.g. `<br/>`, `<ul>`,
 * `<li>`) CommonMark parses each tag as a separate `html` node. Processing
 * them individually causes each fragment to be parsed as a standalone HTML
 * document, so a lone `<ul>` becomes an empty element and its text content
 * ends up as a sibling text node instead of being inside the list item.
 * Concatenating all children first and rendering the result as a single raw
 * HTML block preserves the intended structure.
 */
export const getInlineHtmlContent = (paragraph: Paragraph): string | null => {
  let raw = "";
  let hasInlineHtml = false;

  for (const child of paragraph.children) {
    if (child.type === "text" || child.type === "html") {
      if (child.type === "html") {
        hasInlineHtml = true;
      }
      raw += child.value;
    } else {
      // Formatted content (strong, em, link, …) cannot be flattened to a
      // plain string, so fall back to the regular rendering path.
      return null;
    }
  }

  // Only override the default rendering when inline HTML is actually present;
  // plain-text-only paragraphs go through the regular renderChildren path.
  return hasInlineHtml ? raw : null;
};
