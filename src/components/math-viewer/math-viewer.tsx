import { Component, Element, h, Host, Prop, State, Watch } from "@stencil/core";
import katex from "katex";
import { MINIFIED_FONTS } from "./minified-fonts";

/**
 * A component for rendering LaTeX math expressions using KaTeX.
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
  @State() renderedBlocks: string[] = [];

  @Element() el!: HTMLChMathViewerElement;

  /**
   * Whether to display math in block mode (true) or inline mode (false).
   */
  @Prop({ reflect: true }) readonly displayMode: boolean = true;

  /**
   * Base URL for custom font files. For example, "/assets/fonts/".
   */
  @Prop() readonly fontsBaseUrl?: string;
  @Watch("fontsBaseUrl")
  fontsBaseUrlChanged() {
    this.#loadFonts();
  }

  /**
   * Specifies the LaTeX math string to render.
   */
  @Prop() readonly value?: string;

  @Watch("value")
  @Watch("displayMode")
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
      try {
        const isMathBlock =
          block.startsWith("\\[") ||
          block.startsWith("\\(") ||
          block.startsWith("$$") ||
          block.startsWith("\\begin") ||
          block.includes("&=") ||
          block.includes("^") ||
          this.displayMode;

        // Remove unnecessary delimiters for KaTeX processing
        const cleanBlock = block
          .replace(/^\\\[|\\\]$/g, "")
          .replace(/^\\\(|\\\)$/g, "")
          .replace(/^\$\$|\$\$$/g, "")
          .replace(/^\$|\$$/g, "");

        return katex.renderToString(cleanBlock, {
          throwOnError: false,
          displayMode: isMathBlock,
          output: "htmlAndMathml" // For accessibility reasons
        });
      } catch (err) {
        return `<span style="color:red;">${(err as Error).message}</span>`;
      }
    });

    this.renderedBlocks = htmlBlocks;
  }

  // TODO: Avoid adding multiple theme elements if the property changes or if
  // math-viewer is rendered multiple times.
  #loadFonts = () => {
    if (this.fontsBaseUrl) {
      const themeRef = document.createElement("ch-theme");
      themeRef.avoidFlashOfUnstyledContent = false;
      themeRef.model = [
        {
          themeBaseUrl: this.fontsBaseUrl,
          name: "ch-math-viewer-fonts",
          styleSheet: MINIFIED_FONTS
        }
      ];
      document.body.appendChild(themeRef);
    }
  };

  connectedCallback() {
    this.#loadFonts();
  }

  componentWillLoad() {
    this.updateRenderedBlocks();
  }

  render() {
    return (
      <Host>
        {this.renderedBlocks.map(html => (
          <div innerHTML={html}></div>
        ))}
      </Host>
    );
  }
}
