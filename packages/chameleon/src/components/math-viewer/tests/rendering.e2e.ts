import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";

import "../math-viewer.lit.js";
import type { ChMathViewer } from "../math-viewer.lit.js";

describe("[ch-math-viewer][rendering]", () => {
  afterEach(cleanup);

  describe("simple LaTeX expression", () => {
    let mathViewerRef: ChMathViewer;

    beforeEach(async () => {
      const result = render(
        html`<ch-math-viewer .value=${"x^2 + y^2 = z^2"}></ch-math-viewer>`
      );
      mathViewerRef = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await mathViewerRef.updateComplete;
    });

    it("should render a div with KaTeX output", () => {
      const div = mathViewerRef.shadowRoot!.querySelector("div");
      expect(div).toBeTruthy();
    });

    it("should contain .katex class in the rendered output", () => {
      const katexEl = mathViewerRef.shadowRoot!.querySelector(".katex");
      expect(katexEl).toBeTruthy();
    });

    it("should render MathML for accessibility", () => {
      const mathml = mathViewerRef.shadowRoot!.querySelector(".katex-mathml");
      expect(mathml).toBeTruthy();
    });
  });

  describe("displayMode", () => {
    it('should use display-style math when displayMode is "block"', async () => {
      const result = render(
        html`<ch-math-viewer
          display-mode="block"
          .value=${"E = mc^2"}
        ></ch-math-viewer>`
      );
      const ref = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await ref.updateComplete;

      // In block mode, KaTeX wraps in a .katex-display container
      const katexDisplay = ref.shadowRoot!.querySelector(".katex-display");
      expect(katexDisplay).toBeTruthy();
    });

    it('should use inline-style math when displayMode is "inline" and expression has no block markers', async () => {
      // Use a simple expression without block markers (no ^, &=, $$, etc.)
      const result = render(
        html`<ch-math-viewer
          display-mode="inline"
          .value=${"a + b"}
        ></ch-math-viewer>`
      );
      const ref = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await ref.updateComplete;

      // In inline mode (without block markers), KaTeX does NOT wrap in .katex-display
      const katexDisplay = ref.shadowRoot!.querySelector(".katex-display");
      expect(katexDisplay).toBeNull();

      // But it should still render KaTeX output
      const katex = ref.shadowRoot!.querySelector(".katex");
      expect(katex).toBeTruthy();
    });

    it('should switch to inline-block display when displayMode is "inline"', async () => {
      const result = render(
        html`<ch-math-viewer
          display-mode="inline"
          .value=${"a + b"}
        ></ch-math-viewer>`
      );
      const ref = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await ref.updateComplete;

      const computedStyle = getComputedStyle(ref);
      expect(computedStyle.display).toBe("inline-block");
    });

    it("should auto-detect block mode for $$ delimiters even when displayMode is inline", async () => {
      const result = render(
        html`<ch-math-viewer
          display-mode="inline"
          .value=${"$$a + b$$"}
        ></ch-math-viewer>`
      );
      const ref = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await ref.updateComplete;

      // $$ is a block marker, so it should auto-detect as block mode
      const katexDisplay = ref.shadowRoot!.querySelector(".katex-display");
      expect(katexDisplay).toBeTruthy();
    });

    it("should auto-detect block mode for \\[ delimiters", async () => {
      const result = render(
        html`<ch-math-viewer
          display-mode="inline"
          .value=${"\\[a + b\\]"}
        ></ch-math-viewer>`
      );
      const ref = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await ref.updateComplete;

      const katexDisplay = ref.shadowRoot!.querySelector(".katex-display");
      expect(katexDisplay).toBeTruthy();
    });

    it("should auto-detect block mode for \\begin", async () => {
      const result = render(
        html`<ch-math-viewer
          display-mode="inline"
          .value=${"\\begin{aligned} a &= b \\end{aligned}"}
        ></ch-math-viewer>`
      );
      const ref = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await ref.updateComplete;

      const katexDisplay = ref.shadowRoot!.querySelector(".katex-display");
      expect(katexDisplay).toBeTruthy();
    });
  });

  describe("multi-paragraph", () => {
    it("should render multiple blocks when value contains blank lines", async () => {
      const multiParagraphValue = "a + b\n\nc + d\n\ne + f";
      const result = render(
        html`<ch-math-viewer
          .value=${multiParagraphValue}
        ></ch-math-viewer>`
      );
      const ref = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await ref.updateComplete;

      const divs = ref.shadowRoot!.querySelectorAll("div");
      expect(divs.length).toBe(3);
    });

    it("should skip empty paragraphs between blocks", async () => {
      const valueWithExtraBlankLines = "a + b\n\n\n\n\nc + d";
      const result = render(
        html`<ch-math-viewer
          .value=${valueWithExtraBlankLines}
        ></ch-math-viewer>`
      );
      const ref = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await ref.updateComplete;

      const divs = ref.shadowRoot!.querySelectorAll("div");
      expect(divs.length).toBe(2);
    });
  });

  describe("delimiter stripping", () => {
    it("should strip $$ delimiters and render correctly", async () => {
      const result = render(
        html`<ch-math-viewer .value=${"$$x^2$$"}></ch-math-viewer>`
      );
      const ref = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await ref.updateComplete;

      const katex = ref.shadowRoot!.querySelector(".katex");
      expect(katex).toBeTruthy();
    });

    it("should strip \\( \\) delimiters and render correctly", async () => {
      const result = render(
        html`<ch-math-viewer .value=${"\\(x + y\\)"}></ch-math-viewer>`
      );
      const ref = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await ref.updateComplete;

      const katex = ref.shadowRoot!.querySelector(".katex");
      expect(katex).toBeTruthy();
    });

    it("should strip \\[ \\] delimiters and render correctly", async () => {
      const result = render(
        html`<ch-math-viewer .value=${"\\[a + b\\]"}></ch-math-viewer>`
      );
      const ref = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await ref.updateComplete;

      const katex = ref.shadowRoot!.querySelector(".katex");
      expect(katex).toBeTruthy();
    });

    it("should strip single $ delimiters and render correctly", async () => {
      const result = render(
        html`<ch-math-viewer .value=${"$x$"}></ch-math-viewer>`
      );
      const ref = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await ref.updateComplete;

      const katex = ref.shadowRoot!.querySelector(".katex");
      expect(katex).toBeTruthy();
    });
  });

  describe("reactivity", () => {
    it("should update rendering when value changes", async () => {
      const result = render(
        html`<ch-math-viewer .value=${"a + b"}></ch-math-viewer>`
      );
      const ref = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await ref.updateComplete;

      const initialContent = ref.shadowRoot!.innerHTML;

      ref.value = "c + d";
      await ref.updateComplete;

      const updatedContent = ref.shadowRoot!.innerHTML;
      expect(updatedContent).not.toBe(initialContent);
    });

    it("should clear rendering when value is set to undefined", async () => {
      const result = render(
        html`<ch-math-viewer .value=${"a + b"}></ch-math-viewer>`
      );
      const ref = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await ref.updateComplete;

      expect(ref.shadowRoot!.querySelector(".katex")).toBeTruthy();

      ref.value = undefined;
      await ref.updateComplete;

      expect(ref.shadowRoot!.querySelector(".katex")).toBeNull();
    });

    it("should clear rendering when value is set to empty string", async () => {
      const result = render(
        html`<ch-math-viewer .value=${"a + b"}></ch-math-viewer>`
      );
      const ref = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await ref.updateComplete;

      expect(ref.shadowRoot!.querySelector(".katex")).toBeTruthy();

      ref.value = "";
      await ref.updateComplete;

      expect(ref.shadowRoot!.querySelector(".katex")).toBeNull();
    });
  });
});
