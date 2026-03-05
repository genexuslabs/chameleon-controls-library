import { Component, Element, Host, Prop, Watch, h } from "@stencil/core";
import type { TemplateResult } from "lit";
import type { Parent as MdAstParent } from "mdast";
import { defaultCodeRender } from "./parsers/code-render.lit";
import {
  LAST_NESTED_CHILD_CLASS,
  markdownToJSX
} from "./parsers/markdown-to-template-result.lit";
import {
  MarkdownViewerCodeRender,
  MarkdownViewerExtension,
  MarkdownViewerExtensionRender,
  MarkdownViewerRenderFunctions,
  MarkdownViewerRenderMetadata
} from "./parsers/types";

import {
  markdownViewerRenderDictionary,
  renderDefinedValues
} from "./parsers/renders.lit";

// Side effect to define the ch-markdown-viewer-lit
import "./internal/markdown-viewer.lit";
import { markdownViewerExtension } from "./parsers/math";

/**
 * The `ch-markdown-viewer` component renders Markdown content as rich HTML with GFM support, code highlighting, math rendering, and streaming indicators.
 *
 * @remarks
 * ## Features
 *  - Parses Markdown to [mdast](https://github.com/syntax-tree/mdast) using [micromark](https://github.com/micromark/micromark) via [mdast-util-from-markdown](https://github.com/syntax-tree/mdast-util-from-markdown), with a reactive render layer that only updates changed DOM portions.
 *  - GitHub Flavored Markdown (GFM) via [mdast-util-gfm](https://github.com/syntax-tree/mdast-util-gfm) and [micromark-extension-gfm](https://github.com/micromark/micromark-extension-gfm).
 *  - Code highlighting by parsing code blocks to [hast](https://github.com/syntax-tree/hast) using [lowlight](https://github.com/wooorm/lowlight), supporting all [highlight.js](https://github.com/highlightjs/highlight.js) languages.
 *  - On-demand loading of code parsers and language grammars at runtime.
 *  - Math rendering (built-in extension), raw HTML pass-through, and streaming indicator for real-time content.
 *  - Custom extensions for adding new syntax and rendering behavior.
 *  - Theming support via the `theme` property with optional flash-of-unstyled-content prevention.
 *
 * ## Use when
 *  - Displaying user-authored or AI-generated Markdown in a polished, interactive way.
 *  - Rendering Markdown content that includes headings, lists, code blocks, tables, and math expressions.
 *
 * ## Do not use when
 *  - Only plain text needs to be displayed -- prefer `ch-textblock` for better performance.
 *  - Full math rendering is needed and Markdown is not involved -- prefer `ch-math-viewer` directly.
 *
 * ## Accessibility
 *  - Renders semantic HTML elements (headings, lists, tables, code blocks) that are natively accessible to assistive technologies.
 *  - Code blocks are rendered via `ch-code`, which provides scrollable, labeled code regions.
 *  - Math expressions rendered via the math extension include MathML for screen reader compatibility.
 *
 * @status experimental
 */
@Component({
  shadow: true,
  styleUrl: "markdown-viewer.scss",
  tag: "ch-markdown-viewer"
})
export class ChMarkdownViewer {
  #templateResult: TemplateResult[];
  #renders: MarkdownViewerExtensionRender<object>;

  @Element() el: HTMLChMarkdownViewerElement;

  // /**
  //  * `true` to render potentially dangerous user content when rendering HTML
  //  * with the option `rawHtml === true`
  //  */
  // @Prop() readonly allowDangerousHtml: boolean = false;

  /**
   * When `true`, visually hides the contents of the root node until the
   * theme stylesheet has loaded, preventing a flash of unstyled content.
   * Only takes effect when the `theme` property is set; otherwise this
   * property has no visible effect.
   */
  @Prop() readonly avoidFlashOfUnstyledContent: boolean = false;

  /**
   * Specifies an array of custom extensions to extend and customize the
   * rendered markdown language.
   * There a 3 things needed to implement an extension:
   *  - A tokenizer (the heavy part of the extension).
   *  - A mapping between the custom token to the custom mdast nodes (pretty straightforward).
   *  - A render of the custom mdast nodes in Lit's `TemplateResult` (pretty straightforward).
   *
   * You can see an [example here](./examples/index.ts), which turns syntax like
   * `Some text [[ Value ]]` to:
   *
   * @example
   * ```ts
   * <p>Some text <button type="button" @click=${doSomething}>Value</button></p>
   * ```
   */
  @Prop() readonly extensions: MarkdownViewerExtension<object>[] | undefined;
  @Watch("extensions")
  extensionsChanged() {
    this.#mergeCustomRendersInASingleObject();
  }

