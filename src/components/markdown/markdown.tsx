import { Component, Element, Prop } from "@stencil/core";

import { parseMarkdown } from "@genexus/markdown-parser";

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

    parseMarkdown(this.markdown).then(result => {
      this.el.innerHTML = result;
    });
  }
}
