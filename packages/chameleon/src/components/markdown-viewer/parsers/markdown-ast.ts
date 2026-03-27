import {
  type Extension as MdastExtension,
  fromMarkdown
} from "mdast-util-from-markdown";
import type { Extension as MicromarkExtension } from "micromark-util-types";
import { gfm } from "micromark-extension-gfm";
import { gfmFromMarkdown } from "mdast-util-gfm";

export const markdownToMdAST = (
  markdownToParse: string,

  /**
   * A collection of syntax extensions to change how markdown is tokenized.
   */
  tokenizers?: MicromarkExtension[],

  /**
   * Change how tokens are turned into a Markdown Abstract Syntax Tree (mdast).
   */
  tokensToMdast?: (Partial<MdastExtension> | Partial<MdastExtension>[])[]
) =>
  fromMarkdown(markdownToParse, {
    extensions: [gfm(), ...(tokenizers ?? [])],
    mdastExtensions: [gfmFromMarkdown(), ...(tokensToMdast ?? [])]
  });
