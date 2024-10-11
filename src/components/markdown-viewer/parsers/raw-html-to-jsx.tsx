import { h } from "@stencil/core";
import { fromHTMLStringToHast } from "@genexus/markdown-parser/dist/parse-html.js";
// import { Root, RootContent, RootContentMap } from "hast";
import { Element as HElement, Root, RootContentMap } from "hast";
import { LAST_NESTED_CHILD_CLASS } from "./markdown-to-jsx";

const tagsToSanitize = new Set([
  "base",
  "body",
  "embed",
  "head",
  "html",
  "iframe",
  "link",
  "meta",
  "object",
  "script",
  "style",
  "svg",
  "title"
]);

const LAST_SEMICOLON_AND_SPACES_IN_INLINE_STYLE = /\s*;\s*$/;
const SEMICOLON_AND_SPACES = /\s*;\s*/;
const COLON_AND_SPACES = /\s*:\s*/;

const getStyleObjectFromString = (
  inlineStyle: string
): { [key in string]: string } => {
  // Remove last " ;   "
  const formattedStyle = inlineStyle.replace(
    LAST_SEMICOLON_AND_SPACES_IN_INLINE_STYLE,
    ""
  );

  // ["background-color: red", "color: black", ...]
  const propertiesWithValues = formattedStyle.split(SEMICOLON_AND_SPACES);
  const styleObject = {};

  propertiesWithValues.forEach(propertyAndValue => {
    const separatedPropertyAndValue = propertyAndValue.split(COLON_AND_SPACES);
    styleObject[separatedPropertyAndValue[0]] = separatedPropertyAndValue[1];
  });

  return styleObject;
};

const renderDictionary: {
  [key in keyof RootContentMap]: (
    element: RootContentMap[key],
    showIndicator: boolean,
    lastElementChild: HElement | undefined
  ) => any;
} = {
  comment: () => "",
  element: (element, showIndicator, lastElementChild) => {
    const properties = element.properties;

    // Minimal sanitization
    if (
      tagsToSanitize.has(element.tagName) ||
      (element.tagName === "a" &&
        (properties.href as string)?.includes("javascript:"))
    ) {
      return;
    }

    // Remove native attr listeners
    for (const key in properties) {
      if (key.startsWith("on")) {
        delete properties[key];
      }
    }

    // Parse style to an object
    if (properties.style !== undefined) {
      properties.style = getStyleObjectFromString(
        properties.style as string
      ) as any;
    }

    if (properties.className !== undefined) {
      properties.class = (properties.className as string[]).join(" ");
      delete properties.className;
    }

    if (properties.htmlFor) {
      properties.for = properties.htmlFor;
      delete properties.htmlFor;
    }

    // Indicator for streaming
    const isLastElementChild = showIndicator && element === lastElementChild;
    if (isLastElementChild) {
      properties.class = properties.class
        ? `${properties.class} ${LAST_NESTED_CHILD_CLASS}`
        : LAST_NESTED_CHILD_CLASS;
    }

    return (
      <element.tagName {...properties}>
        {renderChildren(element, showIndicator, lastElementChild)}
      </element.tagName>
    );
  },
  text: element => element.value,
  doctype: () => ""
};

function renderChildren(
  element: Root | HElement,
  showIndicator: boolean,
  lastElementChild: HElement | undefined
) {
  return element.children.map(child =>
    renderDictionary[child.type](child, showIndicator, lastElementChild)
  );
}

const findLastNestedChild = (elementWithChildren: HElement) => {
  const lastChild = elementWithChildren.children.at(-1) as HElement;

  // The last element have children. We must check its sub children
  if (lastChild.children?.length > 0) {
    return findLastNestedChild(lastChild);
  }

  return elementWithChildren;
};

export const rawHTMLToJSX = (
  htmlString: string,
  allowDangerousHtml: boolean,
  showIndicator: boolean
) => {
  const hast: Root = fromHTMLStringToHast(htmlString, allowDangerousHtml, {
    fragment: true
  });

  const lastElementChild =
    hast.children.at(-1).type === "element"
      ? findLastNestedChild(hast.children.at(-1) as HElement)
      : undefined;

  // Render the hast as JSX
  return renderChildren(hast, showIndicator, lastElementChild);
};
