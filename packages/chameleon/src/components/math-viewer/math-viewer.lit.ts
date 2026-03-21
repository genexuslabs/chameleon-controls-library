import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import katex from "katex";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";
import { state } from "lit/decorators/state.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

import styles from "./math-viewer.scss?inline";

/**
 * The `ch-math-viewer` component renders LaTeX math expressions as accessible, high-quality typeset mathematics using [KaTeX](https://katex.org/).
 *
 * @remarks
 * ## Features
 *  - Accepts LaTeX blocks delimited by `$$`, `\[...\]`, `\(...\)`, or bare expressions.
 *  - Supports both block and inline display modes via the `displayMode` property (reflected as an HTML attribute for CSS targeting).
 *  - Multi-paragraph support: paragraphs separated by blank lines are rendered as individual math blocks.
 *  - Graceful error handling: on parse failure, renders raw source text in a `<span part="error">` with the error message exposed via `aria-description` and `title`.
 *  - Accessible output via `htmlAndMathml` rendering.
 *
 * ## Use when
 *  - Displaying mathematical formulas, equations, or scientific notation.
 *
 * ## Do not use when
 *  - Rendering general rich-text content that may include math. Prefer `ch-markdown-viewer` instead.
 *
 * ## Accessibility
 *  - KaTeX renders both HTML and MathML output, allowing assistive technology to read mathematical expressions natively.
 *  - Error spans carry `aria-description` and `title` attributes describing the parsing error, so screen readers can announce what went wrong.
 *
 * ## Configuration Required
 *
 * You must include the KaTeX custom fonts and declare their font-faces. In your main SCSS file, import the font-faces mixin and include it:
 *
 * ```scss
 * @import "@genexus/chameleon-controls-library/dist/assets/scss/math-viewer-font-face.scss";
 *
 * @include math-viewer-font-faces();
 * ```
 *
 * Additionally, ensure the font files from
 * `node_modules/@genexus/chameleon-controls-library/dist/assets/fonts` are copied to your project's assets directory. If using StencilJS, add this to your `stencil.config.ts`:
 *
 * ```ts
 * {
 *   type: "dist",
 *   copy: [
 *     {
 *       src: "../node_modules/@genexus/chameleon-controls-library/dist/assets/fonts",
 *       dest: "assets/fonts"
 *     }
 *   ]
 * }
 * ```
 *
 * @status experimental
 *
 * @part error - A `<span>` rendered in place of a math block when KaTeX fails to parse the expression. Contains the raw source text and exposes the error message via `aria-description` and `title`.
 */
@Component({
  styles,
  tag: "ch-math-viewer"
})
export class ChMathViewer extends KasstorElement {
  /**
   * Internal rendered HTML fragments from KaTeX.
   */
  @state() protected renderedBlocks: { html: string; error: string | null }[] =
    [];

  /**
   * Specifies whether to render the math in block or inline mode.
   *  - `"block"`: Renders display-style math (centered, larger, with vertical
   *    spacing). The host element uses `display: block`.
   *  - `"inline"`: Renders inline math that flows with surrounding text. The
   *    host element uses `display: inline-block`.
   *
   * This property is reflected as an HTML attribute, enabling CSS selectors
   * like `:host([display-mode="inline"])` for layout customization.
   *
   * Individual math blocks in the `value` string may auto-detect as
   * block-style if they start with `\\[`, `$$`, `\\begin`, or contain
   * alignment operators (`&=`, `^`), overriding this setting for that block.
   */
  @property({ reflect: true, attribute: "display-mode" }) displayMode:
    | "block"
    | "inline" = "block";

  /**
   * Specifies the LaTeX math string to render.
   * Multiple math blocks can be separated by blank lines (double newlines);
   * each block is rendered independently.
   *
   * Delimiters (`$$`, `\[...\]`, `\(...\)`, `$...$`) are automatically
   * stripped before passing to KaTeX. When `undefined` or empty, the
   * component renders nothing.
   */
  @property() value: string | undefined;

  // @Observe auto-fires before first render, replacing componentWillLoad()
  @Observe("value")
  protected updateRenderedBlocks() {
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

  override render() {
    if (this.renderedBlocks.length === 0) {
      return nothing;
    }

    return this.renderedBlocks.map(({ html: blockHtml, error }) =>
      error === null
        ? html`<div>${unsafeHTML(blockHtml)}</div>`
        : html`<span
            aria-description=${error}
            title=${error}
            class="katex"
            part="error"
            >${blockHtml}</span
          >`
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ch-math-viewer": ChMathViewer;
  }
}
