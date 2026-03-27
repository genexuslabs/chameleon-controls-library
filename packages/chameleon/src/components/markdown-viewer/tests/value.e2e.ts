import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";

import "../markdown-viewer.lit.js";
import type { ChMarkdownViewer } from "../markdown-viewer.lit";

const LAST_NESTED_CHILD_CLASS = "last-nested-child";

/**
 * Helper to get the rendered HTML inside the shadow root, excluding
 * Lit comment nodes and the ch-theme element.
 */
const getRenderedContent = (el: ChMarkdownViewer): string => {
  const shadow = el.shadowRoot!;
  const nodes = Array.from(shadow.childNodes).filter(
    node =>
      node.nodeType !== Node.COMMENT_NODE &&
      (node as Element).tagName !== "CH-THEME"
  );
  return nodes.map(n => (n as Element).outerHTML ?? n.textContent).join("");
};

/**
 * Test data generator: returns tuples of [markdownInput, expectedHTML, description].
 */
const getTestData: (text: string) => [string, string, string][] = text => [
  [`# ${text}`, `<h1 class="${LAST_NESTED_CHILD_CLASS}">${text}</h1>`, "the h1"],
  [
    `## ${text}`,
    `<h2 class="${LAST_NESTED_CHILD_CLASS}">${text}</h2>`,
    "the h2"
  ],
  [
    `### ${text}`,
    `<h3 class="${LAST_NESTED_CHILD_CLASS}">${text}</h3>`,
    "the h3"
  ],
  [
    `#### ${text}`,
    `<h4 class="${LAST_NESTED_CHILD_CLASS}">${text}</h4>`,
    "the h4"
  ],
  [
    `##### ${text}`,
    `<h5 class="${LAST_NESTED_CHILD_CLASS}">${text}</h5>`,
    "the h5"
  ],
  [
    `###### ${text}`,
    `<h6 class="${LAST_NESTED_CHILD_CLASS}">${text}</h6>`,
    "the h6"
  ],
  [
    `${text}`,
    `<p class="${LAST_NESTED_CHILD_CLASS}">${text}</p>`,
    "the paragraph"
  ],
  [
    `_${text}_`,
    `<em class="${LAST_NESTED_CHILD_CLASS}">${text}</em>`,
    "with italic (underscore)"
  ],
  [
    `*${text}*`,
    `<em class="${LAST_NESTED_CHILD_CLASS}">${text}</em>`,
    "with italic (asterisk)"
  ],
  [
    `__${text}__`,
    `<strong class="${LAST_NESTED_CHILD_CLASS}">${text}</strong>`,
    "with bold (underscore)"
  ],
  [
    `**${text}**`,
    `<strong class="${LAST_NESTED_CHILD_CLASS}">${text}</strong>`,
    "with bold (asterisk)"
  ],
  [
    `> ${text}`,
    `<p class="${LAST_NESTED_CHILD_CLASS}">${text}</p>`,
    "the blockquote content"
  ],
  [
    `- ${text}`,
    `<p class="${LAST_NESTED_CHILD_CLASS}">${text}</p>`,
    "the ul list item content"
  ],
  [
    `1. ${text}`,
    `<p class="${LAST_NESTED_CHILD_CLASS}">${text}</p>`,
    "the ol list item content"
  ],
  [
    `[${text}](https://example.com)`,
    `${text}`,
    "the hyperlink text"
  ]
];

describe("[ch-markdown-viewer][value]", () => {
  let markdownViewerRef: ChMarkdownViewer;

  beforeEach(async () => {
    render(html`<ch-markdown-viewer></ch-markdown-viewer>`);
    markdownViewerRef = document.querySelector("ch-markdown-viewer")!;
    await markdownViewerRef.updateComplete;
  });

  afterEach(cleanup);

  const testValueRender = (
    value: string,
    expectedContent: string,
    description: string,
    valueDescription?: string
  ) => {
    it(`should render ${description} when the "value" property is "${
      valueDescription ?? value
    }"`, async () => {
      markdownViewerRef.value = value;
      await markdownViewerRef.updateComplete;
      // Allow async markdown parsing to complete
      await new Promise(resolve => setTimeout(resolve, 50));
      await markdownViewerRef.updateComplete;

      const renderedContent = getRenderedContent(markdownViewerRef);
      expect(renderedContent).toContain(expectedContent);
    });
  };

  getTestData("Hello").forEach(data =>
    testValueRender(data[0], data[1], data[2])
  );

  getTestData("Hello world").forEach(data =>
    testValueRender(data[0], data[1], data[2])
  );

  /**
   * These test cases validate that the root doesn't throw when trying to
   * render empty children, using an actual value with special characters.
   */
  const testThrowEmptyChildren = (description: string, value: string) =>
    it(`should not throw when the value ("${description}") is defined but the root has empty children`, async () => {
      markdownViewerRef.value = value;
      await markdownViewerRef.updateComplete;
      // Allow async markdown parsing to complete
      await new Promise(resolve => setTimeout(resolve, 50));
      await markdownViewerRef.updateComplete;
    });

  testThrowEmptyChildren("\\n\\n", "\n\n");
  testThrowEmptyChildren("\\r\\n", "\r\n");
  testThrowEmptyChildren("\\r\\r", "\r\r");
  testThrowEmptyChildren("%0A%0A", "%0A%0A");
  testThrowEmptyChildren("- \\n\\n", "- \n\n");
  testThrowEmptyChildren("> \\n\\n", "> \n\n");
  testThrowEmptyChildren("- \\r\\n", "- \r\n");
  testThrowEmptyChildren("> \\r\\n", "> \r\n");
  testThrowEmptyChildren("- \\r\\r", "- \r\r");
  testThrowEmptyChildren("> \\r\\r", "> \r\r");
  testThrowEmptyChildren("- %0A%0A", "- %0A%0A");
  testThrowEmptyChildren("> %0A%0A", "> %0A%0A");

  it('should render nothing when value is "\\n\\n"', async () => {
    markdownViewerRef.value = "\n\n";
    await markdownViewerRef.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    const renderedContent = getRenderedContent(markdownViewerRef);
    expect(renderedContent).toBe("");
  });

  it('should render nothing when value is "\\r\\n"', async () => {
    markdownViewerRef.value = "\r\n";
    await markdownViewerRef.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    const renderedContent = getRenderedContent(markdownViewerRef);
    expect(renderedContent).toBe("");
  });

  // TODO: Add the previous e2e test for validating the crash in the ch-code
  // TODO: Add unit test for updating the value at runtime
  // TODO: Add unit test for checking that the DOM is reused
  // TODO: Add unit test for checking the ch-code value bindings
});
