import { Component, Element, Host, Prop, h } from "@stencil/core";
import { defaultCodeRender, parseCodeToJSX } from "./internal/code-highlight";
import { MarkdownCodeRender } from "./internal/types";

/**
 * A control to highlight code blocks.
 * - It supports code highlight by parsing the incoming code string to [hast](https://github.com/micromark/micromark-extension-gfm) using [lowlight](lowlight). After that, it implements a reactivity layer by implementing its own render for the hast.
 *
 * - It also supports all programming languages from [highlight.js](https://github.com/highlightjs/highlight.js).
 *
 * - When the code highlighting is needed at runtime, the control will load on demand the code parser and the programming language needed to parse the code.
 */
@Component({
  shadow: true,
  styleUrl: "code.scss",
  tag: "ch-code"
})
export class ChCode {
  #JSXCodeBlock: any;
  #lastNestedChildIsRoot: boolean = true;

  @Element() el: HTMLChCodeElement;

  /**
   *
   */
  @Prop() readonly addLastNestedChildClass: boolean = false;

  /**
   *
   */
  @Prop() readonly lastNestedChildClass: string = "last-nested-child";

  /**
   * Specifies the code language to highlight.
   */
  @Prop() readonly language: string;

  /**
   * This property allows us to implement custom rendering for the code blocks.
   */
  @Prop() readonly renderCode: MarkdownCodeRender = defaultCodeRender;

  /**
   * Specifies the code string to highlight.
   */
  @Prop() readonly value: string;

  #getLanguageOrDefault = () => this.language || "plaintext";

  async componentWillRender() {
    if (this.value) {
      const result = await parseCodeToJSX(
        this.value,
        this.#getLanguageOrDefault(),
        this.addLastNestedChildClass,
        this.lastNestedChildClass
      );

      this.#JSXCodeBlock = result.renderedCode;
      this.#lastNestedChildIsRoot = result.lastNestedChildIsRoot;
    } else {
      this.#JSXCodeBlock = "";
      this.#lastNestedChildIsRoot = true;
    }
  }

  render() {
    const addLastNestedChildClassInHost =
      this.addLastNestedChildClass && this.#lastNestedChildIsRoot;

    return (
      <Host>
        {this.renderCode({
          addLastNestedChildClassInHost: addLastNestedChildClassInHost,
          language: this.#getLanguageOrDefault(),
          lastNestedChildClass: this.lastNestedChildClass,
          plainText: this.value || "",
          renderedContent: this.#JSXCodeBlock
        })}
      </Host>
    );
  }
}
