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

export type MarkdownToJSXCommonMetadata = {
  rawHTML: boolean;
  allowDangerousHtml: boolean;
  renderCode: MarkdownCodeRender;
};

export type MarkdownCodeRender = (options: MarkdownCodeRenderOptions) => any;

export type MarkdownCodeRenderOptions = {
  language: string;
  nestedChildIsCodeTag: boolean;
  plainText: string;
  renderedContent: any;
};
