import { Component, Element, Host, Prop, State, h } from "@stencil/core";
import { SCROLLABLE_CLASS } from "../../common/reserved-names";
import { adoptCommonThemes } from "../../common/theme";
import { parseCodeToJSX } from "./internal/code-highlight";

/**
 * The `ch-code` component renders read-only, syntax-highlighted code blocks powered by lowlight and highlight.js.
 *
 * @remarks
 * ## Features
 *  - Syntax highlighting by parsing code to [hast](https://github.com/syntax-tree/hast) using [lowlight](https://github.com/wooorm/lowlight), with a custom reactive render layer.
 *  - Supports all programming languages from [highlight.js](https://github.com/highlightjs/highlight.js).
 *  - On-demand loading of the code parser and language grammars at runtime.
 *  - Streaming indicator for real-time code generation scenarios (controlled by `showIndicator`).
 *  - Extensive set of CSS custom properties (`--ch-code__*`) for token-level color theming of all highlight.js token types.
 *
 * ## Use when
 *  - Displaying read-only syntax-highlighted code snippets, configuration files, or AI-generated code in documentation or chat responses.
 *
 * ## Do not use when
 *  - Users need to edit code -- prefer `ch-code-editor` instead.
 *  - Comparing two versions of code -- prefer `ch-code-diff-editor`.
 *
 * ## Accessibility
 *  - The component renders a semantic `<code>` element with an `hljs language-{lang}` class for assistive technology identification.
 *  - The host element uses scrollable overflow, allowing keyboard-driven scrolling of long code blocks.
 *
 * @status experimental
 *
 * @part code - The inner `<code>` element that wraps the highlighted content.
 * Also exposes a `language-{lang}` part (e.g. `language-typescript`) for
 * language-specific styling.
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
   * Specifies the code language to highlight (e.g., `"typescript"`,
   * `"python"`, `"json"`). Must be a valid highlight.js language identifier.
   * When `undefined` or empty, falls back to `"plaintext"` (no highlighting).
   */
  @Prop() readonly language?: string | undefined;

  /**
   * CSS class name applied to the deepest nested child element to position
   * the streaming indicator. Used internally by the render layer.
   * Override this when integrating with custom indicator positioning.
   */
  @Prop() readonly lastNestedChildClass: string = "last-nested-child";

  /**
   * When `true`, a blinking cursor-like indicator is displayed after the
   * last rendered element. Useful for streaming scenarios where code is
   * being generated in real time.
   *
   * The indicator's appearance is controlled by the CSS custom properties
   * `--ch-code-indicator-color`, `--ch-code-inline-size`, and
   * `--ch-code-block-size`.
   */
  @Prop() readonly showIndicator: boolean = false;

  /**
   * Specifies the code string to highlight.
   * When `undefined` or empty, the component renders nothing.
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
