import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";

import "../math-viewer.lit.js";
import type { ChMathViewer } from "../math-viewer.lit.js";

describe("[ch-math-viewer][error-handling]", () => {
  afterEach(cleanup);

  describe("invalid LaTeX", () => {
    let mathViewerRef: ChMathViewer;

    beforeEach(async () => {
      // This is intentionally invalid LaTeX that KaTeX cannot parse
      const result = render(
        html`<ch-math-viewer
          .value=${"\\invalidcommandthatdoesnotexist{"}
        ></ch-math-viewer>`
      );
      mathViewerRef = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await mathViewerRef.updateComplete;
    });

    it("should render a span instead of a div for errored blocks", () => {
      const span = mathViewerRef.shadowRoot!.querySelector("span");
      expect(span).toBeTruthy();
    });

    it("should not render a div for errored blocks", () => {
      const div = mathViewerRef.shadowRoot!.querySelector("div");
      expect(div).toBeNull();
    });

    it('should have class "katex" on the error span', () => {
      const span = mathViewerRef.shadowRoot!.querySelector("span");
      expect(span!.classList.contains("katex")).toBe(true);
    });

    it("should have the error part attribute", () => {
      const errorPart = mathViewerRef.shadowRoot!.querySelector(
        '[part="error"]'
      );
      expect(errorPart).toBeTruthy();
    });

    it("should have aria-description with the error message", () => {
      const span = mathViewerRef.shadowRoot!.querySelector("span");
      const ariaDesc = span!.getAttribute("aria-description");
      expect(ariaDesc).toBeTruthy();
      expect(ariaDesc!.length).toBeGreaterThan(0);
    });

    it("should have title with the error message", () => {
      const span = mathViewerRef.shadowRoot!.querySelector("span");
      const title = span!.getAttribute("title");
      expect(title).toBeTruthy();
      expect(title!.length).toBeGreaterThan(0);
    });

    it("should match aria-description and title values", () => {
      const span = mathViewerRef.shadowRoot!.querySelector("span");
      expect(span!.getAttribute("aria-description")).toBe(
        span!.getAttribute("title")
      );
    });

    it("should display the raw source text as content", () => {
      const span = mathViewerRef.shadowRoot!.querySelector("span");
      // The raw text is the cleaned block (delimiters stripped)
      expect(span!.textContent).toBeTruthy();
      expect(span!.textContent!.length).toBeGreaterThan(0);
    });
  });

  describe("mixed valid and invalid blocks", () => {
    it("should render valid blocks as divs and invalid blocks as spans", async () => {
      // First block is valid, second is intentionally invalid
      const mixedValue = "a + b\n\n\\invalidcommandthatdoesnotexist{";
      const result = render(
        html`<ch-math-viewer .value=${mixedValue}></ch-math-viewer>`
      );
      const ref = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await ref.updateComplete;

      const divs = ref.shadowRoot!.querySelectorAll("div");
      const spans = ref.shadowRoot!.querySelectorAll('span[part="error"]');

      expect(divs.length).toBe(1);
      expect(spans.length).toBe(1);
    });
  });

  describe("unbalanced braces", () => {
    it("should handle unbalanced opening brace gracefully", async () => {
      const result = render(
        html`<ch-math-viewer .value=${"\\frac{a}{"}></ch-math-viewer>`
      );
      const ref = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await ref.updateComplete;

      // Should either render with error handling or succeed
      const hasOutput =
        ref.shadowRoot!.querySelector("div") !== null ||
        ref.shadowRoot!.querySelector("span") !== null;
      expect(hasOutput).toBe(true);
    });
  });
});
