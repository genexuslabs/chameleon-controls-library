import { Component, h, Host, Prop, State, Watch } from "@stencil/core";
import katex from "katex";

/**
 * The `ch-math-viewer` component renders LaTeX math expressions as accessible,
 * high-quality typeset mathematics using [KaTeX](https://katex.org/).
 *
 * @remarks
 * ## Features
 *  - Accepts LaTeX blocks delimited by `$$`, `\[...\]`, `\(...\)`, or bare expressions.
 *  - Supports both block and inline display modes.
 *  - Graceful error handling: exposes raw text with an error description when parsing fails.
 *  - Accessible output via `htmlAndMathml` rendering.
 *
 * ## Use when
 *  - Displaying mathematical formulas, equations, or scientific notation.
 *
 * ## Do not use when
 *  - Rendering general rich-text content that may include math — prefer `ch-markdown-viewer` instead.
 *
 * ## Accessibility
 *  - KaTeX renders both HTML and MathML output, allowing assistive technology to read mathematical expressions natively.
 *  - Error spans carry `aria-description` and `title` attributes describing the parsing error.
 *
 * **Important:** You must include the KaTeX custom fonts from
 * `node_modules/@genexus/chameleon-controls-library/dist/assets/fonts` and
 * declare their font-faces using the `math-viewer-font-faces` mixin from
 * `node_modules/@genexus/chameleon-controls-library/dist/assets/scss/math-viewer-font-face.scss`.
 *
 * @status experimental
 *
 * @part error - A `<span>` rendered in place of a math block when KaTeX fails to parse the expression. Contains the raw source text and exposes the error message via `aria-description` and `title`.
 */
@Component({
  tag: "ch-math-viewer",
  styleUrl: "math-viewer.scss",
  shadow: true
})
export class ChMathViewer {
  /**
   * Internal rendered HTML fragments from KaTeX.
   */
  @State() renderedBlocks: { html: string; error: string | null }[] = [];

  /**
   * Specifies whether to render the math in block or inline mode.
   */
  @Prop({ reflect: true }) readonly displayMode?: "block" | "inline" = "block";

  /**
   * Specifies the LaTeX math string to render.
   */
  @Prop() readonly value?: string;

  @Watch("value")
  updateRenderedBlocks() {
    if (!this.value) {
      this.renderedBlocks = [];
      return;
    }

    const blocks = this.value
      .split(/\n\s*\n/) // split on empty lines (paragraphs)
      .map(b => b.trim())
      .filter(b => b);

    const htmlBlocks = blocks.map(block => {
      const isMathBlock =
        block.startsWith("\\[") ||
        block.startsWith("\\(") ||
        block.startsWith("$$") ||
        block.startsWith("\\begin") ||
        block.includes("&=") ||
        block.includes("^");

      // Remove unnecessary delimiters for KaTeX processing
      const cleanBlock = block
        .replace(/^\\\[|\\\]$/g, "")
        .replace(/^\\\(|\\\)$/g, "")
        .replace(/^\$\$|\$\$$/g, "")
        .replace(/^\$|\$$/g, "");

      try {
        return {
          html: katex.renderToString(cleanBlock, {
            throwOnError: true,
            displayMode: isMathBlock || this.displayMode === "block",
            output: "htmlAndMathml" // For accessibility reasons
          }),
          error: null
        };
      } catch (err) {
        return { html: cleanBlock, error: (err as Error).message };
      }
    });

    this.renderedBlocks = htmlBlocks;
  }

  componentWillLoad() {
    this.updateRenderedBlocks();
  }

  render() {
    return (
      <Host>
        {this.renderedBlocks.map(({ html, error }) =>
          error === null ? (
            <div innerHTML={html}></div>
          ) : (
            <span
              aria-description={error}
              title={error}
              class="katex"
              part="error"
            >
              {html}
            </span>
          )
        )}
      </Host>
    );
  }
}
