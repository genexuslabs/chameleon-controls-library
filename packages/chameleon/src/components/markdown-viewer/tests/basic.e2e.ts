import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";

import "../markdown-viewer.lit.js";
import type { ChMarkdownViewer } from "../markdown-viewer.lit";

describe("[ch-markdown-viewer][basic]", () => {
  let markdownViewerRef: ChMarkdownViewer;

  beforeEach(async () => {
    render(html`<ch-markdown-viewer></ch-markdown-viewer>`);
    markdownViewerRef = document.querySelector("ch-markdown-viewer")!;
    await markdownViewerRef.updateComplete;
  });

  afterEach(cleanup);

  it("should have Shadow DOM", () => {
    expect(markdownViewerRef.shadowRoot).toBeTruthy();
  });

  it("should render empty by default", () => {
    // When no value is set, nothing should be rendered in the shadow root
    // (aside from possible Lit comment nodes)
    const children = Array.from(
      markdownViewerRef.shadowRoot!.childNodes
    ).filter(
      node =>
        node.nodeType !== Node.COMMENT_NODE &&
        (node.nodeType !== Node.TEXT_NODE || node.textContent!.trim() !== "")
    );
    expect(children.length).toBe(0);
  });

  // Default property values
  it("should have 'avoidFlashOfUnstyledContent' default to false", () => {
    expect(markdownViewerRef.avoidFlashOfUnstyledContent).toBe(false);
  });

  it("should have 'extensions' default to undefined", () => {
    expect(markdownViewerRef.extensions).toBeUndefined();
  });

  it("should have 'rawHtml' default to false", () => {
    expect(markdownViewerRef.rawHtml).toBe(false);
  });

  it("should have 'renderCode' default to undefined", () => {
    expect(markdownViewerRef.renderCode).toBeUndefined();
  });

  it("should have 'showIndicator' default to false", () => {
    expect(markdownViewerRef.showIndicator).toBe(false);
  });

  it("should have 'theme' default to 'ch-markdown-viewer'", () => {
    expect(markdownViewerRef.theme).toBe("ch-markdown-viewer");
  });

  it("should have 'value' default to undefined", () => {
    expect(markdownViewerRef.value).toBeUndefined();
  });
});
