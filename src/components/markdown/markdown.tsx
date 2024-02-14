import { Component, Element, Host, Prop, h } from "@stencil/core";
import { markdownToJSX } from "./parsers/markdown-to-jsx";
import { defaultCodeRender } from "./parsers/code-highlight";

@Component({
  shadow: false,
  styleUrl: "markdown.scss",
  tag: "ch-markdown"
})
export class ChMarkdown {
  #JSXTree: any;

  @Element() el: HTMLChMarkdownElement;

  /**
   *
   */
  @Prop() readonly allowDangerousHtml: boolean = false;

  /**
   *
   */
  @Prop() readonly markdown: string;

  /**
   * `true` to render raw HTML with sanitization.
   */
  @Prop() readonly rawHtml: boolean = false;

  /**
   * This property allows us to implement custom rendering for the code blocks.
   */
  @Prop() readonly renderCode: (language: string, content: any) => any =
    defaultCodeRender;

  async componentWillRender() {
    if (!this.markdown) {
      return;
    }

    this.#JSXTree = await markdownToJSX(this.markdown, {
      rawHTML: this.rawHtml,
      allowDangerousHtml: this.allowDangerousHtml,
      renderCode: this.renderCode
    });
  }

  render() {
    if (!this.markdown) {
      return "";
    }

    return <Host>{this.#JSXTree}</Host>;
  }
}
