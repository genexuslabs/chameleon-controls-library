import {
  Break,
  Code,
  Definition,
  FootnoteReference,
  Html,
  Image,
  ImageReference,
  InlineCode,
  RootContent,
  RootContentMap,
  Text,
  ThematicBreak,
  Yaml
} from "mdast";
import type {
  BlockMath,
  InlineMath
} from "../../../components/markdown-viewer/parsers/math/types";

export type ElementsWithChildren = Exclude<
  RootContent,
  | Break
  | Code
  | Definition
  | FootnoteReference
  | Html
  | Image
  | ImageReference
  | InlineCode
  | Text
  | ThematicBreak
  | Yaml
  | InlineMath
  | BlockMath
>;

export type ElementsWithoutCustomRender = Omit<
  RootContentMap,
  "tableCell" | "tableRow" | "blockMath" | "inlineMath"
>;

/**
 * @deprecated Use the `MarkdownViewerToJSXCommonMetadata` type instead.
 */
export type MarkdownToJSXCommonMetadata = {
  rawHTML: boolean;
  allowDangerousHtml: boolean;
  renderCode: MarkdownCodeRender;
};

/**
 * @deprecated Use the `CodeRender` type instead.
 */
export type MarkdownCodeRender = (options: MarkdownCodeRenderOptions) => any;

/**
 * @deprecated Use the `CodeRenderOptions` type instead.
 */
export type MarkdownCodeRenderOptions = {
  language: string;
  nestedChildIsCodeTag: boolean;
  plainText: string;
  renderedContent: any;
};
