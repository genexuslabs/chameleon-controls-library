import { Component, Element, Host, Prop, State, h } from "@stencil/core";
import { CodeToJSX } from "./internal/types";
import { adoptCommonThemes } from "../../common/theme";
import { SCROLLABLE_CLASS } from "../../common/reserved-names";

let parseCodeToJSX: CodeToJSX;

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

  /**
   * This flag is used for faster initial loading. It avoid waiting for the
   * lazy JS to render the code with its language. This reduces the CLS at the
   * initial load.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #initialLoad = true;

  @Element() el: HTMLChCodeElement;

  @State() JSXCodeBlock: any;

  /**
   *
   */
  @Prop() readonly lastNestedChildClass: string = "last-nested-child";

  /**
   * Specifies the code language to highlight.
   */
  @Prop() readonly language: string;

  /**
   * Specifies if an indicator is displayed in the last element rendered.
   * Useful for streaming scenarios where a loading indicator is needed.
   */
  @Prop() readonly showIndicator: boolean = false;

  /**
   * Specifies the code string to highlight.
   */
  @Prop() readonly value: string;

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
    if (!this.value) {
      this.JSXCodeBlock = "";
      this.#lastNestedChildIsRoot = true;
      return;
    }

    // Don't block the initial render, even if the parser is not downloaded
    if (this.#initialLoad) {
      // The parser was already downloaded
      if (parseCodeToJSX) {
        this.#parseCodeToJSX().then(renderResult => {
          this.JSXCodeBlock = renderResult.renderedCode;
          this.#lastNestedChildIsRoot = renderResult.lastNestedChildIsRoot;
        });
      }
      // The parser is not downloaded. Subscribe to its download
      else {
        import("./internal/code-highlight").then(async bundle => {
          parseCodeToJSX ??= bundle.parseCodeToJSX; // Initialize the parser if necessary
          const renderResult = await this.#parseCodeToJSX();

          this.JSXCodeBlock = renderResult.renderedCode;
          this.#lastNestedChildIsRoot = renderResult.lastNestedChildIsRoot;
        });
      }
    }
    // Block re-renders until the JSX is resolved
    else {
      const result = await this.#parseCodeToJSX();

      this.JSXCodeBlock = result.renderedCode;
      this.#lastNestedChildIsRoot = result.lastNestedChildIsRoot;
    }

    this.#initialLoad = false;
  }

  render() {
    const addLastNestedChildClassInHost =
      this.showIndicator && this.#lastNestedChildIsRoot;

    const language = this.#getLanguageOrDefault();

    // TODO: Should we hide the ch-code on the initial load?
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
          {this.JSXCodeBlock ?? this.value}
        </code>
      </Host>
    );
  }
}
