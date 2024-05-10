import { h } from "@stencil/core";
import { fromHTMLStringToHast } from "@genexus/markdown-parser/dist/parse-html.js";
// import { Root, RootContent, RootContentMap } from "hast";
import { Element as HElement, Root, RootContentMap } from "hast";

const renderDictionary: {
  [key in keyof RootContentMap]: (element: RootContentMap[key]) => any;
} = {
  comment: () => "",
  element: element => {
    const properties = element.properties;

    // Minimal sanitization
    if (
      element.tagName === "script" ||
      (element.tagName === "a" &&
        (properties.href as string)?.includes("javascript:"))
    ) {
      return;
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
