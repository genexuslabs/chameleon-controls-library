import { Component, Element, Host, Prop, h } from "@stencil/core";
import { markdownToJSX } from "./parsers/markdown-to-jsx";
import { defaultCodeRender } from "./parsers/code-highlight";
import { MarkdownCodeRender } from "./parsers/types";

/**
 * @deprecated Use the `ch-markdown-viewer` component instead.
 *
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
  shadow: false,
  styleUrl: "markdown.scss",
  tag: "ch-markdown"
})
export class ChMarkdown {
  #JSXTree: any;

  @Element() el: HTMLChMarkdownElement;

  // /**
  //  * `true` to render potentially dangerous user content when rendering HTML
  //  * with the option `rawHtml === true`
  //  */
  // @Prop() readonly allowDangerousHtml: boolean = false;

  /**
   * `true` to render raw HTML with sanitization.
   */
  @Prop() readonly rawHtml: boolean = false;

  /**
   * This property allows us to implement custom rendering for the code blocks.
   */
  @Prop() readonly renderCode: MarkdownCodeRender = defaultCodeRender;

  /**
   * Specifies the markdown string to parse.
   */
  @Prop() readonly value: string;

  async componentWillRender() {
    if (!this.value) {
      return;
    }

    this.#JSXTree = await markdownToJSX(this.value, {
      rawHTML: this.rawHtml,
      allowDangerousHtml: true, // Allow dangerous in this version
      renderCode: this.renderCode
    });
  }

  render() {
    if (!this.value) {
      return "";
    }

    return <Host>{this.#JSXTree}</Host>;
  }
}
