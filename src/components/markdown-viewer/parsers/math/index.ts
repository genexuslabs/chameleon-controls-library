import { MarkdownViewerExtension } from "../types";
import { mathDelimitersFromMarkdown } from "./mdast-util-math-delimiters";
import { mathDelimitersTokenizer } from "./micromark-extension-math-delimiters";
import { render } from "./render";
import { ExtendedContentMapping } from "./types";

export const markdownViewerExtension: MarkdownViewerExtension<ExtendedContentMapping> =
  {
    tokenizer: mathDelimitersTokenizer(),
    tokensToMdast: mathDelimitersFromMarkdown(),
    mdastRender: render
  };
