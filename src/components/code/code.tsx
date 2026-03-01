import { Component, Element, Host, Prop, State, h } from "@stencil/core";
import { adoptCommonThemes } from "../../common/theme";
import { SCROLLABLE_CLASS } from "../../common/reserved-names";
import { parseCodeToJSX } from "./internal/code-highlight";

/**
 * The `ch-code` component renders read-only, syntax-highlighted code blocks
 * powered by lowlight and highlight.js.
 *
 * @remarks
 * ## Features
 *  - Syntax highlighting by parsing code to [hast](https://github.com/syntax-tree/hast) using [lowlight](https://github.com/wooorm/lowlight), with a custom reactive render layer.
 *  - Supports all programming languages from [highlight.js](https://github.com/highlightjs/highlight.js).
 *  - On-demand loading of the code parser and language grammars at runtime.
 *  - Streaming indicator for real-time code generation scenarios.
 *
 * ## Use when
 *  - Displaying source code snippets, configuration files, or any programming-language content with rich highlighting.
 *  - Displaying read-only syntax-highlighted code snippets or configuration files in documentation or responses.
 *
 * ## Do not use when
 *  - Users need to edit code — prefer `ch-code-editor` instead.
 *  - The user needs to edit the code — prefer `ch-code-editor`.
 *  - Comparing two versions of code — prefer `ch-code-diff-editor`.
 *
 * @status experimental
 *
 * @part code - The inner `<code>` element that wraps the highlighted content. Also exposes a `language-{lang}` part (e.g. `language-typescript`) for language-specific styling.
 */
@Component({
  shadow: true,
  styleUrl: "code.scss",
  tag: "ch-code"
})
export class ChCode {
  #lastNestedChildIsRoot: boolean = true;

  @Element() el: HTMLChCodeElement;

  @State() JSXCodeBlock: any;

  /**
   * Specifies the code language to highlight.
   */
  @Prop() readonly language?: string | undefined;

  /**
   *
   */
  @Prop() readonly lastNestedChildClass: string = "last-nested-child";

  /**
   * Specifies if an indicator is displayed in the last element rendered.
   * Useful for streaming scenarios where a loading indicator is needed.
   */
  @Prop() readonly showIndicator: boolean = false;

  /**
   * Specifies the code string to highlight.
   */
  @Prop() readonly value?: string | undefined;

  #getLanguageOrDefault = () => this.language || "plaintext";

  #parseCodeToJSX = () =>
    parseCodeToJSX(
      this.value,
      this.#getLanguageOrDefault(),
      this.showIndicator,
      this.lastNestedChildClass
    );

  connectedCallback() {
    adoptCommonThemes(this.el.shadowRoot.adoptedStyleSheets);
  }

  async componentWillRender() {
    if (this.value) {
      const renderResult = await this.#parseCodeToJSX();

      this.JSXCodeBlock = renderResult.renderedCode;
      this.#lastNestedChildIsRoot = renderResult.lastNestedChildIsRoot;
    } else {
      this.JSXCodeBlock = "";
      this.#lastNestedChildIsRoot = true;
    }
  }

  render() {
    const addLastNestedChildClassInHost =
      this.showIndicator && this.#lastNestedChildIsRoot;

    const language = this.#getLanguageOrDefault();

    return (
      <Host
        class={{
          "ch-code-show-indicator": this.showIndicator,
          [SCROLLABLE_CLASS]: true
        }}
      >
        <code
          class={{
            [`hljs language-${language}`]: true,
            [this.lastNestedChildClass]: addLastNestedChildClassInHost
          }}
          part={`code language-${language}`}
        >
          {this.JSXCodeBlock}
        </code>
      </Host>
    );
  }
}
