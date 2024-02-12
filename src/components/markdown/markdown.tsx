import { Component, Element, Host, Prop, h } from "@stencil/core";
import { markdownToJSX } from "./parsers/markdown-to-jsx";

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

  async componentWillRender() {
    if (!this.markdown) {
      return;
    }

    this.#JSXTree = await markdownToJSX(
      this.markdown,
      this.rawHtml,
      this.allowDangerousHtml
    );
  }

  render() {
    if (!this.markdown) {
      return "";
    }

    // parseMarkdown(this.markdown).then(result => {
    //   console.log("result", result);
    //   // this.el.innerHTML = result;
    // });

    // console.log(mdAST);

    return <Host>{this.#JSXTree}</Host>;
  }
}
