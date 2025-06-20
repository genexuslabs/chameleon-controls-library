import { MarkdownViewerExtension } from "../parsers/types";
import { buttonReferenceFromMarkdown } from "./mdast-util-button-reference";
import { buttonReference } from "./micromark-extension-button-reference";
import { render } from "./render";
import { ExtendedContentMapping } from "./types";

export const markdownViewerExtension: MarkdownViewerExtension<ExtendedContentMapping> =
  {
    tokenizer: buttonReference(),
    tokensToMdast: buttonReferenceFromMarkdown(),
    mdastRender: render
  };
