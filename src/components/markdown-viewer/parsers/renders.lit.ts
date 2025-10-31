import { html, nothing, type TemplateResult } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { AlignType, Table } from "mdast";
import { getLinkDefinition, setLinkDefinition } from "./link-resolver";
import type { rawHTMLToJSX } from "./raw-html-to-jsx.lit";
import type {
  ElementsWithoutCustomRender,
  MarkdownViewerRenderFunctions,
  MarkdownViewerRenderMetadata
} from "./types";

/**
 * Regex to match the id of the heading.
 *
 * @input `"# Hello, world {#something} "`
 * @output `something`
 */
const HEADING_ID_REGEX = /\{#(.*?)\}/;

// Lazy load the code parser implementation
let HTMLToJSX: typeof rawHTMLToJSX;

export const renderDefinedValues = <T>(
  renderedContent: PromiseSettledResult<T>[]
): T[] => {
  const result = [];

  // We have to filter undefined values, otherwise Lit will ender those values
  // with a comment <!----> which causes flickering, because in some occasions
  // comments are appended above DOM content, which destroys/re-creates the DOM
  // content
  for (let index = 0; index < renderedContent.length; index++) {
    const content = (renderedContent[index] as PromiseFulfilledResult<any>)
      .value;

    if (content) {
      result.push(content);
    }
  }

  return result;
};

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

const tableHeadRender = (
  headCells: TemplateResult[],
  alignmentClass: string | undefined,
  additionalClasses: ReturnType<
    MarkdownViewerRenderFunctions["getAdditionalClasses"]
  >
) => {
  const classes =
    alignmentClass || typeof additionalClasses === "string"
      ? classMap({
          [alignmentClass]: !!alignmentClass,
          [additionalClasses]: typeof additionalClasses === "string"
        })
      : nothing;

  return html`<th class=${classes}>${headCells}</th>`;
};

const tableCellDataRender = (
  bodyCell: TemplateResult,
  alignmentClass: string | undefined,
  additionalClasses: ReturnType<
    MarkdownViewerRenderFunctions["getAdditionalClasses"]
  >
) => {
  const classes =
    alignmentClass || typeof additionalClasses === "string"
      ? classMap({
          [alignmentClass]: !!alignmentClass,
          [additionalClasses]: typeof additionalClasses === "string"
        })
      : nothing;

  return html`<td class=${classes}>${bodyCell}</td>`;
};

const tableRender = async (
  table: Table,
  metadata: MarkdownViewerRenderMetadata,
  functions: MarkdownViewerRenderFunctions
) => {
  const tableHeadRow = table.children[0];
  const tableBodyRows = table.children.slice(1);
  const columnCount = tableHeadRow.children.length;

  // Head cell promises
  const headCellPromises = tableHeadRow.children.map(tableCell =>
    functions.renderChildren(tableCell, metadata, functions)
  );

  const bodyCellPromises = [];

  // Body cell promises
  tableBodyRows.forEach(tableHead => {
    tableHead.children.forEach(tableCell => {
      bodyCellPromises.push(
        functions.renderChildren(tableCell, metadata, functions)
      );
    });
  });

  // Wait for all results to be completed in parallel.
  // TODO: Process in parallel these two promises
  const tableHeadContent = await Promise.allSettled(headCellPromises);
  const tableBodyContent = await Promise.allSettled(bodyCellPromises);

  // Return the JSX array
  const headCells = renderDefinedValues(tableHeadContent);
  const bodyCells = renderDefinedValues(tableBodyContent);

  const alignments = table.align.map(
    alignment => tableAlignmentDictionary[alignment]
  );

  return html`<table>
    <thead><tr>${tableHeadRow.children.map((tableCell, index) =>
          tableHeadRender(
            headCells[index],
            alignments[index],
            functions.getAdditionalClasses(tableCell)
          )
        )}</tr></thead>

    <tbody>
      ${tableBodyRows.map(
        (tableHead, rowIndex) =>
          html`<tr>
            ${tableHead.children.map((tableCell, cellIndex) =>
              tableCellDataRender(
                bodyCells[columnCount * rowIndex + cellIndex],
                alignments[cellIndex],
                functions.getAdditionalClasses(tableCell)
              )
            )}
          </tr>`
      )}
    </tbody>
  </table>`;
};

export const markdownViewerRenderDictionary = {
  blockquote: async (element, metadata, functions) => {
    const content = await functions.renderChildren(
      element,
      metadata,
      functions
    );
    const classes = functions.getAdditionalClasses(element);

    return html`<blockquote class=${classes}>${content}</blockquote>`;
  }, // TODO: Check if code can be inside this tag

  break: () => html`<br />`,

  code: (element, metadata, functions) =>
    metadata.codeRender({
      lastNestedChildClass: metadata.lastNestedChildClass,
      language: element.lang,
      plainText: element.value,
      showIndicator:
        metadata.showIndicator && functions.isLastNestedChild(element)
    }),

  definition: element => setLinkDefinition(element.identifier, element.url),

  delete: async (element, metadata, functions) => {
    const content = await functions.renderChildren(
      element,
      metadata,
      functions
    );

    return html`<del class=${functions.getAdditionalClasses(element)}
      >${content}</del
    >`;
  }, // TODO: Check if code can be inside this tag

  emphasis: async (element, metadata, functions) => {
    const content = await functions.renderChildren(
      element,
      metadata,
      functions
    );

    return html`<em class=${functions.getAdditionalClasses(element)}
      >${content}</em
    >`;
  }, // TODO: Check if code can be inside this tag

  footnoteDefinition: () => "",

  footnoteReference: () => "",

  heading: async (element, metadata, functions) => {
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
    const content = await functions.renderChildren(
      element,
      metadata,
      functions
    );
    const classes = functions.getAdditionalClasses(element);

    return depthToHeading[element.depth](
      content,
      classes,
      headingId || nothing
    ); // TODO: Add anchor icon at the start of the heading
  },

  html: async (element, metadata, functions) => {
    if (metadata.rawHTML && !HTMLToJSX) {
      // Load the parser implementation
      HTMLToJSX = (await import("./raw-html-to-jsx.lit")).rawHTMLToJSX;
    }

    return metadata.rawHTML
      ? HTMLToJSX(
          element.value,
          metadata.allowDangerousHtml,
          // TODO: Add unit tests for these cases
          metadata.showIndicator && functions.isLastNestedChild(element)
        )
      : element.value;
  },

  inlineMath: (element) => html`<ch-latex-viewer .value=${element.value}></ch-latex-viewer>`,

  image: element =>
    html`<img
      src=${element.url}
      alt=${element.alt}
      title=${element.title}
      loading="lazy"
    />`,

  imageReference: () => "",

  inlineCode: element => html`<code class="hljs">${element.value}</code>`,

  link: async (element, metadata, functions) => {
    // Sanitize scripts
    if (element.url.includes("javascript:")) {
      return "";
    }

    const content = await functions.renderChildren(
      element,
      metadata,
      functions
    );

    return html`<a
      aria-label=${element.title || nothing}
      title=${element.title || nothing}
      class=${functions.getAdditionalClasses(element)}
      href=${element.url}
      >${content}</a
    >`;
  }, // TODO: Sanitize href?

  linkReference: async (element, metadata, functions) => {
    const content = await functions.renderChildren(
      element,
      metadata,
      functions
    );
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
      class=${functions.getAdditionalClasses(element)}
      href=${url}
      >${content}</a
    >`;
  },

  list: async (element, metadata, functions) => {
    const content = await functions.renderChildren(
      element,
      metadata,
      functions
    );

    const classes = functions.getAdditionalClasses(element);

    return element.ordered
      ? html`<ol class=${classes} start=${element.start}>${content}</ol>` // TODO: Implement spread  // TODO: Check if code can be inside this tag
      : html`<ul class=${classes}>${content}</ul>`; // TODO: Implement spread  // TODO: Check if code can be inside this tag
  },

  listItem: async (element, metadata, functions) => {
    const content = await functions.renderChildren(
      element,
      metadata,
      functions
    );

    const classes = functions.getAdditionalClasses(element);

    return html`<li class=${classes}>${content}</li>`;
  }, // TODO: Implement spread  // TODO: Check if code can be inside this tag

  paragraph: async (element, metadata, functions) => {
    const content = await functions.renderChildren(
      element,
      metadata,
      functions
    );

    const classes = functions.getAdditionalClasses(element);

    return html`<p class=${classes}>${content}</p>`;
  }, // TODO: Check if code can be inside this tag

  strong: async (element, metadata, functions) => {
    const content = await functions.renderChildren(
      element,
      metadata,
      functions
    );

    return html`<strong class=${functions.getAdditionalClasses(element)}
      >${content}</strong
    >`;
  }, // TODO: Check if code can be inside this tag

  table: tableRender, // TODO: Check if code can be inside this tag

  text: element => element.value,

  thematicBreak: () => html`<hr />`,

  yaml: () => ""
} as const satisfies {
  [key in keyof ElementsWithoutCustomRender]: (
    element: ElementsWithoutCustomRender[key],
    metadata: MarkdownViewerRenderMetadata,
    functions: MarkdownViewerRenderFunctions
  ) =>
    | Promise<string | TemplateResult | TemplateResult[] | void>
    | string
    | TemplateResult
    | TemplateResult[]
    | void;
};
