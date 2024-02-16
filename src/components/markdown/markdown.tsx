import { Component, Element, Host, Prop, h } from "@stencil/core";
import { markdownToJSX } from "./parsers/markdown-to-jsx";
import { defaultCodeRender } from "./parsers/code-highlight";
import { MarkdownCodeRender } from "./parsers/types";

/**
 * A control to render markdown syntax. It supports GitHub Flavored Markdown
 * (GFM) and code highlighting.
 */
@Component({
  shadow: false,
  styleUrl: "markdown.scss",
  tag: "ch-markdown"
})
export class ChMarkdown {
  #JSXTree: any;

  @Element() el: HTMLChMarkdownElement;

  /**
   * `true` to render potentially dangerous user content when rendering HTML
   * with the option `rawHtml === true`
   */
  @Prop() readonly allowDangerousHtml: boolean = false;

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
      allowDangerousHtml: this.allowDangerousHtml,
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
