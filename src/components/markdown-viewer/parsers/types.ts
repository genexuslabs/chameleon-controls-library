import type { nothing, TemplateResult } from "lit";
import type {
  Code,
  Html,
  Node as MdAstNode,
  Parent as MdAstParent,
  RootContentMap
} from "mdast";
import type { Extension as MdastExtension } from "mdast-util-from-markdown";
import type { Extension as MicromarkExtension } from "micromark-util-types";

export type ElementsWithoutCustomRender = Omit<
  RootContentMap,
  "tableCell" | "tableRow" | "inlineMath" | "blockMath"
>;

export type MarkdownViewerRenderMetadata = {
  allowDangerousHtml: boolean;
  codeRender: MarkdownViewerCodeRender;
  lastNestedChildClass: string;
  rawHTML: boolean;
  showIndicator: boolean;
};

export type MarkdownViewerRenderFunctions = {
  isLastNestedChild: (element: MdAstNode) => boolean;
  renderChildren: (
    parent: MdAstParent,
    metadata: MarkdownViewerRenderMetadata,
    functions: MarkdownViewerRenderFunctions
  ) => Promise<TemplateResult[]>;
  getAdditionalClasses: (
    element: MdAstParent | Code | Html
  ) => string | typeof nothing;
};

export type MarkdownViewerExtension<ContentMapping extends object> = {
  /**
   * A syntax extension to change how markdown is tokenized.
   */
  tokenizer: MicromarkExtension;

  /**
   * Change how tokens are turned into a Markdown Abstract Syntax Tree (mdast).
   */
  tokensToMdast?: Partial<MdastExtension> | Partial<MdastExtension>[];

  /**
   * A mapping from the custom mdast nodes to the Lit's `TemplateResult`
   * function. This object should map the new mdast nodes (that this extension
   * gives) to a function that returns `TemplateResult`.
   *
   * @example
   * ```ts
   * const mdastRender = {
   *   buttonReference: (element: ButtonReference) =>
   *     html`<button type="button" @click=${doSomething}>
   *       ${element.value}
   *     </button>`,
   *
   *   emoji: (element: Emoji) => html`${element.value}`
   * } as const satisfies MarkdownViewerExtensionRender<ExtendedContentMapping>
   *
   * type ExtendedContent = ButtonReference | Emoji;
   *
   * type ExtendedContentMapping = {
   *   [key in ExtendedContent["type"]]: Extract<ExtendedContent, { type: key }>;
   * };
   * ```
   */
  mdastRender: MarkdownViewerExtensionRender<ContentMapping>;
};

export type MarkdownViewerExtensionRender<ContentMapping extends object> = {
  [key in keyof ContentMapping]: MarkdownViewerExtensionRenderFunction<
    ContentMapping[key]
  >;
};

export type MarkdownViewerExtensionRenderFunction<T> = (
  element: T
) =>
  | Promise<string | TemplateResult | TemplateResult[] | void>
  | string
  | TemplateResult
  | TemplateResult[]
  | void;

export type MarkdownViewerCodeRender = (
  options: MarkdownViewerCodeRenderOptions
) => TemplateResult;

export type MarkdownViewerCodeRenderOptions = {
  language: string;
  lastNestedChildClass: string;
  plainText: string;
  showIndicator: boolean;
};
