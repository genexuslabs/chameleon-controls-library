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

/**
 * A control to render markdown syntax. It supports GitHub Flavored Markdown
 * (GFM) and code highlighting.
 *  - It parses the incoming markdown to [mdast](https://github.com/syntax-tree/mdast) using [micromark](https://github.com/micromark/micromark) via [mdast-util-from-markdown](https://github.com/syntax-tree/mdast-util-from-markdown).
 *
 * - After that, it implements a reactivity layer by implementing its own render for the mdast. With this, changes to the input markdown only update the portion of the DOM that changes.
 *
 * - It supports Github Flavored Markdown (GFM) by using [mdast-util-gfm](https://github.com/syntax-tree/mdast-util-gfm) and [micromark-extension-gfm](https://github.com/micromark/micromark-extension-gfm).
 *
 * - It supports code highlight by parsing the incomming code of the markdown to [hast](https://github.com/micromark/micromark-extension-gfm) using [lowlight](lowlight). After that, it implements a reactivity layer by implementing its own render for the hast.
 *
 * - It also supports all programming languages from [highlight.js](https://github.com/highlightjs/highlight.js).
 *
 * - When the code highlighting is needed at runtime, the control will load on demand the code parser and the programming language needed to parse the code.
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
   * `true` to visually hide the contents of the root node while the control's
   * style is not loaded. Only works if the `theme` property is set.
   */
  @Prop() readonly avoidFlashOfUnstyledContent: boolean = false;

  /**
   * Specifies an array of custom extensions to extend and customize the
   * rendered markdown language.
   * There a 3 things needed to implement an extension:
   *  - A tokenizer (the heavy part of the extension).
   *  - A mapping between the custom token to the custom mdast nodes (pretty straightforward).
   *  - A render of the custom mdast nodes in `TemplateResult` (pretty straightforward).
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
   * `true` to render raw HTML with sanitization.
   */
  @Prop() readonly rawHtml: boolean = false;

  /**
   * This property allows us to implement custom rendering for the code blocks.
   */
  @Prop() readonly renderCode?: MarkdownViewerCodeRender | undefined;

  /**
   * Specifies if an indicator is displayed in the last element rendered.
   * Useful for streaming scenarios where a loading indicator is needed.
   */
  @Prop() readonly showIndicator: boolean = false;

  /**
   * Specifies the theme to be used for rendering the control.
   * If `undefined`, no theme will be applied.
   */
  @Prop() readonly theme: string | undefined = "ch-markdown-viewer";

  /**
   * Specifies the markdown string to parse.
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

  #mergeCustomRendersInASingleObject = () => {
    if (!this.extensions || this.extensions.length === 0) {
      this.#renders = markdownViewerRenderDictionary;
    }
    // Merge the render of the extensions into a single render object
    else {
      this.#renders = Object.assign(
        markdownViewerRenderDictionary,
        ...this.extensions.map(({ mdastRender }) => mdastRender)
      );
    }
  };

  connectedCallback() {
    this.#mergeCustomRendersInASingleObject();
  }

  async componentWillRender() {
    if (!this.value) {
      return;
    }

    this.#templateResult = await markdownToJSX(
      this.value,
      {
        allowDangerousHtml: true, // Allow dangerous in this version
        codeRender: this.renderCode ?? defaultCodeRender,
        lastNestedChildClass: LAST_NESTED_CHILD_CLASS,
        rawHTML: this.rawHtml,
        showIndicator: this.showIndicator
      },
      this.extensions,
      this.#renderChildren
    );
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
