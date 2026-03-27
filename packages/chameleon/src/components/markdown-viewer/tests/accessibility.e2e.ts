import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";

import "../markdown-viewer.lit.js";
import type { ChMarkdownViewer } from "../markdown-viewer.lit";

describe("[ch-markdown-viewer][accessibility]", () => {
  let markdownViewerRef: ChMarkdownViewer;

  beforeEach(async () => {
    render(html`<ch-markdown-viewer></ch-markdown-viewer>`);
    markdownViewerRef = document.querySelector("ch-markdown-viewer")!;
    await markdownViewerRef.updateComplete;
  });

  afterEach(cleanup);

  it("should render semantic heading elements for markdown headings", async () => {
    markdownViewerRef.value = "# Heading 1\n\n## Heading 2\n\n### Heading 3";
    await markdownViewerRef.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    const shadow = markdownViewerRef.shadowRoot!;
    expect(shadow.querySelector("h1")).toBeTruthy();
    expect(shadow.querySelector("h2")).toBeTruthy();
    expect(shadow.querySelector("h3")).toBeTruthy();
  });

  it("should render semantic list elements for markdown lists", async () => {
    markdownViewerRef.value = "- Item 1\n- Item 2";
    await markdownViewerRef.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    const shadow = markdownViewerRef.shadowRoot!;
    expect(shadow.querySelector("ul")).toBeTruthy();
    expect(shadow.querySelectorAll("li").length).toBe(2);
  });

  it("should render semantic ordered list elements", async () => {
    markdownViewerRef.value = "1. First\n2. Second";
    await markdownViewerRef.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    const shadow = markdownViewerRef.shadowRoot!;
    expect(shadow.querySelector("ol")).toBeTruthy();
    expect(shadow.querySelectorAll("li").length).toBe(2);
  });

  it("should render links with href attributes", async () => {
    markdownViewerRef.value = "[Example](https://example.com)";
    await markdownViewerRef.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    const shadow = markdownViewerRef.shadowRoot!;
    const link = shadow.querySelector("a");
    expect(link).toBeTruthy();
    expect(link!.getAttribute("href")).toBe("https://example.com");
  });

  it("should render images with alt attributes", async () => {
    markdownViewerRef.value = "![Alt text](image.png)";
    await markdownViewerRef.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    const shadow = markdownViewerRef.shadowRoot!;
    const img = shadow.querySelector("img");
    expect(img).toBeTruthy();
    expect(img!.getAttribute("alt")).toBe("Alt text");
  });

  it("should render blockquote elements for markdown blockquotes", async () => {
    markdownViewerRef.value = "> This is a quote";
    await markdownViewerRef.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    const shadow = markdownViewerRef.shadowRoot!;
    expect(shadow.querySelector("blockquote")).toBeTruthy();
  });

  it("should render table elements for markdown tables", async () => {
    markdownViewerRef.value =
      "| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |";
    await markdownViewerRef.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    const shadow = markdownViewerRef.shadowRoot!;
    expect(shadow.querySelector("table")).toBeTruthy();
    expect(shadow.querySelector("th")).toBeTruthy();
    expect(shadow.querySelector("td")).toBeTruthy();
  });
});
