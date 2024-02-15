import { h } from "@stencil/core";
import { AlignType, Root, Table } from "mdast";
import { markdownToMdAST } from "@genexus/markdown-parser";

import {
  ElementsWithChildren,
  ElementsWithoutCustomRender,
  MarkdownToJSXCommonMetadata
} from "./types";
import { parseCodeToJSX } from "./code-highlight"; // The implementation is not used in the initial load, only the type.
import { rawHTMLToJSX } from "./raw-html-to-jsx";
import {
  clearLinkDefinitions,
  getLinkDefinition,
  setLinkDefinition
} from "./link-resolver";

/**
 * Regex to match the id of the heading.
 *
 * @input `"# Hello, world {#something} "`
 * @output `something`
 */
const HEADING_ID_REGEX = /\{#(.*?)\}/;

// Lazy load the code parser implementation
let codeToJSX: typeof parseCodeToJSX;
let HTMLToJSX: typeof rawHTMLToJSX;

const depthToHeading = {
  1: (content: any, id?: string) => <h1 id={id}>{content}</h1>,
  2: (content: any, id?: string) => <h2 id={id}>{content}</h2>,
  3: (content: any, id?: string) => <h3 id={id}>{content}</h3>,
  4: (content: any, id?: string) => <h4 id={id}>{content}</h4>,
  5: (content: any, id?: string) => <h5 id={id}>{content}</h5>,
  6: (content: any, id?: string) => <h6 id={id}>{content}</h6>
} as const;

const tableAlignmentDictionary: { [key in AlignType]: string } = {
  left: "ch-markdown-table-column-start",
  center: "ch-markdown-table-column-center",
  right: "ch-markdown-table-column-end"
};

const getTableAlignment = (table: Table, index: number) =>
  tableAlignmentDictionary[table.align[index]];

const tableRender = async (
  table: Table,
  metadata: MarkdownToJSXCommonMetadata
) => {
  const tableHeadRow = table.children[0];
  const tableBodyRows = table.children.slice(1);
  const columnCount = tableHeadRow.children.length;

  // Head cell promises
  const headCellPromises = tableHeadRow.children.map(tableCell =>
    mdASTtoJSX(tableCell, metadata)
  );

  const bodyCellPromises = [];

  // Body cell promises
  tableBodyRows.forEach(tableHead => {
    tableHead.children.forEach(tableCell => {
      bodyCellPromises.push(mdASTtoJSX(tableCell, metadata));
    });
  });

  // Wait for all results to be completed in parallel
  const tableHeadContent = await Promise.allSettled(headCellPromises);
  const tableBodyContent = await Promise.allSettled(bodyCellPromises);

  // Return the JSX array
  const headCells = tableHeadContent.map(
    jsx => (jsx as PromiseFulfilledResult<any>).value
  );
  const bodyCells = tableBodyContent.map(
    jsx => (jsx as PromiseFulfilledResult<any>).value
  );

  return (
    <table>
      <thead>
        <tr>
          {tableHeadRow.children.map((_, index) => (
            <th class={getTableAlignment(table, index)}>{headCells[index]}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {tableBodyRows.map((tableHead, rowIndex) => (
          <tr>
            {tableHead.children.map((_, cellIndex) => (
              <td class={getTableAlignment(table, cellIndex)}>
                {bodyCells[columnCount * rowIndex + cellIndex]}
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
    metadata: MarkdownToJSXCommonMetadata
  ) => Promise<any> | any;
} = {
  blockquote: async (element, metadata) => {
    const content = await mdASTtoJSX(element, metadata);

    return <blockquote>{content}</blockquote>;
  }, // TODO: Check if code can be inside this tag

  break: () => <br />,

  code: async (element, metadata) => {
    // Load the parser implementation
    codeToJSX ||= (await import("./code-highlight")).parseCodeToJSX; // TODO: Resolve race condition
    const content = await codeToJSX(
      element.value,
      element.lang,
      metadata.renderCode
    );

    return content;
  },

  definition: element => setLinkDefinition(element.identifier, element.url),

  delete: async (element, metadata) => {
    const content = await mdASTtoJSX(element, metadata);

    return <del>{content}</del>;
  }, // TODO: Check if code can be inside this tag

  emphasis: async (element, metadata) => {
    const content = await mdASTtoJSX(element, metadata);

    return <em>{content}</em>;
  }, // TODO: Check if code can be inside this tag

  footnoteDefinition: () => "",

  footnoteReference: () => "",

  heading: async (element, metadata) => {
    // Check if the heading has an id
    const lastChild = element.children.at(-1);
    let headingId: string;

    if (lastChild?.type === "text") {
      const match = lastChild.value.match(HEADING_ID_REGEX);

      if (match && match.length > 1) {
        headingId = match[1];

        // Remove markdown id from the header text
        lastChild.value = lastChild.value.replace(`{#${headingId}}`, "");
      }
    }

    // Render the content after the heading id processing
    const content = await mdASTtoJSX(element, metadata);

    return depthToHeading[element.depth](content, headingId); // TODO: Add anchor icon at the start of the heading
  },

  html: async (element, metadata) => {
    if (metadata.rawHTML && !HTMLToJSX) {
      // Load the parser implementation
      HTMLToJSX = (await import("./raw-html-to-jsx")).rawHTMLToJSX;
    }

    // TESTTTTT
    if (metadata.rawHTML) {
      console.log(HTMLToJSX(element.value, metadata.allowDangerousHtml));
    }

    return metadata.rawHTML ? element.value : element.value;
  },

  image: element => (
    <img
      src={element.url}
      alt={element.alt}
      title={element.title}
      loading="lazy"
    />
  ),

  imageReference: () => "",

  inlineCode: element => <code class="hljs">{element.value}</code>,

  link: async (element, metadata) => {
    const content = await mdASTtoJSX(element, metadata);

    return (
      <a
        aria-label={element.title || null}
        title={element.title || null}
        href={element.url}
      >
        {content}
      </a>
    );
  }, // TODO: Sanitize href?

  linkReference: async (element, metadata) => {
    const content = await mdASTtoJSX(element, metadata);
    let url = "";

    // TODO: Implement the rest of alternatives for "referenceType"
    if (element.referenceType === "shortcut") {
      url = await getLinkDefinition(element.identifier);
    }

    // TODO: It's unnecessary to set aria-label when referenceType === "shortcut"
    // TODO: The title is not supported well. See "An Example Putting the Parts Together" section in markdown.html

    return (
      <a aria-label={element.label || null} href={url}>
        {content}
      </a>
    );
  },

  list: async (element, metadata) => {
    const content = await mdASTtoJSX(element, metadata);

    return element.ordered ? (
      <ol start={element.start}>{content}</ol> // TODO: Implement spread  // TODO: Check if code can be inside this tag
    ) : (
      <ul>{content}</ul> // TODO: Implement spread  // TODO: Check if code can be inside this tag
    );
  },

  listItem: async (element, metadata) => {
    const content = await mdASTtoJSX(element, metadata);

    return <li>{content}</li>;
  }, // TODO: Implement spread  // TODO: Check if code can be inside this tag

  paragraph: async (element, metadata) => {
    const content = await mdASTtoJSX(element, metadata);

    return <p>{content}</p>;
  }, // TODO: Check if code can be inside this tag

  strong: async (element, metadata) => {
    const content = await mdASTtoJSX(element, metadata);

    return <strong>{content}</strong>;
  }, // TODO: Check if code can be inside this tag

  table: tableRender, // TODO: Check if code can be inside this tag

  text: element => element.value,

  thematicBreak: () => <hr />,

  yaml: () => ""
} as const;

/**
 * Converts markdown abstract syntax tree (mdast) into JSX.
 */
async function mdASTtoJSX(
  root: ElementsWithChildren | Root,
  metadata: MarkdownToJSXCommonMetadata
) {
  const childrenLength = root.children.length;
  const asyncJSX = new Array(childrenLength);

  // Get the async JSX
  for (let index = 0; index < childrenLength; index++) {
    const child = root.children[index];

    asyncJSX.push(renderDictionary[child.type](child, metadata));
  }

  // Wait for all results to be completed in parallel
  const renderedContent = await Promise.allSettled(asyncJSX);

  // Return the JSX array
  return renderedContent.map(jsx => (jsx as PromiseFulfilledResult<any>).value);
}

export const markdownToJSX = async (
  markdown: string,
  metadata: MarkdownToJSXCommonMetadata
) => {
  const mdAST: Root = markdownToMdAST(markdown);

  const JSX = await mdASTtoJSX(mdAST, metadata);
  clearLinkDefinitions();

  return JSX;
};
