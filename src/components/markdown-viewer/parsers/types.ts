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
import { CodeRender } from "../../code/internal/types";

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
  renderCode: CodeRender;
};
