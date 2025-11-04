import { Component, h, Host, Prop, State, Watch } from "@stencil/core";
import katex from "katex";

/**
 * A component for rendering LaTeX math expressions using KaTeX.
 *
 * To use this component, you must include the necessary custom fonts in your
 * project. These custom fonts are located in the
 * `node_modules/@genexus/chameleon-controls-library/dist/assets/fonts` folder.
 *
 * To declare the font-faces of these custom fonts in your project, you must
 * use the `math-viewer-font-faces` mixin located in the
 * `node_modules/@genexus/chameleon-controls-library/dist/assets/scss/math-viewer-font-face.scss` folder
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
            displayMode: isMathBlock,
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
