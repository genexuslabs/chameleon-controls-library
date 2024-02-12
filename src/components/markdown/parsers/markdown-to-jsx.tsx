import { h } from "@stencil/core";
import { AlignType, Root, Table } from "mdast";
import { markdownToMdAST } from "@genexus/markdown-parser";

import { ElementsWithoutChildren, ElementsWithoutCustomRender } from "./types";
import { parseCodeToJSX } from "./code-highlight"; // The implementation is not used in the initial load, only the type.
import { rawHTMLToJSX } from "./raw-html-to-jsx";

// Lazy load the code parser implementation
let codeToJSX: typeof parseCodeToJSX;
let HTMLToJSX: typeof rawHTMLToJSX;

const depthToHeading = {
  1: (content: any) => <h1>{content}</h1>,
  2: (content: any) => <h2>{content}</h2>,
  3: (content: any) => <h3>{content}</h3>,
  4: (content: any) => <h4>{content}</h4>,
  5: (content: any) => <h5>{content}</h5>,
  6: (content: any) => <h6>{content}</h6>
};

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

export const renderDictionary: {
  [key in keyof ElementsWithoutCustomRender]: (
    element: ElementsWithoutCustomRender[key],
    rawHTML: boolean,
    allowDangerousHtml: boolean
  ) => any | Promise<any>;
} = {
  blockquote: element => <blockquote>{renderChildren(element)}</blockquote>, // TODO: Check if code can be inside this tag

  break: () => <br />,

  code: async element => {
    // Load the parser implementation
    codeToJSX ||= (await import("./code-highlight")).parseCodeToJSX;

    return codeToJSX(element.lang, element.value);
  },

  definition: () => "",

  delete: element => <del>{renderChildren(element)}</del>, // TODO: Check if code can be inside this tag

  emphasis: element => <em>{renderChildren(element)}</em>, // TODO: Check if code can be inside this tag

  footnoteDefinition: () => "",

  footnoteReference: () => "",

  heading: element => depthToHeading[element.depth](renderChildren(element)), // TODO: Check if code can be inside this tag

  html: async (element, rawHTML, allowDangerousHtml) => {
    if (rawHTML && !HTMLToJSX) {
      // Load the parser implementation
      HTMLToJSX = (await import("./raw-html-to-jsx")).rawHTMLToJSX;
    }

    // TESTTTTT
    if (rawHTML) {
      console.log(HTMLToJSX(element.value, allowDangerousHtml));
    }

    return rawHTML ? element.value : element.value;
  },

  image: () => "",

  imageReference: () => "",

  inlineCode: element => <code class="hljs">{element.value}</code>,

  link: element => (
    <a
      aria-label={element.title || null}
      title={element.title || null}
      href={element.url}
    >
      {renderChildren(element)}
    </a>
  ), // TODO: Sanitize href?

  linkReference: () => "",

  list: element =>
    element.ordered ? (
      <ol start={element.start}>{renderChildren(element)}</ol> // TODO: Implement spread  // TODO: Check if code can be inside this tag
    ) : (
      <ul>{renderChildren(element)}</ul> // TODO: Implement spread  // TODO: Check if code can be inside this tag
    ),

  listItem: element => <li>{renderChildren(element)}</li>, // TODO: Implement spread  // TODO: Check if code can be inside this tag

  paragraph: element => <p>{renderChildren(element)}</p>, // TODO: Check if code can be inside this tag

  strong: element => <strong>{renderChildren(element)}</strong>, // TODO: Check if code can be inside this tag

  table: tableRender, // TODO: Check if code can be inside this tag

  text: element => element.value,

  thematicBreak: () => <hr />,

  yaml: () => ""
} as const;

function renderChildren(element: ElementsWithoutChildren) {
  return element.children.map(child => renderDictionary[child.type](child));
}

/**
 * Converts markdown abstract syntax tree (mdast) into JSX.
 */
const mdASTtoJSX = async (
  root: Root,
  rawHTML: boolean,
  allowDangerousHtml: boolean
) => {
  // Get the async JSX
  const asyncJSX = root.children.map(child =>
    renderDictionary[child.type](child, rawHTML, allowDangerousHtml)
  );

  // Wait for all results to be completed in parallel
  const renderedContent = await Promise.allSettled(asyncJSX);

  // Return the JSX array
  return renderedContent.map(jsx => (jsx as PromiseFulfilledResult<any>).value);
};

export const markdownToJSX = (
  markdown: string,
  rawHTML: boolean,
  allowDangerousHtml: boolean
) => {
  const mdAST: Root = markdownToMdAST(markdown);
  console.log("Markdown AST", mdAST);

  return mdASTtoJSX(mdAST, rawHTML, allowDangerousHtml);
};
