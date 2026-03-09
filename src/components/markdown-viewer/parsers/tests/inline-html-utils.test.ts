import { getInlineHtmlContent } from "../inline-html-utils";
import type { Paragraph } from "mdast";

// Raw HTML from the bug report: a paragraph produced by CommonMark when text
// and HTML appear on consecutive lines without a blank line between them.
const BUG_REPORT_HTML =
  "<br/><ul>" +
  "<li><a href='https://example.com/document/doc-001#page=2' target='_blank'>Document.pdf</a>" +
  "<ul><q><i>............................</i></q></ul></li>" +
  "<li><a href='https://example.com/document/doc-001#page=17' target='_blank'>Document.pdf</a>" +
  "<ul><q><i>............................</i></q></ul></li>" +
  "</ul>";

// Helper to build a Paragraph node with the given children.
// Position data is omitted since getInlineHtmlContent never reads it.
const makeParagraph = (...children: Paragraph["children"]): Paragraph => ({
  type: "paragraph",
  children
});

const textNode = (value: string) =>
  ({ type: "text", value } as const);

const htmlNode = (value: string) =>
  ({ type: "html", value } as const);

describe("getInlineHtmlContent", () => {
  describe("returns null — fall through to normal rendering", () => {
    it("returns null for a plain-text-only paragraph", () => {
      const paragraph = makeParagraph(textNode("Hello world"));
      expect(getInlineHtmlContent(paragraph)).toBeNull();
    });

    it("returns null for an empty paragraph", () => {
      const paragraph = makeParagraph();
      expect(getInlineHtmlContent(paragraph)).toBeNull();
    });

    it("returns null when a formatted node (strong) is present alongside html", () => {
      const paragraph = makeParagraph(
        { type: "strong", children: [textNode("bold")] },
        htmlNode("<br/>")
      );
      expect(getInlineHtmlContent(paragraph)).toBeNull();
    });

    it("returns null when a formatted node (emphasis) is present alongside html", () => {
      const paragraph = makeParagraph(
        htmlNode("<br/>"),
        { type: "emphasis", children: [textNode("italic")] }
      );
      expect(getInlineHtmlContent(paragraph)).toBeNull();
    });

    it("returns null when a link node is present alongside html", () => {
      const paragraph = makeParagraph(
        htmlNode("<span>"),
        { type: "link", url: "https://example.com", children: [textNode("click")] }
      );
      expect(getInlineHtmlContent(paragraph)).toBeNull();
    });

    it("returns null when a formatted node appears before any html node (early exit)", () => {
      // Even though html nodes follow, the early exit must fire on the first
      // non-text/html child so the rest of the array is not iterated.
      const paragraph = makeParagraph(
        { type: "strong", children: [textNode("bold")] },
        htmlNode("<ul>"),
        htmlNode("</ul>")
      );
      expect(getInlineHtmlContent(paragraph)).toBeNull();
    });
  });

  describe("returns concatenated string — inline html rendering path", () => {
    it("returns the html value for a single html-only node", () => {
      const paragraph = makeParagraph(htmlNode("<br/>"));
      expect(getInlineHtmlContent(paragraph)).toBe("<br/>");
    });

    it("concatenates text and html nodes in order", () => {
      const paragraph = makeParagraph(
        textNode("Hello: "),
        htmlNode("<br/>"),
        textNode(" world")
      );
      expect(getInlineHtmlContent(paragraph)).toBe("Hello: <br/> world");
    });

    it("concatenates multiple consecutive html nodes", () => {
      const paragraph = makeParagraph(
        htmlNode("<ul>"),
        htmlNode("<li>"),
        textNode("item"),
        htmlNode("</li>"),
        htmlNode("</ul>")
      );
      expect(getInlineHtmlContent(paragraph)).toBe(
        "<ul><li>item</li></ul>"
      );
    });

    it("preserves the full bug-report HTML structure verbatim", () => {
      // This is the exact MDAST paragraph that CommonMark produces for the
      // bug-report input (text + HTML on consecutive lines, no blank line).
      // The concatenated result must be passed to rawHTMLToJSX as a single
      // string so that links, list items and nested elements are rendered
      // correctly instead of as isolated, empty fragments.
      const paragraph = makeParagraph(
        textNode("I'm AGA html Agent this is raw:\n"),
        htmlNode("<br/>"),
        htmlNode("<ul>"),
        htmlNode("<li>"),
        htmlNode("<a href='https://example.com/document/doc-001#page=2' target='_blank'>"),
        textNode("Document.pdf"),
        htmlNode("</a>"),
        htmlNode("<ul>"),
        htmlNode("<q>"),
        htmlNode("<i>"),
        textNode("............................"),
        htmlNode("</i>"),
        htmlNode("</q>"),
        htmlNode("</ul>"),
        htmlNode("</li>"),
        htmlNode("<li>"),
        htmlNode("<a href='https://example.com/document/doc-001#page=17' target='_blank'>"),
        textNode("Document.pdf"),
        htmlNode("</a>"),
        htmlNode("<ul>"),
        htmlNode("<q>"),
        htmlNode("<i>"),
        textNode("............................"),
        htmlNode("</i>"),
        htmlNode("</q>"),
        htmlNode("</ul>"),
        htmlNode("</li>"),
        htmlNode("</ul>")
      );

      const result = getInlineHtmlContent(paragraph);

      expect(result).not.toBeNull();

      // The intro text must be preserved
      expect(result).toContain("I'm AGA html Agent this is raw:");

      // All HTML tags must survive verbatim
      expect(result).toContain("<br/>");
      expect(result).toContain("<ul>");
      expect(result).toContain("<li>");
      expect(result).toContain("target='_blank'");
      expect(result).toContain("<q>");
      expect(result).toContain("<i>");
      expect(result).toContain("page=2");
      expect(result).toContain("page=17");

      // The full HTML block must appear as a contiguous substring within the
      // result so that rawHTMLToJSX can parse it as a single document fragment.
      expect(result).toContain(BUG_REPORT_HTML);
    });
  });
});
