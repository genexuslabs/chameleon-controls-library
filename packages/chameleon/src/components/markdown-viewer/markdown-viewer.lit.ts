import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import { html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators/property.js";
import type { Parent as MdAstParent } from "mdast";

import { Host } from "../../utilities/host/host";

import { defaultCodeRender } from "./parsers/code-render.lit";
import {
  LAST_NESTED_CHILD_CLASS,
  markdownToJSX
} from "./parsers/markdown-to-template-result.lit";
import { markdownViewerExtension } from "./parsers/math";
import {
  markdownViewerRenderDictionary,
  renderDefinedValues
} from "./parsers/renders.lit";
import type {
  MarkdownViewerCodeRender,
  MarkdownViewerExtension,
  MarkdownViewerExtensionRender,
  MarkdownViewerRenderFunctions,
  MarkdownViewerRenderMetadata
} from "./parsers/types";

import type { ThemeModel } from "../theme/theme-types";

import styles from "./markdown-viewer.scss?inline";

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
  shadow: {},
  styles,
  tag: "ch-markdown-viewer"
})
export class ChMarkdownViewer extends KasstorElement {
  #templateResult: TemplateResult[] | undefined;
  #renders!: MarkdownViewerExtensionRender<object>;

  // /**
  //  * `true` to render potentially dangerous user content when rendering HTML
  //  * with the option `rawHtml === true`
  //  */
  // @property({ attribute: "allow-dangerous-html" }) allowDangerousHtml: boolean = false;

  /**
   * When `true`, visually hides the contents of the root node until the
   * theme stylesheet has loaded, preventing a flash of unstyled content.
   * Only takes effect when the `theme` property is set; otherwise this
   * property has no visible effect.
   */
  @property({ attribute: "avoid-flash-of-unstyled-content", type: Boolean })
  avoidFlashOfUnstyledContent: boolean = false;

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
  @property({ attribute: false })
  extensions: MarkdownViewerExtension<object>[] | undefined;
  @Observe("extensions")
  protected extensionsChanged() {
    this.#mergeCustomRendersInASingleObject();
    this.#parseMarkdown();
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
  @property({ attribute: "raw-html", type: Boolean }) rawHtml: boolean = false;

  /**
   * Allows custom rendering of code blocks (fenced code).
   * When `undefined`, the default code renderer (which uses `ch-code`) is
   * used. Provide a custom function to render code blocks with a different
   * component or UI (e.g., adding copy buttons, line numbers, etc.).
   */
  @property({ attribute: false })
  renderCode: MarkdownViewerCodeRender | undefined;

  /**
   * When `true`, a blinking cursor-like indicator is displayed after the
   * last rendered element. Useful for streaming scenarios where Markdown
   * content is being generated in real time (e.g., AI chat responses).
   *
   * The indicator's appearance is controlled by the CSS custom properties
   * `--ch-markdown-viewer-indicator-color`, `--ch-markdown-viewer-inline-size`,
   * and `--ch-markdown-viewer-block-size`.
   */
  @property({ attribute: "show-indicator", type: Boolean })
  showIndicator: boolean = false;
  @Observe("showIndicator")
  protected showIndicatorChanged() {
    this.#parseMarkdown();
  }

  /**
   * Specifies the theme model name to be used for rendering the control.
   * When set, a `ch-theme` element is rendered to load the theme stylesheet.
   * If `undefined`, no theme will be applied.
   *
   * Works together with `avoidFlashOfUnstyledContent` to prevent unstyled
   * content from being visible before the theme loads.
   */
  @property({ attribute: false })
  theme: ThemeModel | undefined = "ch-markdown-viewer";

  /**
   * Specifies the Markdown string to parse and render.
   * When `undefined` or empty, the component renders nothing.
   * If parsing fails, the error is logged to the console and the
   * previously rendered content is preserved.
   */
  @property({ attribute: false }) value: string | undefined;
  @Observe("value")
  protected valueChanged() {
    this.#parseMarkdown();
  }

  /**
   * Converts markdown abstract syntax tree (mdast) into TemplateResult.
   */
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
      const render = (this.#renders as Record<string, any>)[child.type];

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

  async #parseMarkdown() {
    if (!this.value) {
      this.#templateResult = undefined;
      this.requestUpdate();
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

    this.requestUpdate();
  }

  override connectedCallback() {
    super.connectedCallback();
    this.#mergeCustomRendersInASingleObject();

    // Lazy load ch-theme
    import("../theme/theme.lit.js");
    // Lazy load ch-code for code blocks
    import("../code/code.lit.js");
  }

  override render() {
    if (!this.value) {
      return nothing;
    }

    Host(this, {
      class: {
        "ch-markdown-viewer-show-indicator": this.showIndicator
      }
    });

    return html`${this.theme
        ? html`<ch-theme
            .avoidFlashOfUnstyledContent=${this.avoidFlashOfUnstyledContent}
            .model=${this.theme}
          ></ch-theme>`
        : nothing}${this.#templateResult}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ch-markdown-viewer": ChMarkdownViewer;
  }
}

// // The last element have children. We must check its sub children
// if ((lastChild as MdAstParent).children !== undefined) {
//   return (lastChild as MdAstParent).children.length > 0
//     ? findLastNestedChild(lastChild as MdAstParent)
//     : lastChild;
// }

// ######### Auto generated below #########

declare global {
  // prettier-ignore
  interface HTMLChMarkdownViewerElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChMarkdownViewerElement;
  }

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
   */// prettier-ignore
  interface HTMLChMarkdownViewerElement extends ChMarkdownViewer {
    // Extend the ChMarkdownViewer class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-markdown-viewer": HTMLChMarkdownViewerElement;
  }

  interface HTMLElementTagNameMap {
    "ch-markdown-viewer": HTMLChMarkdownViewerElement;
  }
}