  /**
   * When `true`, raw HTML blocks in the Markdown source are rendered as
   * actual HTML elements (with sanitization). When `false`, HTML blocks
   * are ignored and not rendered.
   *
   * Note: in the current version, `allowDangerousHtml` is always `true`
   * internally, so this flag controls whether HTML is passed through to
   * the rendered output.
   */
  @Prop() readonly rawHtml: boolean = false;

  /**
   * Allows custom rendering of code blocks (fenced code).
   * When `undefined`, the default code renderer (which uses `ch-code`) is
   * used. Provide a custom function to render code blocks with a different
   * component or UI (e.g., adding copy buttons, line numbers, etc.).
   */
  @Prop() readonly renderCode?: MarkdownViewerCodeRender | undefined;

  /**
   * When `true`, a blinking cursor-like indicator is displayed after the
   * last rendered element. Useful for streaming scenarios where Markdown
   * content is being generated in real time (e.g., AI chat responses).
   *
   * The indicator's appearance is controlled by the CSS custom properties
   * `--ch-markdown-viewer-indicator-color`, `--ch-markdown-viewer-inline-size`,
   * and `--ch-markdown-viewer-block-size`.
   */
  @Prop() readonly showIndicator: boolean = false;

  /**
   * Specifies the theme model name to be used for rendering the control.
   * When set, a `ch-theme` element is rendered to load the theme stylesheet.
   * If `undefined`, no theme will be applied.
   *
   * Works together with `avoidFlashOfUnstyledContent` to prevent unstyled
   * content from being visible before the theme loads.
   */
  @Prop() readonly theme: string | undefined = "ch-markdown-viewer";

  /**
   * Specifies the Markdown string to parse and render.
   * When `undefined` or empty, the component renders nothing.
   * If parsing fails, the error is logged to the console and the
   * previously rendered content is preserved.
   */
  @Prop() readonly value?: string | undefined;

  /**
   * Converts markdown abstract syntax tree (mdast) into TemplateResult`.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #renderChildren = async (
    parent: MdAstParent,
    metadata: MarkdownViewerRenderMetadata,
    functions: MarkdownViewerRenderFunctions
  ): Promise<TemplateResult[]> => {
    const childrenLength = parent.children.length;
    const asyncTemplateResult = new Array(childrenLength);

    // Get the async TemplateResult
    for (let index = 0; index < childrenLength; index++) {
      const child = parent.children[index];
      const render = this.#renders[child.type];

      if (render) {
        asyncTemplateResult.push(render(child, metadata, functions));
      }
    }

    // Wait for all results to be completed in parallel
    const renderedContent = await Promise.allSettled(asyncTemplateResult);

    // Return the Template array. TODO: Avoid additional array generation
    return renderDefinedValues(renderedContent);
  };

  // TODO: In Chameleon 7 this method won't be necessary, since the
  // markdown-parser will be built-in and we will have direct access to it for
  // adding more extensions.
  #getExtensions = () =>
    this.extensions
      ? [markdownViewerExtension, ...this.extensions]
      : [markdownViewerExtension];

  #mergeCustomRendersInASingleObject = () => {
    // Merge the render of the extensions into a single render object

    this.#renders = Object.assign(
      markdownViewerRenderDictionary,
      ...this.#getExtensions().map(({ mdastRender }) => mdastRender)
    );
  };

  connectedCallback() {
    this.#mergeCustomRendersInASingleObject();
  }

  async componentWillRender() {
    if (!this.value) {
      return;
    }

    // Don't crash the entire markdown viewer if something goes wrong
    try {
      this.#templateResult = await markdownToJSX(
        this.value,
        {
          allowDangerousHtml: true, // Allow dangerous in this version
          codeRender: this.renderCode ?? defaultCodeRender,
          lastNestedChildClass: LAST_NESTED_CHILD_CLASS,
          rawHTML: this.rawHtml,
          showIndicator: this.showIndicator
        },
        this.#getExtensions(),
        this.#renderChildren
      );
    } catch (error) {
      console.error(
        "An error occurred while rendering the following value in the ch-markdown-viewer (this error won't update the current rendered value, it is only a console.error):\n",
        this.value,
        "\n\n",
        error
      );
    }
  }

  render() {
    if (!this.value) {
      return "";
    }

    return (
      <Host
        class={
          this.showIndicator ? "ch-markdown-viewer-show-indicator" : undefined
        }
      >
        {this.theme && (
          <ch-theme
            key="theme"
            avoidFlashOfUnstyledContent={this.avoidFlashOfUnstyledContent}
            model={this.theme}
          ></ch-theme>
        )}

        <ch-markdown-viewer-lit
          value={this.#templateResult}
        ></ch-markdown-viewer-lit>
      </Host>
    );
  }
}

// // The last element have children. We must check its sub children
// if ((lastChild as MdAstParent).children !== undefined) {
//   return (lastChild as MdAstParent).children.length > 0
//     ? findLastNestedChild(lastChild as MdAstParent)
//     : lastChild;
// }
