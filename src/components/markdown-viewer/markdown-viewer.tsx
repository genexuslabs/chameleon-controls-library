import { Component, Element, Host, Prop, h } from "@stencil/core";
import { TemplateResult } from "lit";
import { defaultCodeRender } from "./parsers/code-render.lit";
import {
  LAST_NESTED_CHILD_CLASS,
  markdownToJSX
} from "./parsers/markdown-to-jsx.lit";
import { MarkdownViewerCodeRender } from "./parsers/types";

// Side effect to define the ch-markdown-viewer-lit
import "./internal/markdown-viewer.lit";

/**
 * A control to render markdown syntax. It supports GitHub Flavored Markdown
 * (GFM) and code highlighting.
 *  - It parses the incoming markdown to [mdast](https://github.com/syntax-tree/mdast) using [micromark](https://github.com/micromark/micromark) via [mdast-util-from-markdown](https://github.com/syntax-tree/mdast-util-from-markdown).
 *
 * - After that, it implements a reactivity layer by implementing its own render for the mdast. With this, changes to the input markdown only update the portion of the DOM that changes.
 *
 * - It supports Github Flavored Markdown (GFM) by using [mdast-util-gfm](https://github.com/syntax-tree/mdast-util-gfm) and [micromark-extension-gfm](https://github.com/micromark/micromark-extension-gfm).
 *
 * - It supports code highlight by parsing the incomming code of the markdown to [hast](https://github.com/micromark/micromark-extension-gfm) using [lowlight](lowlight). After that, it implements a reactivity layer by implementing its own render for the hast.
 *
 * - It also supports all programming languages from [highlight.js](https://github.com/highlightjs/highlight.js).
 *
 * - When the code highlighting is needed at runtime, the control will load on demand the code parser and the programming language needed to parse the code.
 */
@Component({
  shadow: true,
  styleUrl: "markdown-viewer.scss",
  tag: "ch-markdown-viewer"
})
export class ChMarkdownViewer {
  #JSXTree: TemplateResult[];

  @Element() el: HTMLChMarkdownViewerElement;

  // /**
  //  * `true` to render potentially dangerous user content when rendering HTML
  //  * with the option `rawHtml === true`
  //  */
  // @Prop() readonly allowDangerousHtml: boolean = false;

  /**
   * `true` to visually hide the contents of the root node while the control's
   * style is not loaded. Only works if the `theme` property is set.
   */
  @Prop() readonly avoidFlashOfUnstyledContent: boolean = false;

  /**
   * `true` to render raw HTML with sanitization.
   */
  @Prop() readonly rawHtml: boolean = false;

  /**
   * This property allows us to implement custom rendering for the code blocks.
   */
  @Prop() readonly renderCode?: MarkdownViewerCodeRender | undefined;

  /**
   * Specifies if an indicator is displayed in the last element rendered.
   * Useful for streaming scenarios where a loading indicator is needed.
   */
  @Prop() readonly showIndicator: boolean = false;

  /**
   * Specifies the theme to be used for rendering the control.
   * If `undefined`, no theme will be applied.
   */
  @Prop() readonly theme: string | undefined = "ch-markdown-viewer";

  /**
   * Specifies the markdown string to parse.
   */
  @Prop() readonly value?: string | undefined;

  async componentWillRender() {
    if (!this.value) {
      return;
    }

    this.#JSXTree = await markdownToJSX(this.value, {
      allowDangerousHtml: true, // Allow dangerous in this version
      codeRender: this.renderCode ?? defaultCodeRender,
      lastNestedChildClass: LAST_NESTED_CHILD_CLASS,
      rawHTML: this.rawHtml,
      showIndicator: this.showIndicator
    });
  }

  render() {
    if (!this.value) {
      return "";
    }

    return (
      <Host
        class={
          this.showIndicator ? "ch-markdown-viewer-show-indicator" : undefined
        }
      >
        {this.theme && (
          <ch-theme
            key="theme"
            avoidFlashOfUnstyledContent={this.avoidFlashOfUnstyledContent}
            model={this.theme}
          ></ch-theme>
        )}

        <ch-markdown-viewer-lit value={this.#JSXTree}></ch-markdown-viewer-lit>
      </Host>
    );
  }
}
