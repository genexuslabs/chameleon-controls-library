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
>;

export type ElementsWithoutCustomRender = Omit<
  RootContentMap,
  "tableCell" | "tableRow"
>;

export type MarkdownViewerToJSXCommonMetadata = {
  allowDangerousHtml: boolean;
  codeRender: MarkdownViewerCodeRender;
  lastNestedChildClass: string;
  rawHTML: boolean;
};

export type MarkdownViewerCodeRender = (
  options: MarkdownViewerCodeRenderOptions
) => any;

export type MarkdownViewerCodeRenderOptions = {
  language: string;
  lastNestedChildClass: string;
  plainText: string;
  showIndicator: boolean;
};