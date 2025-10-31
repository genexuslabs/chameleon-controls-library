import { Component, Element, h, Host, Prop, State, Watch } from "@stencil/core";
import katex from "katex";
import { MINIFIED_FONTS } from "./minified-fonts";

/**
 * A component for rendering LaTeX math expressions using KaTeX.
 */
@Component({
  tag: "ch-latex-viewer",
  styleUrl: "latex-viewer.scss",
  shadow: true
})
export class ChLatexViewer {
  @Element() el!: HTMLChLatexViewerElement;

  /**
   * Base URL for custom font files. For example, "/assets/fonts/".
   */
  @Prop() readonly fontsBaseUrl?: string;
  @Watch("fontsBaseUrl")
  fontsBaseUrlChanged() {
    this.#loadFonts();
  }

  /**
   * Whether to display math in block mode (true) or inline mode (false).
   */
  @Prop() readonly displayMode: boolean = true;

  /**
   * Specifies the LaTeX string to render.
   */
  @Prop() readonly value?: string;

  /**
   * Internal rendered HTML fragments from KaTeX.
   */
  @State() renderedBlocks: string[] = [];

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
          block.startsWith("\\begin") ||
          block.includes("&=") ||
          block.includes("^") ||
          this.displayMode;

        const cleanBlock = block.replace(/^\\\[|\\\]$/g, "");

        return katex.renderToString(cleanBlock, {
          throwOnError: false,
          displayMode: isMathBlock
        });
      } catch (err) {
        return `<span style="color:red;">${(err as Error).message}</span>`;
      }
    });

    this.renderedBlocks = htmlBlocks;
  }

  #loadFonts = () => {
    if (this.fontsBaseUrl) {
      const themeRef = document.createElement("ch-theme");
      themeRef.avoidFlashOfUnstyledContent = false;
      themeRef.model = [
        {
          themeBaseUrl: this.fontsBaseUrl,
          name: "ch-latex-viewer-fonts",
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
