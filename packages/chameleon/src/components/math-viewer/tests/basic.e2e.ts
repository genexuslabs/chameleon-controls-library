import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";

import "../math-viewer.lit.js";
import type { ChMathViewer } from "../math-viewer.lit.js";

describe("[ch-math-viewer][basic]", () => {
  afterEach(cleanup);

  let mathViewerRef: ChMathViewer;

  beforeEach(async () => {
    const result = render(
      html`<ch-math-viewer></ch-math-viewer>`
    );
    mathViewerRef = result.container.querySelector(
      "ch-math-viewer"
    )! as ChMathViewer;
    await mathViewerRef.updateComplete;
  });

  it("should have Shadow DOM", () => {
    expect(mathViewerRef.shadowRoot).toBeTruthy();
  });

  it('should have displayMode "block" by default', () => {
    expect(mathViewerRef.displayMode).toBe("block");
  });

  it("should have value undefined by default", () => {
    expect(mathViewerRef.value).toBeUndefined();
  });

  it("should have an empty renderedBlocks array by default", () => {
    expect((mathViewerRef as any).renderedBlocks).toEqual([]);
  });

  it("should render nothing when no value is set", () => {
    const shadowChildren = mathViewerRef.shadowRoot!.children;
    // Only the adopted stylesheet should be present (no content nodes)
    const contentNodes = Array.from(shadowChildren).filter(
      node => node.tagName !== "STYLE"
    );
    expect(contentNodes.length).toBe(0);
  });

  it('should reflect displayMode as "display-mode" attribute', () => {
    expect(mathViewerRef.getAttribute("display-mode")).toBe("block");
  });

  it("should use display: block by default", () => {
    const computedStyle = getComputedStyle(mathViewerRef);
    expect(computedStyle.display).toBe("block");
  });
});
