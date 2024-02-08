import { Component, Element, Prop } from "@stencil/core";

// import rehypeHighlight from "rehype-highlight";
// import { micromark } from "micromark";
// import { gfm, gfmHtml } from "micromark-extension-gfm";

// import rehypeHighlight from "rehype-highlight";
import markdownit from "markdown-it";

// const md = markdownit.use(rehypeHighlight);
const md = markdownit();

@Component({
  shadow: false,
  styleUrl: "markdown.scss",
  tag: "ch-markdown"
})
export class ChMarkdown {
  @Element() el: HTMLChMarkdownElement;

  /**
   *
   */
  @Prop() readonly markdown: string;

  render() {
    if (!this.markdown) {
      return "";
    }

    const result = md.render(this.markdown);

    // this.el.innerHTML = micromark(this.markdown, {
    //   extensions: [gfm()],
    //   htmlExtensions: [gfmHtml()]
    // });

    this.el.innerHTML = result;

    return "";
  }
}
