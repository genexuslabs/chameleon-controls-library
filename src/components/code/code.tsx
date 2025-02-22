import { Component, Element, Host, Prop, State, h } from "@stencil/core";
import { adoptCommonThemes } from "../../common/theme";
import { SCROLLABLE_CLASS } from "../../common/reserved-names";
import { parseCodeToJSX } from "./internal/code-highlight";

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
