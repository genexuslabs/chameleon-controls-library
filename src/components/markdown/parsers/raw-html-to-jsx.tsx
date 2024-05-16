import { h } from "@stencil/core";
import { fromHTMLStringToHast } from "@genexus/markdown-parser/dist/parse-html.js";
// import { Root, RootContent, RootContentMap } from "hast";
import { Element as HElement, Root, RootContentMap } from "hast";

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
  [key in keyof RootContentMap]: (element: RootContentMap[key]) => any;
} = {
  comment: () => "",
  element: element => {
    const properties = element.properties;

    // Minimal sanitization
    if (
      tagsToSanitize.has(element.tagName) ||
      (element.tagName === "a" &&
        (properties.href as string)?.includes("javascript:"))
    ) {
      return;
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

    return (
      <element.tagName {...properties}>
        {renderChildren(element)}
      </element.tagName>
    );
  },
  text: element => element.value,
  doctype: () => ""
};

function renderChildren(element: Root | HElement) {
  return element.children.map(child => renderDictionary[child.type](child));
}

export const rawHTMLToJSX = (
  htmlString: string,
  allowDangerousHtml: boolean
) => {
  const hast: Root = fromHTMLStringToHast(htmlString, allowDangerousHtml, {
    fragment: true
  });

  // Render the hast as JSX
  return renderChildren(hast);
};
