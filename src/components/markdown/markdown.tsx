import { Component, Element, Prop, h } from "@stencil/core";

import { parseMarkdown, markdownToHastTree } from "@genexus/markdown-parser";
import {
  AlignType,
  Break,
  Code,
  Definition,
  FootnoteReference,
  Html,
  Image,
  ImageReference,
  InlineCode,
  Root,
  RootContent,
  RootContentMap,
  Table,
  Text,
  ThematicBreak,
  Yaml
} from "mdast";

const depthToHeading = {
  1: (content: any) => <h1>{content}</h1>,
  2: (content: any) => <h2>{content}</h2>,
  3: (content: any) => <h3>{content}</h3>,
  4: (content: any) => <h4>{content}</h4>,
  5: (content: any) => <h5>{content}</h5>,
  6: (content: any) => <h6>{content}</h6>
};

type ElementsWithoutChildren = Exclude<
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

type ElementsWithoutCustomRender = Omit<
  RootContentMap,
  "tableCell" | "tableRow"
>;

const renderChildren = (element: ElementsWithoutChildren) =>
  element.children.map(child => renderDictionary[child.type](child));

const tableAlignmentDictionary: { [key in AlignType]: string } = {
  left: "ch-markdown-table-column-start",
  center: "ch-markdown-table-column-center",
  right: "ch-markdown-table-column-end"
};

const getTableAlignment = (table: Table, index: number) =>
  tableAlignmentDictionary[table.align[index]];

const tableRender = (table: Table) => {
  const tableHeadRow = table.children[0];
  const tableBodyRows = table.children.slice(1);

  return (
    <table>
      <thead>
        <tr>
          {tableHeadRow.children.map((tableCell, index) => (
            <th class={getTableAlignment(table, index)}>
              {renderChildren(tableCell)}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {tableBodyRows.map(tableHead => (
          <tr>
            {tableHead.children.map((tableCell, index) => (
              <td class={getTableAlignment(table, index)}>
                {renderChildren(tableCell)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const renderDictionary: {
  [key in keyof ElementsWithoutCustomRender]: (
    element: ElementsWithoutCustomRender[key]
  ) => any;
} = {
  blockquote: element => <blockquote>{renderChildren(element)}</blockquote>,

  break: () => <br />,

  code: () => "",

  definition: () => "",

  delete: element => <del>{renderChildren(element)}</del>,

  emphasis: element => <em>{renderChildren(element)}</em>,

  footnoteDefinition: () => "",

  footnoteReference: () => "",

  heading: element => depthToHeading[element.depth](renderChildren(element)),

  html: () => "",

  image: () => "",

  imageReference: () => "",

  inlineCode: () => "",

  link: () => "",

  linkReference: () => "",

  list: element =>
    element.ordered ? (
      <ol start={element.start}>{renderChildren(element)}</ol> // TODO: Implement spread
    ) : (
      <ul>{renderChildren(element)}</ul> // TODO: Implement spread
    ),

  listItem: element => <li>{renderChildren(element)}</li>, // TODO: Implement spread

  paragraph: element => <p>{renderChildren(element)}</p>,

  strong: element => <strong>{renderChildren(element)}</strong>,

  table: tableRender, // TODO: Implement align

  text: element => element.value,

  thematicBreak: () => <hr />,

  yaml: () => ""
} as const;

@Component({
  shadow: false,
  styleUrl: "markdown.scss",
  tag: "ch-markdown"
})
export class ChMarkdown {
  @Element() el: HTMLChMarkdownElement;

  /**
   *
   */
  @Prop() readonly markdown: string;

  #hastTreeToJSX = (root: Root) =>
    root.children.map(child => renderDictionary[child.type](child));

  render() {
    if (!this.markdown) {
      return "";
    }

    parseMarkdown(this.markdown).then(result => {
      console.log("result", result);
      // this.el.innerHTML = result;
    });

    return this.#hastTreeToJSX(markdownToHastTree(this.markdown));
  }
}
