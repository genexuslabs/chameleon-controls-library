import { markdownToMdAST } from "@genexus/markdown-parser";
import { nothing, type TemplateResult } from "lit";
import { Parent as MdAstParent, Root } from "mdast";

import { clearLinkDefinitions } from "./link-resolver";
import {
  MarkdownViewerExtension,
  MarkdownViewerRenderFunctions,
  MarkdownViewerRenderMetadata
} from "./types";

export const LAST_NESTED_CHILD_CLASS = "last-nested-child";

const findLastNestedChild = (elementWithChildren: MdAstParent | Root) => {
  const lastChild = elementWithChildren.children.at(-1);

  // When rendering special values like "\n\n" or "\r\n", the root has no
  // children
  if (lastChild === undefined) {
    return elementWithChildren;
  }

  // The last element have children. We must check its sub children
  if ((lastChild as MdAstParent).children?.length > 0) {
    return findLastNestedChild(lastChild as MdAstParent);
  }

  if (lastChild.type === "code" || lastChild.type === "html") {
    return lastChild;
  }

  return elementWithChildren;
};

export const markdownToJSX = async (
  markdown: string,
  metadata: MarkdownViewerRenderMetadata,
  extensions: MarkdownViewerExtension<object>[],
  renderChildren: (
    parent: MdAstParent,
    metadata: MarkdownViewerRenderMetadata,
    functions: MarkdownViewerRenderFunctions
  ) => Promise<TemplateResult[]>
): Promise<TemplateResult[]> => {
  const mdAST: Root = markdownToMdAST(
    markdown,
    extensions?.map(extension => extension.tokenizer),
    extensions?.map(extension => extension.tokensToMdast)
  );

  // First, find the last nested child. Useful to set a marker in the element
  // that accomplish this condition
  const lastNestedChild = findLastNestedChild(mdAST);

  const isLastNestedChild: MarkdownViewerRenderFunctions["isLastNestedChild"] =
    element => element === lastNestedChild;

  const getAdditionalClasses: MarkdownViewerRenderFunctions["getAdditionalClasses"] =
    element => (isLastNestedChild(element) ? LAST_NESTED_CHILD_CLASS : nothing);

  // Render the markdown as TemplateResult
  const JSX = await renderChildren(mdAST, metadata, {
    isLastNestedChild,
    getAdditionalClasses,
    renderChildren
  });

  // Clear all definitions used to render the current markdown, so the next
  // render does not have old information
  // TODO: These definitions should by shared in the metadata object of the
  // renders, instead of being a global state
  clearLinkDefinitions();

  return JSX;
};
