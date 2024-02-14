import { h } from "@stencil/core";
import { Element as HElement, Text as HText } from "hast";

import {
  getActualLanguageWithoutAlias,
  parseCodeToHAST,
  registerLanguage
} from "@genexus/markdown-parser/dist/parse-code.js";
import { Root } from "mdast";

const codeToJSXDictionary = {
  element: (element: HElement) => {
    const className = element.properties.className as string[];
    const classes = className ? className.join(" ") : null;

    return <span class={classes}>{renderCodeChildren(element)}</span>;
  },

  text: (element: HText) => element.value
};

function renderCodeChildren(element: HElement) {
  return element.children.map(child => codeToJSXDictionary[child.type](child));
}

export const parseCodeToJSX = async (
  code: string,
  language: string,
  renderCode: (language: string, content: any) => any
) => {
  const actualLanguage = getActualLanguageWithoutAlias(language || "txt");

  // Register the language
  await registerLanguage(actualLanguage);

  const tree: Root = parseCodeToHAST(actualLanguage, code);

  return renderCode(
    language,
    tree.children.map(child => codeToJSXDictionary[child.type](child))
  );
};

export const defaultCodeRender = (language: string, content: any): any => (
  <pre>
    <code class={`hljs language-${language}`}>{content}</code>
  </pre>
);
