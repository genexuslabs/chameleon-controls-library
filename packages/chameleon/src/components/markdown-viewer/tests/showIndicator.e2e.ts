import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";

import "../markdown-viewer.lit.js";
import type { ChMarkdownViewer } from "../markdown-viewer.lit";

const CODE_ONLY = "```\nDummy code```";
const CODE_WITH_TEXT_AT_THE_END = "```\nDummy code\n```\nAnother text";

describe("[ch-markdown-viewer][showIndicator]", () => {
  let markdownViewerRef: ChMarkdownViewer;

  beforeEach(async () => {
    render(html`<ch-markdown-viewer></ch-markdown-viewer>`);
    markdownViewerRef = document.querySelector("ch-markdown-viewer")!;
    await markdownViewerRef.updateComplete;
  });

  afterEach(cleanup);

  it("should not have the indicator class by default", () => {
    expect(
      markdownViewerRef.classList.contains(
        "ch-markdown-viewer-show-indicator"
      )
    ).toBe(false);
  });

  it("should add the indicator class when showIndicator is true and value is set", async () => {
    markdownViewerRef.showIndicator = true;
    markdownViewerRef.value = "Hello";
    await markdownViewerRef.updateComplete;
    // Allow async markdown parsing to complete
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    expect(
      markdownViewerRef.classList.contains(
        "ch-markdown-viewer-show-indicator"
      )
    ).toBe(true);
  });

  it("should not have the indicator class when showIndicator is false and value is set", async () => {
    markdownViewerRef.showIndicator = false;
    markdownViewerRef.value = "Hello";
    await markdownViewerRef.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    expect(
      markdownViewerRef.classList.contains(
        "ch-markdown-viewer-show-indicator"
      )
    ).toBe(false);
  });

  it('when the ch-code is rendered not at the end its "showIndicator" property should be false by default', async () => {
    markdownViewerRef.value = CODE_WITH_TEXT_AT_THE_END;
    await markdownViewerRef.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    const codeRef =
      markdownViewerRef.shadowRoot!.querySelector("ch-code") as HTMLElement & {
        showIndicator: boolean;
      };
    if (codeRef) {
      expect(codeRef.showIndicator).toBe(false);
    }
  });

  it('when the ch-code is rendered at the end its "showIndicator" property should be false by default', async () => {
    markdownViewerRef.value = CODE_ONLY;
    await markdownViewerRef.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    const codeRef =
      markdownViewerRef.shadowRoot!.querySelector("ch-code") as HTMLElement & {
        showIndicator: boolean;
      };
    if (codeRef) {
      expect(codeRef.showIndicator).toBe(false);
    }
  });

  it('when the ch-code is rendered not at the end its "showIndicator" property should be false, even if the markdown-viewer has "showIndicator" = true', async () => {
    markdownViewerRef.showIndicator = true;
    markdownViewerRef.value = CODE_WITH_TEXT_AT_THE_END;
    await markdownViewerRef.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    const codeRef =
      markdownViewerRef.shadowRoot!.querySelector("ch-code") as HTMLElement & {
        showIndicator: boolean;
      };
    if (codeRef) {
      expect(codeRef.showIndicator).toBe(false);
    }
  });

  it('when the ch-code is rendered at the end its "showIndicator" property should be true, if the markdown-viewer has "showIndicator" = true', async () => {
    markdownViewerRef.showIndicator = true;
    markdownViewerRef.value = CODE_ONLY;
    await markdownViewerRef.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    const codeRef =
      markdownViewerRef.shadowRoot!.querySelector("ch-code") as HTMLElement & {
        showIndicator: boolean;
      };
    if (codeRef) {
      expect(codeRef.showIndicator).toBe(true);
    }
  });

  it("when the value is updated at runtime and showIndicator = true, the showIndicator should be removed from the ch-code", async () => {
    markdownViewerRef.showIndicator = true;
    markdownViewerRef.value = CODE_ONLY;
    await markdownViewerRef.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    // At this point, codeRef.showIndicator === true

    markdownViewerRef.value = CODE_WITH_TEXT_AT_THE_END;
    await markdownViewerRef.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    const codeRef =
      markdownViewerRef.shadowRoot!.querySelector("ch-code") as HTMLElement & {
        showIndicator: boolean;
      };
    if (codeRef) {
      expect(codeRef.showIndicator).toBe(false);
    }
  });
});
