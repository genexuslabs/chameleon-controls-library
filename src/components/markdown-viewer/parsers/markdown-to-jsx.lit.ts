import { markdownToMdAST } from "@genexus/markdown-parser";
import { html, nothing, type TemplateResult } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { AlignType, Code, Html, Root, Table } from "mdast";

import {
  clearLinkDefinitions,
  getLinkDefinition,
  setLinkDefinition
} from "./link-resolver";
import { rawHTMLToJSX } from "./raw-html-to-jsx.lit";
import {
  ElementsWithChildren,
  ElementsWithoutCustomRender,
  MarkdownViewerToJSXCommonMetadata
} from "./types";

/**
 * Regex to match the id of the heading.
 *
 * @input `"# Hello, world {#something} "`
 * @output `something`
 */
const HEADING_ID_REGEX = /\{#(.*?)\}/;

export const LAST_NESTED_CHILD_CLASS = "last-nested-child";

// Lazy load the code parser implementation
let HTMLToJSX: typeof rawHTMLToJSX;
let lastNestedChild: Root | ElementsWithChildren | Code | Html;

const isLastNestedChildClass = (element: ElementsWithChildren | Code | Html) =>
  element === lastNestedChild;

const checkAndGetLastNestedChildClass = (
  element: ElementsWithChildren
): typeof LAST_NESTED_CHILD_CLASS | typeof nothing =>
  isLastNestedChildClass(element) ? LAST_NESTED_CHILD_CLASS : nothing;

const depthToHeading = {
  1: (
    content: any,
    classes: string | typeof nothing,
    id: string | typeof nothing
  ) => html`<h1 class=${classes} id=${id}>${content}</h1>`,

  2: (
    content: any,
    classes: string | typeof nothing,
    id: string | typeof nothing
  ) => html`<h2 class=${classes} id=${id}>${content}</h2>`,

  3: (
    content: any,
    classes: string | typeof nothing,
    id: string | typeof nothing
  ) => html`<h3 class=${classes} id=${id}>${content}</h3>`,

  4: (
    content: any,
    classes: string | typeof nothing,
    id: string | typeof nothing
  ) => html`<h4 class=${classes} id=${id}>${content}</h4>`,

  5: (
    content: any,
    classes: string | typeof nothing,
    id: string | typeof nothing
  ) => html`<h5 class=${classes} id=${id}>${content}</h5>`,

  6: (
    content: any,
    classes: string | typeof nothing,
    id: string | typeof nothing
  ) => html`<h6 class=${classes} id=${id}>${content}</h6>`
} as const;

const tableAlignmentDictionary: { [key in AlignType]: string } = {
  left: "ch-markdown-table-column-start",
  center: "ch-markdown-table-column-center",
  right: "ch-markdown-table-column-end"
};

const tableRender = async (
  table: Table,
  metadata: MarkdownViewerToJSXCommonMetadata
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

  const alignments = table.align.map(
    alignment => tableAlignmentDictionary[alignment]
  );

  return html`<table>
    <thead>
      <tr>
        ${tableHeadRow.children.map(
          (tableCell, index) =>
            html`<th
              class=${classMap({
                [alignments[index]]: !!alignments[index],
                [LAST_NESTED_CHILD_CLASS]: tableCell === lastNestedChild
              })}
            >
              ${headCells[index]}
            </th>`
        )}
      </tr>
    </thead>

    <tbody>
      ${tableBodyRows.map(
        (tableHead, rowIndex) =>
          html`<tr>
            ${tableHead.children.map(
              (tableCell, cellIndex) =>
                html`<td
                  class=${classMap({
                    [alignments[cellIndex]]: !!alignments[cellIndex],
                    [LAST_NESTED_CHILD_CLASS]: tableCell === lastNestedChild
                  })}
                >
                  ${bodyCells[columnCount * rowIndex + cellIndex]}
                </td>`
            )}
          </tr>`
      )}
    </tbody>
  </table>`;
};

export const renderDictionary: {
  [key in keyof ElementsWithoutCustomRender]: (
    element: ElementsWithoutCustomRender[key],
    metadata: MarkdownViewerToJSXCommonMetadata
  ) => Promise<any> | any;
} = {
  blockquote: async (element, metadata) => {
    const content = await mdASTtoJSX(element, metadata);

    return html`<blockquote class=${checkAndGetLastNestedChildClass(element)}>
      ${content}
    </blockquote>`;
  }, // TODO: Check if code can be inside this tag

  break: () => html`<br />`,

  code: (element, metadata) =>
    metadata.codeRender({
      lastNestedChildClass: metadata.lastNestedChildClass,
      language: element.lang,
      plainText: element.value,
      showIndicator: metadata.showIndicator && isLastNestedChildClass(element)
    }),

  definition: element => setLinkDefinition(element.identifier, element.url),

  delete: async (element, metadata) => {
    const content = await mdASTtoJSX(element, metadata);

    return html`<del class=${checkAndGetLastNestedChildClass(element)}
      >${content}</del
    >`;
  }, // TODO: Check if code can be inside this tag

  emphasis: async (element, metadata) => {
    const content = await mdASTtoJSX(element, metadata);

    return html`<em class=${checkAndGetLastNestedChildClass(element)}
      >${content}</em
    >`;
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
    const classes = checkAndGetLastNestedChildClass(element);

    return depthToHeading[element.depth](
      content,
      classes,
      headingId || nothing
    ); // TODO: Add anchor icon at the start of the heading
  },

  html: async (element, metadata) => {
    if (metadata.rawHTML && !HTMLToJSX) {
      // Load the parser implementation
      HTMLToJSX = (await import("./raw-html-to-jsx.lit")).rawHTMLToJSX;
    }

    return metadata.rawHTML
      ? HTMLToJSX(
          element.value,
          metadata.allowDangerousHtml,
          // TODO: Add unit tests for these cases
          metadata.showIndicator && isLastNestedChildClass(element)
        )
      : element.value;
  },

  image: element =>
    html`<img
      src=${element.url}
      alt=${element.alt}
      title=${element.title}
      loading="lazy"
    />`,

  imageReference: () => "",

  inlineCode: element => html`<code class="hljs">${element.value}</code>`,

  link: async (element, metadata) => {
    // Sanitize scripts
    if (element.url.includes("javascript:")) {
      return "";
    }

    const content = await mdASTtoJSX(element, metadata);

    return html`<a
      aria-label=${element.title || nothing}
      title=${element.title || nothing}
      class=${checkAndGetLastNestedChildClass(element)}
      href=${element.url}
    >
      ${content}
    </a>`;
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

    // Sanitize scripts
    if (url.includes("javascript:")) {
      return "";
    }

    return html`<a
      aria-label=${element.label || nothing}
      class=${checkAndGetLastNestedChildClass(element)}
      href=${url}
    >
      ${content}
    </a>`;
  },

  list: async (element, metadata) => {
    const content = await mdASTtoJSX(element, metadata);

    return element.ordered
      ? html`<ol
          class=${checkAndGetLastNestedChildClass(element)}
          start=${element.start}
        >
          ${content}
        </ol>` // TODO: Implement spread  // TODO: Check if code can be inside this tag
      : html`<ul class=${checkAndGetLastNestedChildClass(element)}>
          ${content}
        </ul>`; // TODO: Implement spread  // TODO: Check if code can be inside this tag
  },

  listItem: async (element, metadata) => {
    const content = await mdASTtoJSX(element, metadata);

    return html`<li class=${checkAndGetLastNestedChildClass(element)}>
      ${content}
    </li>`;
  }, // TODO: Implement spread  // TODO: Check if code can be inside this tag

  paragraph: async (element, metadata) => {
    const content = await mdASTtoJSX(element, metadata);

    return html`<p class=${checkAndGetLastNestedChildClass(element)}>
      ${content}
    </p>`;
  }, // TODO: Check if code can be inside this tag

  strong: async (element, metadata) => {
    const content = await mdASTtoJSX(element, metadata);

    return html`<strong class=${checkAndGetLastNestedChildClass(element)}>
      ${content}
    </strong>`;
  }, // TODO: Check if code can be inside this tag

  table: tableRender, // TODO: Check if code can be inside this tag

  text: element => element.value,

  thematicBreak: () => html`<hr />`,

  yaml: () => ""
} as const;

const findLastNestedChild = (
  elementWithChildren: ElementsWithChildren | Root
) => {
  const lastChild = elementWithChildren.children.at(-1);

  // The last element have children. We must check its sub children
  if ((lastChild as ElementsWithChildren).children?.length > 0) {
    return findLastNestedChild(lastChild as ElementsWithChildren);
  }

  if (lastChild.type === "code" || lastChild.type === "html") {
    return lastChild;
  }

  return elementWithChildren;
};

/**
 * Converts markdown abstract syntax tree (mdast) into JSX.
 */
async function mdASTtoJSX(
  root: ElementsWithChildren | Root,
  metadata: MarkdownViewerToJSXCommonMetadata
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
  metadata: MarkdownViewerToJSXCommonMetadata
): Promise<TemplateResult[]> => {
  const mdAST: Root = markdownToMdAST(markdown);

  // First, find the last nested child. Useful to set a marker in the element
  // that accomplish this condition
  lastNestedChild = findLastNestedChild(mdAST);

  // Render the markdown as JSX
  const JSX = await mdASTtoJSX(mdAST, metadata);

  // Clear all definitions used to render the current markdown, so the next
  // render does not have old information
  clearLinkDefinitions();

  return JSX;
};
